import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['noodles', 'bites', 'shorties', 'beverages', 'rice_curry', 'fried_rice', 'kottu'],
    default: 'noodles'
  },
  available: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('MenuItem', menuItemSchema);

