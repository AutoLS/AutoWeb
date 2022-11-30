const express = require('express');
const Todo = require('../models/todoModel');
const {createTodo, getTodo, getTodos, deleteTodo, updateTodo} = require('../controllers/todoController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth for all todos routes
router.use(requireAuth);

router.get('/', getTodos);

router.get('/:id', getTodo);

router.post('/', createTodo);

router.delete('/:id', deleteTodo);

router.patch('/:id', updateTodo);

module.exports = router;