const cron = require('node-cron');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { Op } = require('sequelize');

const startCronJobs = (io) => {
  // Every 5 minutes — expire old bookings and release slots
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredBookings = await Booking.findAll({
        where: {
          end_time: { [Op.lt]: new Date() },
          status: { [Op.in]: ['confirmed', 'pending'] },
        },
      });

      for (const booking of expiredBookings) {
        await booking.update({ status: 'expired' });
        await Slot.update({ status: 'available' }, { where: { id: booking.slot_id } });
        if (io) io.emit('slotUpdated', { slotId: booking.slot_id, status: 'available' });
      }

      if (expiredBookings.length > 0)
        console.log(`Cron: Released ${expiredBookings.length} expired bookings`);
    } catch (err) {
      console.error('Cron error:', err.message);
    }
  });

  console.log('Cron jobs started');
};

module.exports = { startCronJobs };
