import dotenv from 'dotenv';
import path from 'path';

if (process.env.ENVIRONMENT === 'dev') {
  dotenv.config();
}

export const PORT = process.env.PORT || 3000;

export const DB_CONFIG = process.env.MONGODB__CONNECTION_STRING;

export const NOTIFICATION_MAILER = {
  host: process.env.MAILER__HOST,
  port: process.env.MAILER__PORT,
  publicName: process.env.MAILER__PUBLICNAME,
  senderName: process.env.MAILER__SENDER_NAME,
  secure: true,
  auth: {
    user: process.env.MAILER__USERNAME,
    pass: process.env.MAILER__PASSWORD,
  },
};

export const APRAISER_EMAIL = process.env.MAILER__APRAISER_EMAIL.split(',');
// PATH
const PATH_ROOT = path.resolve(__dirname, '../');
export const IMAGE_ERROR_PATH = `${PATH_ROOT}/upload/error_image.png`;
export const PATH_FOLDER = {
  PATH_IMAGE_FOLDER: `${PATH_ROOT}/upload/images`,
  PATH_FILE_FOLDER: `${PATH_ROOT}/upload/files`,
};
export const { BASE_URL } = process.env;

export const {
  PAGE_SIZE,
  REDIS__HOST,
  REDIS__PORT,
  REDIS__PASSWORD,

  JWT__SECRET_KEY,
  JWT__UPLOAD_SECRET_KEY,
} = process.env;

// LOGIN_AS_CUSTOMER
export const LOGIN_AS_CUSTOMER_TOKEN_EXPIRE = '1h';

// email-title
export const EMAIL_TITLE = {
  ORDER_INVOICE: 'ORDER INVOICE: #',
  ORDER_RECEIPT: 'ORDER RECEIPT: ESPP has received the order #',
  ORDER_SLIP: 'ORDER SLIP: #',
  REGISTER_CUSTOMER: 'REGISTER_CUSTOMER: #',
};

export const RE_CAPTCHA_SECRET_KEY = process.env.RE_CAPTCHA_SECRET_KEY || '';
export const RE_CAPTCHA_URL = process.env.RE_CAPTCHA_URL || '';

export const APPROVAL_ROOT_LINK = process.env.APPROVAL_ROOT_LINK || '';
export const FRONT_END_LINK = process.env.FRONT_END_LINK || '';

export const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

export const S3_CONFIG = {
  endPoint: process.env.S3__ENDPOINT,
  port: parseInt(process.env.S3__PORT, 10),
  useSSL: process.env.S3__USER_SSL == 'true',
  accessKey: process.env.S3__ACCESS_KEY,
  secretKey: process.env.S3__SECRET_KEY,
};
export const { S3__BUCKET_NAME_DEFAULT, S3__FOLDER_DEFAULT } = process.env;
