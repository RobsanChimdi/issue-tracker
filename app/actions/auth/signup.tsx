'use server';
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { FormState, SignUpFormSchema } from "../../lib/definitions";
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

    // Separate try/catch for email
    try {
      await sendVerificationEmail(email, verificationCode, name.trim());
      return { success: true, message: `Verification code sent to <p styel= "color:blue">${email}</p>. Please check your inbox.` };
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return { 
        success: true, 
        message: `Account created, but failed to send verification email to ${email}. Please try resending.` 
      };
    }

  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.code === "P2002") {
      return { error: "This email is already registered." };
    }
    return { error: "An unexpected error occurred while creating your account." };
  }
}
