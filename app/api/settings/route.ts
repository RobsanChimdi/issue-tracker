import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/app/lib/session'

const prisma = new PrismaClient()

// ========================= POST =========================
export async function POST(req: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { language, theme, notifications, timezone } = await req.json()

    const setting = await prisma.setting.create({
      data: {
        language,
        theme,
        notifications,
        timezone,
        userId,
      },
      include: {
        user: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json(setting, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ========================= GET =========================
export async function GET() {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const setting = await prisma.setting.findUnique({
      where: { userId }
    })

    return NextResponse.json(setting, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ========================= PUT =========================
// User cannot include userId — we take it from session
export async function PUT(req: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { language, theme, notifications, timezone } = await req.json()

    const updated = await prisma.setting.update({
      where: { userId },
      data: {
        language,
        theme,
        notifications,
        timezone,
      },
    })

    return NextResponse.json(updated, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
