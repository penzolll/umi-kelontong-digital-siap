
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const db = require('../config/db');
const { sanitizeInput } = require('../utils/validation.utils');

/**
 * Get all categories
 * @route GET /api/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    
    res.status(200).json({
      status: 'success',
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category (admin only)
 * @route POST /api/categories
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Category name is required'
      });
    }
    
    // Handle image upload
    let imagePath = null;
    
    if (req.files && req.files.image) {
      const categoryImage = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(categoryImage.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Only JPEG, PNG and WEBP are allowed'
        });
      }
      
      // Generate unique filename
      const filename = `${uuidv4()}${path.extname(categoryImage.name)}`;
      const uploadPath = path.join(__dirname, '../../uploads/categories', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Move file to upload directory
      await categoryImage.mv(uploadPath);
      
      // Set image path for database
      imagePath = `/uploads/categories/${filename}`;
    }
    
    // Sanitize and save to database
    const sanitizedName = sanitizeInput(name);
    
    const result = await db.query(
      'INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING *',
      [sanitizedName, imagePath]
    );
    
    res.status(201).json({
      status: 'success',
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category (admin only)
 * @route PUT /api/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;
    
    // Check if category exists
    const existingCategory = await db.query(
      'SELECT * FROM categories WHERE id = $1',
      [categoryId]
    );
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    const category = existingCategory.rows[0];
    
    // Handle image upload if provided
    let imagePath = category.image;
    
    if (req.files && req.files.image) {
      const categoryImage = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(categoryImage.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Only JPEG, PNG and WEBP are allowed'
        });
      }
      
      // Generate unique filename
      const filename = `${uuidv4()}${path.extname(categoryImage.name)}`;
      const uploadPath = path.join(__dirname, '../../uploads/categories', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Move file to upload directory
      await categoryImage.mv(uploadPath);
      
      // Delete old image if exists
      if (category.image) {
        const oldImagePath = path.join(__dirname, '../../', category.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image path for database
      imagePath = `/uploads/categories/${filename}`;
    }
    
    // Sanitize name if provided
    const sanitizedName = name ? sanitizeInput(name) : category.name;
    
    // Update category in database
    const result = await db.query(
      `UPDATE categories
       SET name = $1, image = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [sanitizedName, imagePath, categoryId]
    );
    
    res.status(200).json({
      status: 'success',
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category (admin only)
 * @route DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const existingCategory = await db.query(
      'SELECT * FROM categories WHERE id = $1',
      [categoryId]
    );
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Check if category is being used by products
    const productsWithCategory = await db.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [categoryId]
    );
    
    if (parseInt(productsWithCategory.rows[0].count) > 0) {
      // Update products to have null category instead of deleting
      await db.query(
        'UPDATE products SET category_id = NULL WHERE category_id = $1',
        [categoryId]
      );
    }
    
    // Delete category image if exists
    if (existingCategory.rows[0].image) {
      const imagePath = path.join(__dirname, '../../', existingCategory.rows[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete category from database
    await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
