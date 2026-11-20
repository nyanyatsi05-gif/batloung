const model = require("../models/paymentModel");
const AppError = require("../middleware/AppError");
const v = require("../middleware/validate");

async function list(req, res, next) {
  try { res.status(200).json(await model.getAllPayments()); } catch (e) { next(e); }
}
async function unpaid(req, res, next) {
  try { res.status(200).json(await model.getUnpaidSales()); } catch (e) { next(e); }
}
async function create(req, res, next) {
  try {
    const sale_id = v.positiveInt(req.body.sale_id, "sale_id");
    const payment_amount = Number(req.body.payment_amount);
    if (!Number.isFinite(payment_amount) || payment_amount <= 0)
      throw new AppError("Payment amount must be greater than zero.", 400);
    if (!v.METHODS.includes(req.body.payment_method)) throw new AppError("Invalid payment method.", 400);
    const payment_date = v.validDate(req.body.payment_date, "payment_date");
    const result = await model.recordPayment({ sale_id, payment_amount, payment_method: req.body.payment_method, payment_date });
    res.status(201).json({ message: "Payment recorded successfully", ...result });
  } catch (e) { next(e); }
}
module.exports = { list, unpaid, create };
