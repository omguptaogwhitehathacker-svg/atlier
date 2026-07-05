const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

router.get('/analytics', authenticate, authorize('owner'), async (req, res) => {
  try {
    const { timeFilter = 'all' } = req.query;
    const now = new Date();
    let dateFilter = {};
    if (timeFilter === 'day') {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } };
    } else if (timeFilter === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
    } else if (timeFilter === 'year') {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
    }
    const orders = await Order.find({ ...dateFilter, status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((s, o) => s + o.totalRevenue, 0);
    const totalCOGS = orders.reduce((s, o) => s + o.totalCOGS, 0);
    const totalRestockCost = orders.reduce((s, o) => s + (o.restockCost || 0), 0);
    const netProfit = totalRevenue - totalCOGS - totalRestockCost;
    const productSales = {};
    orders.forEach(o => o.items.forEach(i => {
      if (!productSales[i.productName]) productSales[i.productName] = { units: 0, revenue: 0 };
      productSales[i.productName].units += i.quantity;
      productSales[i.productName].revenue += i.lineTotal;
    }));
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }));
    res.json({ totalRevenue, totalCOGS, totalRestockCost, netProfit, orderCount: orders.length, topProducts });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/inventory/manage', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { productId, stock, restockCost } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.stock = stock;
    if (restockCost > 0) product.restockCost = (product.restockCost || 0) + restockCost;
    await product.save();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;