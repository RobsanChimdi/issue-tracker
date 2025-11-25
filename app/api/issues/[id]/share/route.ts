import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const issueId = parseInt(params.id);
    if (isNaN(issueId)) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const { sharerId } = await request.json();
    if (sharerId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const originalIssue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        user: {
          select: { id: true, fname: true, lname: true, imageUrl: true }
        },
        likes: true,
        shares: true,
        images: true,
        comments: {
          include: {
            user: { select: { id: true, fname: true, lname: true, imageUrl: true } }
          }
        },
      },
    });

    if (!originalIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    const sharerUser = await prisma.user.findUnique({
      where: { id: sharerId },
      select: { id: true, fname: true, lname: true, imageUrl: true }
    });

    if (!sharerUser) {
      return NextResponse.json({ error: "Sharer not found" }, { status: 404 });
    }
    const existingShare = await prisma.share.findFirst({
      where: {
        postId: issueId,
        sharerId: sharerId,
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: "Already shared this post" }, { status: 400 });
    }
    await prisma.share.create({
      data: {
        postId: issueId,
        sharerId: sharerId,
        posterId: originalIssue.userId,
      },
    });

    const sharedPost = await prisma.issue.create({
      data: {
        title: originalIssue.title,
        description: originalIssue.description,
        userId: sharerId,
        originalPostId: originalIssue.id,
        isShared: true,
        images: {
          create: originalIssue.images.map(img => ({
            url: img.url,
            imagename: img.imagename,
            type: img.type,
            imageSize: img.imageSize,
            user: { connect: { id: sharerId } }
          }))
        }
      },
      include: {
        user: {
          select: { id: true, fname: true, lname: true, imageUrl: true }
        },
        images: true,
        likes: true,
        shares: true,
        comments: {
          include: {
            user: { select: { id: true, fname: true, lname: true, imageUrl: true } }
          }
        },
        originalPost: {
          include: {
            user: { select: { id: true, fname: true, lname: true, imageUrl: true } }
          }
        }
      },
    });

    const responseData = {
      ...sharedPost,
      user: {
        ...sharedPost.user,
        name: `${sharedPost.user.fname} ${sharedPost.user.lname}`.trim()
      },
      originalUser: sharedPost.originalPost?.user ? {
        ...sharedPost.originalPost.user,
        name: `${sharedPost.originalPost.user.fname} ${sharedPost.originalPost.user.lname}`.trim()
      } : null
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}