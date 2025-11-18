// app/issues/[id]/page.tsx
'use server'
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import React from 'react';
import { deleteIssue } from "@/app/actions/issues/deletion";
import {DeleteB} from "../../components/ui/DeleteButton";
import { UpdatePop } from "../../components/ui/UpdatePopUp"
const prisma = new PrismaClient();

interface Props {
  params: { id: string };
}
interface Image {
  id: number
  url: string
  name?: string
  type?: string
}

interface Issue {
    id: number;
    title: string;
    description: string;
    images: Image[];
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    createdAt: Date;
    updatedAt: Date;
}

const statusMap: Record<Issue['status'], string> = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    CLOSED: 'bg-green-100 text-green-800',
};


const IssueDetailPage = async ({ params }: Props) => {
    const issueId = parseInt(params.id);
    if (isNaN(issueId)) {
        return notFound(); 
    }
 async function handleDelete() {
    "use server";
    await deleteIssue(issueId);
  }

    const issue = await prisma.issues.findUnique({
        where: { id: issueId },
        include: {
            user:{
              select:{
                id:true, name:true, email:true
              }  
            },
            images:{
                select:{
                    id:true, url:true, imagename:true, imageSize:true
                }
            }
        }
    }) as Issue | null;
    if (!issue) {
    
        return notFound(); 
    }

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 pb-4 border-b border-gray-200">
                <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-3 ${statusMap[issue.status] || 'bg-gray-100 text-gray-800'}`}
                >
                    {issue.status}
                </span>
                
    
                <h1 className="text-4xl font-extrabold text-gray-900 break-words whitespace-pre-wrap">
                    {issue.title}
                </h1>
                <div>
                   {
                    issue.images.map((image)=>(
                        <img src={image.url} key={image.id} alt="" />
                    ))
                   } 
                </div>
                <div className="mt-2 text-sm text-gray-500 flex items-center space-x-4">
                    <span>Issue #{issue.id}</span>
                    <span>•</span>
                    <span>Created: {issue.createdAt.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {issue.updatedAt.toLocaleDateString()}</span>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {issue.description}
                    </p>
                </div>
                <aside className="md:col-span-1 space-y-4">
                    <div className="flex flex-col space-y-2">
                        <UpdatePop id={issueId} title={issue.title} description={issue.description}/>
                        <DeleteB id={issueId}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md text-sm border border-gray-100">
                        <div className="mb-2">
                            <span className="font-semibold text-gray-600">Assignee:</span> 
                            <span className="ml-2 text-gray-800">Unassigned</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Priority:</span> 
                            <span className="ml-2 text-gray-800">Medium</span>
                        </div>
                    </div>
                </aside>
            </main>
            <section className="mt-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Activity</h2>
                <p className="text-gray-500">No comments yet. Be the first to add one!</p>
            </section>
        </div>
    );
};

export default IssueDetailPage;