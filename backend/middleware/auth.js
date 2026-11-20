const jwt = require("jsonwebtoken");

// Verify the login token sent by the frontend
function verifyToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Please log in to continue" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Session expired. Please log in again" });
    }
}

// Only allow the listed roles (e.g. requireRole("Admin"))
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to do this" });
        }
        next();
    };
}

// Everyone logged in can read (GET), only Admin can change data
function adminOnlyWrites(req, res, next) {
    if (req.method === "GET" || req.user.role === "Admin") return next();
    return res.status(403).json({ message: "Only an Admin can change this data" });
}

// Staff may add/edit records but never delete them
function noStaffDelete(req, res, next) {
    if (req.method === "DELETE" && req.user.role !== "Admin") {
        return res.status(403).json({ message: "Only an Admin can delete records" });
    }
    next();
}

module.exports = { verifyToken, requireRole, adminOnlyWrites, noStaffDelete };
