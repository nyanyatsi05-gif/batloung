const model = require("../models/purchaseModel");
const v = require("../middleware/validate");

async function list(req, res, next) {
  try { res.status(200).json(await model.getAllPurchases()); } catch (e) { next(e); }
}
async function details(req, res, next) {
  try { res.status(200).json(await model.getPurchaseDetails(v.positiveInt(req.params.id, "Purchase id"))); }
  catch (e) { next(e); }
}
async function create(req, res, next) {
  try {
    const supplier_id = v.positiveInt(req.body.supplier_id, "supplier_id");
    const purchase_date = v.validDate(req.body.purchase_date, "purchase_date");
    const items = v.lineItems(req.body.items, "unit_cost");
    const result = await model.createPurchase({ supplier_id, purchase_date, items });
    res.status(201).json({ message: "Purchase recorded and stock updated successfully", ...result });
  } catch (e) { next(e); }
}
module.exports = { list, details, create };
