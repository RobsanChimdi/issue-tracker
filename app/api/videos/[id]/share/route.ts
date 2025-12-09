import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = parseInt(params.id);
    const { sharerId } = await req.json();

    // Get the original video
    const originalVideo = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            imageUrl: true
          }
        }
      }
    });

    if (!originalVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check if already shared by this user
    const existingShare = await prisma.share.findFirst({
      where: {
        videoId,
        sharerId: session.userId,
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: "Already shared this video" }, { status: 400 });
    }

    // Create a share record
    const share = await prisma.share.create({
      data: {
        videoId: videoId,
        sharerId: session.userId,
        posterId: originalVideo.userId,
      },
    });

    // Create a shared video entry
    const sharedVideo = await prisma.video.create({
      data: {
        url: originalVideo.url,
        videoname: originalVideo.videoname,
        type: originalVideo.type,
        userId: session.userId,
        isShared: true,
        originalVideoId: videoId,
        videoSize: originalVideo.videoSize,
      },
      include: {
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            imageUrl: true,
          }
        },
        likes: true,
        comments: {
          include: {
            user: true
          }
        },
        shares: true
      }
    });

    return NextResponse.json({
      ...sharedVideo,
      originalUser: originalVideo.user,
      name: sharedVideo.user.fname + (sharedVideo.user.lname ? ` ${sharedVideo.user.lname}` : '')
    }, { status: 201 });

  } catch (err) {
    console.error("Share video error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}