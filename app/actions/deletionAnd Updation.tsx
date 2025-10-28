'use server'
import {PrismaClient} from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma=new PrismaClient()

export async function deleteIssue(issueId:number){
    try{
        await prisma.issue.delete({
            where:{id:issueId}
        });
        revalidatePath("/issues")
        redirect("/issues")
    }
    catch(error){
        return{
            message:"unkown error"+error
    }
}}
export async function updateIssue(
    issuedId:number,
    formData:FormData
) {
    const title=formData.get("title") as string;
    const description=formData.get('description') as string;
    try{
        await prisma.issue.update({
            where:{
                id:issuedId
            },
            data:{
                title:title,
                description:description
            }
        });
        revalidatePath("/issues")
        revalidatePath(`/issues/${issuedId}`)
        redirect(`/issues/${issuedId}`)
    }
    catch(error){
        return {
            message:error
        }
}}