const express = require("express");
const router = express.Router();

const AuditLog = require("../models/auditLogModel");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.use(authorizeRole("admin"));

router.get("/", async (req, res) => {
  try {
    const aktivitas = await AuditLog.find()
      .populate("user_id", "nama username")
      .populate("booking_id", "_id")
      .sort({ waktu: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil riwayat aktivitas",
      data: aktivitas,
    });
  } catch (error) {
    console.error("Gagal mengambil audit log:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat aktivitas",
    });
  }
});

module.exports = router;
