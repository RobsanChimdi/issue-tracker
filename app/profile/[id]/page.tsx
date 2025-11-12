'use client'

import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'

const Page = () => {
  const params=useParams()
  const [bio, setBio] = useState('')
  const [about, setAbout] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [userId, setUserId]=useState('')
  const [imageUrl, setimageUrl]=useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchProfile() {
      try {
        const session= await axios.get("/api/session")
        setUserId(session.data.userId)
        const res = await axios.get(`/api/profile/${userId}`)
        if (res.data) {
          setBio(res.data.bio || '')
          setAbout(res.data.about || '')
          setBirthDate(res.data.birthDate ? new Date(res.data.birthDate).toISOString().split('T')[0] : '')
          setMaritalStatus(res.data.maritalStatus || '')
          setEducationLevel(res.data.education || '')
        }
      } catch (error) {
        console.log("No profile found yet.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      bio,
      about,
      birthDate,
      maritalStatus,
      educationLevel,
    }

    try {
      const res = await axios.post(`/api/profile/${userId}`, payload)
      alert("Profile created or updated successfully!")
      console.log(res.data)
    } catch (error) {
      console.error("Profile creation failed:", error)
      alert("Failed to save profile.")
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className='flex flex-col items-center justify-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-6 bg-slate-100 rounded-lg w-[400px]'>

        <label>Birth Date:</label>
        <input
          type='date'
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className='border p-2 rounded'
        />

        <label>Bio:</label>
        <input
          type='text'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className='border p-2 rounded'
        />

        <label>Marital Status:</label>
        <select
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          className='border p-2 rounded'
        >
          <option value=''>Select...</option>
          <option value='Single'>Single</option>
          <option value='Married'>Married</option>
          <option value='Divorced'>Divorced</option>
        </select>

        <label>About:</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className='border p-2 rounded'
        />

        <label>Education Level:</label>
        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className='border p-2 rounded'
        >
          <option value=''>Select...</option>
          <option value='PHD'>PHD</option>
          <option value='Masters'>Masters</option>
          <option value='Bachelor'>Bachelor</option>
          <option value='Diploma'>Diploma</option>
          <option value='Highschool'>Highschool</option>
          <option value='Elementary'>Elementary</option>
          <option value='None'>None</option>
        </select>

        <button
          type='submit'
          className='bg-blue-600 text-white p-2 rounded hover:bg-blue-700'
        >
          Save Profile
        </button>
      </form>
    </div>
  )
}

export default Page
