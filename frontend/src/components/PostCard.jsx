import { useState } from 'react'
import { deletePost } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'

// Formats a UTC timestamp into a human-readable relative time string.
// e.g. "just now", "3 minutes ago", "2 hours ago"
function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// highlighted is true when this post's pin is selected on the map,
// which adds a visual ring so the user knows which post is active.
// onDelete is called after a successful delete so the parent
// can remove the post from state without a full refetch.
export default function PostCard({ post, highlighted, onClick, onDelete }) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)

  // Read the current user's id from the JWT payload to check ownership.
  const token = localStorage.getItem('geosocial_token')
  let currentUserId = null
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        payload.nameid ||
        payload.sub
    } catch {
      // malformed token — don't show delete button
    }
  }

  const isOwner = user && currentUserId &&
    post.userId?.toLowerCase() === currentUserId?.toLowerCase()

  const handleDelete = async (e) => {
    // Prevent click bubbling up to the card's onClick
    e.stopPropagation()
    setDeleting(true)
    const res = await deletePost(post.id)
    if (res.ok) {
      onDelete(post.id)
    } else {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
        highlighted
          ? 'border-emerald-500 bg-slate-700'
          : 'border-slate-700 bg-slate-800 hover:border-slate-500'
      }`}
    >
      <p className="text-slate-100 text-sm leading-relaxed">{post.content}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="text-emerald-500">📍</span>
        <span>
          {post.latitude.toFixed(4)}, {post.longitude.toFixed(4)}
        </span>
        <span className="ml-auto">{timeAgo(post.createdAt)}</span>

        {/* Only visible to the post's author */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-2 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
            title="Delete post"
          >
            {deleting ? '...' : '✕'}
          </button>
        )}
      </div>
    </button>
  )
}
