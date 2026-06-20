const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Board = require('./Board');
const Task = require('./Task');
const Comment = require('./Comment');
const Notification = require('./Notification');

// ---- Project belongs to an owner (User) ----
Project.belongsTo(User, { as: 'owner', foreignKey: { name: 'ownerId', allowNull: false } });
User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'ownerId' });

// ---- Project <-> User many-to-many via ProjectMember ----
Project.belongsToMany(User, {
  through: ProjectMember,
  as: 'members',
  foreignKey: 'projectId',
  otherKey: 'userId'
});
User.belongsToMany(Project, {
  through: ProjectMember,
  as: 'projects',
  foreignKey: 'userId',
  otherKey: 'projectId'
});
ProjectMember.belongsTo(User, { foreignKey: 'userId' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });

// ---- Project <-> Board (columns) ----
Project.hasMany(Board, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Board.belongsTo(Project, { foreignKey: 'projectId' });

// ---- Board <-> Task ----
Board.hasMany(Task, { foreignKey: 'boardId', onDelete: 'CASCADE' });
Task.belongsTo(Board, { foreignKey: 'boardId' });

// ---- Task <-> User (assignee, creator) ----
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'creatorId' });

// ---- Task <-> Comment ----
Task.hasMany(Comment, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// ---- Notification <-> User ----
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Board,
  Task,
  Comment,
  Notification
};
