import crypto from 'crypto';

export const generateSixDigitCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};