import { useEffect, useState } from 'react'
import { fetchEvents, splitEvents } from '../api/events'

// Deliberately small — no react-query on the marketing side, so a visitor
// arriving from Instagram doesn't download a caching library to read a
// list that changes about four times a year.
export function useEvents() {
  const [state, setState] = useState({ upcoming: [], past: [], loading: true, failed: false })

  useEffect(() => {
    let live = true

    fetchEvents()
      .then((events) => {
        if (!live) return
        setState({ ...splitEvents(events), loading: false, failed: false })
      })
      .catch(() => {
        // A database hiccup shouldn't take the page down. Fall through to
        // the same empty state we'd show if nothing were scheduled.
        if (live) setState({ upcoming: [], past: [], loading: false, failed: true })
      })

    return () => { live = false }
  }, [])

  return state
}
