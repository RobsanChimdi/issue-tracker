'use client'
import React from "react"
import Link from "next/link";
export default function Message(){
    const users=[
        {
            id:1,
            fname:'Robsan',
            lname:'Chimdi',
            email:'robsanchimdi@gmail.com',
            message:'hi'
        },
        {
            id:2,
            fname:'Roba',
            lname:'Gudisa',
            email:'robagudisa@gmail.com',
             message:'hi'
        },
        {
            id:3,
            fname:'Sami',
            lname:'Chimdi',
            email:'samichimdi@gmail.com',
             message:'hi'
        },
        {
            id:4,
            fname:'Ashe',
            lname:'Chimdi',
            email:'ashechimdi@gmail.com',
            message:'hi'
        }
    ];
    return(
        <div className=" bg-emerald-50 flex flex-col items-center justify-center">
            <h1 className="text-center text-blue-500">User</h1>
            <ul className="">
                {users.map((user)=>(
                    <li className="w-96  rounded-2xl p-1 m-2 hover:bg-gray-500" key={user.id}><Link href={`/message/${user.id}`}>{user.fname+" " +user.lname} <br /><p className="text-black ">{user.message}.....</p></Link> </li>
                ))}
            </ul>

        </div>
    )
}