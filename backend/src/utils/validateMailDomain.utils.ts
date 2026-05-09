import dns from 'dns/promises';
import { ApiError } from './errorHandler.utils.js';
import { fa } from 'zod/locales';

export const verifyEmailDomain = async (
  email: string
) => {
  try {
    const domain = email.split('@')[1];

    const mxRecords = await dns.resolveMx(domain);

    const isDomain = mxRecords && mxRecords.length > 0;
    if(!isDomain){
      throw new ApiError("This domain is not exists",400,false)
    }
  } catch (error){
    throw new ApiError("Email domain is not exists",400,false)
  }
};