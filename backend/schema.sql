/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-13.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: bekal
-- ------------------------------------------------------
-- Server version	13.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `bekal_db_bookmarks`
--

DROP TABLE IF EXISTS `bekal_db_bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_bookmarks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `opportunity_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_bookmark` (`user_id`,`opportunity_id`),
  KEY `opportunity_id` (`opportunity_id`),
  CONSTRAINT `bekal_db_bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `bekal_db_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bekal_db_bookmarks_ibfk_2` FOREIGN KEY (`opportunity_id`) REFERENCES `bekal_db_opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_categories`
--

DROP TABLE IF EXISTS `bekal_db_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_featured_listings`
--

DROP TABLE IF EXISTS `bekal_db_featured_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_featured_listings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `opportunity_id` int(10) unsigned NOT NULL,
  `partner_id` int(10) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `payment_status` enum('pending','paid','expired') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `opportunity_id` (`opportunity_id`),
  KEY `partner_id` (`partner_id`),
  CONSTRAINT `bekal_db_featured_listings_ibfk_1` FOREIGN KEY (`opportunity_id`) REFERENCES `bekal_db_opportunities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bekal_db_featured_listings_ibfk_2` FOREIGN KEY (`partner_id`) REFERENCES `bekal_db_partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_forum`
--

DROP TABLE IF EXISTS `bekal_db_forum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_forum` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `type` enum('discussion','comment') DEFAULT 'discussion',
  `title` varchar(200) DEFAULT NULL,
  `content` text NOT NULL,
  `like_count` int(10) unsigned DEFAULT 0,
  `comment_count` int(10) unsigned DEFAULT 0,
  `view_count` int(10) unsigned DEFAULT 0,
  `status` enum('active','hidden','deleted') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_forum_user` (`user_id`),
  KEY `idx_forum_parent` (`parent_id`),
  KEY `idx_forum_type` (`type`),
  KEY `idx_forum_status` (`status`),
  KEY `idx_forum_created` (`created_at`),
  CONSTRAINT `fk_forum_parent` FOREIGN KEY (`parent_id`) REFERENCES `bekal_db_forum` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_forum_user` FOREIGN KEY (`user_id`) REFERENCES `bekal_db_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_newsletter_subscriptions`
--

DROP TABLE IF EXISTS `bekal_db_newsletter_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_newsletter_subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bekal_db_newsletter_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `bekal_db_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_opportunities`
--

DROP TABLE IF EXISTS `bekal_db_opportunities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_opportunities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL,
  `title` varchar(200) NOT NULL,
  `organizer_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `education_level` enum('SMA/SMK','D3','S1','S2','Umum') NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `cost` varchar(100) DEFAULT NULL,
  `registration_link` varchar(255) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('pending','approved','rejected','expired') DEFAULT 'pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `submitted_by` int(10) unsigned DEFAULT NULL,
  `verified_by` int(10) unsigned DEFAULT NULL,
  `view_count` int(10) unsigned DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `bekal_db_opportunities_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `bekal_db_categories` (`id`),
  CONSTRAINT `bekal_db_opportunities_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `bekal_db_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bekal_db_opportunities_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `bekal_db_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_partners`
--

DROP TABLE IF EXISTS `bekal_db_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_partners` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `organization_name` varchar(150) NOT NULL,
  `partner_type` enum('EO','Perusahaan','Lembaga Donor','Institusi Pendidikan','Lainnya') NOT NULL,
  `contact_email` varchar(150) NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `is_verified_partner` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bekal_db_partners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `bekal_db_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_reports`
--

DROP TABLE IF EXISTS `bekal_db_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `opportunity_id` int(10) unsigned NOT NULL,
  `reported_by` int(10) unsigned NOT NULL,
  `reason` enum('link_rusak','info_palsu','deadline_lewat','lainnya') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('open','reviewed','resolved') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `opportunity_id` (`opportunity_id`),
  KEY `reported_by` (`reported_by`),
  CONSTRAINT `bekal_db_reports_ibfk_1` FOREIGN KEY (`opportunity_id`) REFERENCES `bekal_db_opportunities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bekal_db_reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `bekal_db_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bekal_db_users`
--

DROP TABLE IF EXISTS `bekal_db_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bekal_db_users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('siswa','guru_BK','admin','mitra') NOT NULL DEFAULT 'siswa',
  `school_name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'bekal'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-30 12:57:28
