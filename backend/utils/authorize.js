const { Project, ProjectMember } = require('../models');

// Returns true if the user owns the project or is a member of it.
async function isProjectMember(projectId, userId) {
  if (!projectId || !userId) return false;

  const project = await Project.findByPk(projectId);
  if (!project) return false;
  if (project.ownerId === Number(userId)) return true;

  const membership = await ProjectMember.findOne({ where: { projectId, userId } });
  return !!membership;
}

// Returns true only if the user is the project owner.
async function isProjectOwner(projectId, userId) {
  if (!projectId || !userId) return false;
  const project = await Project.findByPk(projectId);
  return !!project && project.ownerId === Number(userId);
}

module.exports = { isProjectMember, isProjectOwner };
