'use client'
import { Update } from "./UpdateIssue";
import { useState } from "react";

interface UpdatePopProps {
  id: number;
  title: string;
  description: string;
}

export const UpdatePop = ({ id, title, description }: UpdatePopProps) => {
  const [value, setValue] = useState(false);
  
  const HandleBoolean = () => {
    setValue(true);
  };

  return (
    <div>
      <button 
        onClick={HandleBoolean} 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
      >
        Edit Issue
      </button>
      {value && <Update id={id} title={title} description={description} />}
    </div>
  );
};