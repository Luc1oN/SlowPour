import { useEffect } from 'react'

// Each route is served as its own HTML file with the right title already
// in place, so this only matters once someone starts navigating in-page.
export function useTitle(title, description) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
  }, [title, description])
}
