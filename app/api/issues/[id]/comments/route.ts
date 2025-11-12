import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/app/lib/session";
import     {z} from "zod"

const prisma = new PrismaClient();
const createCommentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty"),
});
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }
    const {text}=validation.data
    const issueId = parseInt(params.id);
   const comment=await prisma.comments.create({
       data:{
        issueId,
        userId:session.userId,
        text:text
       },
       include: { user: true },
   })

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
