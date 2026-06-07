import { NextFunction, Request, Response } from "express";

const getClientIp = (req:Request, _res: Response, next: NextFunction) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  // If array → take first value
  if (Array.isArray(ip)) {
    ip = ip[0];
  }

  // If comma-separated → take first IP
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  console.log("ip",ip)
  req.clientIp = "ip";
  next();
};

export default getClientIp;