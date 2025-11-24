import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const issueId = parseInt(params.id);
  const { sharerId } = await request.json();

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { userId: true },
  });

  if (!issue) {
    return new Response(JSON.stringify({ error: "Issue not found" }), { status: 404 });
  }

  const share = await prisma.share.create({
    data: {
      postId: issueId,
      sharerId: sharerId,
      posterId: issue.userId,
    },
  });

  return new Response(JSON.stringify(share), { status: 201 });
}
