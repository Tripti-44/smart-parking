const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const ParkingLot = require('./ParkingLot');

const Slot = sequelize.define('Slot', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lot_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: 'parking_lots', key: 'id' } },
  slot_number:    { type: DataTypes.STRING(10), allowNull: false },
  type:           { type: DataTypes.ENUM('2W', '4W', 'EV'), defaultValue: '4W' },
  status:         { type: DataTypes.ENUM('available', 'booked', 'maintenance'), defaultValue: 'available' },
  price_per_hour: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
}, { tableName: 'slots', timestamps: false });

Slot.belongsTo(ParkingLot, { foreignKey: 'lot_id', as: 'lot' });
ParkingLot.hasMany(Slot, { foreignKey: 'lot_id', as: 'slots' });

module.exports = Slot;
