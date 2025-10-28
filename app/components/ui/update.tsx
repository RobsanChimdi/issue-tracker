import { updateIssue } from "@/app/actions/deletionAnd Updation";
import { startTransition, useTransition } from "react";
interface UpdateProps {
  id: number;
  title: string;
  description: string;
}

export const Update = ({ id, title, description }: UpdateProps) => {
  const [ispending, isUpdated]=useTransition()
   async function HandleUpdate (formData: FormData)  {
    await startTransition(async() =>{
      updateIssue(id, formData);
    })
      
  };

  return (
    <form action={HandleUpdate} className="bg-white p-6 rounded-xl shadow-md border mb-8">
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Title</label>
        <input
          name="title"
          defaultValue={title}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          defaultValue={description}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Update Issue
      </button>
    </form>
  );
};