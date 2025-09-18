-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Sep 17, 2025 at 02:46 PM
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
(4, 'งดการมีเพศสัมพันธ์อย่างน้อย 24-48 ชั่วโมงก่อนเข้ารับการตรวจ'),
(5, 'งดการสวนล้างช่องคลอด งดใช้ยาเหน็บและเจลหล่อลื่นบริเวณอวัยวะเพศ 1-2 วันก่อนตรวจ'),
(6, 'ไม่ควรตรวจในช่วงมีประจำเดือน'),
(7, 'หลีกเลี่ยงการใช้ผ้าอนามัยแบบสอด ควรใช้แบบธรรมดาแทน'),
(8, 'หลีกเลี่ยงกิจกรรมหรือการมีเพศสัมพันธ์ก่อนตรวจเพื่อความแม่นยำของผลตรวจในบางกรณี');

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
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(4, 8);

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `appointment_id` int NOT NULL,
  `ers_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `ds_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `symptoms` text,
  `status` enum('pending','approved','rejected','confirmed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending',
  `confirmCheckInTime` timestamp NULL DEFAULT NULL,
  `appointmentType` enum('patient_booking','doctor_follow_up') NOT NULL DEFAULT 'patient_booking',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`appointment_id`, `ers_id`, `patient_id`, `ds_id`, `appointment_date`, `appointment_time`, `symptoms`, `status`, `confirmCheckInTime`, `appointmentType`, `rejection_reason`) VALUES
(19, 602, 6, 56, '2025-09-17', '08:15:00', 'ทดสอบสถานะคำขอนัดหมายหลังจากผู้ป่วยกดยืนยันเข้ารับการรักษา', 'confirmed', '2025-09-16 14:14:34', 'patient_booking', NULL);

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
('D12345', 'พญ คารีมา แม', '0924664420', 'ka@email.com'),
('D24087', 'พญ.ภัทรา', '0812345678', 'd.patha@hospital.com'),
('D24112', 'พญ.คารีน่า', '0987341256', 'd.karina@hospital.com'),
('D41100', 'พญ.นิภา', '0975648305', 'doctor.nipa@hospital.ac.th'),
('D41198', 'พญ.ทิชา', '0888888888', 'd.ticha@hospital.ac.th'),
('D52102', 'อ.สมหญิง', '0999999999', 'aj.somying@hospital.ac.th'),
('D52103', 'อ.นรีรัตน์ ใจดี', '0987654321', 'aj.naree@hospital.ac.th');

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
(36, 2, 'D24112', 6, '2025-08-18', '08:00:00', '12:00:00', '2025-08-15 04:40:52', '2025-08-15 04:40:52'),
(37, 2, 'D24112', 6, '2025-08-25', '08:00:00', '12:00:00', '2025-08-15 04:40:52', '2025-08-15 04:40:52'),
(38, 2, 'D24112', 6, '2025-09-01', '08:00:00', '12:00:00', '2025-08-15 04:40:52', '2025-08-15 04:40:52'),
(39, 2, 'D24087', 7, '2025-08-18', '08:00:00', '16:00:00', '2025-08-15 04:41:38', '2025-08-15 04:41:38'),
(40, 2, 'D24087', 7, '2025-08-24', '08:00:00', '12:00:00', '2025-08-15 04:41:38', '2025-09-16 10:05:19'),
(41, 2, 'D24087', 7, '2025-09-01', '08:00:00', '16:00:00', '2025-08-15 04:41:38', '2025-08-15 04:41:38'),
(46, 4, 'D41198', 6, '2025-08-19', '08:00:00', '12:00:00', '2025-08-19 06:08:43', '2025-08-19 06:08:43'),
(47, 4, 'D41100', 6, '2025-08-19', '13:00:00', '16:00:00', '2025-08-19 06:08:43', '2025-08-19 06:08:43'),
(48, 4, 'D41198', 6, '2025-08-26', '08:00:00', '12:00:00', '2025-08-19 06:08:43', '2025-08-19 06:08:43'),
(49, 4, 'D41100', 6, '2025-08-26', '13:00:00', '16:00:00', '2025-08-19 06:08:43', '2025-08-19 06:08:43'),
(54, 5, 'D52103', 10, '2025-08-25', '08:00:00', '16:00:00', '2025-08-20 08:22:07', '2025-08-20 08:22:07'),
(55, 5, 'D52102', 11, '2025-08-25', '08:00:00', '16:00:00', '2025-08-20 08:22:07', '2025-08-20 08:22:07'),
(56, 4, 'D12345', 6, '2025-09-17', '08:00:00', '09:00:00', '2025-09-16 06:41:59', '2025-09-16 06:41:59'),
(57, 4, 'D12345', 6, '2025-09-24', '08:00:00', '09:00:00', '2025-09-16 06:41:59', '2025-09-16 06:41:59');

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
('D52102', 5),
('D52103', 5),
('D41100', 4),
('D41198', 4),
('D24087', 2),
('D24112', 2),
('D12345', 4);

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
(6, 'ห้องตรวจคลื่นความถี่สูง 1'),
(7, 'ห้องตรวจคลื่นความถี่สูง 2'),
(8, 'ห้องทำหัตถการ 1'),
(9, 'ห้องทำหัตถการ 2'),
(10, 'ห้องตรวจและหัตถการ Colposcope 1'),
(11, 'ห้องตรวจและหัตถการ Colposcope 2');

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
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(6, 4),
(7, 4),
(8, 4),
(9, 4),
(10, 5),
(11, 5);

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
(177, 36, '08:00:00', '08:15:00', 1, '2025-08-18 14:13:36'),
(178, 36, '08:15:00', '08:30:00', 0, '2025-08-15 04:40:52'),
(179, 36, '08:30:00', '08:45:00', 0, '2025-08-18 14:12:49'),
(180, 36, '08:45:00', '09:00:00', 0, '2025-08-15 04:40:52'),
(181, 36, '09:00:00', '09:15:00', 0, '2025-08-15 04:40:52'),
(182, 36, '09:15:00', '09:30:00', 0, '2025-08-15 04:40:52'),
(183, 36, '09:30:00', '09:45:00', 0, '2025-08-15 04:40:52'),
(184, 36, '09:45:00', '10:00:00', 0, '2025-08-15 04:40:52'),
(185, 36, '10:00:00', '10:15:00', 0, '2025-08-15 04:40:52'),
(186, 36, '10:15:00', '10:30:00', 0, '2025-08-15 04:40:52'),
(187, 36, '10:30:00', '10:45:00', 0, '2025-08-15 04:40:52'),
(188, 36, '10:45:00', '11:00:00', 0, '2025-08-15 04:40:52'),
(189, 36, '11:00:00', '11:15:00', 0, '2025-08-15 04:40:52'),
(190, 36, '11:15:00', '11:30:00', 0, '2025-08-15 04:40:52'),
(191, 36, '11:30:00', '11:45:00', 0, '2025-08-15 04:40:52'),
(192, 36, '11:45:00', '12:00:00', 0, '2025-08-15 04:40:52'),
(193, 37, '08:00:00', '08:15:00', 1, '2025-08-19 06:15:20'),
(194, 37, '08:15:00', '08:30:00', 0, '2025-08-19 08:12:55'),
(195, 37, '08:30:00', '08:45:00', 0, '2025-08-15 04:40:52'),
(196, 37, '08:45:00', '09:00:00', 0, '2025-08-15 04:40:52'),
(197, 37, '09:00:00', '09:15:00', 0, '2025-08-15 04:40:52'),
(198, 37, '09:15:00', '09:30:00', 0, '2025-08-15 04:40:52'),
(199, 37, '09:30:00', '09:45:00', 0, '2025-08-15 04:40:52'),
(200, 37, '09:45:00', '10:00:00', 0, '2025-08-15 04:40:52'),
(201, 37, '10:00:00', '10:15:00', 0, '2025-08-15 04:40:52'),
(202, 37, '10:15:00', '10:30:00', 0, '2025-08-15 04:40:52'),
(203, 37, '10:30:00', '10:45:00', 0, '2025-08-15 04:40:52'),
(204, 37, '10:45:00', '11:00:00', 0, '2025-08-15 04:40:52'),
(205, 37, '11:00:00', '11:15:00', 0, '2025-08-15 04:40:52'),
(206, 37, '11:15:00', '11:30:00', 0, '2025-08-15 04:40:52'),
(207, 37, '11:30:00', '11:45:00', 0, '2025-08-15 04:40:52'),
(208, 37, '11:45:00', '12:00:00', 0, '2025-08-15 04:40:52'),
(209, 38, '08:00:00', '08:15:00', 0, '2025-08-15 04:40:52'),
(210, 38, '08:15:00', '08:30:00', 0, '2025-08-15 04:40:52'),
(211, 38, '08:30:00', '08:45:00', 0, '2025-08-15 04:40:52'),
(212, 38, '08:45:00', '09:00:00', 0, '2025-08-15 04:40:52'),
(213, 38, '09:00:00', '09:15:00', 0, '2025-08-15 04:40:52'),
(214, 38, '09:15:00', '09:30:00', 0, '2025-08-15 04:40:52'),
(215, 38, '09:30:00', '09:45:00', 0, '2025-08-15 04:40:52'),
(216, 38, '09:45:00', '10:00:00', 0, '2025-08-15 04:40:52'),
(217, 38, '10:00:00', '10:15:00', 0, '2025-08-15 04:40:52'),
(218, 38, '10:15:00', '10:30:00', 0, '2025-08-15 04:40:52'),
(219, 38, '10:30:00', '10:45:00', 0, '2025-08-15 04:40:52'),
(220, 38, '10:45:00', '11:00:00', 0, '2025-08-15 04:40:52'),
(221, 38, '11:00:00', '11:15:00', 0, '2025-08-15 04:40:52'),
(222, 38, '11:15:00', '11:30:00', 0, '2025-08-15 04:40:52'),
(223, 38, '11:30:00', '11:45:00', 0, '2025-08-15 04:40:52'),
(224, 38, '11:45:00', '12:00:00', 0, '2025-08-15 04:40:52'),
(225, 39, '08:00:00', '08:15:00', 1, '2025-08-15 14:38:53'),
(226, 39, '08:15:00', '08:30:00', 1, '2025-08-18 11:45:06'),
(227, 39, '08:30:00', '08:45:00', 0, '2025-08-15 04:41:38'),
(228, 39, '08:45:00', '09:00:00', 0, '2025-08-15 04:41:38'),
(229, 39, '09:00:00', '09:15:00', 0, '2025-08-15 04:41:38'),
(230, 39, '09:15:00', '09:30:00', 0, '2025-08-18 14:12:44'),
(231, 39, '09:30:00', '09:45:00', 0, '2025-08-15 04:41:38'),
(232, 39, '09:45:00', '10:00:00', 0, '2025-08-15 04:41:38'),
(233, 39, '10:00:00', '10:15:00', 0, '2025-08-15 04:41:38'),
(234, 39, '10:15:00', '10:30:00', 0, '2025-08-15 04:41:38'),
(235, 39, '10:30:00', '10:45:00', 0, '2025-08-15 04:41:38'),
(236, 39, '10:45:00', '11:00:00', 0, '2025-08-15 04:41:38'),
(237, 39, '11:00:00', '11:15:00', 0, '2025-08-15 04:41:38'),
(238, 39, '11:15:00', '11:30:00', 0, '2025-08-15 04:41:38'),
(239, 39, '11:30:00', '11:45:00', 0, '2025-08-15 04:41:38'),
(240, 39, '11:45:00', '12:00:00', 0, '2025-08-15 04:41:38'),
(241, 39, '12:00:00', '12:15:00', 0, '2025-08-15 04:41:38'),
(242, 39, '12:15:00', '12:30:00', 0, '2025-08-15 04:41:38'),
(243, 39, '12:30:00', '12:45:00', 0, '2025-08-15 04:41:38'),
(244, 39, '12:45:00', '13:00:00', 0, '2025-08-15 04:41:38'),
(245, 39, '13:00:00', '13:15:00', 0, '2025-08-15 04:41:38'),
(246, 39, '13:15:00', '13:30:00', 0, '2025-08-15 04:41:38'),
(247, 39, '13:30:00', '13:45:00', 0, '2025-08-15 04:41:38'),
(248, 39, '13:45:00', '14:00:00', 0, '2025-08-15 04:41:38'),
(249, 39, '14:00:00', '14:15:00', 0, '2025-08-15 04:41:38'),
(250, 39, '14:15:00', '14:30:00', 0, '2025-08-15 04:41:38'),
(251, 39, '14:30:00', '14:45:00', 0, '2025-08-15 04:41:38'),
(252, 39, '14:45:00', '15:00:00', 0, '2025-08-15 04:41:38'),
(253, 39, '15:00:00', '15:15:00', 0, '2025-08-15 04:41:38'),
(254, 39, '15:15:00', '15:30:00', 0, '2025-08-15 04:41:38'),
(255, 39, '15:30:00', '15:45:00', 0, '2025-08-15 04:41:38'),
(256, 39, '15:45:00', '16:00:00', 0, '2025-08-15 04:41:38'),
(289, 41, '08:00:00', '08:15:00', 0, '2025-08-15 04:41:38'),
(290, 41, '08:15:00', '08:30:00', 0, '2025-08-15 04:41:38'),
(291, 41, '08:30:00', '08:45:00', 0, '2025-08-15 04:41:38'),
(292, 41, '08:45:00', '09:00:00', 0, '2025-08-15 04:41:38'),
(293, 41, '09:00:00', '09:15:00', 0, '2025-08-15 04:41:38'),
(294, 41, '09:15:00', '09:30:00', 0, '2025-08-15 04:41:38'),
(295, 41, '09:30:00', '09:45:00', 0, '2025-08-15 04:41:38'),
(296, 41, '09:45:00', '10:00:00', 0, '2025-08-15 04:41:38'),
(297, 41, '10:00:00', '10:15:00', 0, '2025-08-15 04:41:38'),
(298, 41, '10:15:00', '10:30:00', 0, '2025-08-15 04:41:38'),
(299, 41, '10:30:00', '10:45:00', 0, '2025-08-15 04:41:38'),
(300, 41, '10:45:00', '11:00:00', 0, '2025-08-15 04:41:38'),
(301, 41, '11:00:00', '11:15:00', 0, '2025-08-15 04:41:38'),
(302, 41, '11:15:00', '11:30:00', 0, '2025-08-15 04:41:38'),
(303, 41, '11:30:00', '11:45:00', 0, '2025-08-15 04:41:38'),
(304, 41, '11:45:00', '12:00:00', 0, '2025-08-15 04:41:38'),
(305, 41, '12:00:00', '12:15:00', 0, '2025-08-15 04:41:38'),
(306, 41, '12:15:00', '12:30:00', 0, '2025-08-15 04:41:38'),
(307, 41, '12:30:00', '12:45:00', 0, '2025-08-15 04:41:38'),
(308, 41, '12:45:00', '13:00:00', 0, '2025-08-15 04:41:38'),
(309, 41, '13:00:00', '13:15:00', 0, '2025-08-15 04:41:38'),
(310, 41, '13:15:00', '13:30:00', 0, '2025-08-15 04:41:38'),
(311, 41, '13:30:00', '13:45:00', 0, '2025-08-15 04:41:38'),
(312, 41, '13:45:00', '14:00:00', 0, '2025-08-15 04:41:38'),
(313, 41, '14:00:00', '14:15:00', 0, '2025-08-15 04:41:38'),
(314, 41, '14:15:00', '14:30:00', 0, '2025-08-15 04:41:38'),
(315, 41, '14:30:00', '14:45:00', 0, '2025-08-15 04:41:38'),
(316, 41, '14:45:00', '15:00:00', 0, '2025-08-15 04:41:38'),
(317, 41, '15:00:00', '15:15:00', 0, '2025-08-15 04:41:38'),
(318, 41, '15:15:00', '15:30:00', 0, '2025-08-15 04:41:38'),
(319, 41, '15:30:00', '15:45:00', 0, '2025-08-15 04:41:38'),
(320, 41, '15:45:00', '16:00:00', 0, '2025-08-15 04:41:38'),
(385, 46, '08:00:00', '08:15:00', 0, '2025-08-19 06:08:43'),
(386, 46, '08:15:00', '08:30:00', 0, '2025-08-19 06:08:43'),
(387, 46, '08:30:00', '08:45:00', 0, '2025-08-19 06:08:43'),
(388, 46, '08:45:00', '09:00:00', 0, '2025-08-19 06:08:43'),
(389, 46, '09:00:00', '09:15:00', 0, '2025-08-19 06:08:43'),
(390, 46, '09:15:00', '09:30:00', 0, '2025-08-19 06:08:43'),
(391, 46, '09:30:00', '09:45:00', 0, '2025-08-19 06:08:43'),
(392, 46, '09:45:00', '10:00:00', 0, '2025-08-19 06:08:43'),
(393, 46, '10:00:00', '10:15:00', 0, '2025-08-19 06:08:43'),
(394, 46, '10:15:00', '10:30:00', 0, '2025-08-19 06:08:43'),
(395, 46, '10:30:00', '10:45:00', 0, '2025-08-19 06:08:43'),
(396, 46, '10:45:00', '11:00:00', 0, '2025-08-19 06:08:43'),
(397, 46, '11:00:00', '11:15:00', 0, '2025-08-19 06:08:43'),
(398, 46, '11:15:00', '11:30:00', 0, '2025-08-19 06:08:43'),
(399, 46, '11:30:00', '11:45:00', 0, '2025-08-19 06:08:43'),
(400, 46, '11:45:00', '12:00:00', 0, '2025-08-19 06:08:43'),
(401, 47, '13:00:00', '13:15:00', 0, '2025-08-19 06:08:43'),
(402, 47, '13:15:00', '13:30:00', 0, '2025-08-19 06:08:43'),
(403, 47, '13:30:00', '13:45:00', 0, '2025-08-19 06:08:43'),
(404, 47, '13:45:00', '14:00:00', 0, '2025-08-19 06:08:43'),
(405, 47, '14:00:00', '14:15:00', 0, '2025-08-19 06:08:43'),
(406, 47, '14:15:00', '14:30:00', 0, '2025-08-19 06:08:43'),
(407, 47, '14:30:00', '14:45:00', 0, '2025-08-19 06:08:43'),
(408, 47, '14:45:00', '15:00:00', 0, '2025-08-19 06:08:43'),
(409, 47, '15:00:00', '15:15:00', 0, '2025-08-19 06:08:43'),
(410, 47, '15:15:00', '15:30:00', 0, '2025-08-19 06:08:43'),
(411, 47, '15:30:00', '15:45:00', 0, '2025-08-19 06:08:43'),
(412, 47, '15:45:00', '16:00:00', 1, '2025-08-19 06:14:35'),
(413, 48, '08:00:00', '08:15:00', 0, '2025-08-20 08:24:58'),
(414, 48, '08:15:00', '08:30:00', 0, '2025-08-19 06:08:43'),
(415, 48, '08:30:00', '08:45:00', 0, '2025-08-19 06:08:43'),
(416, 48, '08:45:00', '09:00:00', 0, '2025-08-19 06:08:43'),
(417, 48, '09:00:00', '09:15:00', 0, '2025-08-19 06:08:43'),
(418, 48, '09:15:00', '09:30:00', 0, '2025-08-19 06:08:43'),
(419, 48, '09:30:00', '09:45:00', 0, '2025-08-19 06:08:43'),
(420, 48, '09:45:00', '10:00:00', 0, '2025-08-19 06:08:43'),
(421, 48, '10:00:00', '10:15:00', 0, '2025-08-19 06:08:43'),
(422, 48, '10:15:00', '10:30:00', 1, '2025-08-19 06:26:34'),
(423, 48, '10:30:00', '10:45:00', 0, '2025-08-19 06:08:43'),
(424, 48, '10:45:00', '11:00:00', 0, '2025-08-19 06:08:43'),
(425, 48, '11:00:00', '11:15:00', 0, '2025-08-19 06:08:43'),
(426, 48, '11:15:00', '11:30:00', 0, '2025-08-19 06:08:43'),
(427, 48, '11:30:00', '11:45:00', 0, '2025-08-19 06:08:43'),
(428, 48, '11:45:00', '12:00:00', 0, '2025-08-19 06:08:43'),
(429, 49, '13:00:00', '13:15:00', 0, '2025-08-19 06:08:43'),
(430, 49, '13:15:00', '13:30:00', 0, '2025-08-19 06:08:43'),
(431, 49, '13:30:00', '13:45:00', 0, '2025-08-19 06:08:43'),
(432, 49, '13:45:00', '14:00:00', 0, '2025-08-19 06:08:43'),
(433, 49, '14:00:00', '14:15:00', 0, '2025-08-19 06:08:43'),
(434, 49, '14:15:00', '14:30:00', 0, '2025-08-19 06:08:43'),
(435, 49, '14:30:00', '14:45:00', 0, '2025-08-19 06:08:43'),
(436, 49, '14:45:00', '15:00:00', 0, '2025-08-19 06:08:43'),
(437, 49, '15:00:00', '15:15:00', 0, '2025-08-19 06:08:43'),
(438, 49, '15:15:00', '15:30:00', 0, '2025-08-19 06:08:43'),
(439, 49, '15:30:00', '15:45:00', 0, '2025-08-19 06:08:43'),
(440, 49, '15:45:00', '16:00:00', 0, '2025-08-20 07:46:26'),
(537, 54, '08:00:00', '08:15:00', 0, '2025-08-20 08:22:07'),
(538, 54, '08:15:00', '08:30:00', 0, '2025-08-20 08:22:07'),
(539, 54, '08:30:00', '08:45:00', 0, '2025-08-20 08:22:07'),
(540, 54, '08:45:00', '09:00:00', 0, '2025-08-20 08:22:07'),
(541, 54, '09:00:00', '09:15:00', 0, '2025-08-20 08:22:07'),
(542, 54, '09:15:00', '09:30:00', 0, '2025-08-20 08:22:07'),
(543, 54, '09:30:00', '09:45:00', 0, '2025-08-20 08:22:07'),
(544, 54, '09:45:00', '10:00:00', 0, '2025-08-20 08:22:07'),
(545, 54, '10:00:00', '10:15:00', 0, '2025-08-20 08:22:07'),
(546, 54, '10:15:00', '10:30:00', 0, '2025-08-20 08:22:07'),
(547, 54, '10:30:00', '10:45:00', 0, '2025-08-20 08:22:07'),
(548, 54, '10:45:00', '11:00:00', 0, '2025-08-20 08:22:07'),
(549, 54, '11:00:00', '11:15:00', 0, '2025-08-20 08:22:07'),
(550, 54, '11:15:00', '11:30:00', 0, '2025-08-20 08:22:07'),
(551, 54, '11:30:00', '11:45:00', 0, '2025-08-20 08:22:07'),
(552, 54, '11:45:00', '12:00:00', 0, '2025-08-20 08:22:07'),
(553, 54, '12:00:00', '12:15:00', 0, '2025-08-20 08:22:07'),
(554, 54, '12:15:00', '12:30:00', 0, '2025-08-20 08:22:07'),
(555, 54, '12:30:00', '12:45:00', 0, '2025-08-20 08:22:07'),
(556, 54, '12:45:00', '13:00:00', 0, '2025-08-20 08:22:07'),
(557, 54, '13:00:00', '13:15:00', 0, '2025-08-20 08:22:07'),
(558, 54, '13:15:00', '13:30:00', 0, '2025-08-20 08:22:07'),
(559, 54, '13:30:00', '13:45:00', 0, '2025-08-20 08:22:07'),
(560, 54, '13:45:00', '14:00:00', 0, '2025-08-20 08:22:07'),
(561, 54, '14:00:00', '14:15:00', 0, '2025-08-20 08:22:07'),
(562, 54, '14:15:00', '14:30:00', 0, '2025-08-20 08:22:07'),
(563, 54, '14:30:00', '14:45:00', 0, '2025-08-20 08:22:07'),
(564, 54, '14:45:00', '15:00:00', 0, '2025-08-20 08:22:07'),
(565, 54, '15:00:00', '15:15:00', 0, '2025-08-20 08:22:07'),
(566, 54, '15:15:00', '15:30:00', 0, '2025-08-20 08:22:07'),
(567, 54, '15:30:00', '15:45:00', 0, '2025-08-20 08:22:07'),
(568, 54, '15:45:00', '16:00:00', 0, '2025-08-20 08:22:07'),
(569, 55, '08:00:00', '08:15:00', 0, '2025-08-20 08:22:07'),
(570, 55, '08:15:00', '08:30:00', 0, '2025-08-20 08:22:07'),
(571, 55, '08:30:00', '08:45:00', 0, '2025-08-20 08:22:07'),
(572, 55, '08:45:00', '09:00:00', 0, '2025-08-20 08:22:07'),
(573, 55, '09:00:00', '09:15:00', 0, '2025-08-20 08:22:07'),
(574, 55, '09:15:00', '09:30:00', 0, '2025-08-20 08:22:07'),
(575, 55, '09:30:00', '09:45:00', 0, '2025-08-20 08:22:07'),
(576, 55, '09:45:00', '10:00:00', 0, '2025-08-20 08:22:07'),
(577, 55, '10:00:00', '10:15:00', 0, '2025-08-20 08:22:07'),
(578, 55, '10:15:00', '10:30:00', 0, '2025-08-20 08:22:07'),
(579, 55, '10:30:00', '10:45:00', 0, '2025-08-20 08:22:07'),
(580, 55, '10:45:00', '11:00:00', 0, '2025-08-20 08:22:07'),
(581, 55, '11:00:00', '11:15:00', 0, '2025-08-20 08:22:07'),
(582, 55, '11:15:00', '11:30:00', 0, '2025-08-20 08:22:07'),
(583, 55, '11:30:00', '11:45:00', 0, '2025-08-20 08:22:07'),
(584, 55, '11:45:00', '12:00:00', 0, '2025-08-20 08:22:07'),
(585, 55, '12:00:00', '12:15:00', 0, '2025-08-20 08:22:07'),
(586, 55, '12:15:00', '12:30:00', 0, '2025-08-20 08:22:07'),
(587, 55, '12:30:00', '12:45:00', 0, '2025-08-20 08:22:07'),
(588, 55, '12:45:00', '13:00:00', 0, '2025-08-20 08:22:07'),
(589, 55, '13:00:00', '13:15:00', 0, '2025-08-20 08:22:07'),
(590, 55, '13:15:00', '13:30:00', 0, '2025-08-20 08:22:07'),
(591, 55, '13:30:00', '13:45:00', 0, '2025-08-20 08:22:07'),
(592, 55, '13:45:00', '14:00:00', 0, '2025-08-20 08:22:07'),
(593, 55, '14:00:00', '14:15:00', 0, '2025-08-20 08:22:07'),
(594, 55, '14:15:00', '14:30:00', 0, '2025-08-20 08:22:07'),
(595, 55, '14:30:00', '14:45:00', 0, '2025-08-20 08:22:07'),
(596, 55, '14:45:00', '15:00:00', 0, '2025-08-20 08:22:07'),
(597, 55, '15:00:00', '15:15:00', 0, '2025-08-20 08:22:07'),
(598, 55, '15:15:00', '15:30:00', 0, '2025-08-20 08:22:07'),
(599, 55, '15:30:00', '15:45:00', 0, '2025-08-20 08:22:07'),
(600, 55, '15:45:00', '16:00:00', 0, '2025-08-20 08:22:07'),
(601, 56, '08:00:00', '08:15:00', 1, '2025-09-16 06:43:09'),
(602, 56, '08:15:00', '08:30:00', 1, '2025-09-16 07:04:44'),
(603, 56, '08:30:00', '08:45:00', 0, '2025-09-16 06:41:59'),
(604, 56, '08:45:00', '09:00:00', 0, '2025-09-16 06:41:59'),
(605, 57, '08:00:00', '08:15:00', 0, '2025-09-16 06:41:59'),
(606, 57, '08:15:00', '08:30:00', 0, '2025-09-16 06:41:59'),
(607, 57, '08:30:00', '08:45:00', 0, '2025-09-16 06:41:59'),
(608, 57, '08:45:00', '09:00:00', 0, '2025-09-16 06:41:59'),
(609, 40, '08:00:00', '08:15:00', 0, '2025-09-16 10:05:19'),
(610, 40, '08:15:00', '08:30:00', 0, '2025-09-16 10:05:19'),
(611, 40, '08:30:00', '08:45:00', 0, '2025-09-16 10:05:19'),
(612, 40, '08:45:00', '09:00:00', 0, '2025-09-16 10:05:19'),
(613, 40, '09:00:00', '09:15:00', 0, '2025-09-16 10:05:19'),
(614, 40, '09:15:00', '09:30:00', 0, '2025-09-16 10:05:19'),
(615, 40, '09:30:00', '09:45:00', 0, '2025-09-16 10:05:19'),
(616, 40, '09:45:00', '10:00:00', 0, '2025-09-16 10:05:19'),
(617, 40, '10:00:00', '10:15:00', 0, '2025-09-16 10:05:19'),
(618, 40, '10:15:00', '10:30:00', 0, '2025-09-16 10:05:19'),
(619, 40, '10:30:00', '10:45:00', 0, '2025-09-16 10:05:19'),
(620, 40, '10:45:00', '11:00:00', 0, '2025-09-16 10:05:19'),
(621, 40, '11:00:00', '11:15:00', 0, '2025-09-16 10:05:19'),
(622, 40, '11:15:00', '11:30:00', 0, '2025-09-16 10:05:19'),
(623, 40, '11:30:00', '11:45:00', 0, '2025-09-16 10:05:19'),
(624, 40, '11:45:00', '12:00:00', 0, '2025-09-16 10:05:19');

-- --------------------------------------------------------

--
-- Table structure for table `nurse`
--

CREATE TABLE `nurse` (
  `nurse_id` varchar(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `gmail` varchar(50) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `service_id` int NOT NULL,
  `isCounterTerminal` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nurse`
--

INSERT INTO `nurse` (`nurse_id`, `first_name`, `last_name`, `gmail`, `phone`, `service_id`, `isCounterTerminal`) VALUES
('N00000', 'สมศรี', 'ใจดี', 'somsri.j@hospital.com', '0999999999', 2, 0),
('N00001', 'ถั่วงอก', 'เขียว', 'green@hospital.com', '0912345672', 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `nurseSchedules`
--

CREATE TABLE `nurseSchedules` (
  `ns_id` int NOT NULL,
  `nurse_id` varchar(6) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `shift` time DEFAULT NULL,
  `schedule_role` enum('counter_terminal','main_service') DEFAULT NULL,
  `service_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `phone_number` varchar(10) DEFAULT NULL,
  `cancellation_count` int NOT NULL DEFAULT '0',
  `blacklist_until` datetime DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`patient_id`, `hn`, `first_name`, `last_name`, `date_of_birth`, `phone_number`, `cancellation_count`, `blacklist_until`, `gender`) VALUES
(2, 1234567, 'จริงใจ', 'งามสง่า', '1999-08-10', '0912345678', 3, '2025-09-17 21:12:49', NULL),
(3, 5556666, 'สมหญิง', 'ใจแกร่ง', '2025-08-03', '0991234567', 0, NULL, NULL),
(4, 1235678, 'มุนิน', 'ลันเตา', '2000-08-19', '0675894321', 0, NULL, 'female'),
(5, 7869073, 'เอวซ่า', 'ไอซ์', '1998-08-19', '0637567561', 0, NULL, 'female'),
(6, 4567891, 'กิมจิ', 'ดอง', '2000-08-20', '0986754321', 0, NULL, 'female'),
(7, 5647891, 'ชูชิ', 'โรล', '2001-08-20', '0986789425', 0, NULL, 'female');

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
  `img_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_name`, `description`, `price`, `img_path`) VALUES
(2, 'มารดาและทารกในครรภ์', 'การให้คำปรึกษาการคัดกรองกลุ่มอาการดาวน์ การทำ PND ตรวจคลื่นเสียงความถี่สูง ทำหัตถการ ตรวจสุขภาพทารกในครรภ์ ให้คำปรึกษากรณีพบโรคหรือความผิดปกติ', 2300.00, 'maternal-fetal-unit.jpg'),
(4, 'เวชศาสตร์การเจริญพันธุ์', 'มีบุตรยาก วางแผนครอบครัว วัยหมดระดู ต่อมไร้ท่อของระบบสืบพันธุ์', 1500.00, 'family-planing.jpg'),
(5, 'มะเร็งนรีเวช', 'ตรวจภายในช่องคลอดด้วยกล้องขยาย', 10000.00, 'cancer-unit.jpg');

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
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
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
(5, 'somying@gmail.com', '$2b$10$nM3AqCGT7oBL6oTX1GmivunToYQKrBbEsrzOCnQZb/tYW3AzuCLl2', 'patient', '3', '2025-08-09 20:47:40', '2025-08-09 20:47:40'),
(6, 'munin@gmail.com', '$2b$10$kq/m3oO7WqPVF0S6fIvPxeGe6Kp7l4NhSrw6EMIN74A6.Lt5fa2oe', 'patient', '4', '2025-08-18 17:38:44', '2025-08-18 17:38:44'),
(7, 'ice@gmail.com', '$2b$10$Wr7sDqFuHrKRLVBpLuNSGeXrRSJgFFw8ICbPuXeF3ARFdLILUgVfS', 'patient', '5', '2025-08-19 04:49:34', '2025-08-19 04:49:34'),
(8, 'kimji@gmail.com', '$2b$10$9NKKuHE9E.kXgqjnRVsU5e06vCT.GsW89BoAvrxpC4ygBBa1DcpUe', 'patient', '6', '2025-08-20 07:32:05', '2025-08-20 07:32:05'),
(9, 'chuchi@gmail.com', '$2b$10$ZIqRsdsyByBLDCofTokmyuC.6m5jyey8USS0d5FdQSOQu9TP6hrCe', 'patient', '7', '2025-08-20 07:33:18', '2025-08-20 07:33:18'),
(10, 'headnurse0@hospital.com', '$2b$10$Y60sC0u3c0jmcWeRLUSCAOH4xaa1Hvcf6CmTw97aGPFR6dFhnPurm', 'head_nurse', 'H00000', '2025-09-10 13:57:31', '2025-09-10 13:57:31'),
(11, 'green@hospital.com', '$2b$10$79gLLHG24ofERsQe7uWrfOStAp.tHaTy02cwqN5bTPyrPB2T3Upw6', 'nurse', 'N00001', '2025-09-17 12:37:13', '2025-09-17 12:45:24');

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
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `fk_appointment_ersId_ers` (`ers_id`),
  ADD KEY `fk_appointment_patient` (`patient_id`),
  ADD KEY `fk_appointment_dsId_ds` (`ds_id`);

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
-- Indexes for table `nurse`
--
ALTER TABLE `nurse`
  ADD PRIMARY KEY (`nurse_id`),
  ADD KEY `fk_nurse_serviceID_services` (`service_id`);

--
-- Indexes for table `nurseSchedules`
--
ALTER TABLE `nurseSchedules`
  ADD PRIMARY KEY (`ns_id`),
  ADD KEY `fk_nurseSchedules_nurseID_nurse` (`nurse_id`),
  ADD KEY `fk_nurseSchedules_serviceID_services` (`service_id`);

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
  MODIFY `advice_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `appointment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `choiceScore`
--
ALTER TABLE `choiceScore`
  MODIFY `choiceScore_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctorSchedules`
--
ALTER TABLE `doctorSchedules`
  MODIFY `ds_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `examRoom`
--
ALTER TABLE `examRoom`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `examRoomSlots`
--
ALTER TABLE `examRoomSlots`
  MODIFY `ers_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=625;

--
-- AUTO_INCREMENT for table `nurseSchedules`
--
ALTER TABLE `nurseSchedules`
  MODIFY `ns_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `patient_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `question_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  MODIFY `choice_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  ADD CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
-- Constraints for table `nurse`
--
ALTER TABLE `nurse`
  ADD CONSTRAINT `fk_nurse_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nurseSchedules`
--
ALTER TABLE `nurseSchedules`
  ADD CONSTRAINT `fk_nurseSchedules_nurseID_nurse` FOREIGN KEY (`nurse_id`) REFERENCES `nurse` (`nurse_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nurseSchedules_serviceID_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `symptomChoice`
--
ALTER TABLE `symptomChoice`
  ADD CONSTRAINT `fk_symptomChoice_questionID_questions` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
