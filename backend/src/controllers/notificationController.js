import { StatusCodes } from 'http-status-codes';
import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    return res.status(StatusCodes.OK).json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    return res.status(StatusCodes.OK).json({ notification: updated });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return res.status(StatusCodes.OK).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
