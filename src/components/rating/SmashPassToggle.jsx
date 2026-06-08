import React from 'react'
import { motion } from 'framer-motion'

export default function SmashPassToggle({ value, onChange }) {
  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onChange('smash')}
        className={`relative flex-1 py-5 rounded-xl border-2 transition-all text-center overflow-hidden ${
          value === 'smash'
            ? 'border-primary bg-primary/20 shadow-sm'
            : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
        }`}
      >
        {value === 'smash' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-primary/10 rounded-xl"
          />
        )}
        <span className={`relative text-3xl block mb-2 transition-transform ${value === 'smash' ? 'scale-110' : ''}`}>
          🥃
        </span>
        <span className={`relative text-sm font-bold uppercase tracking-widest ${
          value === 'smash' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          Smash
        </span>
        {value === 'smash' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <span className="text-[10px] text-primary-foreground font-bold">✓</span>
          </motion.div>
        )}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onChange('pass')}
        className={`relative flex-1 py-5 rounded-xl border-2 transition-all text-center overflow-hidden ${
          value === 'pass'
            ? 'border-destructive bg-destructive/15 shadow-sm'
            : 'border-border bg-card text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5'
        }`}
      >
        {value === 'pass' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-destructive/10 rounded-xl"
          />
        )}
        <span className={`relative text-3xl block mb-2 transition-transform ${value === 'pass' ? 'scale-110' : ''}`}>
          ❌
        </span>
        <span className={`relative text-sm font-bold uppercase tracking-widest ${
          value === 'pass' ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          Pass
        </span>
        {value === 'pass' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
          >
            <span className="text-[10px] text-white font-bold">✓</span>
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}
