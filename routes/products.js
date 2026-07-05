const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isArchived: false };
    if (category && category !== 'All') query.category = category;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }];
    let sortOption = {};
    if (sort === 'price-asc') sortOption = { sellingPrice: 1 };
    else if (sort === 'price-desc') sortOption = { sellingPrice: -1 };
    res.json(await Product.find(query).sort(sortOption));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isArchived) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin', 'owner'), [
  body('name').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('sellingPrice').isFloat({ min: 0 }),
  body('costPrice').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const Order = require('../models/Order');
    const hasOrders = await Order.exists({ 'items.product': product._id });
    if (hasOrders) {
      product.isArchived = true;
      await product.save();
      res.json({ message: 'Product archived', product });
    } else {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty()
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;