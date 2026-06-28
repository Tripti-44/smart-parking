const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');

const Payment = sequelize.define('Payment', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bookings', key: 'id' } },
  razorpay_order_id:    { type: DataTypes.STRING(100) },
  razorpay_payment_id:  { type: DataTypes.STRING(100) },
  amount:               { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status:               { type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'), defaultValue: 'pending' },
  paid_at:              { type: DataTypes.DATE },
}, { tableName: 'payments', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });

module.exports = Payment;
