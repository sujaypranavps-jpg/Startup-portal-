import { StatusCodes } from 'http-status-codes';
import path from 'path';
import Idea from '../models/Idea.js';
import Review from '../models/Review.js';
import InvestmentRequest from '../models/InvestmentRequest.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { pagination } from '../utils/pagination.js';
import { AppError } from '../utils/AppError.js';
import { notifyUser } from '../services/notificationService.js';

const uploadPitchDeckToCloudinary = async (file) => {
  if (!file) return { url: '', publicId: '', originalName: '' };
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const filename = file.filename || path.basename(file.path || '');
    return { url: filename ? `/uploads/${filename}` : '', publicId: '', originalName: file.originalname };
  }

  const uploaded = await cloudinary.uploader.upload(file.path, {
    resource_type: 'raw',
    folder: 'startup-ideas'
  });
  return { url: uploaded.secure_url, publicId: uploaded.public_id, originalName: file.originalname };
};

export const createIdea = async (req, res, next) => {
  try {
    const pitchDeck = await uploadPitchDeckToCloudinary(req.file);
    const idea = await Idea.create({ ...req.body, pitchDeck, userId: req.user._id, status: 'pending' });
    return res.status(StatusCodes.CREATED).json({ message: 'Idea submitted successfully', idea });
  } catch (err) {
    next(err);
  }
};

export const getMyIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ ideas });
  } catch (err) {
    next(err);
  }
};

export const updateMyIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, userId: req.user._id });
    if (!idea) throw new AppError('Idea not found', StatusCodes.NOT_FOUND);

    if (idea.status === 'approved') throw new AppError('Approved ideas cannot be edited', StatusCodes.BAD_REQUEST);

    Object.assign(idea, req.body, { status: 'pending' });
    if (req.file) {
      idea.pitchDeck = await uploadPitchDeckToCloudinary(req.file);
    }
    await idea.save();

    return res.status(StatusCodes.OK).json({ message: 'Idea updated', idea });
  } catch (err) {
    next(err);
  }
};

export const deleteMyIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!idea) throw new AppError('Idea not found', StatusCodes.NOT_FOUND);
    return res.status(StatusCodes.OK).json({ message: 'Idea deleted' });
  } catch (err) {
    next(err);
  }
};

export const listIdeas = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const { search, industry, stage, status, rating } = req.query;

    const filter = {};
    if (req.user.role === 'investor') filter.status = 'approved';
    if (status && req.user.role !== 'investor') filter.status = status;
    if (industry) filter.industry = industry;
    if (stage) filter.stage = stage;
    if (rating) filter.rating = { $gte: Number(rating) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Idea.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Idea.countDocuments(filter)
    ]);

    return res.status(StatusCodes.OK).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ideas: items
    });
  } catch (err) {
    next(err);
  }
};

export const reviewIdea = async (req, res, next) => {
  try {
    const { rating, feedback, approved } = req.body;
    const idea = await Idea.findById(req.params.id).populate('userId', 'email _id');
    if (!idea) throw new AppError('Idea not found', StatusCodes.NOT_FOUND);

    const review = await Review.create({
      ideaId: idea._id,
      reviewerId: req.user._id,
      rating,
      feedback,
      approved
    });

    idea.status = approved ? 'approved' : 'rejected';
    idea.rating = rating;
    idea.feedback = feedback;
    await idea.save();

    await notifyUser({
      userId: idea.userId._id,
      type: approved ? 'idea_approved' : 'idea_rejected',
      title: approved ? 'Idea Approved' : 'Idea Rejected',
      message: `Your idea "${idea.title}" has been ${approved ? 'approved' : 'rejected'} by ${req.user.name}.`,
      relatedId: idea._id,
      email: idea.userId.email
    });

    return res.status(StatusCodes.OK).json({ message: 'Review submitted', review, idea });
  } catch (err) {
    next(err);
  }
};

export const getStartupDashboard = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ userId: req.user._id }).select('_id status title rating');
    const ideaIds = ideas.map((i) => i._id);
    const interests = await InvestmentRequest.find({ ideaId: { $in: ideaIds } })
      .populate('investorId', 'name email')
      .populate('ideaId', 'title');

    const metrics = {
      totalIdeas: ideas.length,
      pending: ideas.filter((i) => i.status === 'pending').length,
      approved: ideas.filter((i) => i.status === 'approved').length,
      rejected: ideas.filter((i) => i.status === 'rejected').length,
      totalInterests: interests.length
    };

    return res.status(StatusCodes.OK).json({ metrics, ideas, interests });
  } catch (err) {
    next(err);
  }
};

export const getMentorDashboard = async (req, res, next) => {
  try {
    const pendingIdeas = await Idea.find({ status: 'pending' }).populate('userId', 'name email').sort({ createdAt: -1 });
    const myReviews = await Review.find({ reviewerId: req.user._id }).populate('ideaId', 'title status').sort({ createdAt: -1 }).limit(10);
    return res.status(StatusCodes.OK).json({ pendingIdeas, myReviews });
  } catch (err) {
    next(err);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [usersByRole, ideasByStatus, totalInvestment] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Idea.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      InvestmentRequest.aggregate([{ $match: { status: 'accepted' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    return res.status(StatusCodes.OK).json({
      usersByRole,
      ideasByStatus,
      acceptedInvestmentTotal: totalInvestment[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
};
