'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface User {
  id: string
  name: string
  imageUrl: string
}

interface Profile {
  id: number
  birthDate: string
  bio: string
  maritalStatus: string
  about: string
  education: string
  user: User
}

const ProfilePage = () => {
  const [formData, setFormData] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        const sessionRes = await axios.get("/api/session")
        const id = sessionRes.data.userId
        setUserId(id)

        const res = await axios.get(`/api/profile/${id}`)
        if (res.data) {
          setFormData(res.data)
        } else {
          setFormData(null)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setFormData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <p className="text-center mt-10">Loading profile...</p>

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-semibold mb-4">You haven't created a profile yet.</h2>
        <Link
          href="/profile/create"
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Create Profile
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-lime-500 shadow">
            {formData.user.imageUrl ? (
              <img
                src={formData.user.imageUrl}
                alt={`${formData.user.name}'s profile`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">{formData.user.name}</h1>
        </div>

        <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
          <div>
            <h2 className="font-semibold text-lime-600">Bio:</h2>
            <p>{formData.bio}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lime-600">Marital Status:</h2>
            <p>{formData.maritalStatus}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lime-600">Birth Date:</h2>
            <p>{new Date(formData.birthDate).toLocaleDateString()}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lime-600">About:</h2>
            <p>{formData.about}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lime-600">Education:</h2>
            <p>{formData.education}</p>
          </div>
          <div className="text-center mt-8">
            <Link
              href={`/profile/${userId}`}
              className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
