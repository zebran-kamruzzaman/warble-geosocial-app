import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

const API_URL = import.meta.env.VITE_API_URL

// Establishes a persistent WebSocket connection to the .NET SignalR hub.
// Calls onNewPost whenever the server pushes a new post event.
//
// withAutomaticReconnect() means if the connection drops (e.g. brief network
// blip), SignalR will quietly reconnect without any action from the user.
//
// The connection is cleaned up when the component using this hook unmounts.
export function useRealtime(onNewPost) {
  // useRef holds the connection object without causing re-renders when it changes.
  const connectionRef = useRef(null)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/posts`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // "NewPost" matches the event name in PostService:
    // _hub.Clients.All.SendAsync("NewPost", post)
    connection.on('NewPost', (post) => {
      onNewPost(post)
    })

    connection
      .start()
      .catch((err) => console.error('SignalR failed to connect:', err))

    connectionRef.current = connection

    // Cleanup: disconnect when the component unmounts (e.g. user navigates away)
    return () => {
      connection.stop()
    }
  }, []) // Run once on mount; onNewPost changes don't reconnect

  return connectionRef
}
