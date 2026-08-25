import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import SignupSection from './components/SignupSection'

export default function MarketingLayout() {
  const { pathname, hash } = useLocation()

  // Client-side navigation should behave like a page load: top of the page,
  // unless the link pointed at an anchor.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                   focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <SignupSection />
      <Footer />
    </div>
  )
}
