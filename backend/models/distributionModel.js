const { pool } = require("../config/database");

// All functions in this file use promise-based queries (async/await).
async function getDistributionLocations() {
  const [suppliers] = await pool.query(`
    SELECT supplier_id AS id, business_name AS name, province,
           address AS location, 'Supplier' AS type
    FROM suppliers
    ORDER BY business_name
  `);
  const [vendors] = await pool.query(`
    SELECT vendor_id AS id, vendor_name AS name, NULL AS province,
           location, 'Vendor' AS type
    FROM vendors
    ORDER BY vendor_name
  `);
  return { suppliers, vendors };
}

async function getTopFiveFruits() {
  const [rows] = await pool.query(`
    SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold
    FROM sales_details sd
    JOIN fruits f ON f.fruit_id = sd.fruit_id
    GROUP BY f.fruit_id, f.fruit_name
    ORDER BY boxes_sold DESC
    LIMIT 5
  `);
  return rows;
}

async function getRevenueByDateRange(startDate, endDate) {
  const [rows] = await pool.query(`
    SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM sales
    WHERE sale_date BETWEEN ? AND ?
  `, [startDate, endDate]);
  return rows[0];
}

async function getHighestVolumeVendor() {
  const [rows] = await pool.query(`
    SELECT v.vendor_id, v.vendor_name, SUM(sd.quantity) AS boxes_purchased
    FROM sales s
    JOIN vendors v ON v.vendor_id = s.vendor_id
    JOIN sales_details sd ON sd.sale_id = s.sale_id
    GROUP BY v.vendor_id, v.vendor_name
    ORDER BY boxes_purchased DESC
    LIMIT 1
  `);
  return rows[0] || null;
}

async function getStockByPackaging() {
  const [rows] = await pool.query(`
    SELECT f.fruit_name, st.packaging_size, st.available_quantity
    FROM stock st
    JOIN fruits f ON f.fruit_id = st.fruit_id
    ORDER BY f.fruit_name, FIELD(st.packaging_size, 'Small', 'Medium', 'Large')
  `);
  return rows;
}

module.exports = {
  getDistributionLocations,
  getTopFiveFruits,
  getRevenueByDateRange,
  getHighestVolumeVendor,
  getStockByPackaging
};
