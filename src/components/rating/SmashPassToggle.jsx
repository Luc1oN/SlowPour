import React from 'react'
import { motion } from 'framer-motion'

export default function SmashPassToggle({ value, onChange }) {
  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange('smash')}
        className={`flex-1 py-4 rounded-lg border-2 transition-all text-center ${
          value === 'smash'
            ? 'border-primary bg-primary/15 text-primary'
            : 'border-border bg-secondary/50 text-muted-foreground hover:border-border'
        }`}
      >
        <span className="text-2xl block mb-1">🥃</span>
        <span className="text-sm font-semibold uppercase tracking-wider">Smash</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange('pass')}
        className={`flex-1 py-4 rounded-lg border-2 transition-all text-center ${
          value === 'pass'
            ? 'border-destructive bg-destructive/15 text-destructive'
            : 'border-border bg-secondary/50 text-muted-foreground hover:border-border'
        }`}
      >
        <span className="text-2xl block mb-1">❌</span>
        <span className="text-sm font-semibold uppercase tracking-wider">Pass</span>
      </motion.button>
    </div>
  )
}
