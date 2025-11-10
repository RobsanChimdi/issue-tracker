'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');


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

  
  return (
    <div className="p-6 flex flex-col items-center justify-center">
       
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Search videos by name..."
          value={videoName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <Link href="/videos/new">
        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <span>📸</span>
          <span>Upload Video</span>
        </div>
      </Link>


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