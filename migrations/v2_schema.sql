ALTER TABLE appointment
MODIFY COLUMN status ENUM('pending','approved','rejected','confirmed','cancelled','prechecked','completed');

CREATE TABLE counterTerminalSchedules (
  ct_i int NOT NULL,
  nurse_id varchar(6) DEFAULT NULL,
  schedule_date date DEFAULT NULL
);

CREATE TABLE counterTerminalSchedules (
  ct_id int NOT NULL AUTO_INCREMENT,
  nurse_id varchar(6) DEFAULT NULL,
  schedule_date date DEFAULT NULL,
  PRIMARY KEY (`ct_id`),
  KEY fk_nurseSchedules_nurseID_nurse (nurse_id),
  CONSTRAINT fk_nurseSchedules_nurseID_nurse FOREIGN KEY (nurse_id) REFERENCES nurse (nurse_id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO counterTerminalSchedules (`ct_id`, `nurse_id`, `schedule_date`) VALUES
  (7, 'N00000', '2025-09-29'),
  (9, 'N00001', '2025-09-29'),
  (10, 'N00001', '2025-09-30'),
  (11, 'N00001', '2025-10-07');


-- medical_certificate.sql
CREATE TABLE IF NOT EXISTS medical_certificate (
  cert_id           INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id    INT NOT NULL,
  patient_id        INT NOT NULL,
  doctor_id         VARCHAR(6) NOT NULL,
  issued_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- เวลาที่ออกจริง
  reason            TEXT NULL,      -- เหตุผลประกอบ เช่น "เจ็บป่วย", "ลาป่วย"
  rest_from         DATE NULL,      -- วันที่ให้พัก เริ่ม
  rest_to           DATE NULL,      -- วันที่ให้พัก สิ้นสุด
  other_notes       TEXT NULL,      -- หมายเหตุเพิ่มเติม
  pdf_path          VARCHAR(255) NULL,  -- path ไฟล์ PDF ที่ generate
  status            ENUM('issued','void') NOT NULL DEFAULT 'issued',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_mc_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mc_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mc_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ดัชนีเพื่อค้นหาไวขึ้น
CREATE INDEX idx_mc_doctor ON medical_certificate(doctor_id, issued_at);
CREATE INDEX idx_mc_patient ON medical_certificate(patient_id, issued_at);

ALTER TABLE doctors ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE doctorSchedules
DROP FOREIGN KEY fk_doctorSchedule_doctorId_doctors;

ALTER TABLE doctorSchedules
ADD CONSTRAINT fk_doctorSchedule_doctorId_doctors
FOREIGN KEY (doctor_id)
REFERENCES doctors(doctor_id)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE medical_certificate DROP COLUMN rest_from;
ALTER TABLE medical_certificate DROP COLUMN rest_to;

DROP TABLE choiceScore;
DROP TABLE symptomChoice;
DROP TABLE questions;

-- คำถาม
CREATE TABLE question (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตัวเลือกของคำถาม
CREATE TABLE symptomChoice (
  choice_id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  choice_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_choice_question FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

-- คะแนนของตัวเลือกต่อ service
CREATE TABLE choiceScore (
  choiceScore_id INT AUTO_INCREMENT PRIMARY KEY,
  choice_id INT NOT NULL,
  service_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_choice_service (choice_id, service_id),
  CONSTRAINT fk_cs_choice FOREIGN KEY (choice_id) REFERENCES symptomChoice(choice_id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE RESTRICT
);

-- เก็บผลการทำแบบประเมิน
CREATE TABLE symptomAssessmentResult (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  recommended_service_id INT NOT NULL,
  total_scores_json JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sar_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE RESTRICT,
  CONSTRAINT fk_sar_service FOREIGN KEY (recommended_service_id) REFERENCES services(service_id) ON DELETE RESTRICT
);

ALTER TABLE patient
ADD COLUMN is_blacklisted BOOLEAN DEFAULT FALSE;
