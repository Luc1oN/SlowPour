import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Glencairn, Laurel } from '../components/icons/Icons'

function HomeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5" />
    </svg>
  )
}
function TonightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 13.5A7.5 7.5 0 1110.5 5a6 6 0 008.5 8.5z" />
    </svg>
  )
}

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/lineup', icon: Glencairn, label: 'Whiskeys' },
  { path: '/tonight', icon: TonightIcon, label: 'Tonight' },
  { path: '/leaderboard', icon: Laurel, label: 'Results' },
]

const subRoutes = { '/whiskey': '/lineup', '/rate': '/lineup', '/mystery': '/lineup' }

const tabHistories = {}

function getTabRoot(path) {
  for (const [prefix, root] of Object.entries(subRoutes)) {
    if (path.startsWith(prefix)) return root
  }
  const item = navItems.find(n => n.path === path || (n.path !== '/' && path.startsWith(n.path + '/')))
  return item ? item.path : '/'
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabRoot = getTabRoot(location.pathname)
  tabHistories[tabRoot] = location.pathname

  const handleNavClick = (path) => {
    if (path === '/') {
      navigate('/', { replace: true })
      return
    }
    const isActive = tabRoot === path
    if (isActive && location.pathname !== path) {
      navigate(path, { replace: true })
    } else if (!isActive) {
      const dest = tabHistories[path] || path
      navigate(dest)
    }
  }

  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="bg-background font-body flex flex-col" style={{ minHeight: '100dvh' }}>
      <main
        className="flex-1 overflow-hidden"
        style={{ paddingBottom: isAdmin ? 'env(safe-area-inset-bottom)' : 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full overflow-y-auto"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdmin && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Main"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-around">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = tabRoot === path
              return (
                <button
                  key={path}
                  onClick={() => handleNavClick(path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg transition-colors flex-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
