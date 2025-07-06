const express = require("express");
const app = express();
const port = 3000;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mySuperSecretKey"; // You should store this in .env

app.get("/", async (req, res) => {
    const plainPassword = "myPassword";
    const email = "user@example.com";

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 2. Create JWT token
    const token = jwt.sign(
        { email: email, password: hashedPassword }, // payload
        SECRET_KEY,                                 // secret key
        { expiresIn: "1h" }                          // optional expiry
    );

    console.log("JWT Token:", token);

    // 3. Decode / Verify token (e.g., when user comes back)
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(" Decoded JWT Data:", decoded);

    res.send({
        token,
        decoded
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
