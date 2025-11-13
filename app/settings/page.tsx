'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface Setting {
  id: string
  userId: string
  language: string
  theme: string
  notifications: boolean
  timezone?: string
}

const SettingsPage = () => {
  const [setting, setSetting] = useState<Setting | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Fetch the current user's settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings') // call backend route
        setSetting(response.data)
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!setting) return
    const { name, value, type, checked} = e.target
    setSetting({
      ...setting,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = async () => {
    if (!setting) return
    try {
      await axios.put('/api/settings', setting)
      setMessage('✅ Settings updated successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('❌ Failed to update settings.')
    }
  }

  if (loading) return <p>Loading...</p>
  if (!setting) return <p>No settings found.</p>

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-semibold mb-4 text-center">User Settings</h1>

      <div className="flex flex-col space-y-4">
        <label className="flex flex-col">
          Language
          <select
            name="language"
            value={setting.language}
            onChange={handleChange}
            className="border p-2 rounded-md"
          >
            <option>English</option>
            <option>Amharic</option>
            <option>Oromo</option>
            <option>French</option>
          </select>
        </label>

        <label className="flex flex-col">
          Theme
          <select
            name="theme"
            value={setting.theme}
            onChange={handleChange}
            className="border p-2 rounded-md"
          >
            <option>light</option>
            <option>dark</option>
          </select>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="notifications"
            checked={setting.notifications}
            onChange={handleChange}
          />
          <span>Enable Notifications</span>
        </label>

        <label className="flex flex-col">
          Timezone
          <input
            type="text"
            name="timezone"
            value={setting.timezone || ''}
            onChange={handleChange}
            placeholder="e.g., Africa/Addis_Ababa"
            className="border p-2 rounded-md"
          />
        </label>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Changes
        </button>

        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </div>
    </div>
  )
}

export default SettingsPage
