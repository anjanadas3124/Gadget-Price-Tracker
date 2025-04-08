const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// Helper: Renders contact page with success/error/messages
const renderContact = async (res, options = {}) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.render('contact', {
      success: options.success || null,
      error: options.error || null,
      messages,
      message: options.message || null
    });
  } catch (err) {
    console.error('Render error:', err);
    res.render('contact', {
      error: 'Failed to load data',
      success: null,
      messages: [],
      message: null
    });
  }
};

// GET /contact (Show form and messages)
router.get('/contact', async (req, res) => {
  await renderContact(res, {
    success: req.query.success,
    error: req.query.error
  });
});

// POST /contact (Add new message)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.redirect('/contact?error=All fields are required');
    }

    await ContactMessage.create({ name, email, message });
    res.redirect('/contact?success=Message sent!');
  } catch (err) {
    console.error('Create error:', err);
    res.redirect('/contact?error=Failed to send message');
  }
});

// GET /contact/edit/:id (Load message for editing)
router.get('/contact/edit/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.redirect('/contact?error=Message not found');

    await renderContact(res, { message });
  } catch (err) {
    console.error('Edit load error:', err);
    res.redirect('/contact?error=Error loading message');
  }
});

// POST /contact/update/:id (Update existing message)
router.post('/contact/update/:id', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.redirect('/contact?error=All fields are required');
    }

    await ContactMessage.findByIdAndUpdate(req.params.id, { name, email, message });
    res.redirect('/contact?success=Message updated!');
  } catch (err) {
    console.error('Update error:', err);
    res.redirect('/contact?error=Failed to update message');
  }
});

// POST /contact/delete/:id (Delete a message)
router.post('/contact/delete/:id', async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.redirect('/contact?success=Message deleted!');
  } catch (err) {
    console.error('Delete error:', err);
    res.redirect('/contact?error=Failed to delete message');
  }
});

module.exports = router;
