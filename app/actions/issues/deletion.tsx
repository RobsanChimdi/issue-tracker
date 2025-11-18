'use server'
import {PrismaClient} from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma=new PrismaClient()

export async function deleteIssue(issueId:number){
    try{
        await prisma.issues.delete({
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