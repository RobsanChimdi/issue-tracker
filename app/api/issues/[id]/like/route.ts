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

    const issueId = parseInt(params.id);

    const existing = await prisma.likes.findUnique({
      where: { userId_issueId: { userId: session.userId, issueId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Already liked" }, { status: 400 });
    }

    const like = await prisma.likes.create({
      data: { userId: session.userId, issueId },
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

    const issueId = parseInt(params.id);

    await prisma.likes.delete({
      where: { userId_issueId: { userId: session.userId, issueId } },
    });

    return NextResponse.json({ message: "Unliked" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
