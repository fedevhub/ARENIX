const express = require('express');
const router = express.Router();

const {
    getUsers,
    getUserById,
    createUser,
    updateUsers,
    deleteUser
} = require('../controllers/userControllers');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/'. getUsers);
router.get(':id', getUserById);
router.post('/', createUser);
router.post('/:id', updateUser);
router.post('/:id', deleteUser);

module.exports = router;