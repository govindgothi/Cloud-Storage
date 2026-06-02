import jwt, { SignOptions, Secret } from "jsonwebtoken";

export const createToken = (
  payload: object,
  expiresIn: SignOptions["expiresIn"]
): string => {
  const secret: Secret = process.env.JWT_SECRET as string;

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const decodeToken = <T>(token: string): T => {
  const secret: Secret = process.env.JWT_SECRET as string;

  return jwt.verify(token, secret) as T;
};