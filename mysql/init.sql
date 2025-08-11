-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Aug 11, 2025 at 05:31 PM
-- Server version: 8.0.43
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clinic_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `advice`
--

CREATE TABLE `advice` (
  `advice_id` int NOT NULL,
  `advice_text` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `advice`
--

INSERT INTO `advice` (`advice_id`, `advice_text`) VALUES
(1, 'งดน้ำก่อนเวลานัด 1 ชั่วโมง'),
(3, 'งดอาหารและน้ำก่อนเข้าเวลานัด 1 ชั่วโมง');

-- --------------------------------------------------------

--
-- Table structure for table `adviceService`
--

CREATE TABLE `adviceService` (
  `service_id` int NOT NULL,
  `advice_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `adviceService`
--

INSERT INTO `adviceService` (`service_id`, `advice_id`) VALUES
(1, 1),
(2, 1),
(1, 3),
(3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `choiceScore`
--

CREATE TABLE `choiceScore` (
  `choiceScore_id` int NOT NULL,
  `service_id` int NOT NULL,
  `choice_id` int NOT NULL,
  `score` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `doctor_id` varchar(6) NOT NULL,
  `full_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`doctor_id`, `full_name`, `phone_number`, `email`) VALUES
('D00000', 'พญ. นรี ใจบุญ', '0999999999', 'dr.naree@hospital.com'),
('D00001', 'พญ. คารีมา', '0999999999', 'dr.kareema@hospital.com'),
('D00002', 'พญ. สมศรี จันทร์สว่าง', '0987654321', 'dr.somsri@hospital.com');

-- --------------------------------------------------------

--
-- Table structure for table `doctorSchedules`
--

CREATE TABLE `doctorSchedules` (
  `ds_id` int NOT NULL,
  `service_id` int NOT NULL,
  `doctor_id` varchar(6) NOT NULL,
  `room_id` int NOT NULL,
  `schedule_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `doctorSchedules`
--

INSERT INTO `doctorSchedules` (`ds_id`, `service_id`, `doctor_id`, `room_id`, `schedule_date`, `time_start`, `time_end`, `created_at`, `updated_at`) VALUES
(26, 3, 'D00000', 2, '2025-08-11', '08:00:00', '09:00:00', '2025-08-09 17:24:57', '2025-08-09 17:24:57'),
(27, 3, 'D00002', 2, '2025-08-11', '09:00:00', '10:00:00', '2025-08-09 17:25:57', '2025-08-09 17:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `doctorService`
--

CREATE TABLE `doctorService` (
  `doctor_id` varchar(10) NOT NULL,
  `service_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `doctorService`
--

INSERT INTO `doctorService` (`doctor_id`, `service_id`) VALUES
('D00001', 1),
('D00002', 3),
('D00000', 2),
('D00000', 3);

-- --------------------------------------------------------

--
-- Table structure for table `examRoom`
--

CREATE TABLE `examRoom` (
  `room_id` int NOT NULL,
  `room_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `examRoom`
--

INSERT INTO `examRoom` (`room_id`, `room_name`) VALUES
(2, 'ห้องตรวจทั่วไป'),
(4, 'ห้องส่องกล้อง');

-- --------------------------------------------------------

--
-- Table structure for table `examRoomService`
--

CREATE TABLE `examRoomService` (
  `room_id` int NOT NULL,
  `service_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `examRoomService`
--

INSERT INTO `examRoomService` (`room_id`, `service_id`) VALUES
(4, 1),
(2, 2),
(2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `examRoomSlots`
--

CREATE TABLE `examRoomSlots` (
  `ers_id` int NOT NULL,
  `ds_id` int NOT NULL,
  `slot_start` time NOT NULL,
  `slot_end` time NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `examRoomSlots`
--

INSERT INTO `examRoomSlots` (`ers_id`, `ds_id`, `slot_start`, `slot_end`, `is_booked`, `updated_at`) VALUES
(121, 26, '08:00:00', '08:15:00', 0, '2025-08-09 17:24:57'),
(122, 26, '08:15:00', '08:30:00', 0, '2025-08-09 17:24:57'),
(123, 26, '08:30:00', '08:45:00', 0, '2025-08-09 17:24:57'),
(124, 26, '08:45:00', '09:00:00', 0, '2025-08-09 17:24:57'),
(125, 27, '09:00:00', '09:15:00', 0, '2025-08-09 17:25:57'),
(126, 27, '09:15:00', '09:30:00', 0, '2025-08-09 17:25:57'),
(127, 27, '09:30:00', '09:45:00', 0, '2025-08-09 17:25:57'),
(128, 27, '09:45:00', '10:00:00', 0, '2025-08-09 17:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE `patient` (
  `patient_id` int NOT NULL,
  `hn` int NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`patient_id`, `hn`, `first_name`, `last_name`, `date_of_birth`, `phone_number`) VALUES
(2, 1234567, 'จริงใจ', 'งามสง่า', '1999-08-10', '0912345678'),
(3, 5556666, 'สมหญิง', 'ใจแกร่ง', '2025-08-03', '0991234567');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `question_id` int NOT NULL,
  `question_text` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int NOT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `img_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_name`, `description`, `price`, `img_path`) VALUES
(1, 'ตรวจภายใน', 'ส่องกล้องเพื่อตรวจภายใน', 1500.00, 'Internal-examination.jpg'),
(2, 'มารดาและทารกในครรภ์', 'การตรวจคลื่นเสี่ยงความถี่ทางสูติศาสตร์และนรีเวชวิทยา', 2300.00, 'maternal-fetal-unit.jpg'),
(3, 'วางแผนครอบครัว', '-', 1000.00, 'family-planing.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `symptomChoice`
--

CREATE TABLE `symptomChoice` (
  `choice_id` int NOT NULL,
  `question_id` int NOT NULL,
  `choice_text` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

CREATE TABLE `user_accounts` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('patient','doctor','nurse','head_nurse','admin') NOT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`id`, `email`, `password_hash`, `role`, `entity_id`, `created_at`, `updated_at`) VALUES
(1, 'patient@gmail.com', '$2b$10$CgrirVJ7L1vWqUubK8GEMuN/97QLEwYLtdIpPPdb3jUws7OAxBUvC', 'patient', NULL, '2025-07-15 18:48:46', '2025-07-15 18:48:46'),
(2, 'doctor0@hospital.com', '$2b$10$0PRsn8m/69wUqZDkUcOC0eGZiaCOqCbyHhab/2uYJrJQ4Ji77ikH6', 'doctor', 'D00000', '2025-07-15 19:03:20', '2025-07-19 13:09:14'),
(3, 'nurse0@hospital.com', '$2b$10$0XYiEohrRBG6tn2F/fHFLepx2gp/jiILEsQtIFKH8A0.a71LTnqJS', 'nurse', 'N00000', '2025-07-19 13:12:25', '2025-07-19 13:12:25'),
(4, 'jingjai@gmail.com', '$2b$10$iGqcHyPNn7EqypXTwFYPDuhJ907..QlS8A0REYeFPpzgwpLaT8haa', 'patient', '2', '2025-08-09 20:37:13', '2025-08-09 20:37:13'),
(5, 'somying@gmail.com', '$2b$10$nM3AqCGT7oBL6oTX1GmivunToYQKrBbEsrzOCnQZb/tYW3AzuCLl2', 'patient', '3', '2025-08-09 20:47:40', '2025-08-09 20:47:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advice`
--
ALTER TABLE `advice`
  ADD PRIMARY KEY (`advice_id`);

--
-- Indexes for table `adviceService`
--
ALTER TABLE `adviceService`
  ADD PRIMARY KEY (`service_id`,`advice_id`),
  ADD KEY `fk_adviceService_adviceID_advice` (`advice_id`);

--
-- Indexes for table `choiceScore`
--
ALTER TABLE `choiceScore`
  ADD PRIMARY KEY (`choiceScore_id`),
  ADD KEY `fk_choiceScore_choiceID_symptomChoice` (`choice_id`),
  ADD KEY `fk_choiceScore_serviceID_services` (`service_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`doctor_id`);

--
-- Indexes for table `doctorSchedules`
--
ALTER TABLE `doctorSchedules`
  ADD PRIMARY KEY (`ds_id`),
  ADD KEY `fk_doctorSchedule_serviceId_services` (`service_id`),
  ADD KEY `fk_doctorSchedule_doctorId_doctors` (`doctor_id`),
  ADD KEY `fk_doctorSchedule_roomId_examroom` (`room_id`);

--
-- Indexes for table `doctorService`
--
ALTER TABLE `doctorService`
  ADD KEY `fk_doctorService_serviceID_services` (`service_id`),
  ADD KEY `fk_doctorService_doctorID_doctors` (`doctor_id`);

--
-- Indexes for table `examRoom`
--
ALTER TABLE `examRoom`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `examRoomService`
--
ALTER TABLE `examRoomService`
  ADD PRIMARY KEY (`room_id`,`service_id`),
  ADD KEY `fk_examRoomService_serviceID_services` (`service_id`);

--
-- Indexes for table `examRoomSlots`
--
ALTER TABLE `examRoomSlots`
  ADD PRIMARY KEY (`ers_id`),
  ADD UNIQUE KEY `uq_ds_slot` (`ds_id`,`slot_start`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`patient_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`question_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`);

--
-- Indexes for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  ADD PRIMARY KEY (`choice_id`),
  ADD KEY `fk_symptomChoice_questionID_questions` (`question_id`);

--
-- Indexes for table `user_accounts`
--
ALTER TABLE `user_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advice`
--
ALTER TABLE `advice`
  MODIFY `advice_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `choiceScore`
--
ALTER TABLE `choiceScore`
  MODIFY `choiceScore_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctorSchedules`
--
ALTER TABLE `doctorSchedules`
  MODIFY `ds_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `examRoom`
--
ALTER TABLE `examRoom`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `examRoomSlots`
--
ALTER TABLE `examRoomSlots`
  MODIFY `ers_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `patient_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `question_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  MODIFY `choice_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adviceService`
--
ALTER TABLE `adviceService`
  ADD CONSTRAINT `fk_adviceService_adviceID_advice` FOREIGN KEY (`advice_id`) REFERENCES `advice` (`advice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_adviceService_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `choiceScore`
--
ALTER TABLE `choiceScore`
  ADD CONSTRAINT `fk_choiceScore_choiceID_symptomChoice` FOREIGN KEY (`choice_id`) REFERENCES `symptomChoice` (`choice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_choiceScore_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `doctorSchedules`
--
ALTER TABLE `doctorSchedules`
  ADD CONSTRAINT `fk_doctorSchedule_doctorId_doctors` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doctorSchedule_roomId_examroom` FOREIGN KEY (`room_id`) REFERENCES `examRoom` (`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doctorSchedule_serviceId_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `doctorService`
--
ALTER TABLE `doctorService`
  ADD CONSTRAINT `fk_doctorService_doctorID_doctors` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doctorService_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `examRoomService`
--
ALTER TABLE `examRoomService`
  ADD CONSTRAINT `fk_examRoomService_roomID_examRoom` FOREIGN KEY (`room_id`) REFERENCES `examRoom` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_examRoomService_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `examRoomSlots`
--
ALTER TABLE `examRoomSlots`
  ADD CONSTRAINT `fk_ers_dsID_doctorSchedule` FOREIGN KEY (`ds_id`) REFERENCES `doctorSchedules` (`ds_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  ADD CONSTRAINT `fk_symptomChoice_questionID_questions` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
