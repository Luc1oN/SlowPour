import React, { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/ui/toast'
import { supabase } from './api/supabase'
import AppLayout from './pages/AppLayout'
import Welcome from './pages/Welcome'
import Lineup from './pages/Lineup'
import Leaderboard from './pages/Leaderboard'
import MysteryDram from './pages/MysteryDram'
import EventInfo from './pages/EventInfo'
import WhiskeyDetail from './pages/WhiskeyDetail'
import RateWhiskey from './pages/RateWhiskey'
import Admin from './pages/Admin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30 },
  },
})

function AppWithPing() {
  useEffect(() => {
    supabase.from('event_state').select('id').limit(1)
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/lineup" element={<Lineup />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/mystery" element={<MysteryDram />} />
          <Route path="/info" element={<EventInfo />} />
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
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppWithPing />
      </ToastProvider>
    </QueryClientProvider>
  )
}
