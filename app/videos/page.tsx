'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";

interface Video {
  id: string;
  url: string;
  name?: string;
  type?: string;
}

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideos((prev) => [...prev, res.data]);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  }

  return (
    <div className="p-6">
      <form onSubmit={handlePost}>
        {file && (
          <div className="mb-2 flex items-center gap-2">
            <span>{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="bg-red-500 text-white rounded px-2 py-1"
            >
              ✕
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
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
          >
            📎 Choose Video
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {videos.map((video) => (
          <video key={video.id} src={video.url} controls width="300" />
        ))}
      </div>
    </div>
  );
};

export default Page;
