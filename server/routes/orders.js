import express from 'express';
import Order from '../models/Order.js';
import Counter from '../models/Counter.js';

const router = express.Router();

// Helper function to get next sequential order number
async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'orderNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  
  // Ensure it's a 4-digit number (1000-9999)
  let orderNum = counter.value;
  if (orderNum < 1000) {
    orderNum = 1000;
    await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { value: 1000 }
    );
  } else if (orderNum > 9999) {
    // Reset to 1000 if it exceeds 9999
    orderNum = 1000;
    await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { value: 1000 }
    );
  }
  
  return orderNum;
}

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { limit = 50, sort = '-createdAt' } = req.query;
    const orders = await Order.find()
      .sort(sort)
      .limit(parseInt(limit))
      .populate('items.menuItemId', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItemId', 'name price');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { items, discountCode, table_number, payment_method, notes } = req.body;
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate discount (will be handled by discount middleware if needed)
    let discountAmount = req.body.discountAmount || 0;
    let discountType = req.body.discountType || null;
    
    // Calculate total
    const total = Math.max(0, subtotal - discountAmount);
    
    // Get next sequential order number
    const orderNumber = await getNextOrderNumber();
    
    const order = new Order({
      orderNumber,
      items,
      subtotal,
      discountAmount,
      discountType,
      discountCode: discountCode || null,
      total,
      table_number: table_number || 'Walk-in',
      status: 'completed',
      payment_method: payment_method || 'cash',
      notes: notes || ''
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get daily collection statistics
router.get('/stats/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all orders for today
    const todayOrders = await Order.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'completed'
    });

    // Calculate statistics
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate by payment method
    const cashOrders = todayOrders.filter(o => o.payment_method === 'cash');
    const cardOrders = todayOrders.filter(o => o.payment_method === 'card');
    const digitalOrders = todayOrders.filter(o => o.payment_method === 'digital');
    
    const cashRevenue = cashOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const cardRevenue = cardOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const digitalRevenue = digitalOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    res.json({
      date: today.toISOString().split('T')[0],
      totalOrders,
      totalRevenue,
      cashOrders: cashOrders.length,
      cashRevenue,
      cardOrders: cardOrders.length,
      cardRevenue,
      digitalOrders: digitalOrders.length,
      digitalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

