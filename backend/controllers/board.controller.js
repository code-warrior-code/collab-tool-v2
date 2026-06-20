const { Board } = require('../models');
const { isProjectMember } = require('../utils/authorize');
const { broadcastToProject } = require('../utils/realtime');

// POST /api/projects/:projectId/boards
async function createBoard(req, res) {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    const allowed = await isProjectMember(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const count = await Board.count({ where: { projectId } });
    const board = await Board.create({ title, order: count, projectId });

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'board:created', board);

    res.status(201).json({ board });
  } catch (err) {
    console.error('Create board error:', err);
    res.status(500).json({ message: 'Could not create board' });
  }
}

// PUT /api/boards/:id
async function updateBoard(req, res) {
  try {
    const { id } = req.params;
    const board = await Board.findByPk(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const allowed = await isProjectMember(board.projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    const { title } = req.body;
    if (title !== undefined) board.title = title;
    await board.save();

    const io = req.app.get('io');
    broadcastToProject(io, board.projectId, 'board:updated', board);

    res.json({ board });
  } catch (err) {
    console.error('Update board error:', err);
    res.status(500).json({ message: 'Could not update board' });
  }
}

// DELETE /api/boards/:id
async function deleteBoard(req, res) {
  try {
    const { id } = req.params;
    const board = await Board.findByPk(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const allowed = await isProjectMember(board.projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    const projectId = board.projectId;
    const boardId = board.id;
    await board.destroy();

    const io = req.app.get('io');
    broadcastToProject(io, projectId, 'board:deleted', { id: boardId });

    res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(500).json({ message: 'Could not delete board' });
  }
}

// PUT /api/boards/reorder  body: { boards: [{ id, order }] }
async function reorderBoards(req, res) {
  try {
    const { boards } = req.body;
    if (!Array.isArray(boards) || boards.length === 0) {
      return res.status(400).json({ message: 'boards array is required' });
    }

    const first = await Board.findByPk(boards[0].id);
    if (!first) {
      return res.status(404).json({ message: 'Board not found' });
    }
    const allowed = await isProjectMember(first.projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    await Promise.all(
      boards.map((b) => Board.update({ order: b.order }, { where: { id: b.id } }))
    );

    const io = req.app.get('io');
    broadcastToProject(io, first.projectId, 'board:reordered', boards);

    res.json({ message: 'Boards reordered' });
  } catch (err) {
    console.error('Reorder boards error:', err);
    res.status(500).json({ message: 'Could not reorder boards' });
  }
}

module.exports = { createBoard, updateBoard, deleteBoard, reorderBoards };
