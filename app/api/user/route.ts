import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req:Request){
    try{
        const users=await prisma.user.findMany({
           orderBy:{createdAt:"desc"} 
        });

       return NextResponse.json({ users }, { status: 200 });

    }
    catch(error){
        return NextResponse.json({error})
    }

}