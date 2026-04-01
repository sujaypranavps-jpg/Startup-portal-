import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token user' });
    }
    if (user.status === 'blocked') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Account is blocked' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
  }
  next();
};
