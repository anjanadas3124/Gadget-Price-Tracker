// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();

router.get('/contact', (req, res) => {
  res.render('contact', { success: req.query.success });
});

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Optional: Save to DB, send email, etc.
  console.log('Contact Form Submitted:', { name, email, message });

  // Redirect to show success message
  res.redirect('/contact?success=true');
});

module.exports = router;
