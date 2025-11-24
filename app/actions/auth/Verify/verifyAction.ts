'use server'
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export async function verifyEmail(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  const user = await prisma.user.findFirst({
    where: { email, verificationToken: code },
  });

  if (!user) {
    return { message: "Invalid code or wrong email." };
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

  redirect("/Login");
}
