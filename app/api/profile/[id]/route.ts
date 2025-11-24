import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import {z} from "zod"

const userInfo = z.object({
  bio: z.string().min(10).max(500).optional(),
birthDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  maritalStatus: z.string().optional(),
  about: z.string().min(20).max(1000).optional(),
  educationLevel: z.string().optional(),
})
export async function POST(req: Request, {params}:{params:{id:string}}) {
  try {
    const body = await req.json();
    const validation = userInfo.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const { bio, maritalStatus, birthDate, about, educationLevel } = validation.data;
    const parseDate = birthDate ? new Date(birthDate) : null;
    const profile = await prisma.profile.upsert({
      where: { userId: params.id },
      update: {
        bio,
        birthDate:parseDate,
        maritalStatus,
        about,
        education:educationLevel,
      },
      create: {
        bio,
        birthDate:parseDate,
        maritalStatus,
        about,
        education:educationLevel,
        user: { connect: { id: params.id } },
      },
      include: {
        user: { select: { id: true, fname: true, lname:true } },
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(req:Request, {params}:{params:{id:string}}){
  try {
    const profileInfo=await prisma.profile.findUnique({
      where: {userId:params.id},
      include: {
        user: { select: { fname: true, lname:true, imageUrl: true } }}
    });
     return NextResponse.json(profileInfo, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
