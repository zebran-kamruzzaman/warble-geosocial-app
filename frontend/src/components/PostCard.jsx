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
export default function PostCard({ post, highlighted, onClick }) {
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
      </div>
    </button>
  )
}
