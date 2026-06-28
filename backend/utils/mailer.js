const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendBookingConfirmation = async (to, booking) => {
  try {
    await transporter.sendMail({
      from: `"SmartPark" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Booking Confirmed — ${booking.id}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Booking ID: <b>${booking.id}</b></p>
        <p>Slot: <b>${booking.slot?.slot_number}</b></p>
        <p>From: <b>${new Date(booking.start_time).toLocaleString('en-IN')}</b></p>
        <p>To: <b>${new Date(booking.end_time).toLocaleString('en-IN')}</b></p>
        <p>Amount Paid: <b>₹${booking.total_amount}</b></p>
        <p>Show your QR code at entry. Have a safe drive!</p>
      `,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = { sendBookingConfirmation };
