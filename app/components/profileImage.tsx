'use client'
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Image {
  userId: string;
  imageUrl: string;
}

const Profile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<Image | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
const router=useRouter()

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();

    if (!file) return alert("Please select or capture a photo first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/profile", formData);
      setImage(res.data);
      setFile(null);
      setPreview(null);
      router.push("/issues"); 
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-60 h-60 rounded-full overflow-hidden border shadow-md flex justify-center items-center bg-gray-50">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : image?.imageUrl ? (
          <img src={image.imageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Camera className="w-10 h-10 mb-2 opacity-60" />
            <p className="text-sm">No image uploaded</p>
          </div>
        )}
      </div>

      <form onSubmit={handlePost} className="flex flex-col items-center space-y-3">
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md flex items-center space-x-2 transition-all"
        >
          <Camera className="w-4 h-4" />
          <span>Take or Select Photo</span>
        </label>

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          capture="environment" 
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-all"
        >
          Upload
        </button>
      </form>
      <Link href="/">Skip</Link>
    </div>
  );
};

export default Profile;
