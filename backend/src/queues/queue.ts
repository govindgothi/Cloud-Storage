import { Queue } from "bullmq";
import {connection} from "../db/bullmq.js"


// send-email 
export const emailQueue = new Queue("email-queue", {
  connection,
});

export const otpQueue = new Queue('otp-queue',{
  connection
})
