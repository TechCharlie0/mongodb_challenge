const mongoose = require('mongoose');
const express = require('express');
const app = express();
const userModel = require('./usermodel');

app.get('/', (req, res) => {
    res.send("hey this is my first mongodb class")
})

app.get('/create', async (req, res) => {
    let createduser = await userModel.create({       //create a new user
        name: "isha",
        username: "isha@123",
        email: "isha"
    })
    res.send(createduser);
})
app.listen(3000, () => {
    console.log("http://localhost:3000");

})