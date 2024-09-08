import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';
import { env } from './env.js';

const transporter = nodemailer.createTransport({
  host: env(SMTP.HOST),
  port: Number(env(SMTP.PORT)),
  secure: false,
  auth: {
    user: env(SMTP.USER),
    pass: env(SMTP.PASSWORD),
  },
});

export const sendMail = async (options) => {
  return await transporter.sendMail(options);
};