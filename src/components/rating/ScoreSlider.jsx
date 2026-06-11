import React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { motion, AnimatePresence } from 'framer-motion'

// Score starts unset — no anchoring at 5. The first touch is a real choice.
export default function ScoreSlider({ value, onChange }) {
  const hasValue = value !== null && value !== undefined

  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="text-[11px] text-muted-foreground uppercase tracking-widest">Score</span>
        <AnimatePresence mode="wait">
          {hasValue ? (
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl font-semibold text-primary num leading-none"
            >
              {value}
            </motion.span>
          ) : (
            <motion.span
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground italic font-heading"
            >
              slide to score
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <SliderPrimitive.Root
        value={[hasValue ? value : 5]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        aria-label="Score out of ten"
        className="relative flex items-center select-none touch-none w-full py-3"
      >
        <SliderPrimitive.Track className="bg-secondary relative grow rounded-full h-2">
          {hasValue && (
            <SliderPrimitive.Range
              className="absolute rounded-full h-full"
              style={{ background: 'linear-gradient(90deg, hsl(30 70% 40%), hsl(42 75% 58%))' }}
            />
          )}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={`block w-7 h-7 rounded-full shadow-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer transition-colors ${
            hasValue ? 'bg-primary' : 'bg-secondary border-2 border-border'
          }`}
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between mt-1 text-[11px] text-muted-foreground num">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}
