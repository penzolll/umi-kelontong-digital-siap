
const db = require('../config/db');
const { sanitizeInput } = require('../utils/validation.utils');

/**
 * Get all orders (admin) or user orders (customer)
 * @route GET /api/orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    let query;
    let queryParams = [];
    
    // Admin can see all orders, customers can only see their own
    if (req.user.role === 'admin') {
      query = `
        SELECT o.*, u.name as user_name, u.email as user_email,
        COUNT(oi.id) as item_count,
        STRING_AGG(p.name, ', ' ORDER BY oi.id) as product_names
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id, u.name, u.email
        ORDER BY o.created_at DESC
      `;
    } else {
      query = `
        SELECT o.*,
        COUNT(oi.id) as item_count,
        STRING_AGG(p.name, ', ' ORDER BY oi.id) as product_names
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      queryParams = [req.user.id];
    }
    
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      status: 'success',
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific order
 * @route GET /api/orders/:id
 */
exports.getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    
    // Get order details
    let query;
    let queryParams;
    
    if (req.user.role === 'admin') {
      query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1
      `;
      queryParams = [orderId];
    } else {
      query = `
        SELECT o.*
        FROM orders o
        WHERE o.id = $1 AND o.user_id = $2
      `;
      queryParams = [orderId, req.user.id];
    }
    
    const orderResult = await db.query(query, queryParams);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    
    const itemsResult = await db.query(itemsQuery, [orderId]);
    
    res.status(200).json({
      status: 'success',
      order: {
        ...order,
        items: itemsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new order
 * @route POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
  const client = await db.query.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      items, 
      customerName, 
      address, 
      phone, 
      paymentMethod 
    } = req.body;
    
    // Validate required fields
    if (!items || !items.length || !customerName || !address || !phone || !paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required order information'
      });
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(customerName);
    const sanitizedAddress = sanitizeInput(address);
    const sanitizedPhone = sanitizeInput(phone);
    
    // Calculate total and verify product availability
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      // Get current product data
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [item.product.id]
      );
      
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: `Product with ID ${item.product.id} not found`
        });
      }
      
      const product = productResult.rows[0];
      
      // Check stock
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }
      
      // Calculate price
      const price = product.discount_price || product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      
      // Prepare order item
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price
      });
      
      // Update stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, product.id]
      );
      
      // Record inventory transaction
      await client.query(
        `INSERT INTO inventory_transactions
         (product_id, quantity, transaction_type, reference_type, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          product.id,
          item.quantity,
          'sale',
          'order',
          req.user ? req.user.id : null
        ]
      );
    }
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_amount, customer_name, address, phone, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user ? req.user.id : null,
        totalAmount,
        sanitizedName,
        sanitizedAddress,
        sanitizedPhone,
        paymentMethod,
        'pending'
      ]
    );
    
    const newOrder = orderResult.rows[0];
    
    // Create order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [newOrder.id, item.productId, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      status: 'success',
      order: newOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Update order status (admin only)
 * @route PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }
    
    // Check if order exists
    const existingOrder = await db.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    
    if (existingOrder.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    // Special handling for cancellations - restore inventory
    if (status === 'cancelled' && existingOrder.rows[0].status !== 'cancelled') {
      const client = await db.query.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get order items
        const orderItems = await client.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [orderId]
        );
        
        // Restore inventory for each item
        for (const item of orderItems.rows) {
          // Update product stock
          await client.query(
            'UPDATE products SET stock = stock + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
          
          // Record inventory transaction
          await client.query(
            `INSERT INTO inventory_transactions
             (product_id, quantity, transaction_type, reference_id, reference_type, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              item.product_id,
              item.quantity,
              'return',
              orderId,
              'order',
              'Order cancelled',
              req.user.id
            ]
          );
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    // Update order status
    const result = await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    
    res.status(200).json({
      status: 'success',
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
