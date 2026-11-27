const express = require("express");
const router = express.Router();

const {
  getTarif,
  getTarifById,
  createTarif,
  updateTarif,
  deleteTarif,
} = require("../controllers/tarifControllers");

router.get("/", getTarif);
router.get("/:id", getTarifById);
router.post("/", createTarif);
router.put("/:id", updateTarif);
router.delete("/:id", deleteTarif);

module.exports = router;
