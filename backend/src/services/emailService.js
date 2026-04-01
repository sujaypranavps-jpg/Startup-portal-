import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: false,
  auth: config.smtpUser && config.smtpPass ? { user: config.smtpUser, pass: config.smtpPass } : undefined
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!config.smtpUser || !config.smtpPass) return;
  await transporter.sendMail({ from: config.emailFrom, to, subject, html });
};
