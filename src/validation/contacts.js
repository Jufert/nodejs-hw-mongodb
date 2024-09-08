import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  phoneNumber: Joi.string().min(3).max(20).required().messages({
    'string.base': 'User phone should be a string',
    'string.min': 'User phone should have at least {#limit} characters',
    'string.max': 'User phone should have at most {#limit} characters',
    'any.required': 'User phone is required',
  }),
  email: Joi.string().min(3).max(20).messages({
    'string.base': 'User email should be a string',
    'string.min': 'User email should have at least {#limit} characters',
    'string.max': 'User email should have at most {#limit} characters',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'string.base': 'User type should be a string',
      'any.required': 'User type is required',
    }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
  }),
  phoneNumber: Joi.string().min(3).max(20).messages({
    'string.base': 'User phone should be a string',
    'string.min': 'User phone should have at least {#limit} characters',
    'string.max': 'User phone should have at most {#limit} characters',
  }),
  email: Joi.string().min(3).max(20).email().messages({
    'string.base': 'User email should be a string',
    'string.min': 'User email should have at least {#limit} characters',
    'string.max': 'User email should have at most {#limit} characters',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal').messages({
    'string.base': 'User type should be a string',
  }),
  userId: Joi.string(),
});