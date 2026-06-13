import { MailBodyProducer } from "../interface/auth.interface.js";
import { emailQueue } from "../queues/queue.js";

export const addEmailJob = async({to,subject,body}:MailBodyProducer)=> {
  await emailQueue.add(
    "send-register-otp-email",
    {
      to,
      subject,
      body,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

}

