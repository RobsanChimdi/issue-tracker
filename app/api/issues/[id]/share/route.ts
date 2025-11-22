import { PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { sharerId } = await request.json();
    const issueId = parseInt(id);
    const posterId = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { userId: true },
    });
    const share = await prisma.share.create({
        data: {
            postId: issueId,
            sharerId: sharerId,
            posterId: posterId?.userId || "",
        },
    });
    return new Response(JSON.stringify(share), { status: 201 });
}
