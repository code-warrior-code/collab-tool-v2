const { Notification } = require('../models');

// GET /api/notifications
async function getNotifications(req, res) {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
}

// PUT /api/notifications/:id/read
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ notification });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ message: 'Could not update notification' });
  }
}

// PUT /api/notifications/read-all
async function markAllAsRead(req, res) {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ message: 'Could not update notifications' });
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
