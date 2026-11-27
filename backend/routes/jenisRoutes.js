const express = require("express");
const router = express.Router();

const {
    getJenis,
    getJenisById,
    createJenis,
    updateJenis,
    deleteJenis,
} = require("../controllers/jenisControllers");

router.get("/", getJenis);
router.get("/:id", getJenisById);
router.post("/", createJenis);
router.put("/:id", updateJenis);
router.delete("/:id", deleteJenis);

module.exports = router;
