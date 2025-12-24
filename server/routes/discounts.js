import express from 'express';
import Discount from '../models/Discount.js';

const router = express.Router();

// Get all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active discounts
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      active: true,
      validFrom: { $lte: now },
      $or: [
        { validUntil: null },
        { validUntil: { $gte: now } }
      ],
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate discount code
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const discount = await Discount.findOne({ code: code.toUpperCase() });
    
    if (!discount) {
      return res.json({ valid: false, message: 'Invalid discount code' });
    }
    
    if (!discount.active) {
      return res.json({ valid: false, message: 'Discount code is inactive' });
    }
    
    const now = new Date();
    if (discount.validFrom > now) {
      return res.json({ valid: false, message: 'Discount code not yet valid' });
    }
    
    if (discount.validUntil && discount.validUntil < now) {
      return res.json({ valid: false, message: 'Discount code has expired' });
    }
    
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.json({ valid: false, message: 'Discount code usage limit reached' });
    }
    
    if (subtotal < discount.minPurchase) {
      return res.json({ 
        valid: false, 
        message: `Minimum purchase of Rs. ${discount.minPurchase.toFixed(2)} required` 
      });
    }
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }
    
    discountAmount = Math.min(discountAmount, subtotal);
    
    res.json({
      valid: true,
      discount: {
        id: discount._id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        amount: discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create discount
router.post('/', async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update discount
router.put('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete discount
router.delete('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment usage count
router.post('/:id/use', async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

