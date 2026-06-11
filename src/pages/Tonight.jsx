import React from 'react'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import Logo from '../components/shared/Logo'
import { useEventState } from '../hooks/useEventState'
import { STAGES } from '../lib/stages'
import { Glencairn, PocketWatch, WaxSeal, Laurel } from '../components/icons/Icons'
import { MapPin, Calendar, User, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '../components/ui/alert-dialog'

function RepeatIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 01-4 4H3" />
    </svg>
  )
}

const stageIcon = {
  tasting: Glencairn,
  break: PocketWatch,
  mystery: WaxSeal,
  results: Laurel,
}

export default function Tonight() {
  const { eventState } = useEventState()
  const currentStage = eventState.current_stage || 0

  const infoItems = [
    { icon: User, label: 'Host', value: 'Shane' },
    { icon: Calendar, label: 'Date', value: eventState.event_date || 'TBC' },
    { icon: MapPin, label: 'Location', value: eventState.event_location || 'TBC' },
  ]

  const handleReset = () => {
    localStorage.removeItem('whiskey_night_user_name')
    window.location.hash = '#/'
    window.location.reload()
  }

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-2"
      >
        <Logo className="w-56" style={{ mixBlendMode: "screen" }} />
      </motion.div>

      <GoldDivider />

      {/* Event info */}
      <div className="space-y-3 mb-2">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 bg-card border border-border/60 rounded-xl p-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <GoldDivider />

      {/* The format */}
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-1">The Format</h2>
      <p className="text-sm text-muted-foreground mb-5">How the night unfolds</p>

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.type === 'tasting' && stage.round === 2 ? RepeatIcon : stageIcon[stage.type]
          const isPast = stage.id < currentStage
          const isCurrent = stage.id === currentStage
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-primary/50 bg-gradient-to-r from-primary/12 to-transparent shadow-warm'
                  : isPast
                  ? 'border-border/30 bg-secondary/20 opacity-55'
                  : 'border-border/50 bg-card/60'
              }`}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                isCurrent ? 'bg-primary text-primary-foreground' : isPast ? 'bg-accent/60 text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {isPast ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />}
              </div>
              <p className={`flex-1 text-sm font-medium ${isCurrent ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.label}
              </p>
              {isCurrent && (
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">Now</span>
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      <GoldDivider />

      {/* Reset identity */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full text-muted-foreground text-xs">
            Change my name / reset this device
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset this device?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be asked for your name again. Your submitted ratings are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
