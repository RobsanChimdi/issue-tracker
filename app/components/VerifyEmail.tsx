'use client'

import { verifyEmail } from "@/app/actions/auth/Verify/verifyAction";
import { resendVerification } from "@/app/actions/auth/Verify/resendVerification";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

const initialState = { message: "" };

export default function VerifyPage() {
   const [state, action, pending] = useActionState(verifyEmail, undefined);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  async function handleResend() {
    setLoading(true);
    await resendVerification(email);
    setLoading(false);
    alert("Verification code resent!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">

        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Verify Your Email
        </h1>

        <form action={action} className="flex flex-col space-y-4">

          <input type="hidden" name="email" value={email} />

          <input
            type="text"
            name="code"
            maxLength={6}
            placeholder="Enter verification code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:bg-fuchsia-600 text-center text-lg"
          />

          <button
            type="submit"
            className="py-3 bg-fuchsia-700 text-white rounded-lg hover:bg-fuchsia-900"
          >
            Verify
          </button>
        </form>

        {state?.message && (
          <p className="text-center text-red-500 mt-4">{state?.message}</p>
        )}

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={pending}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            {pending? "Sending..." : "Resend code?"}
          </button>
        </div>

      </div>
    </div>
  );
}
