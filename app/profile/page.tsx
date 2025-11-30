'use client'
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react"; // Added loading icon
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fname: string;
  lname: string;
  imageUrl?: string;
}

interface ProfileData {
  bio?: string;
  birthDate?: string;
  maritalStatus?: string;
  about?: string;
  education?: string;
  user: User;
}

const Profile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    bio: "",
    birthDate: "",
    maritalStatus: "",
    about: "",
    education: "",
  });

  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const sessionRes = await axios.get("/api/session");
        const userId = sessionRes.data.userId;
        const res = await axios.get(`/api/profile/${userId}`);
        if (res.data) {
          setProfile(res.data);
          setForm({
            bio: res.data.bio || "",
            birthDate: res.data.birthDate ? new Date(res.data.birthDate).toISOString().split("T")[0] : "",
            maritalStatus: res.data.maritalStatus || "",
            about: res.data.about || "",
            education: res.data.education || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    // Basic file validation
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }
      
      if (selectedFile.size > maxSize) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setError(null);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    const sessionRes = await axios.get("/api/session");
    const userId = sessionRes.data.userId;

    const formData = new FormData();
    formData.append("bio", form.bio);
    formData.append("birthdate", form.birthDate);
    formData.append("marital", form.maritalStatus);
    formData.append("about", form.about);
    formData.append("education", form.education); // Changed from "education" to "educationLevel"
    if (file) formData.append("profile", file);

    await axios.post(`/api/profile/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    router.push("/profile");
  } catch (err: any) {
    console.error("Error updating profile:", err);
    
    // Better error handling to show validation errors
    if (err.response?.data) {
      const errorData = err.response.data;
      if (typeof errorData === 'object') {
        // Handle Zod validation errors
        const validationErrors = Object.values(errorData).flat();
        setError(validationErrors.join(', ') || "Validation failed");
      } else {
        setError(errorData.message || errorData.error || "Failed to update profile");
      }
    } else {
      setError("Failed to update profile");
    }
  } finally {
    setIsSubmitting(false);
  }
};
  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-lime-600" />
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Edit Profile
        </h1>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-lime-500 shadow flex justify-center items-center bg-gray-50">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : profile?.user.imageUrl ? (
              <img src={profile.user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Camera className="w-10 h-10 mb-2 opacity-60" />
                <p className="text-sm">No image</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col space-y-4">
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Photo</span>
          </label>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <input
              type="text"
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself in a few words"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-lime-500"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={form.birthDate}
              onChange={handleInputChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <input
              type="text"
              id="maritalStatus"
              name="maritalStatus"
              value={form.maritalStatus}
              onChange={handleInputChange}
              placeholder="e.g., Single, Married, etc."
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={form.about}
              onChange={handleInputChange}
              placeholder="Share more about yourself..."
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-lime-500 h-24 resize-none"
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
              Education
            </label>
            <input
              type="text"
              id="education"
              name="education"
              value={form.education}
              onChange={handleInputChange}
              placeholder="Your educational background"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Saving..." : "Save Profile"}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <Link 
            href="/" 
            className="text-lime-600 hover:underline transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;