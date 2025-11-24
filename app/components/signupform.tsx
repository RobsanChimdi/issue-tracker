"use client";
import { SignUp } from "@/app/actions/auth/signup";
import Link from "next/link";
import { useActionState } from "react";

export const Signup = () => {
  const [state, action, pending] = useActionState(SignUp, undefined);

  return (
    <div className=" flex items-center justify-center min-h-screen  bg-gray-50">
      <form
        action={action}
        className=" bg-white shadow-md rounded-2xl p-8  w-96 min-h-96 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Create an Account
        </h2>
        <div className="mb-3">
          <label
            htmlFor="fname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            FirstName
          </label>
          <input
            id="fname"
            name="fname"
            type="text"
            placeholder="Your Name"
            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
          />
          {state?.errors?.fname && (
            <p className="text-sm text-red-500 mt-1">{state.errors.fname[0]}</p>
          )}

        </div>
        <div className="mb-3">
          <label
            htmlFor="lname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            LastName
          </label>
          <input
            id="lname"
            name="lname"
            type="text"
            placeholder="Your father Name"
            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
          />
          {state?.errors?.lname && (
            <p className="text-sm text-red-500 mt-1">{state.errors.lname[0]}</p>
          )}
        </div>
        <div className="mb-3">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
          />
          {state?.errors?.email && (
            <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
          />
          {state?.errors?.password && (
            <div className="mt-2 text-sm text-red-500">
              <p>Password must:</p>
              <ul className="list-disc ml-5">
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          disabled={pending}
          type="submit"
          className="w-full bg-fuchsia-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-fuchsia-900 transition disabled:opacity-50"
        >
          {pending ? "Signing Up..." : "Sign Up"}
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/Login" className="text-fuchsia-800 hover:underline">
            Sign In
          </Link>
        </p>
        {state?.error && (
        <p className="text-sm text-center text-red-600 mt-2">{state.error}</p>
      )}
      {state?.message && (
        <p className="text-sm text-center text-green-600 mt-2">{state.message}</p>
      )}
     
      </form>
    </div>
  );
};