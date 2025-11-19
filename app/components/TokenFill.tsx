import React from 'react'
import { useActionState } from 'react';
import { validateResetTokenAction } from '@/app/actions/auth/forgottenPassword/resetToken';
import { useRouter } from 'next/navigation';

const TokenFill = () => {
    const router = useRouter();
    const [token, setToken] = React.useState("");
    const [state, action, pending] = useActionState(validateResetTokenAction, undefined);
    React.useEffect(() => {
        if (state?.success) {
            router.push(`/ResetPassword?token=${token}`);
        }
    }, [state, router, token]);
  return (
    <div>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">Enter Reset Token</h1>
            <form action={action} className="space-y-4">
            <div>
                <label htmlFor="token" className="block text-gray-700 font-medium mb-1">
                Reset Token
                </label>
                <input
                type="text"
                name="token"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <button
                type="submit"
                disabled={pending}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                pending ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
                {pending ? "Validating..." : "Validate Token"}
            </button>
            {state?.error && <p className="text-red-600 text-center mt-2">{state.error}</p>}
            </form>
        </div>
        </div>
    </div>
  )
}

export default TokenFill