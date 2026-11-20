const model = require("../models/salesModel");
const AppError = require("../middleware/AppError");
const v = require("../middleware/validate");

async function list(req, res, next) {
  try { res.status(200).json(await model.getAllSales()); } catch (e) { next(e); }
}
async function details(req, res, next) {
  try {
    const id = v.positiveInt(req.params.id, "Sale id");
    res.status(200).json(await model.getSaleDetails(id));
  } catch (e) { next(e); }
}
async function create(req, res, next) {
  try {
    const vendor_id = v.positiveInt(req.body.vendor_id, "vendor_id");
    const sale_date = v.validDate(req.body.sale_date, "sale_date");
    const items = v.lineItems(req.body.items, "unit_price");

    // Payment: either an explicit amount_paid, or the older payment_status field from the form.
    let amount_paid = Number(req.body.amount_paid || 0);
    let payment_method = req.body.payment_method || "CASH";
    if (!Number.isFinite(amount_paid) || amount_paid < 0) throw new AppError("amount_paid is invalid.", 400);
    if (!v.METHODS.includes(payment_method)) throw new AppError("Invalid payment method.", 400);
    if (req.body.amount_paid === undefined && req.body.payment_status === "PAID") amount_paid = Infinity; // paid in full
    if (req.body.payment_status && !["PAID", "PARTIALLY_PAID", "UNPAID"].includes(req.body.payment_status))
      throw new AppError("Invalid payment status.", 400);

    const result = await model.createSale({
      vendor_id, sale_date, items,
      amount_paid: amount_paid === Infinity ? null : amount_paid, payment_method, payFull: amount_paid === Infinity
    });
    res.status(201).json({ message: "Sale recorded and stock updated successfully.", ...result });
  } catch (e) { next(e); }
}
module.exports = { list, details, create };
