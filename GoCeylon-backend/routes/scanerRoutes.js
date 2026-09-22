const express = require("express");
const router = express.Router();
const rfidController = require("../controllers/scanerController");
const authMiddleware = require('../middleware/authMiddleware');



router.post("/rfid", rfidController.addRFID);

router.get("/rfid", authMiddleware(['admin']), rfidController.getAllRFIDs);

router.get("/export", authMiddleware(['admin']), rfidController.exportRFIDToExcel);

module.exports = router;
