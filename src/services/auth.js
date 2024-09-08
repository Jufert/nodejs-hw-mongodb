import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

import {
  FIFTEEN_MINUTES,
  DAYS,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';

import { env } from '../utils/env.js';
import { sendMail } from '../utils/sendMail.js';

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (user !== null) throw createHttpError(409, 'Email already in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await User.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + DAYS),
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  return await Session.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (user === null) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env(SMTP.JWT_SECRET),
    { expiresIn: '5m' },
  );
  const templateFile = path.join(TEMPLATES_DIR, 'reset-password-email.html');

  const templateSource = (await fs.readFile(templateFile)).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${env(SMTP.APP_DOMAIN)}/reset-password?token=${resetToken}`,
  });

  try {
    await sendMail({
      from: env(SMTP.FROM_EMAIL),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later',
    );
  }
};

export const resetPassword = async ({ token, password }) => {
  let entries;
  try {
    entries = jwt.verify(token, env(SMTP.JWT_SECRET));
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')
      throw createHttpError(401, 'Token is expired or invalid');
    throw err;
  }
  const user = await User.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (user === null) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  await Promise.all([
    User.updateOne({ _id: user._id }, { password: encryptedPassword }),
    Session.deleteOne({ userId: user._id }),
  ]);
};