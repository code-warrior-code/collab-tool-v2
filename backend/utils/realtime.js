const { Notification } = require('../models');

// Sends an event to everyone currently viewing a project (its socket room).
function broadcastToProject(io, projectId, event, payload) {
  if (io && projectId) {
    io.to(`project:${projectId}`).emit(event, payload);
  }
}

// Creates a notification row in the database and, if the recipient is
// currently connected, pushes it to them immediately over their personal
// socket room.
async function notifyUser(io, { userId, type, message, link }) {
  if (!userId) return null;

  const notification = await Notification.create({
    userId,
    type,
    message,
    link: link || null
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }

  return notification;
}

module.exports = { broadcastToProject, notifyUser };
