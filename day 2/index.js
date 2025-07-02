const mongoose = require('mongoose');
const express = require('express');
const app = express();
const userModel = require('./usermodel');

// Add MongoDB connection here
mongoose.connect('mongodb://localhost:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");

    // Start server only after DB is connected
    app.listen(3000, () => {
        console.log("http://localhost:3000");
    });

}).catch((err) => {
    console.log("MongoDB connection error:", err);
});

// Routes
app.get('/', (req, res) => {
    res.send("hey this is my first mongodb class");
});

app.get('/create', async (req, res) => {
    let createduser = await userModel.create({
        name: "isha",
        username: "isha@123",
        email: "isha"
    });
    res.send(createduser);
});
app.get('/update', async (req, res) => {
    let updateduser = await userModel.findOneAndUpdate(
        { username: "isha@123" },
        { name: "robert" },
        { new: true }
    );
    res.send(updateduser);
});
app.get('/read', async (req, res) => {
    let readuser = await userModel.find({ username: "isha@123" });
    res.send(readuser);
});

app.get('/delete', async (req, res) => {
    let deleteduser = await userModel.findOneAndDelete({ username: "isha@123" });
    res.send(deleteduser);
});
