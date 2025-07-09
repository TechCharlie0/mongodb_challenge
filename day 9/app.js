const express = require('express');
const mongoose = require('mongoose');
const Contact = require('./models/contact');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/contactdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(' MongoDB connected'))
    .catch((err) => console.error(' MongoDB connection error:', err));

// POST /contacts — create new contact
app.post('/contacts', async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const newContact = new Contact({ name, phone, email, address });
        await newContact.save();
        console.log('New Contact Created:', newContact);
        res.status(201).json(newContact);
    } catch (err) {
        console.error('Error creating contact:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
