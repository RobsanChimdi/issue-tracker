'use server'
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function verifyEmail(prevState: any, formData: FormData) {
  const code = formData.get("code") as string;

  const user = await prisma.user.findFirst({
    where: { verificationToken: code },
  });

  if (!user) {
    return { message: "Invalid verification code." };
  }

  if (user.verificationExpires! < new Date()) {
    return { message: "Verification code expired." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verified: true,
      verificationToken: null,
      verificationExpires: null,
    },
  });

  redirect("/Auth/Login");
}
