import { useState, useEffect, useCallback } from 'react'
import Map from '../components/Map'
import PostFeed from '../components/PostFeed'
import { getNearbyPosts } from '../api/client'
import { useRealtime } from '../hooks/useRealtime'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [highlightedId, setHighlightedId] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('requesting')

  // Step 1: Get the user's location using the browser Geolocation API.
  // This triggers the browser's "Allow location?" prompt.
  // Once granted, we fetch nearby posts centred on the user.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(loc)
        setLocationStatus('granted')
        loadNearbyPosts(loc.lat, loc.lng)
      },
      () => {
        // User denied location or it timed out.
        // Fall back to Montreal so the map isn't empty.
        setLocationStatus('denied')
        loadNearbyPosts(45.5017, -73.5673)
      }
    )
  }, [])

  async function loadNearbyPosts(lat, lng) {
    const nearby = await getNearbyPosts(lat, lng, 5000)
    setPosts(nearby)
  }

  // Step 2: Listen for real-time posts via SignalR.
  // useCallback prevents this from being recreated on every render,
  // which would cause the SignalR effect to reconnect repeatedly.
  const handleNewPost = useCallback((post) => {
    // Prepend to the list so newest posts appear at the top.
    setPosts((prev) => {
      // Guard against duplicates (e.g. if the creating user also receives the broadcast)
      if (prev.find((p) => p.id === post.id)) return prev
      return [post, ...prev]
    })
  }, [])

  useRealtime(handleNewPost)

  // Step 3: When a pin is clicked on the map, highlight the matching card
  // in the feed and scroll to it.
  const handlePinClick = (post) => {
    setHighlightedId(post.id)
    // Scroll the matching card into view in the feed panel
    document.getElementById(`post-${post.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  // Step 4: When a card is clicked in the feed, highlight it
  // and fly the map to its coordinates.
  const handlePostClick = (post) => {
    setHighlightedId(post.id)
    setFlyTo([post.latitude, post.longitude])
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-52px)] bg-slate-900">
      {/* Location denied banner */}
      {locationStatus === 'denied' && (
        <div className="absolute top-14 left-0 right-0 z-10 bg-amber-900/80 text-amber-200 text-xs text-center py-2 px-4">
          Location access denied — showing posts near Montreal as a fallback.
        </div>
      )}

      {/* Feed panel — full width on mobile, fixed width on desktop */}
      <div className="w-full md:w-80 lg:w-96 md:h-full h-64 border-r border-slate-700 shrink-0 overflow-hidden">
        <PostFeed
          posts={posts}
          highlightedId={highlightedId}
          onPostClick={handlePostClick}
          userLocation={userLocation}
        />
      </div>

      {/* Map panel — fills remaining space */}
      <div className="flex-1 h-full">
        <Map
          posts={posts}
          highlightedId={highlightedId}
          onPinClick={handlePinClick}
          flyTo={flyTo}
        />
      </div>
    </div>
  )
}
