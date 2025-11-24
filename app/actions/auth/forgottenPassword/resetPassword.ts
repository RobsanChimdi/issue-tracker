'use server';
import bcrypt from "bcrypt";
import {prisma} from "@/app/lib/prisma";

export async function resetPasswordAction(state: any, data: FormData) {
  const token = data.get("token") as string;
  const newPassword = data.get("newPassword") as string;
  const confirmPassword = data.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { error: "Invalid or expired token." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetExpires: null,
    },
  });
return {success:true}
}
