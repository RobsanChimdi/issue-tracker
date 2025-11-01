import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSession();
  const currentUserId = session?.userId;

  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(users);
}
