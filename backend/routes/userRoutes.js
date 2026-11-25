const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authMiddleware");

const userController = require("../controllers/userControllers");

router.use(authMiddleware);
router.use(authorizeRole("admin"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
