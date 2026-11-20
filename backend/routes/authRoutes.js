
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ======================================
// POST: USER LOGIN
// ======================================

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username.trim()], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = results[0];

        try {
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "8h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({
                message: "Login failed",
                error: error.message
            });
        }
    });
});


// ======================================
// POST: CUSTOMER REGISTRATION
// ======================================

router.post("/register", async (req, res) => {

    const {
        username,
        password,
        full_name,
        phone,
        email,
        address
    } = req.body;

    if (!username || !password || !full_name) {
        return res.status(400).json({
            message: "Full name, username and password are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters"
        });
    }

    let connection;

    try {
        connection = await db.promise().getConnection();

        await connection.beginTransaction();

        const [existing] = await connection.execute(
            "SELECT user_id FROM users WHERE username = ?",
            [username.trim()]
        );

        if (existing.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult] = await connection.execute(
            `INSERT INTO users (username, password, role)
             VALUES (?, ?, 'Customer')`,
            [username.trim(), hashedPassword]
        );

        await connection.execute(
            `INSERT INTO customers
             (user_id, full_name, phone, email, address)
             VALUES (?, ?, ?, ?, ?)`,
            [
                userResult.insertId,
                full_name.trim(),
                phone || null,
                email || null,
                address || null
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Customer registered successfully"
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Customer registration error:", error);

        res.status(500).json({
            message: "Customer registration failed",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// ======================================
// EXPORT ROUTER
// ======================================

module.exports = router;
