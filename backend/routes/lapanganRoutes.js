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

router.use(authMiddleware);
router.get('/', getLapangan);
router.get('/:id', getLapanganById);
router.post('/', createLapangan);
router.put("/:id", updateLapangan);
router.delete('/:id', deleteLapangan);

module.exports = router;