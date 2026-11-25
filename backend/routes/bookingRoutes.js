const express = require("express");
const router = express.Router();

const {
    getBookings,
    getBookingById,
    getJadwal,
    createBooking,
    updateBookingStatus,
    cancelBooking,
} = require("../controllers/bookingControllers");

const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", getBookings);
router.get("/jadwal", getJadwal);
router.get("/:id", getBookingById);

router.post("/", authorizeRole("penyewa", "petugas"), createBooking);
router.patch("/:id/status", authorizeRole("petugas"), updateBookingStatus);
router.patch("/:id/batal", authorizeRole("penyewa", "petugas"), cancelBooking);

module.exports = router;
