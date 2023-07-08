import dotenv from 'dotenv';

dotenv.config();

export const ACCOUNT = process.env.ACCOUNT || '';
export const HOSTNAME = process.env.HOSTNAME || '';
export const ACTOR = `https://${HOSTNAME}/actor/${ACCOUNT}`;
