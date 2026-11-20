
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Display all suppliers
router.get("/", (req, res) => {
    const sql = "SELECT * FROM suppliers ORDER BY supplier_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error retrieving suppliers",
                error: err.message
            });
        }

        res.status(200).json(results);
    });
});

// GET: Display one supplier
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM suppliers WHERE supplier_id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Error retrieving supplier",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Supplier not found"
                });
            }

            res.json(results[0]);
        }
    );
});

// POST: Add a new supplier
router.post("/", (req, res) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = req.body;

    if (!business_name || !contact_person || !phone ||
        !province || !address) {
        return res.status(400).json({
            message: "Please provide all supplier details"
        });
    }

    const sql = `
        INSERT INTO suppliers
        (business_name, contact_person, phone, province, address)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [business_name, contact_person, phone, province, address],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding supplier",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Supplier added successfully",
                supplier_id: result.insertId
            });
        }
    );
});

// PUT: Update supplier
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = req.body;

    if (!business_name || !contact_person || !phone ||
        !province || !address) {
        return res.status(400).json({
            message: "Please provide all supplier details"
        });
    }

    const sql = `
        UPDATE suppliers
        SET business_name = ?,
            contact_person = ?,
            phone = ?,
            province = ?,
            address = ?
        WHERE supplier_id = ?
    `;

    db.query(
        sql,
        [business_name, contact_person, phone, province, address, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating supplier",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Supplier not found"
                });
            }

            res.json({
                message: "Supplier updated successfully"
            });
        }
    );
});

// DELETE: Remove supplier
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM suppliers WHERE supplier_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error deleting supplier",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Supplier not found"
                });
            }

            res.json({
                message: "Supplier deleted successfully"
            });
        }
    );
});

module.exports = router;
