const Slot = require('../models/Slot');
const ParkingLot = require('../models/ParkingLot');

// GET /api/slots/:lotId  — all slots for a lot
const getSlotsByLot = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { lot_id: req.params.lotId };
    if (type) where.type = type;

    const slots = await Slot.findAll({ where });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/slots/detail/:id
const getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findByPk(req.params.id, {
      include: [{ model: ParkingLot, as: 'lot' }],
    });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/slots/:id/status  (admin)
const updateSlotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const slot = await Slot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    await slot.update({ status });

    // Emit real-time update via socket
    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', { slotId: slot.id, status });

    res.json({ message: 'Slot status updated', slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/slots  (admin — add new slot)
const createSlot = async (req, res) => {
  try {
    const slot = await Slot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSlotsByLot, getSlotById, updateSlotStatus, createSlot };
