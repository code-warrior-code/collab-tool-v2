const { Project, ProjectMember, User, Board, Task } = require('../models');
const { isProjectMember, isProjectOwner } = require('../utils/authorize');
const { broadcastToProject, notifyUser } = require('../utils/realtime');

// GET /api/projects - all projects the user owns or belongs to
async function getProjects(req, res) {
  try {
    const userId = req.user.id;

    const owned = await Project.findAll({ where: { ownerId: userId } });
    const memberships = await ProjectMember.findAll({
      where: { userId },
      include: [{ model: Project }]
    });
    const memberProjects = memberships.map((m) => m.Project).filter(Boolean);

    const ownedIds = new Set(owned.map((p) => p.id));
    const combined = [...owned, ...memberProjects.filter((p) => !ownedIds.has(p.id))];

    res.json({ projects: combined });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Could not fetch projects' });
  }
}

// POST /api/projects
async function createProject(req, res) {
  try {
    const { title, description, color } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description: description || '',
      color: color || '#6366f1',
      ownerId: req.user.id
    });

    await ProjectMember.create({ projectId: project.id, userId: req.user.id, role: 'owner' });

    // Give every new project a sensible default set of boards
    await Board.bulkCreate([
      { title: 'To Do', order: 0, projectId: project.id },
      { title: 'In Progress', order: 1, projectId: project.id },
      { title: 'Done', order: 2, projectId: project.id }
    ]);

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: Board, include: [{ model: Task }] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatarColor'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatarColor'] }
      ]
    });

    res.status(201).json({ project: fullProject });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Could not create project' });
  }
}

// GET /api/projects/:id
async function getProjectById(req, res) {
  try {
    const { id } = req.params;

    const allowed = await isProjectMember(id, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    const project = await Project.findByPk(id, {
      include: [
        {
          model: Board,
          include: [
            {
              model: Task,
              include: [
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatarColor'] },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatarColor'] }
              ]
            }
          ]
        },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatarColor'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatarColor'] }
      ],
      order: [
        [Board, 'order', 'ASC'],
        [Board, Task, 'order', 'ASC']
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ message: 'Could not fetch project' });
  }
}

// PUT /api/projects/:id
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const owner = await isProjectOwner(id, req.user.id);
    if (!owner) {
      return res.status(403).json({ message: 'Only the project owner can update the project' });
    }

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, color } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    await project.save();

    res.json({ project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Could not update project' });
  }
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const owner = await isProjectOwner(id, req.user.id);
    if (!owner) {
      return res.status(403).json({ message: 'Only the project owner can delete the project' });
    }

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: 'Could not delete project' });
  }
}

// POST /api/projects/:id/members  body: { email }
async function addMember(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const owner = await isProjectOwner(id, req.user.id);
    if (!owner) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    const existing = await ProjectMember.findOne({ where: { projectId: id, userId: user.id } });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }

    await ProjectMember.create({ projectId: id, userId: user.id, role: 'member' });

    const io = req.app.get('io');
    const project = await Project.findByPk(id);
    await notifyUser(io, {
      userId: user.id,
      type: 'project_invite',
      message: `${req.user.name} added you to the project "${project.title}"`,
      link: `/projects/${id}`
    });
    broadcastToProject(io, id, 'project:member_added', user.toSafeObject());

    res.status(201).json({ member: user.toSafeObject() });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Could not add member' });
  }
}

// DELETE /api/projects/:id/members/:userId
async function removeMember(req, res) {
  try {
    const { id, userId } = req.params;

    const owner = await isProjectOwner(id, req.user.id);
    if (!owner) {
      return res.status(403).json({ message: 'Only the project owner can remove members' });
    }

    const project = await Project.findByPk(id);
    if (project && Number(userId) === project.ownerId) {
      return res.status(400).json({ message: 'The project owner cannot be removed' });
    }

    await ProjectMember.destroy({ where: { projectId: id, userId } });

    const io = req.app.get('io');
    broadcastToProject(io, id, 'project:member_removed', { userId: Number(userId) });

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Could not remove member' });
  }
}

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
