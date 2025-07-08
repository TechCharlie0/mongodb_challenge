const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll: { type: Number, required: true, unique: true },
    class: { type: String, required: true },
    section: { type: String },
    age: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
