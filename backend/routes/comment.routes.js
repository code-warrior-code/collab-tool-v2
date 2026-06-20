const express = require('express');
const { protect } = require('../middleware/auth');
const { deleteComment } = require('../controllers/comment.controller');

const router = express.Router();

router.use(protect);

router.delete('/:id', deleteComment);

module.exports = router;
