const express = require('express');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { customerEmail, customerName, shippingAddress, paymentMethod, items } = req.body;
    const orderItems = [];
    let totalRevenue = 0, totalCOGS = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.isArchived) return res.status(400).json({ error: 'Product not available' });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      product.stock -= item.quantity;
      await product.save();
      const lineTotal = product.sellingPrice * item.quantity;
      const lineCOGS = product.costPrice * item.quantity;
      totalRevenue += lineTotal; totalCOGS += lineCOGS;
      orderItems.push({
        product: product._id,
        productName: product.name,
        category: product.category,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        unitCost: product.costPrice,
        lineTotal,
        variation: item.variation || null
      });
    }
    const order = new Order({
      customerEmail,
      customerName,
      shippingAddress,
      paymentMethod,
      items: orderItems,
      totalRevenue,
      totalCOGS,
      netProfit: totalRevenue - totalCOGS
    });
    order.generateSerials();
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my-orders', authenticate, async (req, res) => {
  try {
    res.json(await Order.find({ customerEmail: req.user.email }).sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customerEmail !== req.user.email && !['admin', 'owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (order.status !== 'pending') return res.status(400).json({ error: 'Can only cancel pending orders' });
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;