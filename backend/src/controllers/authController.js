import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { sendEmail } from '../services/emailService.js';

const tokenPayload = (user) => ({ id: user._id, role: user.role, email: user.email, name: user.name });

const buildTokenResponse = async (user) => {
  const accessToken = signAccessToken(tokenPayload(user));
  const { token } = signRefreshToken({ id: user._id });
  const decoded = verifyRefreshToken(token);
  await RefreshToken.create({ userId: user._id, token, expiresAt: new Date(decoded.exp * 1000) });
  return { accessToken, refreshToken: token };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already in use', StatusCodes.CONFLICT);

    const user = await User.create({ name, email, password, role: role || 'startup' });
    const tokens = await buildTokenResponse(user);

    return res.status(StatusCodes.CREATED).json({
      message: 'Registered successfully',
      user: tokenPayload(user),
      ...tokens
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }
    if (user.status === 'blocked') {
      throw new AppError('Account is blocked', StatusCodes.FORBIDDEN);
    }

    const tokens = await buildTokenResponse(user);

    return res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: tokenPayload(user),
      ...tokens
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', StatusCodes.BAD_REQUEST);

    const exists = await RefreshToken.findOne({ token: refreshToken });
    if (!exists) throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', StatusCodes.UNAUTHORIZED);

    await RefreshToken.deleteOne({ _id: exists._id });
    const tokens = await buildTokenResponse(user);
    return res.status(StatusCodes.OK).json(tokens);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    return res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: '<p>Your reset request was received. Please contact your admin or implement token reset flow for production.</p>'
      });
    }
    return res.status(StatusCodes.OK).json({ message: 'If that account exists, password reset instructions were sent.' });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  return res.status(StatusCodes.OK).json({ user: req.user });
};
