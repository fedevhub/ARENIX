const express = require('express');
const router = express.Router();

const {
    getLapangan,
    getLapanganById,
    createLapangan,
    updateLapangan,
    deleteLapangan
} = require('../controllers/lapanganControllers');

const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get('/', getLapangan);
router.get('/:id', getLapanganById);

router.post("/", authorizeRole("admin"), createLapangan);
router.put("/:id", authorizeRole("admin"), updateLapangan);
router.delete("/:id", authorizeRole("admin"), deleteLapangan);

module.exports = router;