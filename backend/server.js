const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_task_manager";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch(err => console.error("MongoDB connection error:", err));

// Task Schema & Model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// ==========================
// API ENDPOINTS
// ==========================

// 1. GET: Retrieve all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// 2. POST: Create a new task (with validation)
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;

        // Validation: Prevent empty or whitespace-only tasks
        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "Task title cannot be empty" });
        }

        const newTask = new Task({ title: title.trim() });
        await newTask.save();
        
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (err) {
        res.status(500).json({ error: "Failed to create task" });
    }
});

// 3. PUT: Update task completion status (Bonus Challenge)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { completed },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
    }
});

// 4. DELETE: Delete a task using its ID
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        
        if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

