-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 01, 2025 at 07:27 AM
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

CREATE TABLE IF NOT EXISTS `advice` (
  `advice_id` int NOT NULL AUTO_INCREMENT,
  `advice_text` text,
  PRIMARY KEY (`advice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `adviceService`
--

CREATE TABLE IF NOT EXISTS `adviceService` (
  `service_id` int NOT NULL,
  `advice_id` int NOT NULL,
  PRIMARY KEY (`service_id`,`advice_id`),
  KEY `fk_adviceService_adviceID_advice` (`advice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE IF NOT EXISTS `appointment` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `ers_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `ds_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `symptoms` text,
  `status` enum('pending','approved','rejected','confirmed','cancelled','prechecked') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending',
  `confirmCheckInTime` timestamp NULL DEFAULT NULL,
  `appointmentType` enum('patient_booking','doctor_follow_up') NOT NULL DEFAULT 'patient_booking',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `service_id` int NOT NULL,
  `doctor_id` varchar(6) NOT NULL,
  `room_id` int NOT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `fk_appointment_ersId_ers` (`ers_id`),
  KEY `fk_appointment_patient` (`patient_id`),
  KEY `fk_appointment_dsId_ds` (`ds_id`),
  KEY `fk_appointments_service_id` (`service_id`),
  KEY `fk_appointments_doctor_id` (`doctor_id`),
  KEY `fk_appointments_room_id` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `choiceScore`
--

CREATE TABLE IF NOT EXISTS `choiceScore` (
  `choiceScore_id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `choice_id` int NOT NULL,
  `score` int DEFAULT NULL,
  PRIMARY KEY (`choiceScore_id`),
  KEY `fk_choiceScore_choiceID_symptomChoice` (`choice_id`),
  KEY `fk_choiceScore_serviceID_services` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `counterTerminalSchedules`
--

CREATE TABLE IF NOT EXISTS `counterTerminalSchedules` (
  `ct_id` int NOT NULL AUTO_INCREMENT,
  `nurse_id` varchar(6) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  PRIMARY KEY (`ct_id`),
  KEY `fk_nurseSchedules_nurseID_nurse` (`nurse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE IF NOT EXISTS `doctors` (
  `doctor_id` varchar(6) NOT NULL,
  `full_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctorSchedules`
--

CREATE TABLE IF NOT EXISTS `doctorSchedules` (
  `ds_id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `doctor_id` varchar(6) NOT NULL,
  `room_id` int NOT NULL,
  `schedule_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ds_id`),
  KEY `fk_doctorSchedule_serviceId_services` (`service_id`),
  KEY `fk_doctorSchedule_doctorId_doctors` (`doctor_id`),
  KEY `fk_doctorSchedule_roomId_examroom` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctorService`
--

CREATE TABLE IF NOT EXISTS `doctorService` (
  `doctor_id` varchar(10) NOT NULL,
  `service_id` int NOT NULL,
  KEY `fk_doctorService_serviceID_services` (`service_id`),
  KEY `fk_doctorService_doctorID_doctors` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examRoom`
--

CREATE TABLE IF NOT EXISTS `examRoom` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examRoomService`
--

CREATE TABLE IF NOT EXISTS `examRoomService` (
  `room_id` int NOT NULL,
  `service_id` int NOT NULL,
  PRIMARY KEY (`room_id`,`service_id`),
  KEY `fk_examRoomService_serviceID_services` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examRoomSlots`
--

CREATE TABLE IF NOT EXISTS `examRoomSlots` (
  `ers_id` int NOT NULL AUTO_INCREMENT,
  `ds_id` int NOT NULL,
  `slot_start` time NOT NULL,
  `slot_end` time NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ers_id`),
  UNIQUE KEY `uq_ds_slot` (`ds_id`,`slot_start`)
) ENGINE=InnoDB AUTO_INCREMENT=689 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medicalRecord`
--

CREATE TABLE IF NOT EXISTS `medicalRecord` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` varchar(6) NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `precheck_id` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `diagnosis` text NOT NULL,
  `treatment` text NOT NULL,
  `blood_pressure` varchar(10) NOT NULL,
  `heart_rate` int NOT NULL,
  `temperature` decimal(4,1) NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `height` decimal(5,2) NOT NULL,
  `other_notes` text,
  `follow_up_date` date DEFAULT NULL,
  PRIMARY KEY (`record_id`),
  KEY `fk_medical_patient` (`patient_id`),
  KEY `fk_medical_doctor` (`doctor_id`),
  KEY `fk_medical_appointment` (`appointment_id`),
  KEY `fk_medical_precheck` (`precheck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nurse`
--

CREATE TABLE IF NOT EXISTS `nurse` (
  `nurse_id` varchar(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `gmail` varchar(50) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `service_id` int NOT NULL,
  PRIMARY KEY (`nurse_id`),
  KEY `fk_nurse_serviceID_services` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE IF NOT EXISTS `patient` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `hn` int NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  `cancellation_count` int NOT NULL DEFAULT '0',
  `blacklist_until` datetime DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_precheck`
--

CREATE TABLE IF NOT EXISTS `patient_precheck` (
  `precheck_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `nurse_id` varchar(6) NOT NULL,
  `blood_pressure` varchar(10) NOT NULL,
  `heart_rate` int NOT NULL,
  `temperature` decimal(4,1) NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `height` decimal(5,2) NOT NULL,
  `other_notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`precheck_id`),
  KEY `fk_precheck_appointment` (`appointment_id`),
  KEY `fk_precheck_nurse` (`nurse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE IF NOT EXISTS `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `question_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE IF NOT EXISTS `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `img_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `symptomChoice`
--

CREATE TABLE IF NOT EXISTS `symptomChoice` (
  `choice_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `choice_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`choice_id`),
  KEY `fk_symptomChoice_questionID_questions` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

CREATE TABLE IF NOT EXISTS `user_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `role` enum('patient','doctor','nurse','head_nurse','admin') NOT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_counter_terminal` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`id`, `email`, `password_hash`, `role`, `entity_id`, `created_at`, `updated_at`, `is_counter_terminal`) VALUES
(1, 'patient@gmail.com', '$2b$10$CgrirVJ7L1vWqUubK8GEMuN/97QLEwYLtdIpPPdb3jUws7OAxBUvC', 'patient', NULL, '2025-07-15 18:48:46', '2025-07-15 18:48:46', 0),
(2, 'doctor0@hospital.com', '$2b$10$0PRsn8m/69wUqZDkUcOC0eGZiaCOqCbyHhab/2uYJrJQ4Ji77ikH6', 'doctor', 'D00000', '2025-07-15 19:03:20', '2025-07-19 13:09:14', 0),
(3, 'nurse0@hospital.com', '$2b$10$0XYiEohrRBG6tn2F/fHFLepx2gp/jiILEsQtIFKH8A0.a71LTnqJS', 'nurse', 'N00000', '2025-07-19 13:12:25', '2025-09-30 07:13:37', 0),
(4, 'jingjai@gmail.com', '$2b$10$iGqcHyPNn7EqypXTwFYPDuhJ907..QlS8A0REYeFPpzgwpLaT8haa', 'patient', '2', '2025-08-09 20:37:13', '2025-08-09 20:37:13', 0),
(5, 'somying@gmail.com', '$2b$10$nM3AqCGT7oBL6oTX1GmivunToYQKrBbEsrzOCnQZb/tYW3AzuCLl2', 'patient', '3', '2025-08-09 20:47:40', '2025-08-09 20:47:40', 0),
(6, 'munin@gmail.com', '$2b$10$kq/m3oO7WqPVF0S6fIvPxeGe6Kp7l4NhSrw6EMIN74A6.Lt5fa2oe', 'patient', '4', '2025-08-18 17:38:44', '2025-08-18 17:38:44', 0),
(7, 'ice@gmail.com', '$2b$10$Wr7sDqFuHrKRLVBpLuNSGeXrRSJgFFw8ICbPuXeF3ARFdLILUgVfS', 'patient', '5', '2025-08-19 04:49:34', '2025-08-19 04:49:34', 0),
(8, 'kimji@gmail.com', '$2b$10$9NKKuHE9E.kXgqjnRVsU5e06vCT.GsW89BoAvrxpC4ygBBa1DcpUe', 'patient', '6', '2025-08-20 07:32:05', '2025-08-20 07:32:05', 0),
(9, 'chuchi@gmail.com', '$2b$10$ZIqRsdsyByBLDCofTokmyuC.6m5jyey8USS0d5FdQSOQu9TP6hrCe', 'patient', '7', '2025-08-20 07:33:18', '2025-08-20 07:33:18', 0),
(10, 'headnurse0@hospital.com', '$2b$10$Y60sC0u3c0jmcWeRLUSCAOH4xaa1Hvcf6CmTw97aGPFR6dFhnPurm', 'head_nurse', 'H00000', '2025-09-10 13:57:31', '2025-09-10 13:57:31', 0),
(11, 'green@hospital.com', '$2b$10$79gLLHG24ofERsQe7uWrfOStAp.tHaTy02cwqN5bTPyrPB2T3Upw6', 'nurse', 'N00001', '2025-09-17 12:37:13', '2025-09-30 08:09:43', 1),
(12, 'somchuet.c@hospital.com', '$2b$10$j3a0RgSMKDOjju5Y8mgmZ.4TYeuk5h73RjoDLSqzV7ffVaxsr6NMu', 'nurse', 'N00003', '2025-09-30 08:44:31', '2025-09-30 08:45:46', 0);

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
-- Constraints for table `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `fk_appointment_dsId_ds` FOREIGN KEY (`ds_id`) REFERENCES `doctorSchedules` (`ds_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointment_ersId_ers` FOREIGN KEY (`ers_id`) REFERENCES `examRoomSlots` (`ers_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_room_id` FOREIGN KEY (`room_id`) REFERENCES `examRoom` (`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `choiceScore`
--
ALTER TABLE `choiceScore`
  ADD CONSTRAINT `fk_choiceScore_choiceID_symptomChoice` FOREIGN KEY (`choice_id`) REFERENCES `symptomChoice` (`choice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_choiceScore_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `counterTerminalSchedules`
--
ALTER TABLE `counterTerminalSchedules`
  ADD CONSTRAINT `fk_nurseSchedules_nurseID_nurse` FOREIGN KEY (`nurse_id`) REFERENCES `nurse` (`nurse_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctorSchedules`
--
ALTER TABLE `doctorSchedules`
  ADD CONSTRAINT `fk_doctorSchedule_doctorId_doctors` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doctorSchedule_roomId_examroom` FOREIGN KEY (`room_id`) REFERENCES `examRoom` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doctorSchedule_serviceId_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `medicalRecord`
--
ALTER TABLE `medicalRecord`
  ADD CONSTRAINT `fk_medical_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_medical_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_medical_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_medical_precheck` FOREIGN KEY (`precheck_id`) REFERENCES `patient_precheck` (`precheck_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `nurse`
--
ALTER TABLE `nurse`
  ADD CONSTRAINT `fk_nurse_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `patient_precheck`
--
ALTER TABLE `patient_precheck`
  ADD CONSTRAINT `fk_precheck_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_precheck_nurse` FOREIGN KEY (`nurse_id`) REFERENCES `nurse` (`nurse_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  ADD CONSTRAINT `fk_symptomChoice_questionID_questions` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
