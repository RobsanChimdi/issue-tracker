import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const currentUserId = session?.userId;

  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = await params.id;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: currentUserId },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}