'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User{
  id:string;
  name:string;
}
interface Like{
  id:number;
  videoId:number;
  userId:string;
}
interface Comment{
  id:number;
  videoId:number;
  userId:string;
  content:string;
}
interface Video {
  id: number;
  url: string;
  videoname?: string;
  type?: string;
  user:User
  likes:Like[]
}

const Page = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');
  const [userId, setUserId]= useState<string>('');
  const [comments, setComments]= useState<Comment[]>([]);
  const [content, setContent]= useState('');
  const [error, setError]= useState<string | null>(null);
  const [loading, setLoading]= useState<boolean>(false);
 

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await axios.get("/api/session");
        setUsername(session.data.name);
        setUserId(session.data.userId);
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

  const isliked= (videoId:number)=>{
    const video= videos.find((v)=>v.id===videoId);
    if(!video) return false;
    return video.likes.some((like)=>like.userId===userId);
  }
  const likeHandler= async(video:Video)=>{
    if(isliked(video.id)){
      await axios.delete(`/api/videos/${video.id}/like`);
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === video.id ? { ...v, likes:v.likes.filter((l)=>l.userId!==userId)} : v
        )
      );
    }
    else{
      await axios.post(`/api/videos/${video.id}/like`);
      setVideos((prevVideos) =>prevVideos.map((v) =>
        v.id === video.id ? { ...v, likes:[...v.likes, {id:0, videoId:video.id, userId:userId!}]} : v
      )
      );
    }
  }
 const addComment= async(videoId:number)=>{
  
  try {
     const response= await axios.post(`/api/videos/${videoId}/comments`, {content});
      const newComment= response.data;
      setComments((prevComments)=> prevComments.map((c)=>
        c.videoId===videoId ? {...c, content: newComment.content} : c
      ));

  setContent('');

    
  } catch (error) {
    console.error("Error adding comment:", error);
    
    
  }
  }


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
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handleLike(issue)}>👍 {issue.likes.length}</button>
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handlerClick(issue.id)}>{issue.comments.length} 💬 Comment</button>
                  <button className="hover:text-blue-600 transition-colors">↗ Share</button>
            </div>
            </div>
          </div>
        ))}
      </div>
      <div>
            <div className="space-x-3">
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handleLike(issue)}>👍 {issue.likes.length}</button>
                  <button className="hover:text-blue-600 transition-colors">{issue.comments.length} <Link href={`/issues/${issue.id}`}>💬 Comment</Link></button>
                  <button className="hover:text-blue-600 transition-colors">↗ Share</button>
                </div>
                
              </div>
               <div className="mt-4 border-t pt-3">
            {issue.comments && issue.comments.length > 0 && (
              <ul className="space-y-2 mb-3 max-h-14 overflow-y-auto pr-2">
                {issue.comments.map(comment => (
                  <li key={comment.id} className="text-sm leading-relaxed break-words whitespace-pre-line">
                    <span className="font-semibold">{comment.user.name}:</span> {comment.text}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={commentTexts[issue.id] || ""}
                onChange={e => setCommentTexts(prev => ({ ...prev, [issue.id]: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 border rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={() => handleAddComment(issue.id)}
                disabled={loadingComment === issue.id}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                {loadingComment === issue.id ? "..." : "Send"}
              </button>
            </div> 
          </div>
      </div>
    </div>
  );
};

export default Page;