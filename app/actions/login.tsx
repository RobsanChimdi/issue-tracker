// app/actions/auth.ts (or wherever your login action is)
'use server';

import { FormState, SignUpFormSchema } from "../lib/definitions";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';
import { createSession } from "../lib/session";
import {redirect} from "next/navigation"

export async function login(state: FormState, formData: FormData): Promise<FormState> {
 
  const validatedFields = SignUpFormSchema.safeParse({
  email: formData.get('email'),
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
      return { message: 'Invalid email or password' };
    }
    await createSession(String(user.id), user.email);
    const returnUrl = formData.get('returnUrl') as string;
    if (returnUrl && returnUrl.startsWith('/')) {
      redirect(returnUrl);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Database Error: Failed to login.',
    };
  }
  redirect("/issues"); 
}