const express = require("express");
const router = express.Router();

const {
  getBookings,
  getBookingById,
  getJadwal,
  getJadwalSemua,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getPendapatan,
  getPendapatanRingkasan,
} = require("../controllers/bookingControllers");

const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authMiddleware");

// Jadwal dapat diakses sebelum autentikasi
router.get("/jadwal", getJadwal);
router.get("/jadwal-semua", getJadwalSemua);

// Endpoint khusus admin
router.use(authMiddleware);

router.get("/pendapatan", authorizeRole("admin"), getPendapatan);

router.get(
  "/pendapatan/ringkasan",
  authorizeRole("admin"),
  getPendapatanRingkasan,
);

// Endpoint booking
router.get("/", getBookings);
router.get("/:id", getBookingById);

router.post("/", authorizeRole("penyewa", "petugas"), createBooking);

router.patch("/:id/status", authorizeRole("petugas"), updateBookingStatus);

router.patch("/:id/batal", authorizeRole("penyewa", "petugas"), cancelBooking);

module.exports = router;
