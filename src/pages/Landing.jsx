import React from 'react'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import Logo from '../components/shared/Logo'
import { Glencairn, PocketWatch, WaxSeal, Laurel } from '../components/icons/Icons'
import { FORMAT_OVERVIEW } from '../lib/stages'

function RepeatIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 01-4 4H3" />
    </svg>
  )
}

const stepIcon = {
  glencairn: Glencairn,
  watch: PocketWatch,
  repeat: RepeatIcon,
  seal: WaxSeal,
  laurel: Laurel,
}

// The "before the night" experience — shared with people ahead of the
// event. Mirrors the Display pre-show screen but mobile-first and
// vertical. Once the host flips "night_started" on, the Welcome page
// (Enter Whiskey Night) takes over this slot instead.
export default function Landing({ eventState }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-10 candle-glow">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mb-6"
      >
        <Logo className="w-64" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-center space-y-1 mb-2"
      >
        {eventState?.event_date && (
          <p className="font-heading text-2xl text-foreground/90">{eventState.event_date}</p>
        )}
        {eventState?.event_location && (
          <p className="font-heading text-lg text-muted-foreground">{eventState.event_location}</p>
        )}
        <p className="text-[11px] text-muted-foreground/70 uppercase tracking-[0.3em] pt-2">Hosted by Shane</p>
      </motion.div>

      <GoldDivider />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-sm text-muted-foreground leading-relaxed text-center max-w-sm mb-2"
      >
        Three exceptional whiskeys, good company, and a bit of craic.
        Here's how the night will unfold.
      </motion.p>

      <GoldDivider />

      <div className="w-full max-w-sm space-y-3">
        {FORMAT_OVERVIEW.map((step, i) => {
          const Icon = stepIcon[step.icon]
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
              className="flex items-center gap-4 p-3.5 rounded-xl border border-border/50 bg-card/60"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading text-lg font-medium text-foreground leading-tight">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <GoldDivider />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.25em] text-center"
      >
        The lineup will reveal closer to the night
      </motion.p>
    </div>
  )
}
