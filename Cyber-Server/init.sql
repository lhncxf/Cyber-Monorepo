mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: Cyber
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('72a0286f-4d72-40fb-b161-bc0bb66302da','58af0ef39902ad3a134ee7e56ac7c1ed2ad574ea288ac13c77d6dc22872471a9','2026-03-14 07:26:18.820','20260306063836_add_departments',NULL,NULL,'2026-03-14 07:26:18.776',1),('e10b343f-1810-441d-8d7e-e8f5840727db','41ef9767b2ec2d25cbbcea0fc526819396cbf49e2cf96bded43edbf54dace00d','2026-03-14 07:26:18.913','20260314063229_add_shipping_address_freight_template',NULL,NULL,'2026-03-14 07:26:18.820',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `sku_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_user_id_sku_id_key` (`user_id`,`sku_id`),
  KEY `cart_items_product_id_fkey` (`product_id`),
  KEY `cart_items_sku_id_fkey` (`sku_id`),
  CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_sku_id_fkey` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `mobile_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT '0',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,0,'电子产品',1,1,'2026-03-14 07:26:31.740'),(2,0,'配件周边',2,1,'2026-03-14 07:26:31.742'),(3,1,'手机',1,1,'2026-03-14 07:26:31.743'),(4,1,'电脑',2,1,'2026-03-14 07:26:31.743'),(5,1,'平板',3,1,'2026-03-14 07:26:31.744'),(6,2,'耳机',1,1,'2026-03-14 07:26:31.745'),(7,2,'外设',2,1,'2026-03-14 07:26:31.746');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT '0',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,0,'Cyber 科技有限公司',0,1,'2026-03-14 07:26:31.372'),(2,1,'技术中心',1,1,'2026-03-14 07:26:31.378'),(3,1,'产品中心',2,1,'2026-03-14 07:26:31.380'),(4,1,'运营中心',3,1,'2026-03-14 07:26:31.381'),(5,1,'市场中心',4,1,'2026-03-14 07:26:31.382'),(6,1,'财务中心',5,1,'2026-03-14 07:26:31.383'),(7,2,'前端开发部',1,1,'2026-03-14 07:26:31.384'),(8,2,'后端开发部',2,1,'2026-03-14 07:26:31.385'),(9,2,'测试部',3,1,'2026-03-14 07:26:31.387'),(10,2,'运维部',4,1,'2026-03-14 07:26:31.388'),(11,3,'产品设计部',1,1,'2026-03-14 07:26:31.389'),(12,3,'UI 设计部',2,1,'2026-03-14 07:26:31.390'),(13,4,'内容运营部',1,1,'2026-03-14 07:26:31.391'),(14,4,'用户运营部',2,1,'2026-03-14 07:26:31.392'),(15,5,'品牌推广部',1,1,'2026-03-14 07:26:31.393');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freight_templates`
--

DROP TABLE IF EXISTS `freight_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freight_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int NOT NULL DEFAULT '0',
  `base_price` decimal(10,2) NOT NULL,
  `free_threshold` decimal(10,2) DEFAULT NULL,
  `rules` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `excluded_regions` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freight_templates`
--

LOCK TABLES `freight_templates` WRITE;
/*!40000 ALTER TABLE `freight_templates` DISABLE KEYS */;
INSERT INTO `freight_templates` VALUES (1,'标准快递',0,10.00,99.00,'[]','[]',1,'2026-03-14 07:26:31.747'),(2,'大件商品运费',0,25.00,NULL,'[{\"province\":\"西藏\",\"addPrice\":20},{\"province\":\"新疆\",\"addPrice\":15}]','[]',1,'2026-03-14 07:26:31.750'),(3,'免运费模板',0,0.00,NULL,'[]','[]',1,'2026-03-14 07:26:31.752');
/*!40000 ALTER TABLE `freight_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT '0',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int NOT NULL,
  `path` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `component` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `permission` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `sort` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,0,'首页',2,'/dashboard','dashboard/index','','HomeFilled',0,1,1,'2026-03-14 07:26:31.612'),(2,0,'系统管理',1,'/system','Layout','','Setting',1,1,1,'2026-03-14 07:26:31.613'),(3,2,'用户管理',2,'user','system/user/index','','User',1,1,1,'2026-03-14 07:26:31.614'),(4,2,'角色管理',2,'role','system/role/index','','UserFilled',2,1,1,'2026-03-14 07:26:31.615'),(5,2,'菜单管理',2,'menu','system/menu/index','','Menu',3,1,1,'2026-03-14 07:26:31.616'),(6,2,'部门管理',2,'dept','system/dept/index','','OfficeBuilding',4,1,1,'2026-03-14 07:26:31.617'),(7,3,'新增用户',3,'','','system:user:create','',1,1,1,'2026-03-14 07:26:31.618'),(8,3,'修改用户',3,'','','system:user:update','',2,1,1,'2026-03-14 07:26:31.618'),(9,3,'删除用户',3,'','','system:user:delete','',3,1,1,'2026-03-14 07:26:31.619'),(10,3,'重置密码',3,'','','system:user:reset-pwd','',4,1,1,'2026-03-14 07:26:31.620'),(11,4,'新增角色',3,'','','system:role:create','',1,1,1,'2026-03-14 07:26:31.621'),(12,4,'修改角色',3,'','','system:role:update','',2,1,1,'2026-03-14 07:26:31.621'),(13,4,'删除角色',3,'','','system:role:delete','',3,1,1,'2026-03-14 07:26:31.622'),(14,5,'新增菜单',3,'','','system:menu:create','',1,1,1,'2026-03-14 07:26:31.623'),(15,5,'修改菜单',3,'','','system:menu:update','',2,1,1,'2026-03-14 07:26:31.624'),(16,5,'删除菜单',3,'','','system:menu:delete','',3,1,1,'2026-03-14 07:26:31.625'),(17,6,'新增部门',3,'','','system:dept:create','',1,1,1,'2026-03-14 07:26:31.625'),(18,6,'修改部门',3,'','','system:dept:update','',2,1,1,'2026-03-14 07:26:31.626'),(19,6,'删除部门',3,'','','system:dept:delete','',3,1,1,'2026-03-14 07:26:31.627'),(26,0,'商品管理',1,'/product','Layout','','Goods',2,1,1,'2026-03-14 07:26:31.629'),(27,26,'商品列表',2,'list','product/index','','ShoppingBag',1,1,1,'2026-03-14 07:26:31.630'),(28,26,'订单管理',2,'order','order/index','','List',2,1,1,'2026-03-14 07:26:31.630'),(29,27,'新增商品',3,'','','product:create','',1,1,1,'2026-03-14 07:26:31.631'),(30,27,'修改商品',3,'','','product:update','',2,1,1,'2026-03-14 07:26:31.632'),(31,27,'删除商品',3,'','','product:delete','',3,1,1,'2026-03-14 07:26:31.632'),(32,28,'修改订单状态',3,'','','order:update','',1,1,1,'2026-03-14 07:26:31.633'),(33,0,'移动端管理',1,'/mobile','Layout','','Cellphone',3,1,1,'2026-03-14 07:26:31.634'),(34,33,'移动端用户',2,'user','mobile/user/index','','User',1,1,1,'2026-03-14 07:26:31.635'),(35,34,'新增移动端用户',3,'','','mobile:user:create','',1,1,1,'2026-03-14 07:26:31.636'),(36,34,'修改移动端用户',3,'','','mobile:user:update','',2,1,1,'2026-03-14 07:26:31.636'),(37,34,'删除移动端用户',3,'','','mobile:user:delete','',3,1,1,'2026-03-14 07:26:31.637'),(38,34,'重置移动端用户密码',3,'','','mobile:user:reset-pwd','',4,1,1,'2026-03-14 07:26:31.638'),(39,26,'分类管理',2,'category','product/category/index','','Grid',3,1,1,'2026-03-14 07:26:31.639'),(40,39,'新增分类',3,'','','product:category:create','',1,1,1,'2026-03-14 07:26:31.639'),(41,39,'修改分类',3,'','','product:category:update','',2,1,1,'2026-03-14 07:26:31.640'),(42,39,'删除分类',3,'','','product:category:delete','',3,1,1,'2026-03-14 07:26:31.641'),(43,26,'运费模板',2,'freight','product/freight/index','','Van',4,1,1,'2026-03-14 07:26:31.642'),(44,43,'新增运费模板',3,'','','product:freight:create','',1,1,1,'2026-03-14 07:26:31.643'),(45,43,'修改运费模板',3,'','','product:freight:update','',2,1,1,'2026-03-14 07:26:31.643'),(46,43,'删除运费模板',3,'','','product:freight:delete','',3,1,1,'2026-03-14 07:26:31.644'),(47,26,'售后管理',2,'refund','order/refund/index','','Tickets',5,1,1,'2026-03-14 09:23:41.121');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mobile_users`
--

DROP TABLE IF EXISTS `mobile_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobile_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile_users_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobile_users`
--

LOCK TABLES `mobile_users` WRITE;
/*!40000 ALTER TABLE `mobile_users` DISABLE KEYS */;
INSERT INTO `mobile_users` VALUES (1,'13800000100','$2b$10$U7L5pJNxJ5B/rTdk6XDAjeD9M.NKyVTF5LJsZZWjc.qoPEFmwXZt2','测试用户','',1,'2026-03-14 07:26:31.736');
/*!40000 ALTER TABLE `mobile_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `sku_id` int DEFAULT NULL,
  `skuName` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_fkey` (`order_id`),
  KEY `order_items_product_id_fkey` (`product_id`),
  KEY `order_items_sku_id_fkey` (`sku_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_items_sku_id_fkey` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,21,133,'[{\"存储\":\"256GB\"},{\"颜色\":\"黑色钛金属\"}]',1,7999.00),(2,2,23,160,'[{\"版本\":\"标准版\"}]',1,1899.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `shipping_address_id` int DEFAULT NULL,
  `address_snapshot` text COLLATE utf8mb4_unicode_ci,
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `shipment_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` datetime(3) DEFAULT NULL,
  `shipping_company` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNo_key` (`orderNo`),
  KEY `orders_user_id_fkey` (`user_id`),
  KEY `orders_shipping_address_id_fkey` (`shipping_address_id`),
  CONSTRAINT `orders_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `shipping_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `mobile_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'20260314100001',1,7999.00,3,'上海市 市辖区 黄浦区 世纪大道100号世贸中心3楼',7,'{\"name\":\"测试用户\",\"phone\":\"13800000100\",\"province\":\"上海市\",\"city\":\"市辖区\",\"district\":\"黄浦区\",\"detail\":\"世纪大道100号世贸中心3楼\"}',NULL,'2026-03-10 08:30:00.000','SF1234567890','2026-03-12 10:00:00.000','顺丰速运'),(2,'20260314100002',1,1899.00,3,'上海市 市辖区 黄浦区 世纪大道100号世贸中心3楼',7,'{\"name\":\"测试用户\",\"phone\":\"13800000100\",\"province\":\"上海市\",\"city\":\"市辖区\",\"district\":\"黄浦区\",\"detail\":\"世纪大道100号世贸中心3楼\"}',NULL,'2026-03-11 09:00:00.000','YTO9876543210','2026-03-13 14:00:00.000','圆通速递');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_skus`
--

DROP TABLE IF EXISTS `product_skus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_skus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `product_skus_product_id_fkey` (`product_id`),
  CONSTRAINT `product_skus_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_skus`
--

LOCK TABLES `product_skus` WRITE;
/*!40000 ALTER TABLE `product_skus` DISABLE KEYS */;
INSERT INTO `product_skus` VALUES (133,21,'[{\"存储\":\"256GB\"},{\"颜色\":\"黑色钛金属\"}]',7999.00,50,1),(134,21,'[{\"存储\":\"256GB\"},{\"颜色\":\"白色钛金属\"}]',7999.00,40,1),(135,21,'[{\"存储\":\"256GB\"},{\"颜色\":\"沙漠色钛金属\"}]',7999.00,35,1),(136,21,'[{\"存储\":\"512GB\"},{\"颜色\":\"黑色钛金属\"}]',9299.00,30,1),(137,21,'[{\"存储\":\"512GB\"},{\"颜色\":\"白色钛金属\"}]',9299.00,25,1),(138,21,'[{\"存储\":\"512GB\"},{\"颜色\":\"沙漠色钛金属\"}]',9299.00,20,1),(139,21,'[{\"存储\":\"1TB\"},{\"颜色\":\"黑色钛金属\"}]',11499.00,10,1),(140,21,'[{\"存储\":\"1TB\"},{\"颜色\":\"白色钛金属\"}]',11499.00,0,1),(141,21,'[{\"存储\":\"1TB\"},{\"颜色\":\"沙漠色钛金属\"}]',11499.00,8,1),(142,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"18GB\"},{\"存储\":\"512GB\"}]',14999.00,20,1),(143,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"18GB\"},{\"存储\":\"1TB\"}]',16999.00,15,1),(144,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"18GB\"},{\"存储\":\"2TB\"}]',18999.00,0,1),(145,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"36GB\"},{\"存储\":\"512GB\"}]',17999.00,0,1),(146,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"36GB\"},{\"存储\":\"1TB\"}]',19999.00,10,1),(147,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"36GB\"},{\"存储\":\"2TB\"}]',21999.00,0,1),(148,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"64GB\"},{\"存储\":\"512GB\"}]',0.00,0,1),(149,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"64GB\"},{\"存储\":\"1TB\"}]',0.00,0,1),(150,22,'[{\"芯片\":\"M3 Pro\"},{\"内存\":\"64GB\"},{\"存储\":\"2TB\"}]',0.00,0,1),(151,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"18GB\"},{\"存储\":\"512GB\"}]',0.00,0,1),(152,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"18GB\"},{\"存储\":\"1TB\"}]',0.00,0,1),(153,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"18GB\"},{\"存储\":\"2TB\"}]',0.00,0,1),(154,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"36GB\"},{\"存储\":\"512GB\"}]',0.00,0,1),(155,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"36GB\"},{\"存储\":\"1TB\"}]',21999.00,8,1),(156,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"36GB\"},{\"存储\":\"2TB\"}]',23999.00,0,1),(157,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"64GB\"},{\"存储\":\"512GB\"}]',0.00,0,1),(158,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"64GB\"},{\"存储\":\"1TB\"}]',25999.00,0,1),(159,22,'[{\"芯片\":\"M3 Max\"},{\"内存\":\"64GB\"},{\"存储\":\"2TB\"}]',27999.00,5,1),(160,23,'[{\"版本\":\"标准版\"}]',1899.00,100,1),(161,23,'[{\"版本\":\"USB-C版\"}]',1999.00,80,1),(162,24,'[{\"存储\":\"512GB\"},{\"颜色\":\"钛金黑\"}]',6499.00,40,1),(163,24,'[{\"存储\":\"512GB\"},{\"颜色\":\"雪山白\"}]',6499.00,30,1),(164,24,'[{\"存储\":\"1TB\"},{\"颜色\":\"钛金黑\"}]',7299.00,20,1),(165,24,'[{\"存储\":\"1TB\"},{\"颜色\":\"雪山白\"}]',7299.00,15,1),(166,25,'[{\"内存\":\"8GB\"},{\"存储\":\"128GB\"}]',4999.00,30,1),(167,25,'[{\"内存\":\"8GB\"},{\"存储\":\"256GB\"}]',5499.00,25,1),(168,25,'[{\"内存\":\"8GB\"},{\"存储\":\"512GB\"}]',5999.00,0,1),(169,25,'[{\"内存\":\"12GB\"},{\"存储\":\"128GB\"}]',5499.00,0,1),(170,25,'[{\"内存\":\"12GB\"},{\"存储\":\"256GB\"}]',5999.00,20,1),(171,25,'[{\"内存\":\"12GB\"},{\"存储\":\"512GB\"}]',6999.00,12,1),(172,26,'[{\"颜色\":\"曜石黑\"}]',2999.00,80,1),(173,26,'[{\"颜色\":\"铂金银\"}]',2999.00,60,1),(174,26,'[{\"颜色\":\"午夜蓝\"}]',2999.00,0,1),(175,27,'[{\"处理器\":\"i7\"},{\"配置\":\"16GB+512GB\"}]',12999.00,15,1),(176,27,'[{\"处理器\":\"i7\"},{\"配置\":\"32GB+1TB\"}]',14999.00,10,1),(177,27,'[{\"处理器\":\"i7\"},{\"配置\":\"64GB+2TB\"}]',17999.00,0,1),(178,27,'[{\"处理器\":\"i9\"},{\"配置\":\"16GB+512GB\"}]',14999.00,0,1),(179,27,'[{\"处理器\":\"i9\"},{\"配置\":\"32GB+1TB\"}]',16999.00,8,1),(180,27,'[{\"处理器\":\"i9\"},{\"配置\":\"64GB+2TB\"}]',19999.00,4,1),(181,28,'[{\"存储\":\"128GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"星光色\"}]',4799.00,50,1),(182,28,'[{\"存储\":\"128GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"蓝色\"}]',4799.00,40,1),(183,28,'[{\"存储\":\"128GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"紫色\"}]',4799.00,0,1),(184,28,'[{\"存储\":\"128GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"星光色\"}]',5799.00,0,1),(185,28,'[{\"存储\":\"128GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"蓝色\"}]',5799.00,0,1),(186,28,'[{\"存储\":\"128GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"紫色\"}]',5799.00,0,1),(187,28,'[{\"存储\":\"256GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"星光色\"}]',5299.00,0,1),(188,28,'[{\"存储\":\"256GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"蓝色\"}]',5299.00,30,1),(189,28,'[{\"存储\":\"256GB\"},{\"网络\":\"WiFi\"},{\"颜色\":\"紫色\"}]',5299.00,25,1),(190,28,'[{\"存储\":\"256GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"星光色\"}]',6299.00,20,1),(191,28,'[{\"存储\":\"256GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"蓝色\"}]',6299.00,0,1),(192,28,'[{\"存储\":\"256GB\"},{\"网络\":\"蜂窝\"},{\"颜色\":\"紫色\"}]',6299.00,15,1),(193,29,'[{\"存储\":\"256GB\"},{\"颜色\":\"钛金石黑\"}]',9499.00,35,1),(194,29,'[{\"存储\":\"256GB\"},{\"颜色\":\"钛金灰绿\"}]',9499.00,28,1),(195,29,'[{\"存储\":\"512GB\"},{\"颜色\":\"钛金石黑\"}]',10799.00,20,1),(196,29,'[{\"存储\":\"512GB\"},{\"颜色\":\"钛金灰绿\"}]',10799.00,15,1),(197,30,'[{\"颜色\":\"石墨黑\"}]',699.00,150,1),(198,30,'[{\"颜色\":\"珍珠白\"}]',699.00,120,1);
/*!40000 ALTER TABLE `product_skus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `freight_template_id` int DEFAULT NULL,
  `images` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `products_category_id_fkey` (`category_id`),
  KEY `products_freight_template_id_fkey` (`freight_template_id`),
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_freight_template_id_fkey` FOREIGN KEY (`freight_template_id`) REFERENCES `freight_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (21,'iPhone 16 Pro',3,1,'[\"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop\",\"https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=400&fit=crop\"]','苹果最新旗舰手机，A18芯片，钛金属机身',1,'2026-03-14 09:30:31.611'),(22,'MacBook Pro 14',4,2,'[\"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop\",\"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop\"]','M3 Pro芯片，专业级笔记本电脑',1,'2026-03-14 09:30:31.613'),(23,'AirPods Pro 2',6,1,'[\"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop\"]','主动降噪，空间音频，防水防尘',1,'2026-03-14 09:30:31.615'),(24,'小米15 Ultra',3,1,'[\"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop\"]','徕卡联合调教，骁龙8 Elite旗舰',1,'2026-03-14 09:30:31.616'),(25,'华为MatePad Pro 13',5,1,'[\"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop\"]','麒麟芯片，OLED屏幕，专业平板',1,'2026-03-14 09:30:31.617'),(26,'索尼WH-1000XM6',6,1,'[\"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop\"]','业界顶级降噪耳机，续航30小时',1,'2026-03-14 09:30:31.618'),(27,'戴尔XPS 15',4,2,'[\"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop\"]','OLED屏幕，RTX 4060，轻薄高效',1,'2026-03-14 09:30:31.619'),(28,'iPad Air M2',5,1,'[\"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop\"]','M2芯片，11英寸超薄平板',1,'2026-03-14 09:30:31.621'),(29,'三星Galaxy S25 Ultra',3,1,'[\"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop\"]','S Pen内置，2亿像素主摄，AI功能丰富',1,'2026-03-14 09:30:31.622'),(30,'罗技MX Master 3S',7,1,'[\"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop\"]','专业无线鼠标，电磁滚轮，人体工学',1,'2026-03-14 09:30:31.623');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refund_requests`
--

DROP TABLE IF EXISTS `refund_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `admin_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refund_requests_order_id_key` (`order_id`),
  KEY `refund_requests_user_id_fkey` (`user_id`),
  CONSTRAINT `refund_requests_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `refund_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `mobile_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_requests`
--

LOCK TABLES `refund_requests` WRITE;
/*!40000 ALTER TABLE `refund_requests` DISABLE KEYS */;
INSERT INTO `refund_requests` VALUES (1,2,1,'收到商品与描述不符，左耳降噪效果异常，申请退款',0,NULL,'2026-03-14 06:00:00.000','2026-03-14 06:00:00.000');
/*!40000 ALTER TABLE `refund_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_menus`
--

DROP TABLE IF EXISTS `role_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_menus` (
  `role_id` int NOT NULL,
  `menu_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `role_menus_menu_id_fkey` (`menu_id`),
  CONSTRAINT `role_menus_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_menus_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menus`
--

LOCK TABLES `role_menus` WRITE;
/*!40000 ALTER TABLE `role_menus` DISABLE KEYS */;
INSERT INTO `role_menus` VALUES (1,1),(2,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,26),(1,27),(1,28),(1,29),(1,30),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(1,40),(1,41),(1,42),(1,43),(1,44),(1,45),(1,46),(1,47);
/*!40000 ALTER TABLE `role_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','管理员',1,'2026-03-14 07:26:31.394'),(2,'editor','编辑者',1,'2026-03-14 07:26:31.396');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_addresses`
--

DROP TABLE IF EXISTS `shipping_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `shipping_addresses_user_id_fkey` (`user_id`),
  CONSTRAINT `shipping_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `mobile_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_addresses`
--

LOCK TABLES `shipping_addresses` WRITE;
/*!40000 ALTER TABLE `shipping_addresses` DISABLE KEYS */;
INSERT INTO `shipping_addresses` VALUES (7,1,'测试用户','13800000100','上海市','市辖区','黄浦区','世纪大道100号世贸中心3楼',1,'2026-03-14 09:30:31.595'),(8,1,'测试用户','13800000100','广东省','广州市','天河区','天河路385号太古汇2楼201室',0,'2026-03-14 09:30:31.595'),(9,1,'测试用户','13800000100','北京市','市辖区','朝阳区','望京SOHO T3 18层',0,'2026-03-14 09:30:31.595');
/*!40000 ALTER TABLE `shipping_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_items`
--

DROP TABLE IF EXISTS `table_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'editor',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_items_user_id_fkey` (`user_id`),
  CONSTRAINT `table_items_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_items`
--

LOCK TABLES `table_items` WRITE;
/*!40000 ALTER TABLE `table_items` DISABLE KEYS */;
INSERT INTO `table_items` VALUES (201,'user_001','user1@example.com','13810000000','admin',0,'2025-05-11 17:44:03.211',NULL),(202,'user_002','user2@example.com','13810000001','editor',1,'2025-10-18 15:53:05.271',NULL),(203,'user_003','user3@example.com','13810000002','editor',1,'2025-04-08 21:45:15.693',NULL),(204,'user_004','user4@example.com','13810000003','editor',1,'2025-06-20 00:05:44.462',NULL),(205,'user_005','user5@example.com','13810000004','editor',1,'2025-09-30 05:49:29.606',NULL),(206,'user_006','user6@example.com','13810000005','admin',1,'2025-07-21 07:50:37.794',NULL),(207,'user_007','user7@example.com','13810000006','editor',1,'2025-11-12 04:27:19.791',NULL),(208,'user_008','user8@example.com','13810000007','editor',0,'2025-08-24 06:11:54.344',NULL),(209,'user_009','user9@example.com','13810000008','editor',1,'2026-02-03 23:37:43.133',NULL),(210,'user_010','user10@example.com','13810000009','editor',1,'2025-11-07 03:04:19.161',NULL),(211,'user_011','user11@example.com','13810000010','admin',1,'2025-08-11 08:55:45.124',NULL),(212,'user_012','user12@example.com','13810000011','editor',1,'2025-07-19 15:09:05.937',NULL),(213,'user_013','user13@example.com','13810000012','editor',1,'2025-12-04 02:50:10.206',NULL),(214,'user_014','user14@example.com','13810000013','editor',1,'2025-05-21 09:16:43.136',NULL),(215,'user_015','user15@example.com','13810000014','editor',0,'2025-08-08 17:30:03.050',NULL),(216,'user_016','user16@example.com','13810000015','admin',1,'2025-11-11 12:54:54.121',NULL),(217,'user_017','user17@example.com','13810000016','editor',1,'2026-02-17 14:35:18.362',NULL),(218,'user_018','user18@example.com','13810000017','editor',1,'2025-11-08 13:24:30.288',NULL),(219,'user_019','user19@example.com','13810000018','editor',1,'2025-12-25 09:57:24.424',NULL),(220,'user_020','user20@example.com','13810000019','editor',1,'2025-06-02 16:51:31.303',NULL),(221,'user_021','user21@example.com','13810000020','admin',1,'2025-06-26 22:58:55.126',NULL),(222,'user_022','user22@example.com','13810000021','editor',0,'2025-06-10 20:47:51.947',NULL),(223,'user_023','user23@example.com','13810000022','editor',1,'2025-07-10 20:03:49.863',NULL),(224,'user_024','user24@example.com','13810000023','editor',1,'2026-03-13 00:05:14.580',NULL),(225,'user_025','user25@example.com','13810000024','editor',1,'2025-04-01 15:29:05.917',NULL),(226,'user_026','user26@example.com','13810000025','admin',1,'2026-01-18 19:46:07.428',NULL),(227,'user_027','user27@example.com','13810000026','editor',1,'2025-11-04 13:07:14.637',NULL),(228,'user_028','user28@example.com','13810000027','editor',1,'2025-10-29 17:29:17.688',NULL),(229,'user_029','user29@example.com','13810000028','editor',0,'2025-11-11 06:41:19.915',NULL),(230,'user_030','user30@example.com','13810000029','editor',1,'2025-04-25 13:58:58.980',NULL),(231,'user_031','user31@example.com','13810000030','admin',1,'2025-12-27 15:41:38.520',NULL),(232,'user_032','user32@example.com','13810000031','editor',1,'2026-02-15 18:26:34.549',NULL),(233,'user_033','user33@example.com','13810000032','editor',1,'2025-04-25 00:28:16.858',NULL),(234,'user_034','user34@example.com','13810000033','editor',1,'2025-11-08 11:42:27.997',NULL),(235,'user_035','user35@example.com','13810000034','editor',1,'2025-05-21 14:11:03.873',NULL),(236,'user_036','user36@example.com','13810000035','admin',0,'2026-02-08 19:59:01.742',NULL),(237,'user_037','user37@example.com','13810000036','editor',1,'2025-10-08 02:18:22.678',NULL),(238,'user_038','user38@example.com','13810000037','editor',1,'2025-05-22 12:05:49.678',NULL),(239,'user_039','user39@example.com','13810000038','editor',1,'2025-09-28 16:49:05.740',NULL),(240,'user_040','user40@example.com','13810000039','editor',1,'2025-08-23 20:19:37.950',NULL),(241,'user_041','user41@example.com','13810000040','admin',1,'2026-03-02 15:00:13.044',NULL),(242,'user_042','user42@example.com','13810000041','editor',1,'2025-11-30 07:03:20.385',NULL),(243,'user_043','user43@example.com','13810000042','editor',0,'2025-04-25 02:17:11.169',NULL),(244,'user_044','user44@example.com','13810000043','editor',1,'2026-02-12 04:42:29.201',NULL),(245,'user_045','user45@example.com','13810000044','editor',1,'2026-03-13 13:00:08.623',NULL),(246,'user_046','user46@example.com','13810000045','admin',1,'2025-08-20 22:28:39.084',NULL),(247,'user_047','user47@example.com','13810000046','editor',1,'2025-05-21 15:47:03.867',NULL),(248,'user_048','user48@example.com','13810000047','editor',1,'2026-03-04 21:20:31.364',NULL),(249,'user_049','user49@example.com','13810000048','editor',1,'2025-07-22 15:24:51.433',NULL),(250,'user_050','user50@example.com','13810000049','editor',0,'2026-01-08 21:13:43.616',NULL),(251,'user_051','user51@example.com','13810000050','admin',1,'2025-09-06 01:16:21.704',NULL),(252,'user_052','user52@example.com','13810000051','editor',1,'2025-11-06 14:22:54.627',NULL),(253,'user_053','user53@example.com','13810000052','editor',1,'2025-04-25 08:00:15.259',NULL),(254,'user_054','user54@example.com','13810000053','editor',1,'2025-08-10 15:17:16.571',NULL),(255,'user_055','user55@example.com','13810000054','editor',1,'2025-06-03 08:48:54.540',NULL),(256,'user_056','user56@example.com','13810000055','admin',1,'2025-08-13 13:39:24.189',NULL),(257,'user_057','user57@example.com','13810000056','editor',0,'2025-11-05 03:27:06.627',NULL),(258,'user_058','user58@example.com','13810000057','editor',1,'2025-09-29 11:00:49.628',NULL),(259,'user_059','user59@example.com','13810000058','editor',1,'2026-03-12 11:35:00.629',NULL),(260,'user_060','user60@example.com','13810000059','editor',1,'2026-02-05 16:25:02.181',NULL),(261,'user_061','user61@example.com','13810000060','admin',1,'2025-10-04 11:30:57.467',NULL),(262,'user_062','user62@example.com','13810000061','editor',1,'2025-11-28 02:43:13.847',NULL),(263,'user_063','user63@example.com','13810000062','editor',1,'2025-05-20 19:48:01.791',NULL),(264,'user_064','user64@example.com','13810000063','editor',0,'2026-02-09 12:48:52.011',NULL),(265,'user_065','user65@example.com','13810000064','editor',1,'2025-04-14 03:02:29.654',NULL),(266,'user_066','user66@example.com','13810000065','admin',1,'2026-03-12 23:12:27.553',NULL),(267,'user_067','user67@example.com','13810000066','editor',1,'2026-02-16 04:59:49.880',NULL),(268,'user_068','user68@example.com','13810000067','editor',1,'2025-04-05 19:36:48.770',NULL),(269,'user_069','user69@example.com','13810000068','editor',1,'2025-09-21 21:50:04.463',NULL),(270,'user_070','user70@example.com','13810000069','editor',1,'2025-10-24 23:18:49.987',NULL),(271,'user_071','user71@example.com','13810000070','admin',0,'2025-07-20 14:52:30.386',NULL),(272,'user_072','user72@example.com','13810000071','editor',1,'2025-03-22 10:37:41.041',NULL),(273,'user_073','user73@example.com','13810000072','editor',1,'2025-08-26 06:19:54.430',NULL),(274,'user_074','user74@example.com','13810000073','editor',1,'2025-05-23 04:58:55.121',NULL),(275,'user_075','user75@example.com','13810000074','editor',1,'2026-01-28 04:32:19.045',NULL),(276,'user_076','user76@example.com','13810000075','admin',1,'2026-02-09 22:48:51.033',NULL),(277,'user_077','user77@example.com','13810000076','editor',1,'2025-10-18 22:51:47.473',NULL),(278,'user_078','user78@example.com','13810000077','editor',0,'2025-04-23 22:58:32.223',NULL),(279,'user_079','user79@example.com','13810000078','editor',1,'2025-08-01 21:31:59.446',NULL),(280,'user_080','user80@example.com','13810000079','editor',1,'2025-09-13 12:00:11.756',NULL),(281,'user_081','user81@example.com','13810000080','admin',1,'2026-02-06 22:28:30.214',NULL),(282,'user_082','user82@example.com','13810000081','editor',1,'2025-04-23 07:17:07.721',NULL),(283,'user_083','user83@example.com','13810000082','editor',1,'2025-10-31 11:42:01.412',NULL),(284,'user_084','user84@example.com','13810000083','editor',1,'2026-02-21 11:40:22.943',NULL),(285,'user_085','user85@example.com','13810000084','editor',0,'2025-08-26 12:29:19.534',NULL),(286,'user_086','user86@example.com','13810000085','admin',1,'2025-04-12 15:30:27.095',NULL),(287,'user_087','user87@example.com','13810000086','editor',1,'2026-01-29 12:10:10.370',NULL),(288,'user_088','user88@example.com','13810000087','editor',1,'2025-06-16 20:47:57.525',NULL),(289,'user_089','user89@example.com','13810000088','editor',1,'2025-03-31 11:23:08.521',NULL),(290,'user_090','user90@example.com','13810000089','editor',1,'2025-05-22 00:13:52.501',NULL),(291,'user_091','user91@example.com','13810000090','admin',1,'2025-06-29 14:50:12.880',NULL),(292,'user_092','user92@example.com','13810000091','editor',0,'2025-06-29 02:19:53.331',NULL),(293,'user_093','user93@example.com','13810000092','editor',1,'2025-10-05 22:24:18.404',NULL),(294,'user_094','user94@example.com','13810000093','editor',1,'2026-02-24 12:46:15.616',NULL),(295,'user_095','user95@example.com','13810000094','editor',1,'2025-04-18 09:09:52.489',NULL),(296,'user_096','user96@example.com','13810000095','admin',1,'2026-02-14 07:09:35.485',NULL),(297,'user_097','user97@example.com','13810000096','editor',1,'2025-10-06 00:42:19.669',NULL),(298,'user_098','user98@example.com','13810000097','editor',1,'2025-07-19 07:22:54.456',NULL),(299,'user_099','user99@example.com','13810000098','editor',0,'2025-05-23 22:35:28.460',NULL),(300,'user_100','user100@example.com','13810000099','editor',1,'2025-04-13 06:56:19.140',NULL);
/*!40000 ALTER TABLE `table_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `user_roles_role_id_fkey` (`role_id`),
  CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,2),(10,2),(11,2),(12,2);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_dept_id_fkey` (`dept_id`),
  CONSTRAINT `users_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$N3bv0hWsgnRV1lEadf6.9.KTLT4HBP5MHb4eNVb9K6AT7XKrG5O1e','admin@Cyber.com','13800000001',1,'2026-03-14 07:26:31.587','2026-03-14 07:26:31.587',1),(2,'editor','$2b$10$ao/daDz.BrfjF.thejw6t.S0m7NBNv2m.H4ZMMbByL.yFfYnoZgY6','editor@Cyber.com','13800000002',1,'2026-03-14 07:26:31.590','2026-03-14 07:26:31.590',7),(3,'zhang_wei','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','zhang_wei@Cyber.com','13900000003',1,'2026-03-14 07:26:31.591','2026-03-14 07:26:31.591',7),(4,'li_fang','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','li_fang@Cyber.com','13900000004',1,'2026-03-14 07:26:31.594','2026-03-14 07:26:31.594',7),(5,'wang_hao','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','wang_hao@Cyber.com','13900000005',1,'2026-03-14 07:26:31.596','2026-03-14 07:26:31.596',8),(6,'zhao_min','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','zhao_min@Cyber.com','13900000006',1,'2026-03-14 07:26:31.597','2026-03-14 07:26:31.597',8),(7,'chen_jing','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','chen_jing@Cyber.com','13900000007',1,'2026-03-14 07:26:31.598','2026-03-14 07:26:31.598',9),(8,'liu_yang','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','liu_yang@Cyber.com','13900000008',1,'2026-03-14 07:26:31.600','2026-03-14 07:26:31.600',10),(9,'sun_xia','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','sun_xia@Cyber.com','13900000009',1,'2026-03-14 07:26:31.602','2026-03-14 07:26:31.602',11),(10,'zhou_peng','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','zhou_peng@Cyber.com','13900000010',1,'2026-03-14 07:26:31.603','2026-03-14 07:26:31.603',12),(11,'wu_ting','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','wu_ting@Cyber.com','13900000011',1,'2026-03-14 07:26:31.605','2026-03-14 07:26:31.605',13),(12,'zheng_bo','$2b$10$58Y0d9aW9RvhgMY1laV/KOJbSGlLQKhjX6yr70hmlnH2LDDKTTFgm','zheng_bo@Cyber.com','13900000012',1,'2026-03-14 07:26:31.607','2026-03-14 07:26:31.607',14);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-14 17:30:44
