import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {prisma} from "@/app/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/app/lib/session";


const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required").max(5000),
});


export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const file = formData.get("file");

    const validation = createIssueSchema.safeParse({ title, description });
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    let fileUrl;
    let imagename;
    let imageSize;

    if (file && file instanceof Blob && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
      }

      const maxSize = 100 * 1024 * 1024; 
      if (file.size > maxSize) {
        return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name || ".jpg");
      const baseName = path
        .basename(file.name || "file", ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 50);
      const fileName = `${Date.now()}-${baseName}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      fileUrl = `/uploads/${fileName}`;
      imagename = file.name || fileName;
      imageSize = file.size;
    }

    const issueData: any = { title, description, userId: session.userId };
    if (fileUrl) {
      issueData.images = {
        create: [{ type: "image", url: fileUrl, imagename, imageSize, userId: session.userId }],
      };
    }

    const newIssue = await prisma.issue.create({
      data: issueData,
      include: { images: true },
    });

    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fname: true, lname:true, imageUrl: true } },
        images: { select: { url: true, imagename: true, createdAt: true } },
        likes: { select: { userId: true } },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: { select: { id: true, fname: true, lname:true, imageUrl: true } },
          },
        },
      },
    });

    const issuesWithLikes = issues.map((issue) => ({
      ...issue,
      likesCount: issue.likes.length,
      likedBy: issue.likes.map((like) => like.userId),
      commentsCount: issue.comments.length,
    }));

    return NextResponse.json(issuesWithLikes, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


