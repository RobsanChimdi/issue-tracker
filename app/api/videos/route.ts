import { prisma } from "@/app/lib/prisma";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  try {
    console.log("Video upload request received");
    
    const session = await getSession();
    const userId = session?.userId;
    
    console.log("Session userId:", userId);

    if (!userId) {
      console.log("Unauthorized: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size);
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
      console.log("Invalid file type:", file.type);
      return NextResponse.json({ 
        error: "File type not allowed. Allowed types: MP4, MPEG, MOV, WebM, OGG, AVI" 
      }, { status: 400 });
    }

    let fileUrl = "";
    
    try {
      console.log("Processing file upload...");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate safe filename
      const fileExtension = path.extname(file.name);
      const basename = path.basename(file.name, fileExtension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      const fileName = `${Date.now()}-${basename}${fileExtension}`;
      
      // Create uploads/videos directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
      console.log("Upload directory:", uploadDir);
      
      // Check if directory exists, create if not
      try {
        await fs.access(uploadDir);
      } catch {
        console.log("Creating upload directory");
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      // Save file
      const filePath = path.join(uploadDir, fileName);
      console.log("Saving file to:", filePath);
      
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/videos/${fileName}`;
      
      console.log("File saved successfully:", fileUrl);
      
    } catch (error: any) {
      console.error("File system error details:", error);
      return NextResponse.json({ 
        error: "Failed to save file to server",
        details: error.message 
      }, { status: 500 });
    }

    // Create video record in database
    try {
      console.log("Creating database record...");
      
      // Prepare data with validation
      const videoData = {
        type: 'video' as const,
        url: fileUrl,
        userId: userId,
        videoname: file.name || `video-${Date.now()}`,
        videoSize: file.size,
        isShared: false,
        originalPostId: null
      };
      
      console.log("Video data to save:", videoData);
      
      // First, check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!userExists) {
        console.error("User not found:", userId);
        // Clean up the uploaded file
        try {
          await fs.unlink(path.join(process.cwd(), "public", fileUrl));
        } catch (cleanupError) {
          console.error("Failed to cleanup file:", cleanupError);
        }
        
        return NextResponse.json({ 
          error: "User not found" 
        }, { status: 404 });
      }
      
      const video = await prisma.video.create({
        data: videoData,
        include: {
          user: {
            select: {
              id: true,
              fname: true,
              lname: true,
              imageUrl: true,
            }
          }
        }
      });

      console.log("Video created successfully:", {
        id: video.id,
        userId: video.userId,
        url: video.url,
        videoname: video.videoname
      });

      const response = {
        ...video,
        user: {
          ...video.user,
          name: `${video.user.fname} ${video.user.lname || ''}`.trim()
        }
      };

      return NextResponse.json(response);

    } catch (dbError: any) {
      console.error("Database error details:");
      console.error("Error message:", dbError.message);
      console.error("Error code:", dbError.code);
      console.error("Error meta:", dbError.meta);
      
      // Clean up the uploaded file if database save failed
      try {
        if (fileUrl) {
          const filePath = path.join(process.cwd(), "public", fileUrl);
          await fs.unlink(filePath);
          console.log("Cleaned up uploaded file due to database error");
        }
      } catch (cleanupError) {
        console.error("Failed to cleanup file:", cleanupError);
      }
      
      // Provide more specific error messages
      let errorMessage = "Failed to save video record to database";
      
      if (dbError.message.includes("Foreign key constraint")) {
        errorMessage = "User not found. Please log in again.";
      } else if (dbError.message.includes("Unique constraint")) {
        errorMessage = "A video with this URL already exists.";
      } else if (dbError.message.includes("required")) {
        errorMessage = "Missing required video information.";
      }
      
      return NextResponse.json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Upload error details:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({
      error: "Failed to upload video",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}