const express = require('express');
const Task = require('../model/task');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks: ' + err.message });
    }
};

// Create a new task
const createTask = async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: 'Error creating task: ' + err.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: 'Error updating task: ' + err.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ message: 'Error deleting task: ' + err.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};