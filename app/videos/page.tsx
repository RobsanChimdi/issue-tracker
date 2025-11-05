'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";
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

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await axios.get("/api/session");
        setUsername(session.data.name);
        const res = await axios.get("/api/videos");
        if (res.data) {
          setVideos(res.data);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      }
    }
    fetchData();
  }, []);

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
    <div className="p-6 flex flex-col items-center justify-center">
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
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Search videos by name..."
          value={videoName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mt-4 space-y-6">
        {videos.filter((video) => 
          video.videoname?.toLowerCase().includes(videoName.toLowerCase())
        ).map((video) => (
          <div key={video.id} className="border border-gray-200 rounded-lg p-4 h-[600px]">
            
            <h2 className="text-lg font-semibold mb-5">
              {video.user.name || 'Unknown User'}
            </h2>
            <div className="flex flex-row">
            <video 
              src={video.url} 
              controls 
              className="w-full max-w-[400px] h-[500px] object-cover shadow-xl rounded-lg"
            />
            <div className="flex flex-col mt-72 ml-[-50px]">
            <button className="hover:text-blue-600 transition-colors text-3xl mb-4">👍 </button>
            <button className="hover:text-blue-600 transition-colors text-3xl mb-4">💬 </button>
            <button className="hover:text-blue-600 transition-colors text-3xl mb-4">↗️ </button>
            </div>
            </div>
          </div>
        ))}
      </div>
      <div>
            
      </div>
    </div>
  );
};

export default Page;