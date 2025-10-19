const express = require("express");
const {
  getTopServices,
  getPeakHours,
  getMonthlyBookings,
  getDepartmentDistribution,
  getDoctorLoad,
  getRoomUtilization,
  getAppointmentStatus,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/top-services", getTopServices);
router.get("/peak-hours", getPeakHours);
router.get("/monthly-bookings", getMonthlyBookings);
router.get("/department", getDepartmentDistribution);
router.get("/doctor-load", getDoctorLoad);
router.get("/room-utilization", getRoomUtilization);
router.get("/appointment-status", getAppointmentStatus);

module.exports = router;
