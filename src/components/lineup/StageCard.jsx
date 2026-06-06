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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isCurrent
          ? 'border-primary/50 bg-primary/10'
          : isPast
          ? 'border-border/50 bg-secondary/50'
          : 'border-border/30 bg-card/50'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isCurrent
          ? 'bg-primary text-primary-foreground'
          : isPast
          ? 'bg-accent text-accent-foreground'
          : 'bg-secondary text-muted-foreground'
      }`}>
        {isPast ? (
          <Check className="w-4 h-4" strokeWidth={2} />
        ) : isFuture ? (
          <span className="text-xs font-medium">{index + 1}</span>
        ) : (
          <Circle className="w-3 h-3 fill-current" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${
          isCurrent ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground/70'
        }`}>
          {stageLabels[index]}
        </span>
        {whiskeyName && (
          <p className={`text-xs mt-0.5 truncate ${
            isCurrent ? 'text-primary/70' : 'text-muted-foreground/70'
          }`}>
            {whiskeyName}
          </p>
        )}
      </div>

      {isCurrent && (
        <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-primary font-semibold">
          Now
        </span>
      )}
    </motion.div>
  )
}
