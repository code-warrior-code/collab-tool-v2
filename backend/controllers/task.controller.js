const { Task, Board, User, Comment } = require('../models');
const { isProjectMember } = require('../utils/authorize');
const { broadcastToProject, notifyUser } = require('../utils/realtime');

async function getTaskProjectId(task) {
  const board = await Board.findByPk(task.boardId);
  return board ? board.projectId : null;
}

// POST /api/boards/:boardId/tasks
async function createTask(req, res) {
  try {
    const { boardId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;

    const board = await Board.findByPk(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const allowed = await isProjectMember(board.projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (assigneeId) {
      const assigneeAllowed = await isProjectMember(board.projectId, assigneeId);
      if (!assigneeAllowed) {
        return res.status(400).json({ message: 'Assignee must be a member of the project' });
      }
    }

    const count = await Task.count({ where: { boardId } });

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      order: count,
      boardId,
      assigneeId: assigneeId || null,
      creatorId: req.user.id
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatarColor'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatarColor'] }
      ]
    });

    const io = req.app.get('io');
    broadcastToProject(io, board.projectId, 'task:created', fullTask);

    if (assigneeId && Number(assigneeId) !== req.user.id) {
      await notifyUser(io, {
        userId: assigneeId,
        type: 'task_assigned',
        message: `${req.user.name} assigned you a task: "${title}"`,
        link: `/projects/${board.projectId}/tasks/${task.id}`
      });
    }

    res.status(201).json({ task: fullTask });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Could not create task' });
  }
}

// GET /api/tasks/:id
async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatarColor'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatarColor'] },
        {
          model: Comment,
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatarColor'] }]
        }
      ],
      order: [[Comment, 'createdAt', 'ASC']]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = await getTaskProjectId(task);
    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    res.json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Could not fetch task' });
  }
}

// PUT /api/tasks/:id - also handles moving a task to another board and reordering
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = await getTaskProjectId(task);
    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    const { title, description, priority, dueDate, assigneeId, boardId, order } = req.body;
    const previousAssigneeId = task.assigneeId;
    const previousBoardId = task.boardId;

    if (assigneeId !== undefined && assigneeId !== null) {
      const assigneeAllowed = await isProjectMember(projectId, assigneeId);
      if (!assigneeAllowed) {
        return res.status(400).json({ message: 'Assignee must be a member of the project' });
      }
    }

    if (boardId !== undefined) {
      const targetBoard = await Board.findByPk(boardId);
      if (!targetBoard || targetBoard.projectId !== projectId) {
        return res.status(400).json({ message: 'Invalid target board' });
      }
      task.boardId = boardId;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (order !== undefined) task.order = order;

    await task.save();

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatarColor'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatarColor'] }
      ]
    });

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'task:updated', fullTask);

    if (boardId !== undefined && Number(boardId) !== previousBoardId) {
      broadcastToProject(io, projectId, 'task:moved', {
        taskId: task.id,
        fromBoardId: previousBoardId,
        toBoardId: task.boardId
      });
    }

    if (
      assigneeId !== undefined &&
      assigneeId !== null &&
      Number(assigneeId) !== previousAssigneeId &&
      Number(assigneeId) !== req.user.id
    ) {
      await notifyUser(io, {
        userId: assigneeId,
        type: 'task_assigned',
        message: `${req.user.name} assigned you a task: "${fullTask.title}"`,
        link: `/projects/${projectId}/tasks/${task.id}`
      });
    }

    res.json({ task: fullTask });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Could not update task' });
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = await getTaskProjectId(task);
    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }

    const boardId = task.boardId;
    await task.destroy();

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'task:deleted', { id: Number(id), boardId });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Could not delete task' });
  }
}

module.exports = { createTask, getTaskById, updateTask, deleteTask };
