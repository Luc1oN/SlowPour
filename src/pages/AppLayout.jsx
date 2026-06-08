import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, List, Trophy, Lock, Info, AlignJustify } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/lineup', icon: List, label: 'Whiskeys' },
  { path: '/leaderboard', icon: Trophy, label: 'Results' },
  { path: '/mystery', icon: Lock, label: 'Mystery' },
  { path: '/format', icon: AlignJustify, label: 'Format' },
  { path: '/info', icon: Info, label: 'Info' },
]

const tabHistories = {}

function getTabRoot(path) {
  const item = navItems.find(n =>
    n.path === path || (n.path !== '/' && path.startsWith(n.path + '/'))
  )
  return item ? item.path : '/'
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabRoot = getTabRoot(location.pathname)
  tabHistories[tabRoot] = location.pathname

const handleNavClick = (e, path) => {
  e.preventDefault()
  if (path === '/') {
    navigate('/', { replace: true })
    return
  }
  const isActive = location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path + '/'))
  if (isActive) {
    navigate(path, { replace: true })
  } else {
    const dest = tabHistories[path] || path
    navigate(dest)
  }
}

  return (
    <div className="bg-background font-body flex flex-col" style={{ minHeight: '100dvh' }}>
      <main className="flex-1 overflow-hidden" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full overflow-y-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path + '/'))
            return (
              <button
                key={path}
                onClick={(e) => handleNavClick(e, path)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-2 rounded-lg transition-colors flex-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
