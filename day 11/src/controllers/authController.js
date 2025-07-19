const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.showHome = (req, res) => {
    res.render("index");
};

exports.register = async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (results.length) {
            return res.send("Email already exists");
        }

        db.query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashed],
            (err) => {
                if (err) return res.send("Error during registration");
                res.redirect("/");
            }
        );
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (!results.length) return res.send("Invalid credentials");

        const match = await bcrypt.compare(password, results[0].password);
        if (!match) return res.send("Wrong password");

        req.session.user = results[0];
        res.redirect("/profile");
    });
};

exports.profile = (req, res) => {
    if (!req.session.user) return res.redirect("/");
    res.render("profile", { user: req.session.user });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};
