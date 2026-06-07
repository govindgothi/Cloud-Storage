import { Worker, Job } from "bullmq";
import {connection} from "../db/bullmq.js"
import { addOtpLogsData, insertBlockedEmail, insertBlockedIp, updateEmailBlockStatusModel, updateIpBlockStatusModel } from "../models/auth.models.js";

import { initDB } from "../db/mysql.db.js";
await initDB({
      host: "localhost",
      user: "root",
      password: "",
      database: "cloud-storage",
    })
const worker = new Worker(
  "otp-queue",
  async (job: Job) => {
    switch(job.name){

      case "add-otp-create-log":
        const data = await addOtpLogsData(job.data)
      break;

      case "update-email-block":
        const updateEmailData = await updateEmailBlockStatusModel(job.data)
      break;

      case "update-ip-block":
        const updateIpData = await updateIpBlockStatusModel(job.data)

      case "insert-email":
        const emaildata = await insertBlockedEmail(job.data);
      
      case "insert-ip":
        const ipdata = await insertBlockedIp(job.data)
    }

    return {
      success: true,
    };
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job} failed`, err);
});