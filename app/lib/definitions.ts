import React from 'react'
import {z} from "zod"
export const SignUpFormSchema=z.object({
  fname:z.string().min(2,{message:"Name is required"}).trim(),
  lname:z.string().min(2,{message:"Name is required"}).trim(),
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
export type FormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      success?: boolean
      message?: string
    }
  | undefined

  export type SessionPayload = {
  userId: string,
  email: string
  fname:string|null,
  role?: string
}
