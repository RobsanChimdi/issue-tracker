'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface Image {
  id: number
  url: string
  name?: string
  type?: string
}
interface User{
  id:string;
  name:string;
}
interface Issue {
  id: number
  title: string
  description: string
  createdAt: string
  user:User
  images: Image[]
}

const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch("/api/issues")
        if (!res.ok) throw new Error('Failed to fetch issues')
        const data = await res.json()
        setIssues(data)
      } catch (error) {
        console.error("Error fetching issues:", error)
      }
    }
    fetchIssues()
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
        <Link href="/Auth/Signout" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
          Sign Out
        </Link>
      </div>
      {issues.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No posts yet.{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Create one now!
          </Link>
        </p>
      ) : (
        <ul className="space-y-6">
          {issues.map(issue => (
            <li
              key={issue.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {issue.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  OPEN
                </span>
              </div>

              <p className="text-gray-700 text-[15px] mt-3 leading-relaxed">
                {issue.description}
              </p>
              {issue.images && issue.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issue.images.map(image => (
                    <div key={`${issue.id}-${image.id}`} className="overflow-hidden rounded-xl border border-gray-100">
                      <img
                        src={image.url}
                        alt={image.name || "Post image"}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500 mt-4 border-t pt-3">
                <Link href={`/issues/${issue.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
                <div className="space-x-3">
                  <button className="hover:text-blue-600 transition-colors">👍 Like</button>
                  <button className="hover:text-blue-600 transition-colors">💬 Comment</button>
                  <button className="hover:text-blue-600 transition-colors">↗ Share</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default IssuesPage
