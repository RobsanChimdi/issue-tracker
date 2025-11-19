import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendResetPasswordEmail } from "../../../lib/mail";

const prisma = new PrismaClient();
export async function sendResetPasswordEmailAction(state: any, data: FormData) {
  const email = data.get("email") as string;
  if (!email) return { message: "Please provide a valid email." };

  const user = await prisma.user.findUnique({ where: { email } });

  const message = "You have not signed up with this email address.";
  if (!user) return { message };

  const resetToken = crypto.randomBytes(32).toString("hex"); 
  const resetExpires = new Date(Date.now() + 1000 * 60 * 15); 

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetExpires },
  });

  await sendResetPasswordEmail(email, resetToken);

  return { message };
}
