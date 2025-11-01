import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { senderId, recipientId, conversationId, text } = await req.json();

    if (!conversationId || !senderId || !recipientId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { senderId, recipientId, conversationId, text },
      include: { sender: true, recipient: true },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: message.id, updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: true, recipient: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}
