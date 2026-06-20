const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Wires up Socket.io: every connecting client must send a valid JWT (the
// same one used for the REST API). Each user automatically joins a
// personal room (user:<id>) used for direct notifications, and can join
// project rooms (project:<id>) to receive live board/task/comment updates.
function initSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on('project:join', (projectId) => {
      if (projectId) socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      // Socket.io automatically removes the socket from all of its rooms.
    });
  });
}

module.exports = initSockets;
