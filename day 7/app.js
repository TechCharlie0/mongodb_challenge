const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();
const PORT = 3000;

app.use(express.json());

//  MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(' MongoDB Connected'))
    .catch((err) => console.error(' MongoDB Connection Error:', err));

//  Root route
app.get('/', (req, res) => {
    res.send('Welcome to the User API!');
});

//create route (temporary for testing)
app.get('/create', async (req, res) => {
    try {
        const createduser = await User.create({
            name: "isha",
            username: "isha@123",
            email: "isha@example.com",
            password: "test123"
        });

        console.log(' User Created:', createduser);
        res.send(createduser);
    } catch (err) {
        console.error(' Error:', err.message);
        res.status(400).send(err.message);
    }
});

//  Start server
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
