import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import InvestmentRequest from '../models/InvestmentRequest.js';
import { notifyUser } from '../services/notificationService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ users });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    return res.status(StatusCodes.OK).json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status' });
    }
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot update own status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    return res.status(StatusCodes.OK).json({ user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot delete own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(StatusCodes.OK).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

export const getInvestments = async (req, res, next) => {
  try {
    const requests = await InvestmentRequest.find()
      .populate('investorId', 'name email role')
      .populate('ideaId', 'title industry stage status userId')
      .sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ requests });
  } catch (err) {
    next(err);
  }
};

export const sendNotification = async (req, res, next) => {
  try {
    const { userId, role, title, message, type } = req.body;
    if (!title || !message || !type) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'title, message, and type are required' });
    }

    let users = [];
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
      users = [user];
    } else if (role) {
      users = await User.find({ role });
    } else {
      users = await User.find();
    }

    await Promise.all(
      users.map((user) =>
        notifyUser({
          userId: user._id,
          type,
          title,
          message,
          relatedId: null,
          email: user.email
        })
      )
    );

    return res.status(StatusCodes.OK).json({ sent: users.length });
  } catch (err) {
    next(err);
  }
};

export const exportIdeasCsv = async (req, res, next) => {
  try {
    const ideas = await Idea.find().populate('userId', 'name email');
    const header = 'title,industry,stage,status,rating,fundingNeeded,startupName,startupEmail';
    const rows = ideas.map((idea) =>
      [
        `"${(idea.title || '').replaceAll('"', '""')}"`,
        `"${(idea.industry || '').replaceAll('"', '""')}"`,
        idea.stage || '',
        idea.status || '',
        idea.rating || '',
        idea.fundingNeeded || 0,
        `"${(idea.userId?.name || '').replaceAll('"', '""')}"`,
        idea.userId?.email || ''
      ].join(',')
    );

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ideas-export.csv"');
    return res.status(StatusCodes.OK).send(csv);
  } catch (err) {
    next(err);
  }
};
