import dotenv from 'dotenv';

if (process.env.ENVIRONMENT === 'dev') {
  dotenv.config();
}

if (process.env.ENVIRONMENT === 'cicd') {
  dotenv.config('./ci.env');
}

export const {
  MONGODB__CONNECTION_STRING,
  MONGODB__NAME,

  REDIS__HOST,
  REDIS__PORT,
  REDIS__PASSWORD,

  JWT__SECRET_KEY,
} = process.env;
