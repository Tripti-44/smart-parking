const express = require('express');
const router = express.Router();
const { getAllLots, getLotById, createLot, updateLot, getLotOccupancy } = require('../controllers/lotController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllLots);
router.get('/:id', getLotById);
router.get('/:id/occupancy', protect, adminOnly, getLotOccupancy);
router.post('/', protect, adminOnly, createLot);
router.put('/:id', protect, adminOnly, updateLot);

module.exports = router;
