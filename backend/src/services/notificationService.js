import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';

let ioRef;

export const setSocketServer = (io) => {
  ioRef = io;
};

export const notifyUser = async ({ userId, type, title, message, relatedId, email }) => {
  const notification = await Notification.create({ userId, type, title, message, relatedId });
  if (ioRef) ioRef.to(String(userId)).emit('notification:new', notification);
  if (email) {
    await sendEmail({ to: email, subject: title, html: `<p>${message}</p>` });
  }
  return notification;
};
