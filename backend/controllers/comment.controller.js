const { Comment, Task, Board, User } = require('../models');
const { isProjectMember } = require('../utils/authorize');
const { broadcastToProject, notifyUser } = require('../utils/realtime');

async function getTaskProjectId(taskId) {
  const task = await Task.findByPk(taskId);
  if (!task) return null;
  const board = await Board.findByPk(task.boardId);
  return board ? board.projectId : null;
}

// GET /api/tasks/:taskId/comments
async function getComments(req, res) {
  try {
    const { taskId } = req.params;

    const projectId = await getTaskProjectId(taskId);
    if (!projectId) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    const comments = await Comment.findAll({
      where: { taskId },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatarColor'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Could not fetch comments' });
  }
}

// POST /api/tasks/:taskId/comments  body: { content }
async function createComment(req, res) {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findByPk(task.boardId);
    const projectId = board ? board.projectId : null;
    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      taskId,
      userId: req.user.id
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatarColor'] }]
    });

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'comment:created', {
      taskId: Number(taskId),
      comment: fullComment
    });

    const recipients = new Set();
    if (task.assigneeId && task.assigneeId !== req.user.id) recipients.add(task.assigneeId);
    if (task.creatorId && task.creatorId !== req.user.id) recipients.add(task.creatorId);

    for (const recipientId of recipients) {
      await notifyUser(io, {
        userId: recipientId,
        type: 'comment_added',
        message: `${req.user.name} commented on "${task.title}"`,
        link: `/projects/${projectId}/tasks/${taskId}`
      });
    }

    res.status(201).json({ comment: fullComment });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ message: 'Could not create comment' });
  }
}

// DELETE /api/comments/:id
async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    const taskId = comment.taskId;
    const projectId = await getTaskProjectId(taskId);

    await comment.destroy();

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'comment:deleted', { id: Number(id), taskId });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Could not delete comment' });
  }
}

module.exports = { getComments, createComment, deleteComment };
