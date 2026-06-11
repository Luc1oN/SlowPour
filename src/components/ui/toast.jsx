import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

// Module-level emitter so non-component code (e.g. the global
// mutation error handler) can raise toasts too.
let emit = null
export function notify(opts) {
  if (emit) emit(opts)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, variant = 'default' }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, title, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    emit = toast
    return () => { emit = null }
  }, [toast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-xs w-full" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`rounded-lg px-4 py-3 text-sm shadow-deep border ${
                t.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground border-destructive/50'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              {t.title}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
