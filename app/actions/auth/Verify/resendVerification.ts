'use server'
import { sendVerificationEmail } from "../../../lib/mail";
import { prisma } from "@/app/lib/prisma";

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { fname: true, lname: true, email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { email },
    data: {
      verificationToken: code,
      verificationExpires: new Date(Date.now() + 1000 * 60 * 10),
    },
  });

  await sendVerificationEmail(
    user.email,
    code,
    user.fname,
    user.lname || "User"
  );

  return { success: true };
}
