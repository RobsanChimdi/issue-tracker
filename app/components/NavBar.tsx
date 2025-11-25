"use client"
import { useState, useEffect } from "react"
import React from 'react'
import Link from "next/link"
import axios from "axios"
import { Home, Search } from "lucide-react"

interface Image {
  id: string
  imageUrl: string
}

const NavBar = () => {
  const [image, setImage] = useState<Image | null>(null);

  // useEffect(() => {
  //   async function fetchProfileImage() {
  //     try {
  //       const { data } = await axios.get("/api/profile");
  //       setImage(data);
  //     } catch (err) {
  //       console.error("Error fetching image", err);
  //     }
  //   }
  //   fetchProfileImage();
  // }, []);

  return (
    <nav className="flex items-center justify-between h-14 px-6 bg-white dark:bg-gray-300 shadow-md">
      <Link href="/" className="flex items-center text-gray-800 dark:text-gray-200 hover:text-blue-500 transition-colors">
        <Home size={30} color="fuchsia" />
      </Link>
      <div className="flex-1 flex justify-center">
        <div className="relative w-72">
          <input
            type="search"
            className="w-full border border-gray-300 dark:border-fuchsia-500 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-fuchsia-700 dark:text-gray-200"
            placeholder="Search..."
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <Link href="/profile" className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors">
        {image?.imageUrl ? (
          <img src={image.imageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
            ?
          </div>
        )}
      </Link>
    </nav>
  )
}

export default NavBar
