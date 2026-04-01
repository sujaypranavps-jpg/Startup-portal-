import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup_portal',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me',
  accessTokenTTL: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: (process.env.CLIENT_URLS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  emailFrom: process.env.EMAIL_FROM || 'noreply@startupportal.dev',
  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: Number(process.env.SMTP_PORT || 2525),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};
