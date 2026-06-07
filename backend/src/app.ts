import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { query } from "./db/mysql.db.js";
import { errorHandler } from "./utils/errorHandler.utils.js";

const app = express();
export const NODE_ENV = process.env.NODE_ENV;
export const isProduction = process.env.NODE_ENV == "development" ? true : false ;

declare module "express-serve-static-core" {
  interface Request {
    clientIp: string;
    user?:any
  }
}

app.use(express.json());
app.use(cookieParser("jdskjfkjdskjndskjnfksdnkjdk"));
app.use(getClientIp)
//cors setup  
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

interface User {
    id:number,
    email:number,
    create_at:number
}

// Test route for server and data base connection
app.get("/health", async(_, res:Response) => {
  const users = await query<User[]>(
  "SELECT * FROM users WHERE id = ?",
  [1]
);
  res.json({ ok: true });
});

// Import routes 
import homeRouter from "./routes/home.routes.js"
import userRouter from "./routes/auth.route.js"
import getClientIp from "./middlewares/modifier/getIp.middleware.js";

// Mount routes under base path "/api"
app.use("/api/v1/home",homeRouter)
app.use("/api/v1/auth",userRouter)

// Global error handler
app.use(errorHandler);

export default app;