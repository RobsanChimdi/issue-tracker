// app/actions/auth.ts (or wherever your login action is)
'use server';

import { FormState, SignUpFormSchema } from "../lib/definitions";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';
import { createSession } from "../lib/session";
import {redirect} from "next/navigation"
import  {z} from "zod"
 const  LoginForm=z.object({
    email:z.string().email({message:"please enter valid email"}).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})
export async function login(state: FormState, formData: FormData): Promise<FormState> {
 
  const validatedFields = LoginForm.safeParse({
    email: formData.get('email') as string,
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Login.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
        const user = await (prisma.user.findUnique({
          where: { 
            email: email.toLowerCase().trim() 
          },
        }));
if (!user || !(await bcrypt.compare(password, user.password))) {
  return {
    errors: { email: [''], password: [''] },
    message: 'Invalid email or password',
  };
}
    await createSession(String(user.id), user.email);

    const returnUrl = formData.get('returnUrl') as string;
    if (returnUrl && returnUrl.startsWith('/')) {
      redirect(returnUrl);
    }
    redirect("/issues"); 
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Database Error: Failed to login.',
    };
  }
}