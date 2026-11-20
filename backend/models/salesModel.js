const { pool, withTransaction } = require("../config/database");
const AppError = require("../middleware/AppError");

const money = (n) => Math.round(n * 100) / 100;

function paymentStatus(total, paid) {
  if (paid <= 0) return "UNPAID";
  return paid >= total ? "PAID" : "PARTIALLY_PAID";
}

async function getAllSales() {
  const [rows] = await pool.query(`
    SELECT s.sale_id, s.vendor_id, v.vendor_name, s.sale_date, s.payment_status, s.total_amount,
           COALESCE((SELECT SUM(p.payment_amount) FROM payments p WHERE p.sale_id = s.sale_id), 0) AS amount_paid
    FROM sales s JOIN vendors v ON v.vendor_id = s.vendor_id
    ORDER BY s.sale_id DESC`);
  return rows;
}

async function getSaleDetails(saleId) {
  const [rows] = await pool.query(`
    SELECT sd.sales_detail_id, sd.sale_id, sd.fruit_id, f.fruit_name, sd.packaging_size,
           sd.quantity, sd.unit_price, (sd.quantity * sd.unit_price) AS subtotal
    FROM sales_details sd JOIN fruits f ON f.fruit_id = sd.fruit_id
    WHERE sd.sale_id = ?`, [saleId]);
  return rows;
}

// Business logic: total = SUM(quantity x selling price of that packaging size)
function calculateSaleTotal(lines) {
  return money(lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0));
}

/**
 * Records a multi-item sale atomically.
 * If ANY item fails (unknown fruit, no price, not enough stock) the whole
 * transaction is rolled back: no stock reduced, no sale row, no details.
 */
async function createSale({ vendor_id, sale_date, items, amount_paid, payment_method, payFull }) {
  return withTransaction(async (conn) => {
    const [vendors] = await conn.query("SELECT vendor_id FROM vendors WHERE vendor_id = ?", [vendor_id]);
    if (vendors.length === 0) throw new AppError("Selected vendor does not exist.", 404);

    // Merge duplicate lines (same fruit + size) and sort => consistent lock order, no deadlocks.
    const merged = new Map();
    for (const it of items) {
      const key = `${it.fruit_id}|${it.packaging_size}`;
      const prev = merged.get(key);
      if (prev) prev.quantity += it.quantity;
      else merged.set(key, { ...it });
    }
    const lines = [...merged.values()].sort((a, b) =>
      a.fruit_id - b.fruit_id || a.packaging_size.localeCompare(b.packaging_size));

    for (const line of lines) {
      const [fr] = await conn.query("SELECT fruit_name FROM fruits WHERE fruit_id = ?", [line.fruit_id]);
      if (fr.length === 0) throw new AppError(`Fruit ${line.fruit_id} does not exist.`, 404);
      const name = fr[0].fruit_name;

      // Price comes from the database, so the admin cannot type a wrong total.
      const [pr] = await conn.query(
        "SELECT price FROM selling_prices WHERE fruit_id = ? AND packaging_size = ?",
        [line.fruit_id, line.packaging_size]);
      if (pr.length) line.unit_price = pr[0].price;
      else if (!(line.unit_price >= 0)) throw new AppError(`No selling price set for ${name} (${line.packaging_size}).`, 400);

      // Lock the stock row so two sales cannot both take the last boxes.
      const [st] = await conn.query(
        "SELECT available_quantity FROM stock WHERE fruit_id = ? AND packaging_size = ? FOR UPDATE",
        [line.fruit_id, line.packaging_size]);
      const available = st.length ? st[0].available_quantity : 0;
      if (available < line.quantity) {
        throw new AppError(
          `Insufficient stock for ${name} (${line.packaging_size}): requested ${line.quantity}, available ${available}.`,
          400, { fruit_id: line.fruit_id, packaging_size: line.packaging_size, requested: line.quantity, available });
      }
      await conn.query(
        "UPDATE stock SET available_quantity = available_quantity - ? WHERE fruit_id = ? AND packaging_size = ?",
        [line.quantity, line.fruit_id, line.packaging_size]);
    }

    const total = calculateSaleTotal(lines);
    const paid = payFull ? total : money(amount_paid || 0);
    if (paid > total) throw new AppError("Amount paid cannot be more than the sale total.", 400);
    const status = paymentStatus(total, paid);

    const [sale] = await conn.query(
      "INSERT INTO sales (vendor_id, sale_date, payment_status, total_amount) VALUES (?, ?, ?, ?)",
      [vendor_id, sale_date, status, total]);
    for (const l of lines) {
      await conn.query(
        "INSERT INTO sales_details (sale_id, fruit_id, packaging_size, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
        [sale.insertId, l.fruit_id, l.packaging_size, l.quantity, l.unit_price]);
    }
    if (paid > 0) {
      await conn.query(
        "INSERT INTO payments (sale_id, payment_amount, payment_method, payment_date) VALUES (?, ?, ?, ?)",
        [sale.insertId, paid, payment_method, sale_date]);
    }
    return { sale_id: sale.insertId, total_amount: total, amount_paid: paid,
             outstanding_balance: money(total - paid), payment_status: status, items: lines };
  });
}

module.exports = { getAllSales, getSaleDetails, createSale, calculateSaleTotal, paymentStatus };
