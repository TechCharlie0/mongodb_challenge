const express = require('express');
const mongoose = require('mongoose');
const Contact = require('./models/contact');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/contactdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(' MongoDB connected'))
    .catch((err) => console.error(' MongoDB connection error:', err));

// Routes

// POST — create a contact
app.post('/contacts', async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const newContact = new Contact({ name, phone, email, address });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.get('/create-sample', async (req, res) => {
    try {
        const sample = await Contact.create({
            name: 'Sample User',
            phone: '1234567890',
            email: 'sample@example.com',
            address: 'Pokhara'
        });
        res.send(sample);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


// GET — all contacts
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET — contact by ID
app.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(contact);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
    }
});

// Server start
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
