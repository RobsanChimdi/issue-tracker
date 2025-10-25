
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createissue=z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description:z.string().min(1, 'Description is required')
})
export async function POST(request:NextRequest){
    const body=await request.json();
    const validation=createissue.safeParse(body);
    
    if(!validation.success){
    return NextResponse.json(validation.error.format(), {status:400})
    }
    const { title, description} = validation.data;
    
   const  newIssue= await prisma.issue.create({
  data: {
    title: "Some title",
    description: "Some description",
    userId: '1', // 👈 add this
  },
});

    return NextResponse.json(newIssue, {status:201})
}
export async function GET() {
  const issues = await prisma.issue.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(issues);
}