
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Display all vendors
router.get("/", (req, res) => {
    const sql = "SELECT * FROM vendors ORDER BY vendor_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error retrieving vendors",
                error: err.message
            });
        }

        res.json(results);
    });
});

// GET: Display one vendor
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM vendors WHERE vendor_id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Error retrieving vendor",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Vendor not found"
                });
            }

            res.json(results[0]);
        }
    );
});

// POST: Register a new vendor
router.post("/", (req, res) => {
    const {
        vendor_name,
        phone_number,
        location,
        registration_date
    } = req.body;

    if (!vendor_name || !phone_number ||
        !location || !registration_date) {
        return res.status(400).json({
            message: "Please provide all vendor details"
        });
    }

    const sql = `
        INSERT INTO vendors
        (vendor_name, phone_number, location, registration_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [vendor_name, phone_number, location, registration_date],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error registering vendor",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Vendor registered successfully",
                vendor_id: result.insertId
            });
        }
    );
});

// PUT: Update vendor
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        vendor_name,
        phone_number,
        location,
        registration_date
    } = req.body;

    if (!vendor_name || !phone_number ||
        !location || !registration_date) {
        return res.status(400).json({
            message: "Please provide all vendor details"
        });
    }

    const sql = `
        UPDATE vendors
        SET vendor_name = ?,
            phone_number = ?,
            location = ?,
            registration_date = ?
        WHERE vendor_id = ?
    `;

    db.query(
        sql,
        [vendor_name, phone_number, location, registration_date, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating vendor",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Vendor not found"
                });
            }

            res.json({
                message: "Vendor updated successfully"
            });
        }
    );
});

// DELETE: Delete vendor
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM vendors WHERE vendor_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error deleting vendor",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Vendor not found"
                });
            }

            res.json({
                message: "Vendor deleted successfully"
            });
        }
    );
});

module.exports = router;
