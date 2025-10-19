const express = require("express");
const { enableDemoMode, disableDemoMode, isDemoMode } = require("../utils/demoMode");

const router = express.Router();

router.post("/enable", (req, res) => {
  const { date } = req.body;
  enableDemoMode(date || new Date());
  res.json({ message: "Demo mode enabled", currentDate: date || new Date() });
});

router.post("/disable", (req, res) => {
  disableDemoMode();
  res.json({ message: "Demo mode disabled" });
});

router.get("/status", (req, res) => {
  res.json({ demoMode: isDemoMode() });
});

router.get("/current-date", (req, res) => {
  res.json({ now: new Date() });
})
module.exports = router;
