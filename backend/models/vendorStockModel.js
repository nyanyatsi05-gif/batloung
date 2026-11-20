const { pool } = require("../config/database");

async function searchVendors(q) {
  const like = `%${q}%`;
  const [rows] = await pool.query(
    "SELECT * FROM vendors WHERE vendor_name LIKE ? OR phone_number LIKE ? ORDER BY vendor_name", [like, like]);
  return rows;
}

// Outstanding balance per vendor = total sales - total payments.
async function getVendorBalances(vendorId) {
  const [rows] = await pool.query(`
    SELECT v.vendor_id, v.vendor_name, v.phone_number,
           COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.vendor_id = v.vendor_id), 0) AS total_sales,
           COALESCE((SELECT SUM(p.payment_amount) FROM payments p JOIN sales s ON s.sale_id = p.sale_id
                     WHERE s.vendor_id = v.vendor_id), 0) AS total_paid
    FROM vendors v ${vendorId ? "WHERE v.vendor_id = ?" : ""}
    ORDER BY v.vendor_name`, vendorId ? [vendorId] : []);
  return rows.map((r) => ({ ...r, outstanding_balance: Math.round((r.total_sales - r.total_paid) * 100) / 100 }));
}

async function getLowStock(threshold) {
  const [rows] = await pool.query(`
    SELECT st.stock_id, f.fruit_id, f.fruit_name, st.packaging_size, st.available_quantity
    FROM stock st JOIN fruits f ON f.fruit_id = st.fruit_id
    WHERE st.available_quantity <= ?
    ORDER BY st.available_quantity, f.fruit_name`, [threshold]);
  return rows;
}

module.exports = { searchVendors, getVendorBalances, getLowStock };
