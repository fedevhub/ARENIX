const express = require("express");
const router = express.Router();

const {
  getLapangan,
  getLapanganById,
  createLapangan,
  updateLapangan,
  deleteLapangan,
} = require("../controllers/lapanganControllers");

const upload = require("../middleware/uploadLapangan");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

router.use(authMiddleware);

router.get("/", getLapangan);
router.get("/:id", getLapanganById);

router.post(
  "/",
  authorizeRole("admin"),
  upload.single("gambar"),
  createLapangan,
);

router.put(
  "/:id",
  authorizeRole("admin"),
  upload.single("gambar"),
  updateLapangan,
);

router.delete("/:id", authorizeRole("admin"), deleteLapangan);

module.exports = router;
