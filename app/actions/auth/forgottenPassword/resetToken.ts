import {prisma} from "@/app/lib/prisma";
export async function validateResetTokenAction(state: any, data: FormData) {
  const token = data.get("token") as string;
  if (!token || token.trim() === "") return { error: "Invalid or missing token." };

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  });

  if (!user) return { error: "Invalid or expired token." };

  return { success: true }; 
}
