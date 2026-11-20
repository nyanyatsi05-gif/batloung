const { pool, withTransaction } = require("../config/database");
const AppError = require("../middleware/AppError");

async function getAllPurchases() {
  const [rows] = await pool.query(`
    SELECT p.purchase_id, p.supplier_id, s.business_name, p.purchase_date, p.total_amount
    FROM purchases p JOIN suppliers s ON s.supplier_id = p.supplier_id
    ORDER BY p.purchase_id DESC`);
  return rows;
}

async function getPurchaseDetails(id) {
  const [rows] = await pool.query(`
    SELECT pd.purchase_detail_id, pd.purchase_id, pd.fruit_id, f.fruit_name, pd.quantity,
           pd.unit_cost, pd.packaging_size, (pd.quantity * pd.unit_cost) AS subtotal
    FROM purchase_details pd JOIN fruits f ON f.fruit_id = pd.fruit_id
    WHERE pd.purchase_id = ?`, [id]);
  return rows;
}

// Records a multi-item purchase and INCREASES stock per fruit + packaging size.
async function createPurchase({ supplier_id, purchase_date, items }) {
  return withTransaction(async (conn) => {
    const [sup] = await conn.query("SELECT supplier_id FROM suppliers WHERE supplier_id = ?", [supplier_id]);
    if (sup.length === 0) throw new AppError("Selected supplier does not exist.", 404);

    let total = 0;
    for (const it of items) {
      const [fr] = await conn.query("SELECT fruit_id FROM fruits WHERE fruit_id = ?", [it.fruit_id]);
      if (fr.length === 0) throw new AppError(`Fruit ${it.fruit_id} does not exist.`, 404);
      total += it.quantity * it.unit_cost;
    }
    total = Math.round(total * 100) / 100;

    const [p] = await conn.query(
      "INSERT INTO purchases (supplier_id, purchase_date, total_amount) VALUES (?, ?, ?)",
      [supplier_id, purchase_date, total]);
    for (const it of items) {
      await conn.query(
        `INSERT INTO purchase_details (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
         VALUES (?, ?, ?, ?, ?)`, [p.insertId, it.fruit_id, it.quantity, it.unit_cost, it.packaging_size]);
      await conn.query(
        `INSERT INTO stock (fruit_id, packaging_size, available_quantity) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE available_quantity = available_quantity + VALUES(available_quantity)`,
        [it.fruit_id, it.packaging_size, it.quantity]);
    }
    return { purchase_id: p.insertId, total_amount: total };
  });
}

module.exports = { getAllPurchases, getPurchaseDetails, createPurchase };
