const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Slot = require('./Slot');

const Booking = sequelize.define('Booking', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  slot_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'slots', key: 'id' } },
  start_time:   { type: DataTypes.DATE, allowNull: false },
  end_time:     { type: DataTypes.DATE, allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status:       { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'expired'), defaultValue: 'pending' },
  qr_code:      { type: DataTypes.TEXT },
}, { tableName: 'bookings', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Booking.belongsTo(Slot, { foreignKey: 'slot_id', as: 'slot' });
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });

module.exports = Booking;
