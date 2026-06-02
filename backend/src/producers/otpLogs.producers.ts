import { AddOtpLogsModel, updateEmailBlock, updateIpBlockType } from "../interface/auth.interface.js"
import { otpQueue } from "../queues/queue.js"

export const addOtpLogProducer = async({ clientIp, email, otpHash }:AddOtpLogsModel)=>{
   await otpQueue.add(
    "add-otp-create-log",
    {
      clientIp, email, otpHash
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
   )
}

export const updateEmailBlockStatusProducer = async({email,redisBlockedEmailKey}:updateEmailBlock)=>{
   await otpQueue.add(
    "update-email-block",
    {
      email,redisBlockedEmailKey
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
   )
}

export const updateIpBlockStatusProducer = async({ip,redisBlockedIpKey}:updateIpBlockType)=>{
   await otpQueue.add(
    "update-ip-block",
    {
      ip,redisBlockedIpKey
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
   )
}