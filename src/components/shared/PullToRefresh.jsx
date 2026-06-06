import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 72

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(null)
  const containerRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current
    if (el && el.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (startYRef.current === null || refreshing) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20))
    }
  }, [refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      await onRefresh()
      setRefreshing(false)
    }
    setPullDistance(0)
    startYRef.current = null
  }, [pullDistance, onRefresh])

  const progress = Math.min(pullDistance / THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: progress, height: pullDistance || (refreshing ? THRESHOLD : 0) }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : progress * 180 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : {}}
            >
              <RefreshCw
                className="w-5 h-5"
                style={{ color: `hsl(34 75% ${42 + (1 - progress) * 20}%)`, opacity: 0.4 + progress * 0.6 }}
                strokeWidth={2}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}
