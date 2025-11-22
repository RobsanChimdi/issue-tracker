import { PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { userId } = await request.json();
    try {
    const sharedIssue = await prisma.issue.update({
      where: { id: Number(id) },
      data: {
        shared: {
          create: { posetrId: userId, sharerId: userId }
        }
        },
    });
    return new Response(JSON.stringify(sharedIssue), { status: 200 });
  } catch (error) {
    console.error("Error sharing issue:", error);
    return new Response("Error sharing issue", { status: 500 });
  }
}