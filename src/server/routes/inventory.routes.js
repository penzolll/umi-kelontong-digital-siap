
const express = require('express');
const {
  getProductInventoryHistory,
  updateInventory,
  getLowStockProducts
} = require('../controllers/inventory.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(restrictTo('admin'));

router.get('/product/:id', getProductInventoryHistory);
router.post('/update', updateInventory);
router.get('/low-stock', getLowStockProducts);

module.exports = router;
