'use client';
import { login } from '@/app/actions/login';
import React, { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SigninForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form action={action} className="bg-white shadow-md rounded-2xl p-8 md:w-80 md:h-96 w-96 border border-gray-200 h-96">
        <h2 className="flex items-center justify-center text-gray-950 text-2xl mb-2">Sign In</h2>

        {/* 👇 Hidden field for redirection */}
        <input type="hidden" name="returnUrl" value={returnUrl} />

        <div>
          <label htmlFor="email" className="text-gray-950 text-xl font-sans mb-3">Email:</label>
          <input type="email" id="email" name="email" className="border p-2 rounded-lg w-full mb-2" />
          {state?.errors?.email && (
            <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-gray-950 text-xl font-sans mb-3">Password:</label>
          <input type="password" id="password" name="password" className="border p-2 rounded-lg w-full" />
          {state?.errors?.password && (
            <p className="text-sm text-red-500 mt-1 mb-4">{state.errors.password[0]}</p>
          )}
        </div>

        <button type="submit" disabled={pending} className="bg-fuchsia-800 w-full p-2 mt-4 rounded-lg text-white font-bold hover:bg-fuchsia-900 transition-colors">
          {pending ? 'Signing In...' : 'Sign In'}
        </button>

        {state?.message && <p className="text-sm mt-2">{state.message}</p>}

        <Link href="/Auth/SignUp" className="text-fuchsia-800">Sign Up</Link>
      </form>
    </div>
  );
}

export default SigninForm;
