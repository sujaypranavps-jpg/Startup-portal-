import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';

export const signAccessToken = (payload) => jwt.sign(payload, config.jwtAccessSecret, { expiresIn: config.accessTokenTTL });

export const signRefreshToken = (payload) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign({ ...payload, jti }, config.jwtRefreshSecret, { expiresIn: config.refreshTokenTTL });
  return { token, jti };
};

export const verifyAccessToken = (token) => jwt.verify(token, config.jwtAccessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, config.jwtRefreshSecret);
