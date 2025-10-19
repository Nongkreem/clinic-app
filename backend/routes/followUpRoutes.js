const express = require("express");
const router = express.Router();
const followUpController = require("../controllers/followUpController");

// แพทย์สร้างนัดติดตาม
router.post("/create", followUpController.createFollowUpAppointment);

module.exports = router;
