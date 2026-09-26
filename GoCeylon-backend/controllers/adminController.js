const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new admin
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    // VULN-05 (NoSQL Injection) fix:
    // Reject any credential that is not a plain string so an attacker cannot pass
    // a MongoDB operator object (e.g. { "$ne": null }) into the query below.
    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    try {
        const existingAdmin = await Admin.findOne({ email }); // nosemgrep: ajinabraham.njsscan.database.nosql_find_injection.node_nosqli_injection -- email is guarded as a string above

        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = new Admin({ email, password });
        await admin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


