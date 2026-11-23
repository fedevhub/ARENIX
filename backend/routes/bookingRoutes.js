const express = require('express');
const router = express.Router();

const {
    getBookings,
    getBookingById,
    getJadwal,
    createBooking,
    updateBookingStatus,
    cancelBooking
} = require('../controllers/bookingControllers');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getBookings);
router.get('/jadwal', getJadwal);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);
router.patch('/:id/batal', cancelBooking);

module.exports = router;