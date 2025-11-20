'use server'
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../../../lib/mail";

const prisma = new PrismaClient();

export async function resendVerification(email: string) {
  const userName = await prisma.user.findFirst({
    where: { email },
    select: { name: true },
  });
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { email },
    data: {
      verificationToken: code,
      verificationExpires: new Date(Date.now() + 1000 * 60 * 10), 
    },
  });

  await sendVerificationEmail(email, code, userName?.name || "User");

  return { success: true };
}
