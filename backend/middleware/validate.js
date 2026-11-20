const AppError = require("./AppError");
const SIZES = ["Small", "Medium", "Large"];
const METHODS = ["CASH", "MOBILE MONEY", "BANK TRANSFER"];

function positiveInt(v, label) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(`${label} must be a positive whole number.`, 400);
  return n;
}
function validDate(v, label) {
  if (!v || Number.isNaN(Date.parse(v))) throw new AppError(`${label} must be a valid date (YYYY-MM-DD).`, 400);
  return String(v).slice(0, 10);
}
function lineItems(items, priceField) {
  if (!Array.isArray(items) || items.length === 0) throw new AppError("At least one item is required.", 400);
  return items.map((it, i) => {
    if (!SIZES.includes(it.packaging_size))
      throw new AppError(`Item ${i + 1}: packaging_size must be Small, Medium or Large.`, 400);
    const line = {
      fruit_id: positiveInt(it.fruit_id, `Item ${i + 1}: fruit_id`),
      quantity: positiveInt(it.quantity, `Item ${i + 1}: quantity`),
      packaging_size: it.packaging_size
    };
    if (it[priceField] !== undefined && it[priceField] !== "") {
      const p = Number(it[priceField]);
      if (!Number.isFinite(p) || p < 0) throw new AppError(`Item ${i + 1}: ${priceField} is invalid.`, 400);
      line[priceField] = p;
    } else if (priceField === "unit_cost") {
      throw new AppError(`Item ${i + 1}: unit_cost is required.`, 400);
    }
    return line;
  });
}
module.exports = { SIZES, METHODS, positiveInt, validDate, lineItems };
