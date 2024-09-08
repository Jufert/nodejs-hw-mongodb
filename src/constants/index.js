import path from 'node:path';

export const ENV_VARS = {
  PORT: 'PORT',
};

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};
export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const DAYS = 30 * 24 * 60 * 60 * 1000;

export const SMTP = {
  HOST: 'SMTP_HOST',
  PORT: 'SMTP_PORT',
  USER: 'SMTP_USER',
  PASSWORD: 'SMTP_PASSWORD',
  FROM_EMAIL: 'SMTP_FROM',
  JWT_SECRET: 'JWT_SECRET',
  APP_DOMAIN: 'APP_DOMAIN',
};

export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const CLOUDINARY = {
  CLOUD_NAME: 'CLOUD_NAME',
  API_KEY: 'API_KEY',
  API_SECRET: 'API_SECRET',
  ENABLE_CLOUDINARY: 'ENABLE_CLOUDINARY',
};