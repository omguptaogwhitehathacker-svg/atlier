const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

router.get('/', authenticate, authorize('owner'), async (req, res) => {
  try {
    res.json(await User.find().select('-password'));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('owner'), async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('owner'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;