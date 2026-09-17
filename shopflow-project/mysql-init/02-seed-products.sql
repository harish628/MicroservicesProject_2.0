-- seed-products.sql
--
-- What this file does:
-- Inserts dummy categories and products directly into product_db so you have
-- something to actually see and click on in the React storefront.
--
-- Images use https://picsum.photos — a free service that returns real,
-- stable stock photos (not broken links, not gray placeholder boxes).
-- Each one is seeded with a fixed ID (picsum.photos/id/{N}/600/600) so the
-- SAME photo shows every time you reload — useful for a consistent demo.
--
-- HOW TO RUN THIS:
--   mysql -u root -p product_db < seed-products.sql
--
-- Or paste the contents directly into the MySQL command line client
-- after running: USE product_db;

USE product_db;


-- Reset auto-increment counters so IDs start clean at 1
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;

-- ── CATEGORIES ────────────────────────────────────────────────────────────
INSERT INTO categories (name, description, created_at) VALUES
  ('Electronics',  'Phones, laptops, audio gear, and gadgets',        NOW()),
  ('Footwear',     'Sneakers, boots, and everyday shoes',             NOW()),
  ('Home & Kitchen', 'Appliances, cookware, and home essentials',     NOW()),
  ('Fashion',      'Clothing, bags, and accessories',                 NOW()),
  ('Sports & Fitness', 'Equipment and gear for an active lifestyle',  NOW());

-- ── PRODUCTS ──────────────────────────────────────────────────────────────
-- category_id 1=Electronics 2=Footwear 3=Home & Kitchen 4=Fashion 5=Sports

INSERT INTO products (name, description, price, image_url, stock, is_active, category_id, created_at) VALUES

-- Electronics
('Wireless Over-Ear Headphones', 'Noise-cancelling wireless headphones with 30-hour battery life and plush ear cushions for all-day comfort.', 4999.00, 'https://picsum.photos/id/3/600/600', 42, TRUE, 1, NOW()),
('Smartwatch Pro', 'Track fitness, heart rate, and notifications on a vivid AMOLED display. Water resistant up to 50m.', 8999.00, 'https://picsum.photos/id/60/600/600', 18, TRUE, 1, NOW()),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with hot-swappable switches, built for gaming and typing alike.', 3499.00, 'https://picsum.photos/id/0/600/600', 35, TRUE, 1, NOW()),
('Portable Bluetooth Speaker', 'Compact speaker with deep bass and 12-hour playtime. Splash resistant for outdoor use.', 2199.00, 'https://picsum.photos/id/26/600/600', 4, TRUE, 1, NOW()),
('4K Action Camera', 'Capture every adventure in crisp 4K. Includes waterproof case and mounting kit.', 12499.00, 'https://picsum.photos/id/96/600/600', 0, TRUE, 1, NOW()),

-- Footwear
('Classic Running Shoes', 'Lightweight breathable mesh upper with cushioned sole, built for long-distance comfort.', 3299.00, 'https://picsum.photos/id/103/600/600', 60, TRUE, 2, NOW()),
('Leather Chelsea Boots', 'Premium full-grain leather boots with a comfortable elastic side panel and durable sole.', 5499.00, 'https://picsum.photos/id/21/600/600', 22, TRUE, 2, NOW()),
('Canvas Sneakers', 'Classic everyday canvas sneakers — easy to pair with anything in your wardrobe.', 1899.00, 'https://picsum.photos/id/24/600/600', 8, TRUE, 2, NOW()),

-- Home & Kitchen
('Stainless Steel Cookware Set', '5-piece induction-friendly cookware set with non-stick coating and heat-resistant handles.', 6499.00, 'https://picsum.photos/id/292/600/600', 15, TRUE, 3, NOW()),
('Electric Kettle', 'Fast-boiling 1.7L electric kettle with auto shut-off and boil-dry protection.', 1599.00, 'https://picsum.photos/id/30/600/600', 50, TRUE, 3, NOW()),
('Air Fryer 4L', 'Oil-free air fryer with digital touch controls and 8 preset cooking modes.', 5999.00, 'https://picsum.photos/id/292/600/600', 27, TRUE, 3, NOW()),

-- Fashion
('Leather Crossbody Bag', 'Compact genuine leather crossbody bag with adjustable strap and multiple compartments.', 2799.00, 'https://picsum.photos/id/188/600/600', 30, TRUE, 4, NOW()),
('Cotton Casual Shirt', 'Breathable 100% cotton shirt, tailored fit, perfect for everyday wear.', 1299.00, 'https://picsum.photos/id/177/600/600', 75, TRUE, 4, NOW()),
('Denim Jacket', 'Classic washed denim jacket with a relaxed fit and durable stitching.', 2999.00, 'https://picsum.photos/id/180/600/600', 19, TRUE, 4, NOW()),

-- Sports & Fitness
('Yoga Mat', 'Extra-thick non-slip yoga mat with carrying strap, ideal for home workouts.', 999.00, 'https://picsum.photos/id/206/600/600', 90, TRUE, 5, NOW()),
('Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells, 2.5kg to 20kg per side, with quick-lock mechanism.', 7499.00, 'https://picsum.photos/id/210/600/600', 12, TRUE, 5, NOW()),
('Resistance Bands Set', 'Set of 5 resistance bands with varying tension levels, plus door anchor and handles.', 799.00, 'https://picsum.photos/id/212/600/600', 3, TRUE, 5, NOW());



