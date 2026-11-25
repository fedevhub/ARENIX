
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authMiddleware');

const {
    getJenis,
    getJenisById,
    createJenis,
    updateJenis,
    deleteJenis
} = require('../controllers/jenisControllers');

router.use(authMiddleware);
router.use(authorizeRole('admin'));

router.get('/', getJenis);
router.get('/:id', getJenisById);
router.post('/', createJenis);
router.put('/:id', updateJenis);
router.delete('/:id', deleteJenis);

module.exports = router;
