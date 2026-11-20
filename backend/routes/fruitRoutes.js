
const express = require("express");
const router = express.Router();
const db = require("../db");

// =====================================
// GET: Display all fruits
// =====================================
router.get("/", (req, res) => {
    const sql = "SELECT * FROM fruits ORDER BY fruit_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error retrieving fruits",
                error: err.message
            });
        }

        res.json(results);
    });
});

// =====================================
// GET: Display one fruit
// =====================================
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM fruits WHERE fruit_id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Error retrieving fruit",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Fruit not found"
                });
            }

            res.json(results[0]);
        }
    );
});

// =====================================
// POST: Add a new fruit
// =====================================
router.post("/", (req, res) => {
    const { fruit_name, description, status } = req.body;

    const allowedFruits = [
        "Apples",
        "Bananas",
        "Oranges",
        "Mangoes",
        "Grapes"
    ];

    if (!fruit_name || !allowedFruits.includes(fruit_name)) {
        return res.status(400).json({
            message: "Please provide a valid fruit name"
        });
    }

    const fruitStatus = status || "Available";

    if (!["Available", "Unavailable"].includes(fruitStatus)) {
        return res.status(400).json({
            message: "Invalid fruit status"
        });
    }

    const sql = `
        INSERT INTO fruits (fruit_name, description, status)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [fruit_name, description || null, fruitStatus],
        (err, result) => {
            if (err) {
                console.error("Error adding fruit:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: fruit_name + " already exists. Please select another fruit."
                    });
                }

                return res.status(500).json({
                    message: "Error adding fruit: " + err.message
                });
            }

            res.status(201).json({
                message: "Fruit added successfully",
                fruit_id: result.insertId
            });
        }
    );
});

// =====================================
// PUT: Update fruit information
// =====================================
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { fruit_name, description, status } = req.body;

    const allowedFruits = [
        "Apples",
        "Bananas",
        "Oranges",
        "Mangoes",
        "Grapes"
    ];

    if (!fruit_name || !allowedFruits.includes(fruit_name)) {
        return res.status(400).json({
            message: "Please provide a valid fruit name"
        });
    }

    if (!["Available", "Unavailable"].includes(status)) {
        return res.status(400).json({
            message: "Invalid fruit status"
        });
    }

    const sql = `
        UPDATE fruits
        SET fruit_name = ?, description = ?, status = ?
        WHERE fruit_id = ?
    `;

    db.query(
        sql,
        [fruit_name, description || null, status, id],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: fruit_name + " already exists. Please choose another fruit."
                    });
                }

                return res.status(500).json({
                    message: "Error updating fruit",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Fruit not found"
                });
            }

            res.json({
                message: "Fruit updated successfully"
            });
        }
    );
});

// =====================================
// DELETE: Delete a fruit
// =====================================
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM fruits WHERE fruit_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error deleting fruit",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Fruit not found"
                });
            }

            res.json({
                message: "Fruit deleted successfully"
            });
        }
    );
});
// DELETE: Delete a fruit
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM fruits WHERE fruit_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting fruit",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Fruit not found"
            });
        }

        res.json({
            message: "Fruit deleted successfully"
        });
    });
});
module.exports = router;

