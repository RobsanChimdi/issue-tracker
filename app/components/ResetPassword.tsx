import React from 'react'
import { useActionState } from "react";
import { sendResetPasswordEmailAction } from "@/app/actions/auth/forgottenPassword/forgetPassword";

const ResetPassword = () => {
    const [password, setPassword] = React.useState('');
    const [state, action, pending] = useActionState(sendResetPasswordEmailAction, undefined)
  return (
    <div>
        <h1>Reset Password</h1>
        <form action={action}>
            <label>New Password:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="newPassword"
                required
            />
            <label htmlFor="">Confirm Password</label>
            <input type="password" name="confirmPassword" required />
            <button type="submit" disabled={pending}>
                {pending ? 'Resetting...' : 'Reset Password'}
            </button>
            {state?.message && <p>{state.message}</p>}
        </form>
    </div>
  )
}

export default ResetPassword