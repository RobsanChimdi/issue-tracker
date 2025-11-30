import { prisma } from "@/app/lib/prisma";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

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
  education: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const bio = formData.get("bio") as string;
    const maritalStatus = formData.get("marital") as string;
    const birthDate = formData.get("birthdate") as string;
    const about = formData.get("about") as string;
    const education = formData.get("education") as string;
    const profileImage = formData.get("profile") as Blob | null;

    const validation = userInfo.safeParse({
      bio,
      birthDate,
      maritalStatus,
      about,
      education,
    });

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const parseDate = birthDate ? new Date(birthDate) : null;

    let fileUrl: string | null = null;
    if (profileImage && profileImage instanceof Blob && profileImage.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(profileImage.type)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
      }

      const maxSize = 5 * 1024 * 1024; 
      if (profileImage.size > maxSize) {
        return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
      }

      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const ext = path.extname((profileImage as any).name || ".jpg");
      const baseName = path
        .basename((profileImage as any).name || "file", ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 50);
      const fileName = `${Date.now()}-${baseName}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      fileUrl = `/uploads/${fileName}`;
    }

    const profile = await prisma.profile.upsert({
      where: { userId: params.id },
      update: {
        bio,
        birthDate: parseDate,
        maritalStatus,
        about,
        education: education,
      },
      create: {
        bio,
        birthDate: parseDate,
        maritalStatus,
        about,
        education: education,
        user: { connect: { id: params.id } },
      },
      include: {
        user: { select: { id: true, fname: true, lname: true } },
      },
    });

    if (fileUrl) {
      await prisma.user.update({
        where: { id: params.id },
        data: { imageUrl: fileUrl },
      });
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profileInfo = await prisma.profile.findUnique({
      where: { userId: params.id },
      include: {
        user: { select: { fname: true, lname: true, imageUrl: true } },
      },
    });

    return NextResponse.json(profileInfo, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
