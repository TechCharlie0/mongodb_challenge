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
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(' MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
    res.send(' Welcome to Contact Management API');
});

// CREATE — Add a new contact
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

// READ — Get all contacts
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// READ — Get a contact by ID
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

// UPDATE — Update a contact by ID
app.put('/contacts/:id', async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedContact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(updatedContact);
    } catch (err) {
        res.status(400).json({ error: 'Invalid request or ID' });
    }
});

// DELETE — Remove a contact by ID
app.delete('/contacts/:id', async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
