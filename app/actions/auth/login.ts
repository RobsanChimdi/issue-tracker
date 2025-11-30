'use server';

import {prisma} from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createSession } from "../../lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "../../lib/definitions";
import { sendVerificationEmail } from "@/app/lib/mail";


const LoginForm = z.object({
  email: z.string().email({ message: "Please enter a valid email" }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character." })
    .trim(),
});

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginForm.safeParse({
    email: formData.get("email") as string,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Missing fields. Failed to login.",
    };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim(),
     },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { errors: { email: [""], password: [""] }, message: "Invalid email or password" };
  }
  const verify=await prisma.user.findUnique({
    where:{verified:true,email:email}
  });
  if (!verify) {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();

  await prisma.user.update({
    where: { email },
    data: { verificationToken: code , verificationExpires: new Date(Date.now() + 1000 * 60 * 10),}
  });

  await sendVerificationEmail(user.email, code, user.fname, user.lname);
 redirect(`/VerifyEmail?email=${user.email}`);
}
  await createSession(String(user.id), user.email,user.fname, user.imageUrl);

  const returnUrl = (formData.get("returnUrl") as string) || "/";
  if (returnUrl.startsWith("/")) redirect(returnUrl);
  redirect("/profile");
}
