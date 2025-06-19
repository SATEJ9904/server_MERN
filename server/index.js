const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/studentsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    course: String,
    Previous_Degree: String,
});

const Student = mongoose.model('Student', studentSchema);

// Create
app.post('/api/students', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const saved = await newStudent.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read All
app.get('/api/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// Read One
app.get('/api/students/:id', async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
});

// Update
app.put('/api/students/:id', async (req, res) => {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// Delete
app.delete('/api/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
