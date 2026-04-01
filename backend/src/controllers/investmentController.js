import { StatusCodes } from 'http-status-codes';
import InvestmentRequest from '../models/InvestmentRequest.js';
import Idea from '../models/Idea.js';
import { AppError } from '../utils/AppError.js';
import { notifyUser } from '../services/notificationService.js';

export const createInvestmentRequest = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({ _id: req.params.ideaId, status: 'approved' }).populate('userId', 'email _id');
    if (!idea) throw new AppError('Idea not available for investment', StatusCodes.BAD_REQUEST);

    const payload = {
      ideaId: idea._id,
      investorId: req.user._id,
      amount: req.body.amount,
      partnershipType: req.body.partnershipType,
      note: req.body.note || ''
    };

    const interest = await InvestmentRequest.create(payload);

    await notifyUser({
      userId: idea.userId._id,
      type: 'investor_interest',
      title: 'New Investor Interest',
      message: `${req.user.name} submitted an investment request for your idea \"${idea.title}\".`,
      relatedId: interest._id,
      email: idea.userId.email
    });

    return res.status(StatusCodes.CREATED).json({ message: 'Investment request submitted', interest });
  } catch (err) {
    next(err);
  }
};

export const myInvestmentRequests = async (req, res, next) => {
  try {
    const requests = await InvestmentRequest.find({ investorId: req.user._id })
      .populate('ideaId', 'title industry stage userId status')
      .sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ requests });
  } catch (err) {
    next(err);
  }
};

export const startupInvestorRequests = async (req, res, next) => {
  try {
    const myIdeas = await Idea.find({ userId: req.user._id }).select('_id');
    const ids = myIdeas.map((i) => i._id);
    const requests = await InvestmentRequest.find({ ideaId: { $in: ids } })
      .populate('investorId', 'name email')
      .populate('ideaId', 'title')
      .sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ requests });
  } catch (err) {
    next(err);
  }
};

export const updateInvestmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', StatusCodes.BAD_REQUEST);
    }

    const request = await InvestmentRequest.findById(req.params.id)
      .populate('ideaId', 'title userId')
      .populate('investorId', 'email _id');
    if (!request) throw new AppError('Request not found', StatusCodes.NOT_FOUND);
    if (String(request.ideaId.userId) !== String(req.user._id)) throw new AppError('Not authorized', StatusCodes.FORBIDDEN);

    if (status === 'rejected') {
      await InvestmentRequest.deleteOne({ _id: request._id });
    } else {
      request.status = status;
      await request.save();
    }

    await notifyUser({
      userId: request.investorId._id,
      type: `investment_${status}`,
      title: `Investment Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message: `Your request for \"${request.ideaId.title}\" was ${status}.`,
      relatedId: request._id,
      email: request.investorId.email
    });

    return res.status(StatusCodes.OK).json({ message: `Request ${status}`, request: status === 'rejected' ? null : request });
  } catch (err) {
    next(err);
  }
};

export const cancelInvestmentRequest = async (req, res, next) => {
  try {
    const request = await InvestmentRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found', StatusCodes.NOT_FOUND);
    if (String(request.investorId) !== String(req.user._id)) {
      throw new AppError('Not authorized', StatusCodes.FORBIDDEN);
    }
    if (request.status !== 'pending') {
      throw new AppError('Only pending requests can be cancelled', StatusCodes.BAD_REQUEST);
    }

    await InvestmentRequest.deleteOne({ _id: request._id });
    return res.status(StatusCodes.OK).json({ message: 'Request cancelled' });
  } catch (err) {
    next(err);
  }
};
