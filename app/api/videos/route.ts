import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { getSession } from "@/app/lib/session";

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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large (max 100MB)" }, { status: 400 });
    }

    const allowedTypes = [
      'video/mp4',
      'video/mpeg', 
      'video/quicktime',
      'video/webm',
      'video/ogg',
      'video/x-msvideo' 
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "File type not allowed. Allowed types: MP4, MPEG, MOV, WebM, OGG, AVI" 
      }, { status: 400 });
    }

    let fileUrl = "";
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExtension = path.extname(file.name);
      const basename = path.basename(file.name, fileExtension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      const fileName = `${Date.now()}-${basename}${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
      
    } catch (error) {
      console.error("File system error:", error);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    const video = await prisma.videos.create({
      data: {
        type: 'video',
        url: fileUrl,
        userId,
        videoname: file.name,
        videoSize: file.size
      }
    });

    console.log("Video uploaded successfully:", {
      id: video.id,
      userId,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size
    });

    return NextResponse.json(video);

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({
      error: "Failed to upload video",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const videos = await prisma.videos.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id:true,
            name: true
          }
        }
      }
    });

    const videosWithUser = videos.map(video => ({
      ...video,
      username: video.user.name
    }));

    return NextResponse.json(videosWithUser);
  } catch (error: any) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json({
      error: "Failed to fetch videos",
      details: error.message
    }, { status: 500 });
  }
}