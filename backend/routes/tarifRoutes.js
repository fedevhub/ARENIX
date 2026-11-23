const express = require('express');
const router = express.router();

const {
    getTarif,
    getTarifById,
    createTarif,
    updateTarif,
    deleteTarif,
} = require('../controllers/tarifControllers');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getTarif);
router.get('/:id', getTarifById);
router.post('/', createTarif);
router.put('/:id', updateTarif);
router.delete('/:id', deleteTarif);

module.exports = router;