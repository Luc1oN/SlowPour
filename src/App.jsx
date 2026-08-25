import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

// The marketing site loads eagerly — it's what a stranger arriving from
// Instagram gets, so it needs to be the smallest thing we can ship.
import MarketingLayout from './marketing/MarketingLayout'
import Home from './marketing/pages/Home'
import Events from './marketing/pages/Events'
import About from './marketing/pages/About'

// The tasting app is a separate chunk, fetched only when someone actually
// goes to /app. Marketing visitors never download it.
const AppRoutes = lazy(() => import('./AppRoutes'))

export default function App() {
  return (
    <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
            </Route>

            <Route
              path="/app/*"
              element={
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <AppRoutes />
                </Suspense>
              }
            />

            {/* Anything unrecognised goes home rather than to a dead end */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ErrorBoundary>
  )
}
