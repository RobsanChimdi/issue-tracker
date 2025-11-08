"use client"
import React from 'react'
import Link from "next/link"

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between h-12 px-4">
  <Link href="/" className="flex-shrink-0">
    Logo
  </Link>
  <div className="flex-1 flex justify-center">
    <input
      type="search"
      className="w-72 border rounded-sm px-2 py-1"
      placeholder="🔍 Search..."
    />
  </div>
  <button className="flex-shrink-0">Profile</button>
  <Link href="/Auth/Login" className="right-0 absolute ">Login</Link>
</nav>

  )
}

export default NavBar