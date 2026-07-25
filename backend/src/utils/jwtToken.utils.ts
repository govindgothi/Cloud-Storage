import jwt, { SignOptions, Secret } from "jsonwebtoken";

export const createToken = (
  payload: object,
  expiresIn: SignOptions["expiresIn"],
): string => {
  const secret: Secret = process.env.JWT_SECRET as string;
  console.log(payload,secret,expiresIn)
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const decodeToken = <T>(token: string): T => {
  try {
    const secret: Secret = process.env.JWT_SECRET as string;
    const result = jwt.verify(token, secret) as T;
    return result;
  } catch (err) {
    return null;
  }
};