const express = require('express');
const { protect } = require('../middleware/auth');
const { getTaskById, updateTask, deleteTask } = require('../controllers/task.controller');
const { getComments, createComment } = require('../controllers/comment.controller');

const router = express.Router();

router.use(protect);

router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', createComment);

module.exports = router;
