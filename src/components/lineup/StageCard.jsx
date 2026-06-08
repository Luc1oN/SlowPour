import React from 'react'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'

export const stageLabels = [
  'Whiskey 1 – Round 1',
  'Whiskey 2 – Round 1',
  'Whiskey 3 – Round 1',
  'Break',
  'Whiskey 1 – Round 2',
  'Whiskey 2 – Round 2',
  'Whiskey 3 – Round 2',
  'Mystery Dram',
  'Final Results',
]

export default function StageCard({ index, currentStage, whiskeyName }) {
  const isPast = index < currentStage
  const isCurrent = index === currentStage
  const isFuture = index > currentStage
  const isBreak = stageLabels[index] === 'Break'
  const isFinal = stageLabels[index] === 'Final Results'
  const isMystery = stageLabels[index] === 'Mystery Dram'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isCurrent
          ? 'border-primary/50 bg-gradient-to-r from-primary/12 to-primary/4 shadow-sm'
          : isPast
          ? 'border-border/30 bg-secondary/30 opacity-60'
          : isBreak || isFinal
          ? 'border-border/20 bg-card/30'
          : 'border-border/40 bg-card/60'
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
        isCurrent
          ? 'bg-primary text-primary-foreground shadow-sm'
          : isPast
          ? 'bg-accent/70 text-accent-foreground'
          : isBreak || isFinal || isMystery
          ? 'bg-secondary text-muted-foreground'
          : 'bg-secondary border border-border text-muted-foreground'
      }`}>
        {isPast ? (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        ) : isMystery ? (
          <span>🔒</span>
        ) : isFinal ? (
          <span>🏆</span>
        ) : isBreak ? (
          <span>☕</span>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${
          isCurrent
            ? 'text-primary'
            : isPast
            ? 'text-muted-foreground'
            : isBreak || isFinal
            ? 'text-muted-foreground'
            : 'text-foreground'
        }`}>
          {stageLabels[index]}
        </p>
        {whiskeyName && (
          <p className={`text-xs mt-0.5 truncate ${
            isCurrent ? 'text-primary/70' : 'text-muted-foreground/60'
          }`}>
            {whiskeyName}
          </p>
        )}
      </div>

      {/* Right side */}
      {isCurrent && (
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Now</span>
        </div>
      )}
      {isPast && (
        <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground/50">Done</span>
      )}
    </motion.div>
  )
}
