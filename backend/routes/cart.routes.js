const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Gadget = require('../models/Gadget');
const auth = require('../middleware/auth');

// 🛒 GET user's cart
router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image');

    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error('Get cart error:', err); // log for debugging
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ➕ ADD item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Input validation
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const product = await Gadget.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item =>
      item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price image');

    res.status(200).json(updatedCart);
  } catch (err) {
    console.error('Add to cart error:', err); // 👈 better logging
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
