'use client'

import axios from 'axios'
import React, { useState, useEffect } from 'react'
import {motion, AnimatePresence} from "framer-motion"
import { useRouter } from 'next/navigation'

const Page = () => {
  const router=useRouter()
  const [bio, setBio] = useState('')
  const [about, setAbout] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [userId, setUserId]=useState('')
  const [imageUrl, setimageUrl]=useState('')
  const [loading, setLoading] = useState(true)
  const [submit, setSubmit] = useState(false)
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
       router.push("/profile")
    } catch (error) {
      console.error("Profile creation failed:", error)
      alert("Failed to save profile.")
    }
    finally{
      setSubmit(false)
    }
  }

  if (loading) return (
<AnimatePresence>
 
    <motion.div
      className="flex items-center justify-center h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-1 text-lg font-medium text-gray-800">
        <span>Loading</span>
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full inline-block"
            initial={{ backgroundColor: "#BBF7D0" }}
            animate={{ backgroundColor: ["#BBF7D0", "#065F46", "#BBF7D0"] }}
            transition={{
              duration: 1,
              delay,
              repeat: Infinity,
              repeatDelay: 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
    </AnimatePresence>
  );
  return (
  <div className="relative flex flex-col items-center justify-center min-h-screen">
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 w-[600px] rounded-lg bg-white shadow-md"
    >
      <label>Birth Date:</label>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="border p-2 rounded"
      />

      <label>Bio:</label>
      <input
        type="text"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="border p-2 rounded"
      />

      <label>Marital Status:</label>
      <select
        value={maritalStatus}
        onChange={(e) => setMaritalStatus(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select...</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
      </select>

      <label>About:</label>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        className="border p-2 rounded"
      />

      <label>Education Level:</label>
      <select
        value={educationLevel}
        onChange={(e) => setEducationLevel(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select...</option>
        <option value="PHD">PHD</option>
        <option value="Masters">Masters</option>
        <option value="Bachelor">Bachelor</option>
        <option value="Diploma">Diploma</option>
        <option value="Highschool">Highschool</option>
        <option value="Elementary">Elementary</option>
        <option value="None">None</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        onClick={()=>setSubmit(true)}
      >
        Save Profile
      </button>
    </form>
    <AnimatePresence>
      {submit && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center  z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-3xl font-medium px-6 py-4 rounded-lg text-emerald-600">
            <span>Submitting</span>
            {[0, 0.3, 0.6].map((delay, i) => (
              <motion.span
                key={i}
                className="w-3 h-3  mt-1 rounded-full inline-block"
                initial={{ backgroundColor: "#BBF7D0" }}
                animate={{ backgroundColor: ["#BBF7D0", "#065F46", "#BBF7D0"] }}
                transition={{
                  duration: 1,
                  delay,
                  repeat: Infinity,
                  repeatDelay: 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

}

export default Page
