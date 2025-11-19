'use server'
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { FormState, SignUpFormSchema } from "../../lib/definitions";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "../../lib/mail";

const prisma = new PrismaClient();

export async function SignUp(state: FormState, formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const validatedFields = SignUpFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        verified: false,
        verificationToken: verificationCode,
        verificationExpires: new Date(Date.now() + 1000 * 60 * 10), 
      },
    });
    await sendVerificationEmail(email, verificationCode);

  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.code === "P2002") {
      return { message: "This email is already registered." };
    }
    return { message: "An unexpected error occurred while creating your account." };
  }

  return redirect(`/Verify?email=${email}`);
}
``