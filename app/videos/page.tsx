"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
}

interface Like {
  id: number;
  videoId: number;
  userId: string;
}

interface Comment {
  id: number;
  videoId: number;
  userId: string;
  content: string;
  user?: User;
}
interface Share {
  id: number;
  videoId: number;
  userId: string;
}
interface Video {
  id: number;
  url: string;
  videoname?: string;
  type?: string;
  user: User;
  likes: Like[];
  comments?: Comment[];
  shares?: Share[];
}

const Page = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [videoName, setVideoName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({});
  const [loadingComment, setLoadingComment] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await axios.get("/api/session");
        setUsername(session.data.name);
        setUserId(session.data.userId);

        const res = await axios.get("/api/videos");
        if (res.data) setVideos(res.data);
      } catch (err) {
        console.error("Failed to load videos:", err);
      }
    }
    fetchData();
  }, []);

  const handleShare = async (videoId: number) => {
    try {
      await axios.post(`/api/videos/${videoId}/share`);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                // Assuming shares is an array similar to likes
                shares: [...(v.shares || []), { id: 0, videoId, userId }],
              }
            : v
        )
      );
    } catch (error) {
      console.error("Error sharing video:", error);
    }
  };

  const isLiked = (videoId: number) => {
    const video = videos.find((v) => v.id === videoId);
    return video?.likes.some((l) => l.userId === userId) ?? false;
  };

  const likeHandler = async (video: Video) => {
    if (isLiked(video.id)) {
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
            ? {
                ...v,
                likes: [...v.likes, { id: 0, videoId: video.id, userId }],
              }
            : v
        )
      );
    }
  };

  const addComment = async (videoId: number) => {
    try {
      setLoadingComment(videoId);

      const response = await axios.post(`/api/videos/${videoId}/comments`, {
        content: commentTexts[videoId],
      });

      const newComment = response.data;

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, comments: [...(v.comments || []), newComment] }
            : v
        )
      );

      setCommentTexts((prev) => ({ ...prev, [videoId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoadingComment(null);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Search videos by name..."
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <Link href="/videos/new">
        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <span>📸</span>
          <span>Upload Video</span>
        </div>
      </Link>

      <div className="mt-4 space-y-6 w-full max-w-2xl">
        {videos
          .filter((v) =>
            v.videoname?.toLowerCase().includes(videoName.toLowerCase())
          )
          .map((video) => (
            <div
              key={video.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h2 className="text-lg font-semibold mb-3">
                {video.user.name ?? "Unknown User"}
              </h2>

              <video
                src={video.url}
                controls
                className="w-full h-[400px] object-cover shadow-lg rounded-lg"
              />
              <div className="flex items-center gap-4 mt-3">
                <button
                  className="hover:text-fuchsia-600"
                  onClick={() => likeHandler(video)}
                >
                  👍 {video.likes.length}
                </button>

                <button className="hover:text-fuchsia-600">
                  💬 {video.comments?.length ?? 0} Comment
                </button>

                <button className="hover:text-fuchsia-600">↗ Share</button>
              </div>
              {video.comments && video.comments.length > 0 && (
                <ul className="mt-3 space-y-1 border-t pt-2">
                  {video.comments.map((c) => (
                    <li key={c.id} className="text-sm">
                      <span className="font-semibold">
                        {c.user?.name ?? "User"}:
                      </span>{" "}
                      {c.content}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={commentTexts[video.id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({
                      ...prev,
                      [video.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a comment..."
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => addComment(video.id)}
                  disabled={loadingComment === video.id}
                  className="bg-fuchsia-500 text-white px-3 py-1 rounded hover:bg-fuchsia-600 text-sm"
                >
                  {loadingComment === video.id ? "..." : "Send"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Page;
