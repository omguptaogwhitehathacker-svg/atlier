const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Category = require('../models/Category');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await Category.find()); } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;