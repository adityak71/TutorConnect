const Notification = require('./Notification');

/**
 * Helper to create a notification record inside the database
 */
exports.createNotification = async (recipient, sender, type, title, message, relatedEntity, entityModel) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedEntity,
      entityModel,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the logged in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications returned successfully
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email profilePicture');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications of current user as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
