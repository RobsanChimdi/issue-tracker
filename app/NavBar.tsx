"use client"
import React from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import classnames from "classnames"
const NavBar = () => {
    const currentPath=usePathname()
    console.log(currentPath)
    const links=[{
        label:'home', href:"/"
    },
    {
        label:"Issue", href:"/issues"
    }
]
  return (
    <nav className="flex space-x-10 border-b-2 border-b-slate-950 bg-stone-200 h-12 items-center">
     <Link href="/">Logo</Link>
     <ul className='flex space-x-6'>
        {
            links.map((link)=>(
                <li key={link.href}><Link href={link.href} className={classnames({
                    'text-zinc-900':link.href===currentPath,
                    'text-zinc-500':link.href!==currentPath,
                    'hover:text-zinc-800 transition-colors':true
                })}>{link.label}</Link></li>
            ))
        }
     </ul>
    </nav>
  )
}

export default NavBar