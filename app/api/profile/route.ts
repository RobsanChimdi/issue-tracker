import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "../../lib/session"

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let fileUrl = "";

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = path.extname(file.name);
        const baseName = path
          .basename(file.name, fileExtension)
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 50);
        const fileName = `${Date.now()}-${baseName}${fileExtension}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        fileUrl = `/uploads/${fileName}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: fileUrl },
      select: { id: true, imageUrl: true },
    });

    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  
}

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, imageUrl: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
