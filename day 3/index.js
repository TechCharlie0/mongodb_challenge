const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const userModel = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index.ejs");
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
        await userModel.create({ name, email, image });
        res.redirect("/read");
    } catch (err) {
        res.status(500).send("Error creating user");
    }
});
app.get("/edit/:id", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        res.render("edit", { user });
    } catch (err) {
        res.status(500).send("Error fetching user for edit");
    }
});

app.post("/delete/:id", async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.redirect("/read");
    } catch (err) {
        res.status(500).send("Error deleting user");
    }
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
