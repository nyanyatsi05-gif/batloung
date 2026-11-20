const model = require("../models/vendorStockModel");
const AppError = require("../middleware/AppError");

async function search(req, res, next) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) throw new AppError("Provide a search term using ?q=name-or-phone", 400);
    res.status(200).json(await model.searchVendors(q));
  } catch (e) { next(e); }
}
async function balances(req, res, next) {
  try { res.status(200).json(await model.getVendorBalances()); } catch (e) { next(e); }
}
async function balanceOne(req, res, next) {
  try {
    const rows = await model.getVendorBalances(Number(req.params.id));
    if (rows.length === 0) throw new AppError("Vendor not found.", 404);
    res.status(200).json(rows[0]);
  } catch (e) { next(e); }
}
async function lowStock(req, res, next) {
  try {
    const t = req.query.threshold === undefined ? 10 : Number(req.query.threshold);
    if (!Number.isInteger(t) || t < 0) throw new AppError("threshold must be a whole number >= 0.", 400);
    res.status(200).json({ threshold: t, items: await model.getLowStock(t) });
  } catch (e) { next(e); }
}
module.exports = { search, balances, balanceOne, lowStock };
