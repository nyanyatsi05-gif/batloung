
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Display all stock
router.get("/", (req, res) => {
    const sql = `
        SELECT
            stock.stock_id,
            fruits.fruit_id,
            fruits.fruit_name,
            stock.packaging_size,
            stock.available_quantity
        FROM stock
        INNER JOIN fruits
        ON stock.fruit_id = fruits.fruit_id
        ORDER BY stock.stock_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error retrieving stock",
                error: err.message
            });
        }

        res.json(results);
    });
});

// POST: Add stock
router.post("/", (req, res) => {
    const { fruit_id, packaging_size, available_quantity } = req.body;

    if (
        !fruit_id ||
        !["Small", "Medium", "Large"].includes(packaging_size) ||
        !Number.isInteger(Number(available_quantity)) ||
        Number(available_quantity) < 0
    ) {
        return res.status(400).json({
            message: "Invalid stock information"
        });
    }

    const sql = `
        INSERT INTO stock
        (fruit_id, packaging_size, available_quantity)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [fruit_id, packaging_size, available_quantity],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding stock",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Stock added successfully",
                stock_id: result.insertId
            });
        }
    );
});

// PUT: Update stock
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { packaging_size, available_quantity } = req.body;

    if (
        !["Small", "Medium", "Large"].includes(packaging_size) ||
        !Number.isInteger(Number(available_quantity)) ||
        Number(available_quantity) < 0
    ) {
        return res.status(400).json({
            message: "Invalid stock information"
        });
    }

    const sql = `
        UPDATE stock
        SET packaging_size = ?, available_quantity = ?
        WHERE stock_id = ?
    `;

    db.query(
        sql,
        [packaging_size, available_quantity, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating stock",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Stock record not found"
                });
            }

            res.json({
                message: "Stock updated successfully"
            });
        }
    );
});

// DELETE: Delete stock
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM stock WHERE stock_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error deleting stock",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Stock record not found"
                });
            }

            res.json({
                message: "Stock deleted successfully"
            });
        }
    );
});

module.exports = router;
