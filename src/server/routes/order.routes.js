
const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Routes requiring authentication
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

// Admin only routes
router.put('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;
