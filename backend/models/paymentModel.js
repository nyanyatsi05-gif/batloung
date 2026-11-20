const { pool, withTransaction } = require("../config/database");
const AppError = require("../middleware/AppError");
const { paymentStatus } = require("./salesModel");

async function getAllPayments() {
  const [rows] = await pool.query(`
    SELECT p.payment_id, p.sale_id, p.payment_amount, p.payment_method, p.payment_date,
           s.total_amount, s.payment_status, v.vendor_name
    FROM payments p JOIN sales s ON s.sale_id = p.sale_id JOIN vendors v ON v.vendor_id = s.vendor_id
    ORDER BY p.payment_id DESC`);
  return rows;
}

async function getUnpaidSales() {
  const [rows] = await pool.query(`
    SELECT s.sale_id, s.total_amount, s.payment_status, v.vendor_name,
           COALESCE(SUM(p.payment_amount), 0) AS amount_paid,
           s.total_amount - COALESCE(SUM(p.payment_amount), 0) AS outstanding_balance
    FROM sales s JOIN vendors v ON v.vendor_id = s.vendor_id
    LEFT JOIN payments p ON p.sale_id = s.sale_id
    GROUP BY s.sale_id, s.total_amount, s.payment_status, v.vendor_name
    HAVING outstanding_balance > 0
    ORDER BY s.sale_id DESC`);
  return rows;
}

async function recordPayment({ sale_id, payment_amount, payment_method, payment_date }) {
  return withTransaction(async (conn) => {
    const [sales] = await conn.query("SELECT total_amount FROM sales WHERE sale_id = ? FOR UPDATE", [sale_id]);
    if (sales.length === 0) throw new AppError("Sale not found.", 404);
    const [[{ paid }]] = await conn.query(
      "SELECT COALESCE(SUM(payment_amount),0) AS paid FROM payments WHERE sale_id = ?", [sale_id]);
    const total = sales[0].total_amount;
    const outstanding = Math.round((total - paid) * 100) / 100;
    if (payment_amount > outstanding) {
      throw new AppError("Payment cannot be greater than the outstanding balance.", 400,
        { outstanding_balance: outstanding });
    }
    const [r] = await conn.query(
      "INSERT INTO payments (sale_id, payment_amount, payment_method, payment_date) VALUES (?, ?, ?, ?)",
      [sale_id, payment_amount, payment_method, payment_date]);
    const newPaid = Math.round((paid + payment_amount) * 100) / 100;
    const status = paymentStatus(total, newPaid);
    await conn.query("UPDATE sales SET payment_status = ? WHERE sale_id = ?", [status, sale_id]);
    return { payment_id: r.insertId, amount_paid: newPaid,
             outstanding_balance: Math.round((total - newPaid) * 100) / 100, payment_status: status };
  });
}

module.exports = { getAllPayments, getUnpaidSales, recordPayment };
