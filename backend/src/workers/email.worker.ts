import { Worker, Job } from "bullmq";
import {connection} from "../db/bullmq.js"

import { initDB } from "../db/mysql.db.js";
await initDB({
      host: "localhost",
      user: "root",
      password: "",
      database: "cloud-storage",
    })

const worker = new Worker(
  "email-queue",
  async (job: Job) => {
    console.log("Processing job:",job, job.id);

    const { to, subject, body } = job.data;

    console.log(` Sending email: To: ${to} Subject: ${subject} Body: ${body}`);
    
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