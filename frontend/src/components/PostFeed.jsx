import { useState } from 'react'
import PostCard from './PostCard'
import { createPost } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function PostFeed({ posts, highlightedId, onPostClick, onDeletePost, userLocation }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return
    if (!userLocation) {
      setError('Waiting for your location...')
      return
    }

    setSubmitting(true)
    setError('')

    const res = await createPost(content.trim(), userLocation.lat, userLocation.lng)

    if (res.ok) {
      setContent('')
      // The new post will appear via SignalR — no need to manually add it here.
      // If SignalR isn't connected it won't show until refresh, which is acceptable.
    } else {
      setError('Failed to post. Are you logged in?')
    }

    setSubmitting(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-white font-medium text-sm">Nearby Posts</h2>
        <p className="text-slate-500 text-xs mt-0.5">{posts.length} within 5km</p>
      </div>

      {/* Post compose box — only shown when logged in */}
      {user && (
        <div className="px-4 py-3 border-b border-slate-700">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening here?"
            rows={3}
            maxLength={280}
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-slate-600 text-xs">{content.length}/280</span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {posts.length === 0 ? (
          <p className="text-slate-600 text-sm text-center mt-8">
            No posts nearby yet.
            {user ? ' Be the first!' : ' Log in to post.'}
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              highlighted={post.id === highlightedId}
              onClick={() => onPostClick(post)}
              onDelete={onDeletePost}
            />
          ))
        )}
      </div>
    </div>
  )
}
