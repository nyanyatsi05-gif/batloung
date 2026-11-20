-- Batloung Farm Distribution System - MySQL schema + sample data
-- Run:  mysql -u root -p < database/schema.sql
DROP DATABASE IF EXISTS batloung_farm_db;
CREATE DATABASE batloung_farm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE batloung_farm_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'Staff'
);

CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(100) NOT NULL UNIQUE,
  contact_person VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province ENUM('Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape',
                'Limpopo','Mpumalanga','North West','Northern Cape') NOT NULL,
  address VARCHAR(255) NOT NULL
);

CREATE TABLE fruits (
  fruit_id INT AUTO_INCREMENT PRIMARY KEY,
  fruit_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  status ENUM('Available','Unavailable') NOT NULL DEFAULT 'Available'
);

CREATE TABLE vendors (
  vendor_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  location VARCHAR(150) NOT NULL,
  registration_date DATE NOT NULL
);

CREATE TABLE purchases (
  purchase_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  purchase_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE purchase_details (
  purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  fruit_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  packaging_size ENUM('Small','Medium','Large') NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
);

CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  sale_date DATE NOT NULL,
  payment_status ENUM('PAID','PARTIALLY_PAID','UNPAID') NOT NULL DEFAULT 'UNPAID',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

CREATE TABLE sales_details (
  sales_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  fruit_id INT NOT NULL,
  packaging_size ENUM('Small','Medium','Large') NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
);

-- One row per fruit AND packaging size => separate small/medium/large stock.
CREATE TABLE stock (
  stock_id INT AUTO_INCREMENT PRIMARY KEY,
  fruit_id INT NOT NULL,
  packaging_size ENUM('Small','Medium','Large') NOT NULL,
  available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  UNIQUE KEY uq_stock_fruit_size (fruit_id, packaging_size),
  FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
);

-- Selling price per fruit and packaging size (each size has a different price).
CREATE TABLE selling_prices (
  price_id INT AUTO_INCREMENT PRIMARY KEY,
  fruit_id INT NOT NULL,
  packaging_size ENUM('Small','Medium','Large') NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  UNIQUE KEY uq_price_fruit_size (fruit_id, packaging_size),
  FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  payment_amount DECIMAL(12,2) NOT NULL CHECK (payment_amount > 0),
  payment_method ENUM('CASH','MOBILE MONEY','BANK TRANSFER') NOT NULL,
  payment_date DATE NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
);

-- ---------------- SAMPLE DATA ----------------
INSERT INTO suppliers (business_name, contact_person, phone, province, address) VALUES
('Highveld Fresh Produce','Thabo Mokoena','+27 11 555 0101','Gauteng','12 Market Rd, Johannesburg'),
('Free State Orchards','Anna van Wyk','+27 51 555 0102','Free State','45 Orchard Ln, Bloemfontein'),
('Zulu Coast Farms','Sipho Dlamini','+27 31 555 0103','KwaZulu-Natal','8 Cane St, Durban'),
('Cape Valley Growers','Liezel Botha','+27 21 555 0104','Western Cape','3 Vineyard Rd, Paarl'),
('Limpopo Tropical Fruit','Peter Maake','+27 15 555 0105','Limpopo','20 Mango Dr, Tzaneen'),
('Lowveld Citrus Co-op','Nomsa Khumalo','+27 13 555 0106','Mpumalanga','7 Citrus Ave, Nelspruit');

INSERT INTO fruits (fruit_name, description, status) VALUES
('Apples','Crisp red apples','Available'),
('Bananas','Sweet ripe bananas','Available'),
('Oranges','Juicy navel oranges','Available'),
('Mangoes','Tropical mangoes','Available'),
('Grapes','Seedless table grapes','Available');

INSERT INTO vendors (vendor_name, phone_number, location, registration_date) VALUES
('Mpho Street Stall','+266 5801 1001','Maseru Central','2026-01-15'),
('Lerato Fruits','+266 5801 1002','Maseru West','2026-02-03'),
('Tumelo Fresh Corner','+266 5801 1003','Ha Thetsane','2026-02-20'),
('Palesa Market Table','+266 5801 1004','Maseru East','2026-03-11'),
('Teboho Roadside Fruit','+266 5801 1005','Mazenod','2026-04-02');

INSERT INTO stock (fruit_id, packaging_size, available_quantity) VALUES
(1,'Small',60),(1,'Medium',40),(1,'Large',6),
(2,'Small',50),(2,'Medium',35),(2,'Large',25),
(3,'Small',45),(3,'Medium',30),(3,'Large',20),
(4,'Small',8),(4,'Medium',25),(4,'Large',15),
(5,'Small',30),(5,'Medium',22),(5,'Large',4);

INSERT INTO selling_prices (fruit_id, packaging_size, price) VALUES
(1,'Small',80),(1,'Medium',120),(1,'Large',180),
(2,'Small',50),(2,'Medium',75),(2,'Large',110),
(3,'Small',60),(3,'Medium',90),(3,'Large',130),
(4,'Small',90),(4,'Medium',140),(4,'Large',200),
(5,'Small',100),(5,'Medium',150),(5,'Large',220);

INSERT INTO purchases (supplier_id, purchase_date, total_amount) VALUES
(1,'2026-10-01',5400.00),(3,'2026-10-05',3150.00);
INSERT INTO purchase_details (purchase_id, fruit_id, quantity, unit_cost, packaging_size) VALUES
(1,1,30,100.00,'Medium'),(1,5,20,120.00,'Large'),
(2,2,35,60.00,'Medium'),(2,4,10,105.00,'Small');

INSERT INTO sales (vendor_id, sale_date, payment_status, total_amount) VALUES
(1,'2026-10-10','PAID',1200.00),
(2,'2026-10-12','PARTIALLY_PAID',900.00),
(3,'2026-10-15','UNPAID',1100.00);
INSERT INTO sales_details (sale_id, fruit_id, packaging_size, quantity, unit_price) VALUES
(1,1,'Medium',10,120.00),
(2,3,'Medium',5,90.00),(2,2,'Large',4,110.00),
(3,4,'Large',3,200.00),(3,5,'Small',5,100.00);
INSERT INTO payments (sale_id, payment_amount, payment_method, payment_date) VALUES
(1,1200.00,'CASH','2026-10-10'),
(2,400.00,'MOBILE MONEY','2026-10-13');
