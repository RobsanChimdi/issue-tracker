'use client'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface User {
  id: string
  fname: string
  lname: string
  imageUrl: string
  name: string 
}

interface Image {
  id: number
  url: string
  imagename?: string
  type?: string
  createdAt?: string
}

interface Comment {
  id: number
  user: User
  text: string
  createdAt: string
}

interface Likes {
  userId: string
}

interface Shares {
  id: number
  posterId: string
  sharerId: string
  postId: number
}

interface Issue {
  id: number
  title: string
  description: string
  createdAt: string
  user: User
  likes: Likes[]
  shares: Shares[]
  images: Image[]
  comments: Comment[]
  isShared?: boolean
  originalPostId?: number
  originalUser?: User
  likesCount?: number
  commentsCount?: number
  likedBy?: string[]
}

export const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [download, setDownLoad] = useState(false)
  const [more, setMore] = useState<{ [key: number]: Boolean }>({})
  const [userId, setUserId] = useState<string>("")
  const [clicke, setClicked] = useState<{ [key: number]: Boolean }>({})
  const [profileImage, setProfileImage] = useState<string>('')
  const [sharedDate, setSharedData] = useState<Issue | null>(null)
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({})
  const [loadingComment, setLoadingComment] = useState<number | null>(null)
  const [currentDownloadIssue, setCurrentDownloadIssue] = useState<number | null>(null)

  useEffect(() => {
  console.log("Issues updated:", issues);
}, [issues]);
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
      const sharedPosts = issuesRes.data.filter((issue: Issue) => issue.isShared);
      console.log("Shared posts in response:", sharedPosts);
      
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }
  fetchData()
}, [])
useEffect(() => {
  async function Fetch() {
    try {
      const res = await axios.get(`/api/issues/${userId}`)
      setSharedData(res.data)
    } catch (error) {
      console.log(error)
    }
  }
  
  if (userId) {
    Fetch();
  }
}, [userId]); 

const HandleShare = async (issueId: number) => {
  try {
    const originalIssue = issues.find(i => i.id === issueId);
    if (!originalIssue) {
      console.error("Original issue not found");
      return;
    }
    const tempId = Date.now();
    const tempSharedIssue: Issue = {
      ...originalIssue,
      id: tempId,
      createdAt: new Date().toISOString(),
      user: {
        id: userId,
        fname: "You",
        lname: "",
        imageUrl: profileImage,
        name: "You"
      },
      isShared: true,
      originalPostId: originalIssue.id,
      originalUser: originalIssue.user,
      likes: [],
      shares: [],
      comments: [],
      images: originalIssue.images || [],
      likesCount: 0,
      commentsCount: 0,
      likedBy: []
    };
    setIssues(prev => [tempSharedIssue, ...prev]);
    const response = await axios.post(`/api/issues/${issueId}/share`, { 
      sharerId: userId 
    });
    
    const sharedIssue = response.data;
    console.log("Shared issue response:", sharedIssue);
    setIssues(prev => 
      prev.map(issue => 
        issue.id === tempId ? sharedIssue : issue
      )
    );

    alert("Post shared successfully!");

  } catch (error: any) {
    console.error("Share error:", error);
    setIssues(prev => 
      prev.filter(issue => issue.id !== Date.now())
    );

    if (error.response?.status === 400) {
      alert(error.response.data.error || "Already shared this post");
    } else if (error.response?.status === 401) {
      alert("Please log in to share posts");
    } else {
      alert("Could not share the post. Please try again.");
    }
  }
};


  const downloadhandler = (issueId: number) => {
    setCurrentDownloadIssue(issueId)
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
      const res = await axios.post(`/api/issues/${issueId}/comments`, { text })
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

  const handlerClick = (id: number) => {
    setClicked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderSharedHeader = (issue: Issue) => {
    if (!issue.isShared) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span>Shared by {issue.user.name}</span>
        </div>
        {issue.originalUser && (
          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
            <img src={issue.originalUser.imageUrl} className="w-4 h-4 rounded-full" />
            <span>Original post by {issue.originalUser.name}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button className="m-4 rounded-xl bg-slate-100 p-6">
          <div className='flex flex-row' >
            <div className='w-12 h-12 rounded-full mr-4 text-3xl bg-slate-600'>
              <Link href="/issues/new" className='w-20 h-20 rounded-full mr-4 text-3xl bg-slate-600'>
                {profileImage ? (
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
                {/* Shared header for shared posts */}
                {renderSharedHeader(issue)}

                <div className='flex flex-row justify-between items-start'>
                  <div className='flex flex-row'>
                    <img src={issue.user.imageUrl} alt="" className='w-12 h-12 rounded-full' />
                    <h1 className='mt-3 ml-3'>{issue.user.name}</h1>
                  </div>
                  <button onClick={() => downloadhandler(issue.id)} className='text-2xl'>⋯</button>
                </div>

                {download && currentDownloadIssue === issue.id && (
                  <div className='w-60 mt-2 ml-44 flex flex-col items-start bg-white rounded-md border shadow-lg fixed z-10 p-2'>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>⬇️ Download</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>💾 Save</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>🔍 Zoom</button>
                    <button className='text-lg w-full text-left mb-2 p-2 hover:bg-gray-100 rounded'>📞 Contact</button>
                  </div>
                )}

                <div className="flex justify-between items-start mt-2">
                  <div>
                    <p className="text-sm text-gray-500 mt-1 mb-2">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {issue.title}
                    </h2>
                  </div>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {issue.isShared ? 'SHARED' : 'OPEN'}
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
                        className={`overflow-hidden rounded-xl border border-gray-100 ${issue.images.length === 1 ? 'w-full max-w-md' : ''
                          }`}
                      >
                        <img
                          src={image.url}
                          alt={image.imagename|| "Post image"}
                          className={`w-[500px] h-[500px] m-4  object-cover hover:scale-105 transition-transform duration-300 ${issue.images.length === 1 ? 'mx-auto' : ''
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
                    <button className="hover:text-blue-600 transition-colors" onClick={() => handleLike(issue)}>
                      👍 {issue.likes.length}
                    </button>
                    <button className="hover:text-blue-600 transition-colors" onClick={() => handlerClick(issue.id)}>
                      {issue.comments.length} 💬 Comment
                    </button>
                    <button className="hover:text-blue-600 transition-colors" onClick={() => HandleShare(issue.id)}>
                      {issue.shares.length} ↗ Share
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments Modal */}
      <div className='top-0 max-w-96 max-h-96 fixed'>
        {Object.entries(clicke).some(([_, v]) => v) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-white rounded-2xl p-6 w-[450px] max-h-[650px] overflow-y-auto shadow-lg">
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
                    className="bg-slate-100 border border-gray-200 rounded-2xl p-4 shadow-sm transition-all duration-200 w-full"
                  >
                    {renderSharedHeader(issue)}

                    <div className='flex flex-row justify-between items-start'>
                      <div className='flex flex-row'>
                        <img src={issue.user.imageUrl} alt="" className='w-12 h-12 rounded-full' />
                        <h1 className='mt-3 ml-3'>{issue.user.name}</h1>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mt-2">
                      <div>
                        <p className="text-sm text-gray-500 mt-1 mb-2">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {issue.title}
                        </h2>
                      </div>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {issue.isShared ? 'SHARED' : 'OPEN'}
                      </span>
                    </div>

                    <p className="text-gray-700 text-[15px] mt-3 leading-relaxed break-words whitespace-pre-line">
                      {issue.description}
                    </p>

                    {issue.images && issue.images.length > 0 && (
                      <div className={`mt-4 ${issue.images.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}`}>
                        {issue.images.map(image => (
                          <div
                            key={`${issue.id}-${image.id}`}
                            className={`overflow-hidden rounded-xl border border-gray-100 ${issue.images.length === 1 ? 'w-full max-w-md' : ''
                              }`}
                          >
                            <img
                              src={image.url}
                              alt={image.imagename || "Post image"}
                              className={`w-full h-48 object-cover hover:scale-105 transition-transform duration-300 ${issue.images.length === 1 ? 'mx-auto' : ''
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
                        <button className="hover:text-blue-600 transition-colors" onClick={() => handleLike(issue)}>
                          👍 {issue.likes.length}
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          {issue.comments.length} 💬 Comment
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          {issue.shares.length} ↗ Share
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-3">
                      {issue.comments && issue.comments.length > 0 && (
                        <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-2">
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