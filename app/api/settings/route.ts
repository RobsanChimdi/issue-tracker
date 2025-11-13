import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET settings for logged-in user
export async function GET() {
  const userId = 'your_user_id_here' // replace with actual session user
  const setting = await prisma.setting.findUnique({ where: { userId } })
  return NextResponse.json(setting)
}

// UPDATE settings
export async function PUT(request: Request) {
  const body = await request.json()
  const { userId, language, theme, notifications, timezone } = body

  const updated = await prisma.setting.update({
    where: { userId },
    data: { language, theme, notifications, timezone },
  })

  return NextResponse.json(updated)
}
