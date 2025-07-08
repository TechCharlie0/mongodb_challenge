const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/student');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(' MongoDB Connected'))
    .catch((err) => console.error(' DB Error:', err));

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to Student Management API');
});

//  Create Student
app.post('/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Get All Students
app.get('/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

//  Get One Student
app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

// Update Student
app.put('/students/:id', async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Delete Student
app.delete('/students/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
