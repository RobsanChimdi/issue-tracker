import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient()

export async function resetPasswordAction(state:any, data:FormData){
    const token=data.get("token") as string;
    const newPassword=data.get("newPassword") as string;
    const user=await prisma.user.findFirst({
        where:{
            resetToken:token,
            resetExpires:{
                gt:new Date()
            }
        }
    });
    if(!user){
        return {error:"Invalid or expired token."};
    }
    await prisma.user.update({
        where:{id:user.id},
        data:{
            password:newPassword,
            resetToken:null,
            resetExpires:null
        }
    });
    return {message:"Password has been reset successfully."};
}