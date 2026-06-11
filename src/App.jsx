import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { ToastProvider, notify } from './components/ui/toast'
import ErrorBoundary from './components/ErrorBoundary'
import { supabase } from './api/supabase'
import AppLayout from './pages/AppLayout'
import Welcome from './pages/Welcome'
import Lineup from './pages/Lineup'
import Tonight from './pages/Tonight'
import Leaderboard from './pages/Leaderboard'
import MysteryDram from './pages/MysteryDram'
import WhiskeyDetail from './pages/WhiskeyDetail'
import RateWhiskey from './pages/RateWhiskey'
import Admin from './pages/Admin'
import Display from './pages/Display'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 30 },
    mutations: { retry: 1 },
  },
  // No silent failures: anything that doesn't save says so.
  mutationCache: new MutationCache({
    onError: () => notify({ title: "Couldn't save — check your connection and try again", variant: 'destructive' }),
  }),
})

function AppWithPing() {
  useEffect(() => {
    // warm the free-tier database on load
    supabase.from('event_state').select('id').limit(1)
  }, [])

  return (
    <HashRouter>
      <Routes>
        {/* Display mode — no nav, full screen */}
        <Route path="/display" element={<Display />} />

        {/* Main app */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/lineup" element={<Lineup />} />
          <Route path="/tonight" element={<Tonight />} />
          {/* legacy routes from v1 keep working */}
          <Route path="/format" element={<Navigate to="/tonight" replace />} />
          <Route path="/info" element={<Navigate to="/tonight" replace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/mystery" element={<MysteryDram />} />
          <Route path="/whiskey/:id" element={<WhiskeyDetail />} />
          <Route path="/rate/:id" element={<RateWhiskey />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <AppWithPing />
          </ToastProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
