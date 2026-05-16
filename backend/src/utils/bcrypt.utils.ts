import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// hash password
export const hashValue = async (value: string) => {
  return await bcrypt.hash(value, SALT_ROUNDS);
};

// compare password
export const verifyHash = async (
  plainValue: string,
  hashedValue: string
) => {
  return await bcrypt.compare(plainValue, hashedValue);
};