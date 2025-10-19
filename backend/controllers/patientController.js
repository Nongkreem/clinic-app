const PatientModel = require("../models/Patient");

exports.getPatientBlacklistStatus = async (req, res) => {
  const { patientId } = req.params;
  console.log("routeId:", patientId, typeof patientId);
  console.log("tokenId:", req.user.entity_id, typeof req.user.entity_id);
  if (parseInt(patientId, 10) !== parseInt(req.user.entity_id, 10)) {
    return res
      .status(403)
      .json({
        message:
          "ไม่ได้รับอนุญาต: คุณไม่สามารถเข้าถึงข้อมูล Blacklist ของผู้ป่วยรายอื่นได้",
      });
  }

  try {
    const status = await PatientModel.checkAndHandleBlacklistStatus(
      parseInt(patientId, 10)
    );
    res.status(200).json(status);
  } catch (error) {
    console.error("Error fetching patient blacklist status:", error);
    res.status(500).json({ message: "ไม่สามารถดึงสถานะ Blacklist ได้" });
  }
};
