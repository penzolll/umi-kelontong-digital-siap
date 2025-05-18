
const db = require('../config/db');

/**
 * Get inventory history for a product
 * @route GET /api/inventory/product/:id
 */
exports.getProductInventoryHistory = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    // Get inventory transactions
    const result = await db.query(
      `SELECT it.*, u.name as created_by_name
       FROM inventory_transactions it
       LEFT JOIN users u ON it.created_by = u.id
       WHERE it.product_id = $1
       ORDER BY it.created_at DESC`,
      [productId]
    );
    
    res.status(200).json({
      status: 'success',
      product: productResult.rows[0],
      inventoryTransactions: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory manually (admin only)
 * @route POST /api/inventory/update
 */
exports.updateInventory = async (req, res, next) => {
  const client = await db.query.connect();
  
  try {
    await client.query('BEGIN');
    
    const { productId, quantity, type, notes } = req.body;
    
    if (!productId || !quantity || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID, quantity, and type are required'
      });
    }
    
    // Validate type
    const validTypes = ['add', 'remove', 'set'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory update type'
      });
    }
    
    // Check if product exists
    const productResult = await client.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    const product = productResult.rows[0];
    let newStock;
    let transactionQuantity;
    let transactionType;
    
    // Calculate new stock based on update type
    switch (type) {
      case 'add':
        newStock = product.stock + quantity;
        transactionQuantity = quantity;
        transactionType = 'manual-add';
        break;
        
      case 'remove':
        if (product.stock < quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            status: 'error',
            message: `Cannot remove ${quantity} items. Only ${product.stock} in stock.`
          });
        }
        newStock = product.stock - quantity;
        transactionQuantity = quantity;
        transactionType = 'manual-remove';
        break;
        
      case 'set':
        if (quantity < 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            status: 'error',
            message: 'Cannot set negative stock value'
          });
        }
        
        transactionQuantity = Math.abs(quantity - product.stock);
        transactionType = quantity > product.stock ? 'manual-add' : 'manual-remove';
        newStock = quantity;
        break;
        
      default:
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: 'Invalid update type'
        });
    }
    
    // Update product stock
    await client.query(
      'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2',
      [newStock, productId]
    );
    
    // Record inventory transaction
    await client.query(
      `INSERT INTO inventory_transactions
       (product_id, quantity, transaction_type, notes, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        productId,
        transactionQuantity,
        transactionType,
        notes || 'Manual inventory update',
        req.user.id
      ]
    );
    
    await client.query('COMMIT');
    
    // Get updated product data
    const updatedProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    res.status(200).json({
      status: 'success',
      product: updatedProduct.rows[0],
      message: `Product stock ${type === 'set' ? 'set to' : type + 'ed'} ${quantity} units`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Get low stock products (admin only)
 * @route GET /api/inventory/low-stock
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const result = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock <= $1
       ORDER BY p.stock ASC`,
      [threshold]
    );
    
    res.status(200).json({
      status: 'success',
      products: result.rows
    });
  } catch (error) {
    next(error);
  }
};
