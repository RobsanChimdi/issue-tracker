'use client';

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  fname: string;
  lname: string;
  imageUrl: string;
  name: string;
}

interface Like {
  userId: string;
}

interface Share {
  id: number;
  posterId: string;
  sharerId: string;
  videoId: number;
}

interface Comment {
  id: number;
  user: User;
  text: string;
  content: string;
  createdAt: string;
}

interface Video {
  id: number;
  url: string;
  videoname?: string;
  type?: string;
  createdAt: string;
  user: User;
  likes: Like[];
  shares: Share[];
  comments: Comment[];
  isShared?: boolean;
  originalPostId?: number;
  originalUser?: User;
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [download, setDownLoad] = useState(false);
  const [more, setMore] = useState<{ [key: number]: Boolean }>({});
  const [userId, setUserId] = useState<string>("");
  const [clicke, setClicked] = useState<{ [key: number]: Boolean }>({});
  const [profileImage, setProfileImage] = useState<string>('');
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({});
  const [loadingComment, setLoadingComment] = useState<number | null>(null);
  const [currentDownloadVideo, setCurrentDownloadVideo] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, videosRes] = await Promise.all([
          axios.get("/api/session"),
          axios.get("/api/videos")
        ]);

        setUserId(sessionRes.data.userId || sessionRes.data.id);
        setProfileImage(sessionRes.data.imageUrl || '');
        
        console.log("Fetched videos:", videosRes.data);
        
        // Transform the videos data to match our interface
        const transformedVideos = videosRes.data.map((video: any) => ({
          ...video,
          user: {
            id: video.userId || video.user?.id,
            fname: video.user?.fname || 'User',
            lname: video.user?.lname || '',
            imageUrl: video.user?.imageUrl || '/default-avatar.png',
            name: video.user?.fname || 'User'
          },
          likes: Array.isArray(video.likes) ? video.likes : [],
          shares: Array.isArray(video.shares) ? video.shares : [],
          comments: Array.isArray(video.comments) ? video.comments.map((c: any) => ({
            ...c,
            content: c.text || c.content || '',
            user: c.user || { 
              id: c.userId || userId, 
              fname: 'User', 
              lname: '', 
              imageUrl: '/default-avatar.png', 
              name: 'User' 
            }
          })) : [],
          createdAt: video.createdAt || new Date().toISOString()
        }));
        
        console.log("Transformed videos:", transformedVideos);
        setVideos(transformedVideos);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [userId]);

  const downloadhandler = (videoId: number) => {
    setCurrentDownloadVideo(videoId);
    setDownLoad(prev => !prev);
  }

  const toggleDescription = (id: number) => {
    setMore(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const isLiked = (video: Video) => {
    return video.likes && video.likes.some(like => like.userId === userId);
  }

  const handleLike = async (video: Video) => {
    try {
      if (isLiked(video)) {
        await axios.delete(`/api/videos/${video.id}/like`);
        setVideos((prev) => prev.map((v) => v.id === video.id ? {
          ...v,
          likes: v.likes.filter((l) => l.userId !== userId)
        } : v));
      } else {
        await axios.post(`/api/videos/${video.id}/like`);
        setVideos((prev) => prev.map((v) => v.id === video.id ? {
          ...v,
          likes: [...(v.likes || []), { userId }]
        } : v));
      }
    } catch (error: any) {
      console.error("Error liking/unliking:", error);
      if (error.response?.status === 400) {
        alert(error.response.data.message || "Already liked this video");
      }
    }
  };

  const handleShare = async (video: Video) => {
    // Don't allow sharing of already shared videos
    if (video.isShared) {
      alert("Cannot share an already shared video");
      return;
    }

    const originalVideo = videos.find(v => v.id === video.id);
    if (!originalVideo) return;

    // Check if already shared by this user
    const alreadyShared = videos.some(v => 
      v.isShared && 
      v.originalPostId === video.id && 
      v.user.id === userId
    );
    
    if (alreadyShared) {
      alert("You have already shared this video!");
      return;
    }

    const tempId = Date.now();

    const tempSharedVideo: Video = {
      ...originalVideo,
      id: tempId,
      createdAt: new Date().toISOString(),
      user: {
        id: userId,
        fname: "You",
        lname: "",
        imageUrl: profileImage || '/default-avatar.png',
        name: "You"
      },
      isShared: true,
      originalPostId: originalVideo.id,
      originalUser: originalVideo.user,
      likes: [],
      shares: [],
      comments: []
    };

    setVideos(prev => [tempSharedVideo, ...prev]);

    try {
      const response = await axios.post(`/api/videos/${video.id}/share`, {
        sharerId: userId
      });

      const sharedVideo = response.data;

      setVideos(prev =>
        prev.map(v => v.id === tempId ? {
          ...sharedVideo,
          user: {
            id: sharedVideo.userId || sharedVideo.user?.id,
            fname: sharedVideo.user?.fname || 'You',
            lname: sharedVideo.user?.lname || '',
            imageUrl: sharedVideo.user?.imageUrl || profileImage || '/default-avatar.png',
            name: sharedVideo.user?.fname || 'You'
          },
          originalUser: originalVideo.user,
          likes: sharedVideo.likes || [],
          shares: sharedVideo.shares || [],
          comments: sharedVideo.comments || []
        } : v)
      );

      // Update original video's share count
      setVideos(prev =>
        prev.map(v =>
          v.id === video.id && !v.isShared
            ? {
                ...v,
                shares: [...(v.shares || []), {
                  id: Date.now(),
                  videoId: video.id,
                  sharerId: userId,
                  posterId: v.user.id
                }]
              }
            : v
        )
      );

      alert("Video shared successfully!");
    } catch (error: any) {
      console.error("Share error:", error);

      setVideos(prev => prev.filter(v => v.id !== tempId));

      if (error.response?.status === 400) {
        alert(error.response.data.error || "Already shared this video");
      } else if (error.response?.status === 401) {
        alert("Please log in to share videos");
      } else {
        alert("Could not share the video. Please try again.");
      }
    }
  };

  const handleAddComment = async (videoId: number) => {
    const text = commentTexts[videoId]?.trim();
    if (!text) return;

    setLoadingComment(videoId);
    try {
      const res = await axios.post(`/api/videos/${videoId}/comments`, { text });
      const newComment: Comment = {
        ...res.data,
        content: res.data.text || res.data.content || '',
        user: res.data.user || {
          id: userId,
          fname: "You",
          lname: "",
          imageUrl: profileImage || '/default-avatar.png',
          name: "You"
        }
      };

      setVideos(prev =>
        prev.map(video =>
          video.id === videoId
            ? {
                ...video,
                comments: video.comments ? [...video.comments, newComment] : [newComment],
              }
            : video
        )
      );
      setCommentTexts(prev => ({ ...prev, [videoId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Could not add comment. Please try again.");
    } finally {
      setLoadingComment(null);
    }
  };

  const handlerClick = (id: number) => {
    setClicked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSharedHeader = (video: Video) => {
    if (!video.isShared) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span>Shared by {video.user?.name || 'User'}</span>
        </div>
        {video.originalUser && (
          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
            <img src={video.originalUser.imageUrl || '/default-avatar.png'} className="w-4 h-4 rounded-full" />
            <span>Original video by {video.originalUser.name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/videos/new" className="flex items-center space-x-3 bg-slate-100 p-3 rounded-xl hover:bg-slate-200 transition-colors">
            <img 
              src={profileImage || "/default-avatar.png"} 
              className="w-12 h-12 rounded-full" 
              alt="Your profile"
            />
            <div className="flex-1 p-2 rounded-md border bg-white text-gray-500 cursor-pointer">
              Share a new video...
            </div>
          </Link>
        </div>

        {videos.length === 0 ? (
          <p className="text-center text-gray-500">No videos posted yet.</p>
        ) : (
          <ul className="space-y-6">
            {videos.map(video => (
              <li
                key={video.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all duration-200"
              >
                {renderSharedHeader(video)}

                <div className='flex flex-row justify-between items-start'>
                  <div className='flex flex-row'>
                    <img src={video.user?.imageUrl || "/default-avatar.png"} alt="" className='w-12 h-12 rounded-full' />
                    <h1 className='mt-3 ml-3'>{video.user?.name || 'User'}</h1>
                  </div>
                  <button onClick={() => downloadhandler(video.id)} className='text-2xl'>⋯</button>
                </div>

                {download && currentDownloadVideo === video.id && (
                  <div className='w-60 mt-2 ml-44 flex flex-col items-start bg-white rounded-md border shadow-lg fixed z-10 p-2'>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>⬇️ Download</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>💾 Save</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>🔍 Zoom</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>📞 Contact</button>
                  </div>
                )}

                <div className="flex justify-between items-start mt-2">
                  <div>
                    <p className="text-sm text-gray-500 mt-1 mb-2">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {video.videoname || 'Untitled Video'}
                    </h2>
                  </div>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {video.isShared ? 'SHARED' : 'VIDEO'}
                  </span>
                </div>

                <div className="mt-4">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-[320px] rounded-xl bg-black"
                  />
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mt-4 border-t pt-3">
                  <Link href={`/videos/${video.id}`} className="text-blue-600 hover:underline">
                    View Details
                  </Link>
                  <div className="space-x-3">
                    <button className="hover:text-blue-600 transition-colors" onClick={() => handleLike(video)}>
                      👍 {video.likes?.length || 0}
                    </button>
                    <button className="hover:text-blue-600 transition-colors" onClick={() => handlerClick(video.id)}>
                      {video.comments?.length || 0} 💬 Comment
                    </button>
                    <button className="hover:text-blue-600 transition-colors" onClick={() => handleShare(video)}>
                      {video.shares?.length || 0} ↗ Share
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments Modal - Same as Issues Page */}
      <div className='top-0 max-w-96 max-h-96 fixed'>
        {Object.entries(clicke).some(([_, v]) => v) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-white rounded-2xl p-6 w-[450px] max-h-[650px] overflow-y-auto shadow-lg">
              <button
                onClick={() => setClicked({})}
                className="absolute top-3 right-3 text-2xl text-white bg-red-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition"
              >
                ✖
              </button>

              <ul className="space-y-6 mt-6">
                {videos.filter(video => clicke[video.id]).map(video => (
                  <li
                    key={video.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm transition-all duration-200 w-full"
                  >
                    {renderSharedHeader(video)}

                    <div className='flex flex-row justify-between items-start'>
                      <div className='flex flex-row'>
                        <img src={video.user?.imageUrl || "/default-avatar.png"} alt="" className='w-12 h-12 rounded-full' />
                        <h1 className='mt-3 ml-3'>{video.user?.name || 'User'}</h1>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mt-2">
                      <div>
                        <p className="text-sm text-gray-500 mt-1 mb-2">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {video.videoname || 'Untitled Video'}
                        </h2>
                      </div>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {video.isShared ? 'SHARED' : 'VIDEO'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <video
                        src={video.url}
                        controls
                        className="w-full h-[250px] rounded-xl bg-black"
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 mt-4 border-t pt-3">
                      <Link href={`/videos/${video.id}`} className="text-blue-600 hover:underline">
                        View Details
                      </Link>
                      <div className="space-x-3">
                        <button className="hover:text-blue-600 transition-colors" onClick={() => handleLike(video)}>
                          👍 {video.likes?.length || 0}
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          {video.comments?.length || 0} 💬 Comment
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          {video.shares?.length || 0} ↗ Share
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-3">
                      {video.comments && video.comments.length > 0 && (
                        <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-2">
                          {video.comments.map(comment => (
                            <li key={comment.id} className="text-sm leading-relaxed break-words whitespace-pre-line">
                              <span className="font-semibold flex">
                                <img src={comment.user?.imageUrl || "/default-avatar.png"} alt="?" className='w-8 h-8 rounded-full bg-slate-300'/>
                                {comment.user?.fname || 'User'} {comment.user?.lname}:
                              </span> 
                              {comment.text && comment.text.length > 40 ? (
                                <>
                                  {more[comment.id]
                                    ? comment.text
                                    : comment.text.substring(0, 40) + "..."}
                                  <button
                                    onClick={() => toggleDescription(comment.id)}
                                    className="text-blue-600 ml-1 hover:underline"
                                  >
                                    {more[comment.id] ? "see less" : "see more"}
                                  </button>
                                </>
                              ) : (comment.text || comment.content)}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={commentTexts[video.id] || ""}
                          onChange={e => setCommentTexts(prev => ({ ...prev, [video.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 border rounded-md px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleAddComment(video.id)}
                          disabled={loadingComment === video.id}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                        >
                          {loadingComment === video.id ? "..." : "Send"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideosPage;