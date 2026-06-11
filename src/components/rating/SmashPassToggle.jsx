import React from 'react'
import { motion } from 'framer-motion'
import { Glencairn, PassMark } from '../icons/Icons'

export default function SmashPassToggle({ value, onChange }) {
  const options = [
    { key: 'smash', label: 'Smash', Icon: Glencairn, active: 'border-primary bg-primary/15 text-primary', check: 'bg-primary text-primary-foreground' },
    { key: 'pass', label: 'Pass', Icon: PassMark, active: 'border-destructive bg-destructive/10 text-destructive', check: 'bg-destructive text-white' },
  ]

  return (
    <div className="flex gap-3" role="radiogroup" aria-label="Smash or pass">
      {options.map(({ key, label, Icon, active, check }) => {
        const selected = value === key
        return (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(key)}
            role="radio"
            aria-checked={selected}
            className={`relative flex-1 py-5 rounded-xl border transition-all text-center ${
              selected ? `${active} shadow-warm` : 'border-border bg-card text-muted-foreground hover:border-primary/30'
            }`}
          >
            <motion.span
              animate={selected ? { scale: 1.12 } : { scale: 1 }}
              className="flex justify-center mb-2"
            >
              <Icon className="w-8 h-8" filled={key === 'smash' && selected} />
            </motion.span>
            <span className="text-sm font-semibold uppercase tracking-widest">{label}</span>
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${check}`}
              >
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5l2.5 2.5L10 3" /></svg>
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
