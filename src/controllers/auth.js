import {
    registerUser,
    loginUser,
    logoutUser,
    refreshUsersSession,
    requestResetToken,
    resetPassword,
  } from '../services/auth.js';
  
  import { DAYS } from '../constants/index.js';
  
  export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);
  
    res.send({
      status: 201,
      message: `Successfully registered a user!`,
      data: user,
    });
  };
  
  export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);
  
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + DAYS),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + DAYS),
    });
  
    res.send({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  };
  
  export const logoutUserController = async (req, res) => {
    const { sessionId } = req.cookies;
  
    if (typeof sessionId === 'string') {
      await logoutUser(sessionId);
    }
  
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
  
    res.status(204).end();
  };
  
  const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: session.refreshTokenValidUntil,
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: session.refreshTokenValidUntil,
    });
  };
  
  export const refreshUserSessionController = async (req, res) => {
    const { sessionId, refreshToken } = req.cookies;
    const session = await refreshUsersSession({
      sessionId,
      refreshToken,
    });
  
    setupSession(res, session);
  
    res.send({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  };
  
  export const requestResetEmailController = async (req, res) => {
    await requestResetToken(req.body.email);
    res.send({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  };
  
  export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);
    res.json({
      status: 200,
      message: 'Password has been successfully reset!',
      data: {},
    });
  };