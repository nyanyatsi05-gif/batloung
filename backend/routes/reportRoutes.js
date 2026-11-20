
const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. STOCK REPORT
router.get("/stock", (req, res) => {
    const sql = `
        SELECT
            stock_id,
            fruit_id,
            packaging_size,
            available_quantity
        FROM stock
        ORDER BY fruit_id ASC, packaging_size ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error generating stock report",
                error: err.message
            });
        }

        res.json(results);
    });
});

// 2. SALES REPORT
router.get("/sales", (req, res) => {
    const sql = `
        SELECT
            s.sale_id,
            s.sale_date,
            s.payment_status,
            s.total_amount,
            COALESCE(SUM(sd.quantity), 0) AS total_items,
            COALESCE(SUM(sd.quantity * sd.unit_price), 0) AS calculated_total
        FROM sales s
        LEFT JOIN sales_details sd ON s.sale_id = sd.sale_id
        GROUP BY
            s.sale_id,
            s.sale_date,
            s.payment_status,
            s.total_amount
        ORDER BY s.sale_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error generating sales report",
                error: err.message
            });
        }

        res.json(results);
    });
});

// 3. PURCHASE REPORT
router.get("/purchases", (req, res) => {
    const sql = `
        SELECT
            p.purchase_id,
            p.supplier_id,
            p.purchase_date,
            p.total_amount,
            COALESCE(SUM(pd.quantity), 0) AS total_items,
            COALESCE(SUM(pd.quantity * pd.unit_cost), 0) AS calculated_total
        FROM purchases p
        LEFT JOIN purchase_details pd
            ON p.purchase_id = pd.purchase_id
        GROUP BY
            p.purchase_id,
            p.supplier_id,
            p.purchase_date,
            p.total_amount
        ORDER BY p.purchase_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error generating purchase report",
                error: err.message
            });
        }

        res.json(results);
    });
});

// 4. SALES SUMMARY BY FRUIT
router.get("/sales-by-fruit", (req, res) => {
    const sql = `
        SELECT
            fruit_id,
            SUM(quantity) AS total_quantity_sold,
            SUM(quantity * unit_price) AS total_sales
        FROM sales_details
        GROUP BY fruit_id
        ORDER BY total_sales DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error generating sales summary",
                error: err.message
            });
        }

        res.json(results);
    });
});

// 5. PURCHASE SUMMARY BY FRUIT
router.get("/purchases-by-fruit", (req, res) => {
    const sql = `
        SELECT
            fruit_id,
            SUM(quantity) AS total_quantity_purchased,
            SUM(quantity * unit_cost) AS total_purchase_cost
        FROM purchase_details
        GROUP BY fruit_id
        ORDER BY total_purchase_cost DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error generating purchase summary",
                error: err.message
            });
        }

        res.json(results);
    });
});

module.exports = router;
