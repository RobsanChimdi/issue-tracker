'use client';

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Like {
  userId: string;
}

interface Share {
  id: number;
  videoId: number;
  sharerId: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
}

interface Video {
  id: number;
  url: string;
  videoname?: string;
  type?: string;
  user: User;
  likes: Like[];
  comments: Comment[];
  shared: Share[];
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({});
  const [loadingComment, setLoadingComment] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await axios.get("/api/session");
        const res = await axios.get("/api/videos");

        setUserId(session.data.userId || session.data.id);
        setProfileImage(session.data.imageUrl || "");
        setVideos(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  const isLiked = (video: Video) => video.likes.some((l) => l.userId === userId);

  const handleLike = async (video: Video) => {
    try {
      if (isLiked(video)) {
        await axios.delete(`/api/videos/${video.id}/like`);
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, likes: v.likes.filter((l) => l.userId !== userId) }
              : v
          )
        );
      } else {
        await axios.post(`/api/videos/${video.id}/like`);
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, likes: [...v.likes, { userId }] }
              : v
          )
        );
      }
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  const handleShare = async (videoId: number) => {
    try {
      await axios.post(`/api/videos/${videoId}/share`, { sharerId: userId });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                shared: [
                  ...v.shared,
                  { id: Date.now(), videoId, sharerId: userId },
                ],
              }
            : v
        )
      );
    } catch (err) {
      console.log("Share error:", err);
    }
  };

  const addComment = async (videoId: number) => {
    const text = commentTexts[videoId]?.trim();
    if (!text) return;

    setLoadingComment(videoId);
    try {
      const res = await axios.post(`/api/videos/${videoId}/comments`, {
        content: text,
      });

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId ? { ...v, comments: [...v.comments, res.data] } : v
        )
      );

      setCommentTexts((prev) => ({ ...prev, [videoId]: "" }));
    } catch (err) {
      console.log("Comment error:", err);
    } finally {
      setLoadingComment(null);
    }
  };

  const renderVideoContent = (video: Video) => (
    <>
      <video
        src={video.url}
        controls
        className="w-full h-[320px] rounded-xl bg-black mt-2"
      />

      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="space-x-3">
          <button onClick={() => handleLike(video)}>
            👍 {video.likes.length}
          </button>
          <button>💬 {video.comments.length} Comments</button>
          <button onClick={() => handleShare(video.id)}>↗ Share {video.shared.length}</button>
        </div>

        <Link href={`/videos/${video.id}`} className="text-blue-600 hover:underline">
          View Details
        </Link>
      </div>

      {video.comments.length > 0 && (
        <ul className="mt-3 space-y-1 max-h-32 overflow-y-auto">
          {video.comments.map((c) => (
            <li key={c.id}>
              <span className="font-semibold">{c.user.name}:</span> {c.content}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 mt-3">
        <input
          type="text"
          value={commentTexts[video.id] || ""}
          onChange={(e) =>
            setCommentTexts((prev) => ({ ...prev, [video.id]: e.target.value }))
          }
          placeholder="Write a comment..."
          className="flex-1 border px-3 py-1 rounded-md text-sm"
        />
        <button
          onClick={() => addComment(video.id)}
          disabled={loadingComment === video.id}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
        >
          {loadingComment === video.id ? "..." : "Send"}
        </button>
      </div>
    </>
  );

  const renderPost = (video: Video) => {
    if (video.shared.length > 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          {video.shared.map((share) => (
            <div key={share.id} className="flex items-center text-sm text-gray-500 mb-2 space-x-2">
              <img
                src={videos.find((v) => v.user.id === share.sharerId)?.user.imageUrl || "/default-avatar.png"}
                className="w-6 h-6 rounded-full"
              />
              <span>
                {share.sharerId === userId ? "You" : videos.find((v) => v.user.id === share.sharerId)?.user.name} shared this video
              </span>
            </div>
          ))}

          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <img src={video.user.imageUrl || "/default-avatar.png"} className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{video.user.name}</span>
            </div>
            {renderVideoContent(video)}
          </div>
        </div>
      );
    } else {
      return <div className="bg-white rounded-xl p-3 border border-gray-200">{renderVideoContent(video)}</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/videos/new" className="flex items-center space-x-3 bg-slate-100 p-3 rounded-xl">
          <img src={profileImage || "/default-avatar.png"} className="w-12 h-12 rounded-full" />
          <input type="text" placeholder="Share a new video..." className="flex-1 p-2 rounded-md border bg-white" />
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos posted yet.</p>
      ) : (
        <ul className="space-y-6">
          {videos.map((video) => (
            <li key={video.id}>{renderPost(video)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideosPage;
