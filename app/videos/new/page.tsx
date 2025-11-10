'use client'
import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
interface User{
  id:string;
  name:string;
}
interface Video {
  id: number;
  url: string;
  videoname?: string;
  type?: string;
  user:User
}

const page = () => {
     const [file, setFile] = useState<File | null>(null);
          const [preview, setPreview] = useState<string | null>(null);
          const [videos, setVideos] = useState<Video[]>([]);
          const [username, setUsername] = useState<string | null>(null);
          const [videoName, setVideoName] = useState('');
          const [uploading, setUploading] = useState(false);
          const router=useRouter()


    async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/videos", formData
      );

      setVideos((prev) => [...prev, res.data]);
      setFile(null);
      setPreview(null);
      router.push("/videos")

    } catch (error: any) {
      console.error("Upload failed:", error);
      if (error.response?.data?.error) {
        alert(`Upload failed: ${error.response.data.error}`);
      } else {
        alert("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const videoUrl = URL.createObjectURL(selectedFile);
      setPreview(videoUrl);
    } else {
      setPreview(null);
    }
  }
  return (
    <div className='flex items-center justify-center'>   
        <form onSubmit={handlePost}>
        {file && (
          <div className="mb-4 flex items-center gap-2">
            {preview && (
              <video
                src={preview}
                controls
                width="300"
                className="rounded-lg border border-gray-300"
              />
            )}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="bg-red-500 text-white rounded px-3 py-2 hover:bg-red-600"
            >
              ✕ Remove
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300"
          >
            📎 Choose Video
          </label>
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default page