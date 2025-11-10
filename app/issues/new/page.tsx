"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const CreateIssuePage = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await axios.get("/api/issues");
        const data = await res.data;
        setIssues(data);
      } catch (error) {
        console.log("Error fetching issues:", error);
      }
    }
    fetchIssues();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title || !description) {
      alert("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      const response = await axios.post("/api/issues", formData);

      if (response.status === 201) {
        console.log("Successfully submitted:", response.data);
        setIssues((prev) => [response.data, ...prev]);
        setTitle("");
        setDescription("");
        setFile(null);
        router.push("/issues"); 
      }
    } catch (error) {
      console.error("Error submitting issue:", error);
    }
  }

  return (
    <div className="bg-white shadow-md p-6 text-black max-w-xl mx-auto rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="What's on your mind?"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Image
          </label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) setFile(selectedFile);
            }}
            className="mt-1 block w-full text-sm text-gray-600"
          />
          {file && (
            <p className="text-xs text-green-600 mt-1">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreateIssuePage;
