const { sequelize } = require('../config/db');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const QRCode = require('qrcode');
const { sendBookingConfirmation } = require('../utils/mailer');

// POST /api/bookings  — create booking with TRANSACTION
const createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { slot_id, start_time, end_time } = req.body;
    if (!slot_id || !start_time || !end_time)
      return res.status(400).json({ message: 'slot_id, start_time, end_time required' });

    // Lock the slot — no other request can book it simultaneously
    const slot = await Slot.findOne({
      where: { id: slot_id, status: 'available' },
      lock: true,
      transaction: t,
    });
    if (!slot) {
      await t.rollback();
      return res.status(409).json({ message: 'Slot is no longer available' });
    }

    // Calculate amount
    const hours = (new Date(end_time) - new Date(start_time)) / 3600000;
    const total_amount = parseFloat((hours * slot.price_per_hour).toFixed(2));

    // Create booking record
    const booking = await Booking.create(
      { user_id: req.user.id, slot_id, start_time, end_time, total_amount, status: 'pending' },
      { transaction: t }
    );

    // Mark slot as booked
    await slot.update({ status: 'booked' }, { transaction: t });

    // Create pending payment record
    await Payment.create({ booking_id: booking.id, amount: total_amount }, { transaction: t });

    await t.commit();

    // Generate QR code
    const qrData = JSON.stringify({ booking_id: booking.id, user_id: req.user.id, slot: slot.slot_number });
    const qr_code = await QRCode.toDataURL(qrData);
    await booking.update({ qr_code });

    // Emit real-time slot update
    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', { slotId: slot.id, status: 'booked' });

    res.status(201).json({ message: 'Booking created', booking, qr_code });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my  — logged in user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Slot, as: 'slot', include: [{ model: ParkingLot, as: 'lot' }] },
        { model: Payment, as: 'payment' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Slot, as: 'slot', include: [{ model: ParkingLot, as: 'lot' }] },
        { model: Payment, as: 'payment' },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      transaction: t,
    });
    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found' }); }
    if (booking.status === 'cancelled') { await t.rollback(); return res.status(400).json({ message: 'Already cancelled' }); }

    await booking.update({ status: 'cancelled' }, { transaction: t });
    await Slot.update({ status: 'available' }, { where: { id: booking.slot_id }, transaction: t });
    await Payment.update({ status: 'refunded' }, { where: { booking_id: booking.id }, transaction: t });

    await t.commit();

    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', { slotId: booking.slot_id, status: 'available' });

    res.json({ message: 'Booking cancelled and slot released' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings  (admin — all bookings)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Slot, as: 'slot', include: [{ model: ParkingLot, as: 'lot' }] },
        { model: Payment, as: 'payment' },
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings };
