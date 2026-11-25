const express = require('express');
const router = express.Router();

const {
    getTarif,
    getTarifById,
    createTarif,
    updateTarif,
    deleteTarif,
} = require('../controllers/tarifControllers');

const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get('/', getTarif);
router.get('/:id', getTarifById);

router.post("/", authorizeRole("admin"), createTarif);
router.put("/:id", authorizeRole("admin"), updateTarif);
router.delete("/:id", authorizeRole("admin"), deleteTarif);

module.exports = router;