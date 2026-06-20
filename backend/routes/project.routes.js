const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/project.controller');
const { createBoard } = require('../controllers/board.controller');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

router.post('/:projectId/boards', createBoard);

module.exports = router;
