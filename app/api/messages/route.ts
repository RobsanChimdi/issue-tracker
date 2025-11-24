import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const senderId = formData.get("senderId") as string;
    const recipientId = formData.get("recipientId") as string;
    const conversationId = formData.get("conversationId") as string;
    const text = (formData.get("text") as string) || "";
    const file = formData.get("file") as File | null;

    if (!conversationId || !senderId || !recipientId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let fileUrl = "";
    let fileSize = 0;
    let type = "text";

   if (file) {
  const maxSize = 10 * 1024 * 1024; 
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File size too large. Maximum 10MB allowed." },
      { status: 400 }
    );
  }
  const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/ogg',
  'application/pdf', 
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
  
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = path.extname(file.name);
    const baseName = path.basename(file.name, fileExtension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    const fileName = `${Date.now()}-${baseName}${fileExtension}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    fileUrl = `/uploads/${fileName}`;
    fileSize = file.size;
    type = file.type.startsWith('image/') ? 'image' : 'file';
    
  } catch (fileError) {
    console.error("File upload error:", fileError);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        conversationId,
        text,
        attachments: file
  ? {
      create: [
        {
           type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'file',
        url: fileUrl,
        fileSize,
        fileName:file.name
        },
      ],
    }
  : undefined,

      },
      include: { sender: true, recipient: true, attachments: true },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: message.id, updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: true, recipient: true, attachments: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
