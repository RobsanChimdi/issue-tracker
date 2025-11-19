import React from 'react'
import { useActionState } from "react";
import { sendResetPasswordEmailAction } from "@/app/actions/auth/forgottenPassword/forgetPassword";

const ForgottenPassword = () => {
    const [email, setEmail] = React.useState('');
    const [state, action, pending] = useActionState(sendResetPasswordEmailAction, undefined)

  return (
    <div>
        <h1>Forgotten Password</h1>
        <form action={action}>
            <label>Email:</label>
            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                required
            />
            <button type="submit" disabled={pending}>
                {pending ? 'Sending...' : 'Send Reset Link'}
            </button>
            {state?.message && <p>{state.message}</p>}
        </form>
    </div>
  )
}

export default ForgottenPassword