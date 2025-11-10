"use client"
import { useState, useEffect } from "react"
import React from 'react'
import Link from "next/link"
import axios from "axios"
interface Image{
 id:string
 imageUrl:string
}
const NavBar = () => {
   const [image, setImage] = useState<Image | null>(null);

    useEffect(() => {
    async function fetchProfileImage() {
      try {
        const { data } = await axios.get("/api/profile");
        setImage(data);
      } catch (err) {
        console.error("Error fetching image", err);
      }
    }
    fetchProfileImage();
  }, []);
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
   <div className='w-12 h-12 rounded-full mr-4 bg-slate-900'>
    <Link href="./profile" className='w-12 h-12'> <img className="w-12 h-12 rounded-full" src={image?.imageUrl}/></Link>
  </div>
</nav>

  )
}

export default NavBar