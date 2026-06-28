const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');
const { sequelize } = require('../config/db');

// GET /api/lots
const getAllLots = async (req, res) => {
  try {
    const { city } = req.query;
    const where = city ? { city } : {};
    const lots = await ParkingLot.findAll({
      where,
      include: [{ model: Slot, as: 'slots', attributes: ['id', 'status'] }],
    });

    const result = lots.map((lot) => {
      const available = lot.slots.filter((s) => s.status === 'available').length;
      return { ...lot.toJSON(), available_slots: available, slots: undefined };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lots/:id
const getLotById = async (req, res) => {
  try {
    const lot = await ParkingLot.findByPk(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Parking lot not found' });
    res.json(lot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/lots  (admin)
const createLot = async (req, res) => {
  try {
    const lot = await ParkingLot.create(req.body);
    res.status(201).json(lot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/lots/:id  (admin)
const updateLot = async (req, res) => {
  try {
    const lot = await ParkingLot.findByPk(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    await lot.update(req.body);
    res.json(lot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lots/:id/occupancy  (admin analytics)
const getLotOccupancy = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT
         COUNT(*) AS total_slots,
         SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available,
         SUM(CASE WHEN status='booked' THEN 1 ELSE 0 END) AS booked,
         SUM(CASE WHEN status='maintenance' THEN 1 ELSE 0 END) AS maintenance,
         ROUND(SUM(CASE WHEN status='booked' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS occupancy_percent
       FROM slots WHERE lot_id = ?`,
      { replacements: [req.params.id] }
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllLots, getLotById, createLot, updateLot, getLotOccupancy };
