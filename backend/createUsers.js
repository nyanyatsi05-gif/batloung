const bcrypt = require("bcryptjs");
const db = require("./db");

// Run once with:  node createUsers.js
// Creates the users table (if missing) and the default Admin and Staff logins.
// Change these passwords after your first login.
const users = [
    { username: "admin", password: "Admin@12345", role: "Admin" },
    { username: "staff", password: "Staff@12345", role: "Staff" }
];

const run = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
    );

async function createUsers() {
    try {
        await run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('Admin','Staff') NOT NULL DEFAULT 'Staff'
            )
        `);

        for (const user of users) {
            const existing = await run("SELECT user_id FROM users WHERE username = ?", [user.username]);

            if (existing.length > 0) {
                console.log(user.username + " already exists - skipped");
                continue;
            }

            const hashed = await bcrypt.hash(user.password, 10);
            await run(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                [user.username, hashed, user.role]
            );
            console.log(user.username + " account created successfully!");
        }
    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        db.end();
    }
}

createUsers();
