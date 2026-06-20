const express = require('express');
const { protect } = require('../middleware/auth');
const { updateBoard, deleteBoard, reorderBoards } = require('../controllers/board.controller');
const { createTask } = require('../controllers/task.controller');

const router = express.Router();

router.use(protect);

// NOTE: /reorder must come before /:id so Express doesn't treat "reorder" as an id
router.put('/reorder', reorderBoards);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

router.post('/:boardId/tasks', createTask);

module.exports = router;
