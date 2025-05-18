
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const db = require('../config/db');
const { sanitizeInput } = require('../utils/validation.utils');

/**
 * Get all products with optional filtering
 * @route GET /api/products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, promo } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND c.id = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (promo === 'true') {
      query += ` AND p.is_promo = true`;
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      status: 'success',
      products: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 * @route GET /api/products/:id
 */
exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const productResult = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );
    
    const product = productResult.rows[0];
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    // Get related products (same category)
    const relatedResult = await db.query(
      `SELECT * FROM products
       WHERE category_id = $1 AND id != $2
       LIMIT 4`,
      [product.category_id, productId]
    );
    
    res.status(200).json({
      status: 'success',
      product,
      relatedProducts: relatedResult.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (admin only)
 * @route POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      discountPrice,
      category,
      description,
      stock,
      isFeatured,
      isPromo
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, price and category'
      });
    }
    
    let imagePath = null;
    
    // Handle file upload
    if (req.files && req.files.image) {
      const productImage = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(productImage.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Only JPEG, PNG and WEBP are allowed'
        });
      }
      
      // Generate unique filename
      const filename = `${uuidv4()}${path.extname(productImage.name)}`;
      const uploadPath = path.join(__dirname, '../../uploads/products', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Move file to upload directory
      await productImage.mv(uploadPath);
      
      // Set image path for database
      imagePath = `/uploads/products/${filename}`;
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = sanitizeInput(description || '');
    
    // Insert product into database
    const result = await db.query(
      `INSERT INTO products 
       (name, price, discount_price, image, category_id, description, stock, is_featured, is_promo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sanitizedName,
        price,
        discountPrice || null,
        imagePath,
        category,
        sanitizedDescription,
        stock || 0,
        isFeatured || false,
        isPromo || false
      ]
    );
    
    const newProduct = result.rows[0];
    
    // Add initial inventory record
    if (stock && stock > 0) {
      await db.query(
        `INSERT INTO inventory_transactions
         (product_id, quantity, transaction_type, notes, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newProduct.id,
          stock,
          'initial',
          'Initial stock',
          req.user.id
        ]
      );
    }
    
    res.status(201).json({
      status: 'success',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product (admin only)
 * @route PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const {
      name,
      price,
      discountPrice,
      category,
      description,
      stock,
      isFeatured,
      isPromo
    } = req.body;
    
    // Check if product exists
    const existingProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    const product = existingProduct.rows[0];
    
    // Handle file upload if provided
    let imagePath = product.image;
    
    if (req.files && req.files.image) {
      const productImage = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(productImage.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Only JPEG, PNG and WEBP are allowed'
        });
      }
      
      // Generate unique filename
      const filename = `${uuidv4()}${path.extname(productImage.name)}`;
      const uploadPath = path.join(__dirname, '../../uploads/products', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Move file to upload directory
      await productImage.mv(uploadPath);
      
      // Delete old image if exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '../../', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image path for database
      imagePath = `/uploads/products/${filename}`;
    }
    
    // Update stock if changed
    if (stock !== undefined && stock !== null && stock !== product.stock) {
      const difference = stock - product.stock;
      
      if (difference !== 0) {
        const transactionType = difference > 0 ? 'adjustment-add' : 'adjustment-remove';
        
        await db.query(
          `INSERT INTO inventory_transactions
           (product_id, quantity, transaction_type, notes, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            productId,
            Math.abs(difference),
            transactionType,
            'Stock adjustment via admin update',
            req.user.id
          ]
        );
      }
    }
    
    // Sanitize inputs
    const sanitizedName = name ? sanitizeInput(name) : product.name;
    const sanitizedDescription = description ? sanitizeInput(description) : product.description;
    
    // Update product in database
    const result = await db.query(
      `UPDATE products
       SET name = $1, price = $2, discount_price = $3, image = $4, 
           category_id = $5, description = $6, stock = $7, 
           is_featured = $8, is_promo = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        sanitizedName,
        price || product.price,
        discountPrice || null,
        imagePath,
        category || product.category_id,
        sanitizedDescription,
        stock !== undefined ? stock : product.stock,
        isFeatured !== undefined ? isFeatured : product.is_featured,
        isPromo !== undefined ? isPromo : product.is_promo,
        productId
      ]
    );
    
    res.status(200).json({
      status: 'success',
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (admin only)
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const existingProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    const product = existingProduct.rows[0];
    
    // Delete product image if exists
    if (product.image) {
      const imagePath = path.join(__dirname, '../../', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete product from database
    await db.query('DELETE FROM products WHERE id = $1', [productId]);
    
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
