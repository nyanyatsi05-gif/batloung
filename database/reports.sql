USE batloung_farm_db;
-- 1. Five most frequently sold fruits
SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold
FROM sales_details sd JOIN fruits f ON f.fruit_id = sd.fruit_id
GROUP BY f.fruit_id, f.fruit_name ORDER BY boxes_sold DESC LIMIT 5;

-- 2. Total revenue in a date range
SELECT COALESCE(SUM(total_amount),0) AS total_revenue
FROM sales WHERE sale_date BETWEEN '2026-10-01' AND '2026-10-31';

-- 3. Vendor who purchased the highest number of boxes
SELECT v.vendor_name, SUM(sd.quantity) AS boxes_purchased
FROM sales s JOIN vendors v ON v.vendor_id = s.vendor_id
JOIN sales_details sd ON sd.sale_id = s.sale_id
GROUP BY v.vendor_id, v.vendor_name ORDER BY boxes_purchased DESC LIMIT 1;

-- 4. Current stock per fruit and packaging size
SELECT f.fruit_name, st.packaging_size, st.available_quantity
FROM stock st JOIN fruits f ON f.fruit_id = st.fruit_id
ORDER BY f.fruit_name, FIELD(st.packaging_size,'Small','Medium','Large');

-- 5. Outstanding balance per vendor
SELECT v.vendor_name,
  COALESCE(SUM(s.total_amount),0) - COALESCE((SELECT SUM(p.payment_amount) FROM payments p
     JOIN sales s2 ON s2.sale_id = p.sale_id WHERE s2.vendor_id = v.vendor_id),0) AS outstanding
FROM vendors v LEFT JOIN sales s ON s.vendor_id = v.vendor_id GROUP BY v.vendor_id, v.vendor_name;

-- Transaction demo (run manually in the MySQL client for the video):
-- START TRANSACTION;
--   UPDATE stock SET available_quantity = available_quantity - 2 WHERE fruit_id=2 AND packaging_size='Small';
--   UPDATE stock SET available_quantity = available_quantity - 10 WHERE fruit_id=1 AND packaging_size='Large'; -- violates CHECK (>=0) -> error
-- ROLLBACK;  -- bananas return to the original quantity
