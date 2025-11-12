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
  name: string
  imageUrl:string
}

interface Likes {
  userId: string
}

interface Issue {
  id: number
  title: string
  description: string
  createdAt: string
  user: User
  likes: Likes[]
  images: Image[]
  comments:Comment[]
}

export const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [download, setDownLoad] = useState(false)
  const [more, setMore] = useState<{ [key: number]: Boolean }>({})
  const [userId, setUserId] = useState<string>("")
  const [clicke, setClicked]=useState<{ [key: number]: Boolean }>({})
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

  const downloadhandler = () => {
    setDownLoad(prev => !prev)
  }

  const toggleDescription = (id: number) => {
    setMore(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const isLiked = (issue: Issue) => {
    return issue.likes.some(like => like.userId === userId)
  }

  const handleLike = async (issue: Issue) => {
    try {
     

      if (isLiked(issue)) {
        await axios.delete(`/api/issues/${issue.id}/like`)
        setIssues((prev) => prev.map((i) => i.id === issue.id ? {
          ...i,
          likes: i.likes.filter((l) => l.userId !== userId)
        } : i))
      } else {
        await axios.post(`/api/issues/${issue.id}/like`)
        setIssues((prev) => prev.map((i) => i.id === issue.id ? {
          ...i,
          likes: [...i.likes, { userId }]
        } : i))
      }
    } catch (error: any) {
      console.error("Error liking/unliking:", error)
      if (error.response?.status === 400) {
        alert(error.response.data.message || "Already liked this post")
      }
    }
  }
  const handleAddComment = async (issueId: number) => {
    const text = commentTexts[issueId]?.trim()
    if (!text) return

    setLoadingComment(issueId)
    try {
    const res=  await axios.post(`/api/issues/${issueId}/comments`, { text })
      const newComment: Comment = res.data

      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? {
                ...issue,
                comments: issue.comments ? [...issue.comments, newComment] : [newComment],
              }
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
const handlerClick=(id:number)=>{ setClicked((prev)=>({...prev, [id]:!prev[id]}))}

  return (
    <>
    <div className="max-w-2xl mx-auto px-4 py-8">
        <button className="m-4 rounded-xl bg-slate-100 p-6">
          <div className='flex flex-row' >
             <div className='w-12 h-12 rounded-full mr-4 text-3xl bg-slate-600'>
               <Link href="/issues/new" className='w-20 h-20 rounded-full mr-4 text-3xl bg-slate-600'>
              {
                profileImage?(
                 <img
                  src={profileImage}
                  alt='nuid'
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
              )}
              </Link>

             </div>
            <Link href="/issues/new"> 
            <input type="new issue" placeholder='what is happening on your mind' className="border w-96 p-1 bg-slate-200  border-spacing-4 rounded-md" />  
            </Link>
          </div>
            
        </button>
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
              className="bg-slate-100 border border-gray-200 rounded-2xl p-5 shadow-sm transition-all duration-200 w-[500px] h-min-[700px] h-auto"
            >   
            <div className='flex flex-row space-x-80'>
              <div className='flex flex-row'>
                <img src={issue.user.imageUrl} alt="" className='w-12 h-12 rounded-full' />
                 <h1 className='mt-3 ml-3'>{issue.user.name}</h1> 
              </div>
            
             <button onClick={downloadhandler} className='text-4xl'>...</button>
            </div>
             
              {download&&(
                <div className='w-60 h-60 mt-0 ml-44 flex flex-col items-start bg-slate-50 rounded-md  fixed'>
                    <button className='text-lg  mb-3 rounded-sm'> ⬇️ button</button>
                    <button className='text-lg  mb-3 rounded-sm'> save  button2</button>
                    <button className='text-lg  mb-3 rounded-sm'> 🔍 button3</button>
                    <button className='text-lg  mb-3 rounded-sm'> 📞 button4</button>
                </div>
              )}
         
              <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 mt-1 mb-2">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {issue.title}
                  </h2>
                 
                </div>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  OPEN
                </span>
              </div>

             <p className="text-gray-700 text-[15px] mt-3 leading-relaxed break-words whitespace-pre-line overflow-y-auto max-h-96">
              {issue.description.length > 50 ? (
                <>
                  {more[issue.id] 
                    ? issue.description 
                    : issue.description.substring(0, 50) + "..."}
                  <button
                    onClick={() => toggleDescription(issue.id)}
                    className="text-blue-600 ml-1 hover:underline"
                  >
                    {more[issue.id] ? "see less" : "see more"}
                  </button>
                </>
              ) : (
                issue.description
              )}
            </p>

              {issue.images && issue.images.length > 0 && (
                <div className={`mt-4 ${issue.images.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
                  {issue.images.map(image => (
                    <div 
                      key={`${issue.id}-${image.id}`} 
                      className={`overflow-hidden rounded-xl border border-gray-100 ${
                        issue.images.length === 1 ? 'w-full max-w-md' : ''
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name || "Post image"}
                        className={`w-[500px] h-[500px] m-4  object-cover hover:scale-105 transition-transform duration-300 ${
                          issue.images.length === 1 ? 'mx-auto' : ''
                        }`}
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
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handleLike(issue)}>👍 {issue.likes.length}</button>
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handlerClick(issue.id)}>{issue.comments.length} 💬 Comment</button>
                  <button className="hover:text-blue-600 transition-colors">↗ Share</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
     <div className='top-0 max-w-96 max-h-96 fixed'>
{Object.entries(clicke).some(([_, v]) => v) && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="relative bg-white rounded-2xl p-6 w-[450px] max-h-[650px] overflow-y-hidden shadow-lg">
      <button
        onClick={() => setClicked({})}
        className="absolute top-3 right-3 text-2xl text-white bg-red-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition"
      >
        ✖
      </button>

      <ul className="space-y-6 mt-6">

          {issues.filter(issue => clicke[issue.id]).map(issue => (
            <li
              key={issue.id}
              className="bg-slate-100 border border-gray-200 rounded-2xl p-1 shadow-sm transition-all duration-200 w-[400px] h-min-[630px] h-auto"
            >   
          
            <div className='flex flex-row space-x-60'>
             <div className='flex flex-row'>
                <img src={issue.user.imageUrl} alt="" className='w-12 h-12 rounded-full' />
                 <h1 className='mt-3 ml-3'>{issue.user.name}</h1> 
              </div>
             <button onClick={downloadhandler} className='text-4xl'>...</button>
            </div>
             
              {download&&(
                <div className='w-60 h-60 mt-0 ml-44 flex flex-col items-start bg-slate-50 rounded-md  fixed'>
                    <button className='text-lg  mb-3 rounded-sm'> ⬇️ button</button>
                    <button className='text-lg  mb-3 rounded-sm'> save  button2</button>
                    <button className='text-lg  mb-3 rounded-sm'> 🔍 button3</button>
                    <button className='text-lg  mb-3 rounded-sm'> 📞 button4</button>
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 mt-1 mb-2">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {issue.title}
                  </h2>
                 
                </div>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  OPEN
                </span>
              </div>

             <p className="text-gray-700 text-[15px] mt-3 leading-relaxed break-words whitespace-pre-line overflow-y-auto max-h-96">
              {issue.description.length > 50 ? (
                <>
                  {more[issue.id] 
                    ? issue.description 
                    : issue.description.substring(0, 50) + "..."}
                  <button
                    onClick={() => toggleDescription(issue.id)}
                    className="text-blue-600 ml-1 hover:underline"
                  >
                    {more[issue.id] ? "see less" : "see more"}
                  </button>
                </>
              ) : (
                issue.description
              )}
            </p>

              {issue.images && issue.images.length > 0 && (
                <div className={`mt-4 ${issue.images.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
                  {issue.images.map(image => (
                    <div 
                      key={`${issue.id}-${image.id}`} 
                      className={`overflow-hidden rounded-xl border border-gray-100 ${
                        issue.images.length === 1 ? 'w-full max-w-md' : ''
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name || "Post image"}
                        className={`w-[350px] h-[200px] m-2 object-cover hover:scale-105 transition-transform duration-300 ${
                          issue.images.length === 1 ? 'mx-auto' : ''
                        }`}
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
                  <button className="hover:text-blue-600 transition-colors" onClick={()=>handleLike(issue)}>👍 {issue.likes.length}</button>
                  <button className="hover:text-blue-600 transition-colors">{issue.comments.length} <Link href={`/issues/${issue.id}`}>💬 Comment</Link></button>
                  <button className="hover:text-blue-600 transition-colors">↗ Share</button>
                </div>
                
              </div>
               <div className="mt-4 border-t pt-3">
            {issue.comments && issue.comments.length > 0 && (
              <ul className="space-y-2 mb-3 max-h-14 overflow-y-auto pr-2">
                {issue.comments.map(comment => (
                  <li key={comment.id} className="text-sm leading-relaxed break-words whitespace-pre-line">
                    <span className="font-semibold">{comment.user.name}:</span> {comment.text}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={commentTexts[issue.id] || ""}
                onChange={e => setCommentTexts(prev => ({ ...prev, [issue.id]: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 border rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={() => handleAddComment(issue.id)}
                disabled={loadingComment === issue.id}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                {loadingComment === issue.id ? "..." : "Send"}
              </button>
            </div> 
          </div>

        
        </li>
          ))}
          
        </ul>
      </div>
      </div>
      )}
        
        </div>
        </>
  )
}

export default IssuesPage