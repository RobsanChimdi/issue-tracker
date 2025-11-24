"use client";
import React from "react";
import { useActionState } from "react";
import { sendResetPasswordEmailAction } from "@/app/actions/auth/forgottenPassword/forgetPassword";

const ForgottenPassword = () => {
  const [email, setEmail] = React.useState("");
  const [state, action, pending] = useActionState(sendResetPasswordEmailAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Forgotten Password</h1>

        <p className="text-gray-600 text-center">
          Enter your email to receive a password reset link.
        </p>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-fuchsia-500 focus:border-fuchsia-500"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              pending ? "bg-fuchsia-300 cursor-not-allowed" : "bg-fuchsia-500 hover:bg-fuchsia-600"
            }`}
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>

          {state?.message && (
            <p className="text-sm text-center text-green-600 mt-2">{state.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgottenPassword;
