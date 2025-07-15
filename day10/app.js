const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// In-memory data
let introData = {
    lives: "Bharatpur, Nepal",
    studied: "United Technical College",
    from: "Chitwan",
};

let lastPost = null;

// ✅ Routes

// Home Page (Posts)
app.get("/", (req, res) => {
    res.render("index", {
        intro: introData,
        post: lastPost,
        activePage: "posts"
    });
});

// About Page
app.get("/about", (req, res) => {
    res.render("about", { activePage: "about" });
});

// Friends Page
app.get("/friends", (req, res) => {
    res.render("friends", { activePage: "friends" });
});

// Photos Page
app.get("/photos", (req, res) => {
    res.render("photos", { activePage: "photos" });
});

// Videos Page
app.get("/videos", (req, res) => {
    res.render("videos", { activePage: "videos" });
});

// Edit Intro Page
app.get("/edit", (req, res) => {
    res.render("edit", {
        intro: introData,
        activePage: "posts"
    });
});

// Save edited intro data
app.post("/edit", (req, res) => {
    const { lives, studied, from } = req.body;
    introData = { lives, studied, from };
    res.redirect("/");
});

// Upload a post
app.post("/upload", upload.single("media"), (req, res) => {
    const feeling = req.body.feeling || '';
    const filePath = req.file ? `/uploads/${req.file.filename}` : '';
    lastPost = { feeling, filePath };
    res.redirect("/");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
