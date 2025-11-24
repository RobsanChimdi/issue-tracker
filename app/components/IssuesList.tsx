'use client'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface Image {
  id: number
  url: string
  name?: string
  type?: string
}

interface Comment{
  id:number
  user:User
  text:String
}

interface User {
  id: string
  fname: string
  lname:string
  imageUrl:string

}

interface Likes {
  userId: string
}

interface Shares{
  id:number
  posterId:string
  sharerId:string
}

interface Issue {
  id: number
  title: string
  description: string
  createdAt: string
  user: User
  likes: Likes[]
  shared:Shares[]
  images: Image[]
  comments:Comment[]
}

const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [download, setDownload] = useState(false)
  const [more, setMore] = useState<{ [key: number]: boolean }>({})
  const [userId, setUserId] = useState<string>("")
  const [clicked, setClicked]=useState<{ [key: number]: boolean }>({})
  const [profileImage, setProfileImage]=useState<string>('')
  const [commentTexts, setCommentTexts]=useState<{[key:number]:string}>({})
  const [loadingComment, setLoadingComment] = useState<number | null>(null)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, issuesRes] = await Promise.all([
          axios.get("/api/session"),
          axios.get("/api/issues")
        ])
        
        setUserId(sessionRes.data.userId || sessionRes.data.id) 
        setIssues(issuesRes.data)
        setProfileImage(sessionRes.data.imageUrl)
      } catch (error) {
        console.error("Error fetching data:", error)
      } 
    }
    fetchData()
  }, [])

  const HandleShare = async (issueId: number) => {
    try {
      await axios.post(`/api/issues/${issueId}/share`, {sharerId: userId });
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? {
            ...issue,
            shared: [...issue.shared, { 
                     id: Date.now(), 
                     posterId: issue.user.id, 
                     sharerId: userId 
                      }]   } : issue
        ))
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const downloadHandler = () => setDownload(prev => !prev)
  const toggleDescription = (id: number) => setMore(prev => ({ ...prev, [id]: !prev[id] }))
  const handleClick = (id:number)=> setClicked(prev => ({...prev, [id]:!prev[id]}))

  const isLiked = (issue: Issue) => issue.likes.some(like => like.userId === userId)

  const handleLike = async (issue: Issue) => {
    try {
      if (isLiked(issue)) {
        await axios.delete(`/api/issues/${issue.id}/like`)
        setIssues(prev => prev.map(i => i.id === issue.id ? {
          ...i,
          likes: i.likes.filter(l => l.userId !== userId)
        } : i))
      } else {
        await axios.post(`/api/issues/${issue.id}/like`)
        setIssues(prev => prev.map(i => i.id === issue.id ? {
          ...i,
          likes: [...i.likes, { userId }]
        } : i))
      }
    } catch (error:any) {
      console.error("Error liking/unliking:", error)
      if (error.response?.status === 400) alert(error.response.data.message || "Already liked this post")
    }
  }

  const handleAddComment = async (issueId: number) => {
    const text = commentTexts[issueId]?.trim()
    if (!text) return

    setLoadingComment(issueId)
    try {
      const res = await axios.post(`/api/issues/${issueId}/comments`, { text })
      const newComment: Comment = res.data

      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? { ...issue, comments: [...(issue.comments || []), newComment] }
            : issue
        )
      )
      setCommentTexts(prev => ({ ...prev, [issueId]: "" }))
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Could not add comment. Please try again.")
    } finally {
      setLoadingComment(null)
    }
  }

  const renderIssueContent = (issue: Issue) => (
    <>
      <div className="flex justify-between mt-2">
        <div>
          <p className="text-sm text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</p>
          <h2 className="text-lg font-semibold">{issue.title}</h2>
        </div>
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">OPEN</span>
      </div>

      <p className="text-gray-700 mt-2 break-words whitespace-pre-line">
        {issue.description.length > 50
          ? (more[issue.id] ? issue.description : issue.description.substring(0,50) + "...") 
          : issue.description}
        {issue.description.length > 50 && (
          <button onClick={() => toggleDescription(issue.id)} className="text-blue-600 ml-1 hover:underline">
            {more[issue.id] ? "see less" : "see more"}
          </button>
        )}
      </p>

      {issue.images.length > 0 && (
        <div className={`mt-2 ${issue.images.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}`}>
          {issue.images.map(img => (
            <img key={img.id} src={img.url} alt={img.name || "image"} className="rounded-xl w-full object-cover max-h-60" />
          ))}
        </div>
      )}

      <div className="flex justify-between mt-3 border-t pt-2 text-sm text-gray-500">
        <div className="space-x-3">
          <button onClick={() => handleLike(issue)}>👍 {issue.likes.length}</button>
          <button onClick={() => handleClick(issue.id)}>{issue.comments.length} 💬 Comment</button>
          <button onClick={() => HandleShare(issue.id)}>↗ Share {issue.shared.length}</button>
        </div>
        <Link href={`/issues/${issue.id}`} className="text-blue-600 hover:underline">View Details</Link>
      </div>

      {issue.comments.length > 0 && (
        <ul className="mt-2 max-h-24 overflow-y-auto space-y-1">
          {issue.comments.map(c => (
            <li key={c.id}><span className="font-semibold">{c.user.fname} {c.user.lname}:</span> {c.text}</li>
          ))}
        </ul>
      )}

      <div className="flex mt-2 space-x-2">
        <input
          value={commentTexts[issue.id] || ""}
          onChange={e => setCommentTexts(prev => ({...prev, [issue.id]: e.target.value}))}
          placeholder="Write a comment..."
          className="flex-1 border rounded-md px-2 py-1 text-sm"
        />
        <button
          onClick={() => handleAddComment(issue.id)}
          disabled={loadingComment === issue.id}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
        >
          {loadingComment === issue.id ? "..." : "Send"}
        </button>
      </div>
    </>
  )

  const renderPost = (issue: Issue) => {
    if(issue.shared.length > 0){
      return (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          {issue.shared.map(share => (
            <div key={share.id} className="flex items-center text-sm text-gray-500 mb-2 space-x-2">
              <img src={issues.find(i => i.user.id === share.sharerId)?.user.imageUrl} alt="" className="w-6 h-6 rounded-full"/>
              <span>{share.sharerId === userId ? "You" : issues.find(i => i.user.id === share.sharerId)?.user.fname} shared this post</span>
            </div>
          ))}
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <img src={issue.user.imageUrl} alt="" className="w-8 h-8 rounded-full"/>
              <span className="font-semibold">{issue.user.fname} {issue.user.lname}</span>
            </div>
            {renderIssueContent(issue)}
          </div>
        </div>
      )
    } else {
      return <div className="bg-white rounded-xl p-3 border border-gray-200">{renderIssueContent(issue)}</div>
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/issues/new" className="flex items-center space-x-3 bg-slate-100 p-3 rounded-xl">
          <img src={profileImage || "/default-avatar.png"} alt="" className="w-12 h-12 rounded-full"/>
          <input type="text" placeholder="What's on your mind?" className="flex-1 p-2 rounded-md border bg-white"/>
        </Link>
      </div>
      {issues.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No posts yet. <Link href="/" className="text-blue-600 hover:underline">Create one now!</Link>
        </p>
      ) : (
        <ul className="space-y-6">
          {issues.map(issue => (
            <li key={issue.id}>{renderPost(issue)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default IssuesPage
