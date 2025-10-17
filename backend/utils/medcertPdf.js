const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const fontPath = path.join(
  __dirname,
  "..",
  "assets",
  "fonts",
  "Sarabun-Light.ttf"
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateMedicalCertPDF({ hospital, patient, doctor, cert }) {
  const outDir = path.join(__dirname, "..", "uploads", "medcerts");
  ensureDir(outDir);

  const filename = `MC_${cert.cert_id}.pdf`;
  const filePath = path.join(outDir, filename);
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // โหลดฟอนต์ไทย
  doc.registerFont("Sarabun-Light", fontPath);
  doc.font("Sarabun-Light").fontSize(16);

  // Header
  if (hospital.logoPath && fs.existsSync(hospital.logoPath)) {
    doc.image(hospital.logoPath, 50, 40, { width: 60 });
  }
  doc
    .fontSize(10)
    .text(hospital.name || "โรงพยาบาลของเรา", 120, 45)
    .fontSize(10)
    .fillColor("#444")
    .text(hospital.address || "", 120, 65)
    .text(hospital.phone ? `โทร: ${hospital.phone}` : "", 120, 80)
    .moveDown(4);

  // Title + วันที่ออก (จัดกลางอย่างถูกต้อง)
  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const pageWidth = doc.page.width;
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // พิมพ์หัวเรื่องตรงกลาง
  doc
    .fillColor("black")
    .fontSize(18)
    .text("ใบรับรองแพทย์ (Medical Certificate)", marginLeft, doc.y, {
      align: "center",
      width: contentWidth
    })
    .moveDown(0.6)
    .fontSize(13)
    .text(`ออกให้เมื่อ: ${issuedDate}`, marginLeft, doc.y, {
      align: "center",
      width: contentWidth
    })
    .moveDown(2);

  // Patient Info
  doc
    .fontSize(13)
    .text(`HN: ${patient.hn || "-"}`, { lineGap: 6 })
    .text(`ชื่อ-นามสกุล: ${patient.first_name} ${patient.last_name}`)
    .moveDown(1.5);

  // Certificate body
  doc
    .fontSize(13)
    .text("การวิเคราะห์โรค:", { continued: false })
    .moveDown(0.5)
    .text(`${cert.reason || "-"}`, { indent: 20, lineGap: 4 })
    .moveDown(0.5)
    .text("ความคิดเห็นของแพทย์:", { continued: false })
    .moveDown(0.5)
    .text(`${cert.other_notes || "-"}`, { indent: 20, lineGap: 4 })
    .moveDown(2);

  // เส้นคั่นก่อนส่วนลายเซ็น
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor("#eeeeee")
    .lineWidth(0.8)
    .stroke()
    .moveDown(2);

  // Doctor sign
  doc
    .fontSize(13)
    .text(`แพทย์ผู้ออกใบรับรอง: ${doctor.full_name || doctor.doctor_id}`, {
      align: "right",
    });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const publicUrl = `/uploads/medcerts/${filename}`;
      resolve({ filePath, publicUrl, filename });
    });
    stream.on("error", reject);
  });
}

module.exports = { generateMedicalCertPDF };