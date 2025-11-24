'use server'
import { sendVerificationEmail } from "../../../lib/mail";
import {prisma} from "@/app/lib/prisma";
export async function resendVerification(email: string) {
  const userName = await prisma.user.findFirst({
    where: { email },
    select: { fname: true , lname: true },
  });
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { email },
    data: {
      verificationToken: code,
      verificationExpires: new Date(Date.now() + 1000 * 60 * 10), 
    },
  });
  if(!userName){
    throw new Error("User not found");
  }

  await sendVerificationEmail(email, code, userName.fname, userName.lname|| "User");

  return { success: true };
}
