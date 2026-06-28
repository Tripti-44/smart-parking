const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ParkingLot = sequelize.define('ParkingLot', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:           { type: DataTypes.STRING(150), allowNull: false },
  address:        { type: DataTypes.TEXT, allowNull: false },
  city:           { type: DataTypes.STRING(50), allowNull: false },
  latitude:       { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitude:      { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  total_slots:    { type: DataTypes.INTEGER, allowNull: false },
  price_per_hour: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  opening_time:   { type: DataTypes.STRING(5), defaultValue: '06:00' },
  closing_time:   { type: DataTypes.STRING(5), defaultValue: '23:00' },
}, { tableName: 'parking_lots', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = ParkingLot;
