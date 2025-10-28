'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'


interface Issue {
  id: number
  title: string
  description: string
  createdAt: string
}

const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchIssues() {
      try{
        const res = await fetch("/api/issues")
        if (!res.ok) throw new Error('Failed to fetch issues')
        const data = await res.json()
        setIssues(data)
      }
      catch(error){
        console.error("Error fetching issues:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchIssues()
  }, [])

  if (isLoading) return <div className="p-8 text-center text-lg">Loading issues...</div>

  return (
    <div className="max-w-4xl mx-auto p-8 pt-4">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-extrabold text-gray-800">Issue Tracker</h1>
      </div>
      {issues.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No issues found. <Link href="/" className='text-fuchsia-800'>Create a new one!</Link> </p>
      ) : (
        <ul className="space-y-4">
          {issues.map(issue => (
            <li key={issue.id} className="bg-white border border-gray-200 shadow-lg p-5 rounded-xl hover:shadow-xl transition-shadow cursor-pointer">
              <Link href={`/issues/${issue.id}`}> 
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-indigo-700 hover:text-indigo-600 truncate max-w-[80%]">
                    {issue.title}
                  </h2>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    OPEN
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 mb-3 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex justify-end text-xs text-gray-400">
                  <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
<button className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors top-6 right-0 fixed">
  <Link  href="/Auth/Signout">Signout</Link>
  </button>
    </div>
  )
}

export default IssuesPage