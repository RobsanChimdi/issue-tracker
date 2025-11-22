import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/app/lib/session";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = parseInt(params.id);

    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId: session.userId, videoId} },
    });

    if (existing) {
      return NextResponse.json({ message: "Already liked" }, { status: 400 });
    }

    const like = await prisma.like.create({
      data: { userId: session.userId, videoId , issueId: null},
    });

    return NextResponse.json(like, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const videoId = parseInt(params.id);

    await prisma.like.delete({
      where: { userId_issueId: { userId: session.userId, videoId } },
    });

    return NextResponse.json({ message: "Unliked" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
