const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const userModel = require("./models/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/read", async (req, res) => {
    try {
        const allUsers = await userModel.find();
        res.render("read", { users: allUsers });
    } catch (err) {
        res.status(500).send("Error fetching users");
    }
});

app.post("/create", async (req, res) => {
    try {
        const { name, email, image } = req.body;
        const createUser = await userModel.create({ name, email, image });
        res.redirect("/read"); // optional: redirect after creation
    } catch (err) {
        res.status(500).send("Error creating user");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
