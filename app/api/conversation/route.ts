import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();
    const currentUserId = session?.userId;

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { 
            userId: currentUserId 
          },
        },
      },
      include: {
        participants: {
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            } 
          },
        },
        lastMessage: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform the data to match your frontend expectations
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      isGroup: conv.isGroup,
      name: conv.name,
      participants: conv.participants.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
      })),
      lastMessage: conv.lastMessage ? {
        text: conv.lastMessage.text,
        createdAt: conv.lastMessage.createdAt,
      } : undefined,
    }));

    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { recipientId } = await req.json();
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!recipientId) {
      return NextResponse.json({ error: 'Missing recipient ID' }, { status: 400 });
    }

    // Check if conversation already exists between these two users
    const existingConversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: [userId, recipientId] },
          },
        },
      },
      include: { 
        participants: {
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        lastMessage: true,
      },
    });

    // Filter to find exact 1:1 conversation
    const existingConversation = existingConversations.find(conv => 
      conv.participants.length === 2 &&
      conv.participants.some(p => p.userId === userId) &&
      conv.participants.some(p => p.userId === recipientId)
    );

    if (existingConversation) {
      const transformedConversation = {
        id: existingConversation.id,
        isGroup: existingConversation.isGroup,
        name: existingConversation.name,
        participants: existingConversation.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          name: p.user.name,
        })),
        lastMessage: existingConversation.lastMessage ? {
          text: existingConversation.lastMessage.text,
          createdAt: existingConversation.lastMessage.createdAt,
        } : undefined,
      };
      return NextResponse.json(transformedConversation);
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: userId },
            { userId: recipientId },
          ],
        },
      },
      include: { 
        participants: {
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
      },
    });

    const transformedConversation = {
      id: newConversation.id,
      isGroup: newConversation.isGroup,
      name: newConversation.name,
      participants: newConversation.participants.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
      })),
      lastMessage: undefined,
    };

    return NextResponse.json(transformedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}