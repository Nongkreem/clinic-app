-- related_appointment สำหรับเชื่อมโยงกับนัดก่อนหน้า
ALTER TABLE appointment
ADD COLUMN related_appointment_id INT NULL,
ADD CONSTRAINT fk_related_appointment FOREIGN KEY (related_appointment_id)
REFERENCES appointment(appointment_id) ON DELETE SET NULL;
