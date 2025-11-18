"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function ConditionalNavBar() {
  const pathname = usePathname();

  const hideNav=  pathname.startsWith("/Login") || pathname.startsWith("/Signup");

  if (hideNav) return null;

  return <NavBar />;
}
