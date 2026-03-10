import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet's default marker icons break when bundled with Vite because Vite
// rewrites asset URLs and the icon files can't be found via the default path.
// This fix points Leaflet directly at the CDN-hosted images instead.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Highlighted pin uses a teal/emerald color to show the selected post.
const highlightedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Flies the map to a new centre whenever `center` changes.
// This is a child component so it can call useMap(), which only works
// inside a MapContainer.
function MapFlyTo({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { animate: true, duration: 0.8 })
  }, [center])
  return null
}

export default function Map({ posts, highlightedId, onPinClick, flyTo }) {
  // Default centre: Montreal
  const defaultCenter = [45.5017, -73.5673]

  return (
    <div className="h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="h-full w-full"
      >
        {/* OpenStreetMap tiles, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fly to a post when selected from the feed */}
        {flyTo && <MapFlyTo center={flyTo} />}

        {/* Render a marker for every nearby post */}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.latitude, post.longitude]}
            icon={post.id === highlightedId ? highlightedIcon : new L.Icon.Default()}
            eventHandlers={{
              click: () => onPinClick(post),
            }}
          >
            <Popup>
              <div className="text-sm max-w-xs">
                <p className="font-medium text-gray-800">{post.content}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(post.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
