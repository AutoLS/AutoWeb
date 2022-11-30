const Todo = require('../models/todoModel');
const mongoose = require('mongoose');

// Get all todos
const getTodos = async (req, res) => {

    const user_id = req.user.id;

    const todos = await Todo.find({user_id}).sort({createdAt: 1});

    res.status(200).json(todos);
}

// Get single todo
const getTodo = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.isObjectIdOrHexString(id)) {
        return res.status(404).json({error: 'No such todo exists'});
    }

    const todo = await Todo.findById(id);

    if(!todo) {
        return res.status(404).json({error: 'No such todo exists'});
    }

    res.status(200).json(todo);
}

// Create new todo
const createTodo = async (req, res) => {
    const {title, description, completed} = req.body;

    if(!title) {
        return res.status(400).json({error: 'Please fill in the title!'});
    }

    try {
        const user_id = req.user._id;
        const todo = await Todo.create({title, description, completed, user_id});
        res.status(200).json(todo);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Delete a todo 
const deleteTodo = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.isObjectIdOrHexString(id)) {
        return res.status(404).json({error: 'No such todo exists'});
    }

    const todo = await Todo.findByIdAndDelete(id);
    if(!todo) {
        return res.status(400).json({error: 'No such todo exists'});
    }

    res.status(200).json(todo);
}

// Update a todo
const updateTodo = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.isObjectIdOrHexString(id)) {
        return res.status(404).json({error: 'No such todo exists'});
    }

    const todo = await Todo.findByIdAndUpdate(id, {...req.body});
    if(!todo) {
        return res.status(400).json({error: 'No such todo exists'});
    }

    res.status(200).json(todo);
}

module.exports = {
    getTodos,
    getTodo,
    createTodo,
    deleteTodo,
    updateTodo
};