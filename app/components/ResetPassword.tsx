"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActionState , useState, useEffect} from "react";
import { resetPasswordAction } from "@/app/actions/auth/forgottenPassword/resetPassword";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =useState("");
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);

  useEffect(() => {
    if (state?.success) {
      router.push("/Login");
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Reset Password</h1>
        <form
          action={action}
          className="space-y-4"
          data-token={token} 
        >
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              pending ? "bg-fuchsia-300 cursor-not-allowed" : "bg-fuchsia-500 hover:bg-fuchsia-700"
            }`}
          >
            {pending ? "Resetting..." : "Reset Password"}
          </button>
          {state?.error && <p className="text-red-600 text-center mt-2">{state.error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
