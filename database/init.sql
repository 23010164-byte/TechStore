CREATE DATABASE IF NOT EXISTS techstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techstore;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_name (name),
  INDEX idx_products_category (category)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  total DECIMAL(12,2) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, category, price, stock, image_url)
SELECT 'TechStore Wireless Mouse', 'Ergonomic wireless mouse for everyday work.', 'Accessories', 299000, 40, 'https://placehold.co/600x400?text=Wireless+Mouse'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'TechStore Wireless Mouse');
INSERT INTO products (name, description, category, price, stock, image_url)
SELECT 'Mechanical Keyboard TKL', 'Compact mechanical keyboard for productivity and gaming.', 'Accessories', 1299000, 18, 'https://placehold.co/600x400?text=Keyboard'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mechanical Keyboard TKL');
INSERT INTO products (name, description, category, price, stock, image_url)
SELECT '27-inch IPS Monitor', 'Full HD IPS monitor suitable for study and office.', 'Monitors', 3499000, 12, 'https://placehold.co/600x400?text=Monitor'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '27-inch IPS Monitor');
INSERT INTO products (name, description, category, price, stock, image_url)
SELECT 'USB-C Hub 7-in-1', 'USB-C hub with HDMI, USB-A and card reader ports.', 'Accessories', 799000, 25, 'https://placehold.co/600x400?text=USB-C+Hub'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB-C Hub 7-in-1');
INSERT INTO products (name, description, category, price, stock, image_url)
SELECT 'Laptop Stand Aluminum', 'Adjustable aluminum stand for improved desk ergonomics.', 'Workspace', 599000, 30, 'https://placehold.co/600x400?text=Laptop+Stand'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop Stand Aluminum');
