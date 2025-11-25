'use server';
import bcrypt from "bcryptjs";
import {prisma }from "@/app/lib/prisma";
import { FormState, SignUpFormSchema } from "../../lib/definitions";
import { sendVerificationEmail } from "../../lib/mail";


export async function SignUp(state: FormState, formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const validatedFields = SignUpFormSchema.safeParse({
    fname: formData.get("fname"),
    lname: formData.get("lname"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    };
  }

  const { fname,lname, email, password } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        fname: fname.trim(),
        lname: lname.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        verified: false,
        verificationToken: verificationCode,
        verificationExpires: new Date(Date.now() + 1000 * 60 * 10),
      },
    });

    try {
      await sendVerificationEmail(email, verificationCode, fname.trim(), lname.trim());
      return { success: true, message: `Verification code sent to <p style= "color:blue">${email}</p>. Please check your inbox.` };
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
