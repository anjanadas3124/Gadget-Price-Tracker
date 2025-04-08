const ContactMessage = require('../models/ContactMessage');

// Helper function to get all messages
const getAllMessages = async () => {
  return await ContactMessage.find().sort({ createdAt: -1 });
};

// Display contact form with messages
exports.showContactPage = async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.render('contact', {
      success: req.query.success,
      error: req.query.error,
      messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.render('contact', { 
      error: 'Failed to load messages',
      success: null,
      messages: []
    });
  }
};

// Handle form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.redirect('/contact?error=All fields are required');
    }

    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    res.redirect('/contact?success=Message sent successfully!');
  } catch (err) {
    console.error('Error saving message:', err);
    res.redirect('/contact?error=Failed to send message');
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const [message, messages] = await Promise.all([
      ContactMessage.findById(req.params.id),
      getAllMessages()
    ]);
    
    if (!message) {
      return res.redirect('/contact?error=Message not found');
    }
    
    res.render('contact', {
      message,
      messages,
      success: req.query.success,
      error: req.query.error
    });
  } catch (err) {
    console.error('Error finding message:', err);
    res.redirect('/contact?error=Message not found');
  }
};

// Update message
exports.updateMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.redirect(`/contact/edit/${req.params.id}?error=All fields are required`);
    }

    await ContactMessage.findByIdAndUpdate(req.params.id, {
      name,
      email,
      message
    }, { new: true });
    
    res.redirect('/contact?success=Message updated successfully!');
  } catch (err) {
    console.error('Error updating message:', err);
    res.redirect(`/contact/edit/${req.params.id}?error=Failed to update message`);
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.redirect('/contact?success=Message deleted successfully!');
  } catch (err) {
    console.error('Error deleting message:', err);
    res.redirect('/contact?error=Failed to delete message');
  }
};