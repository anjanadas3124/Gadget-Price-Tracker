const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Gadget',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true 
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update total before saving
cartSchema.pre('save', function (next) {
  try {
    this.total = this.items.reduce((sum, item) => {
      const price = item.price ?? 0;
      const quantity = item.quantity ?? 1;
      return sum + (price * quantity);
    }, 0);
    this.updatedAt = Date.now();
    next();
  } catch (err) {
    console.error('Cart pre-save error:', err);
    next(err);
  }
});

module.exports = mongoose.model('Cart', cartSchema);
