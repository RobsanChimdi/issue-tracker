'use client'
import { useState } from "react";
import { verifyEmail } from "@/app/actions/auth/Verify/verifyAcrion";

export default function VerifyPage() {
  const [code, setCode] = useState("");

  return (
    <div>
      <h1>Verify Email</h1>
      <form action={verifyEmail}>
        <input
          type="text"
          name="code"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}
