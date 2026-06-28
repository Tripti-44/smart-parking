const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const payment = await Payment.findOne({ where: { booking_id } });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    const order = await razorpay.orders.create({
      amount: Math.round(payment.amount * 100),  // paise
      currency: 'INR',
      receipt: `booking_${booking_id}`,
    });

    await payment.update({ razorpay_order_id: order.id });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    await Payment.update(
      { razorpay_payment_id, status: 'paid', paid_at: new Date() },
      { where: { razorpay_order_id } }
    );
    await Booking.update({ status: 'confirmed' }, { where: { id: booking_id } });

    res.json({ message: 'Payment verified, booking confirmed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/my
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Booking, as: 'booking', where: { user_id: req.user.id } }],
      order: [['created_at', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getMyPayments };
