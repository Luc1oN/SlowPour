import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { supabase } from '../api/supabase'
import { useEventState } from '../hooks/useEventState'

const LOGO_URL = 'https://media.base44.com/images/public/69c2768139029255606813e3/8048bcdcd_ChatGPTImageApr13202610_13_31AM-Edited.png'

const stageLabels = [
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

// Welcome / between screens
function WelcomeScreen({ eventState }) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-16"
    >
      <motion.img
        src={LOGO_URL}
        alt="The Slow Pour"
        className="w-80 mb-12 opacity-90"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
      <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />
      {eventState?.event_date && (
        <p className="text-2xl text-foreground/70 mb-2 font-heading">{eventState.event_date}</p>
      )}
      {eventState?.event_location && (
        <p className="text-xl text-muted-foreground font-heading">{eventState.event_location}</p>
      )}
      <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-8 mb-10" />
      <p className="text-lg text-muted-foreground tracking-widest uppercase text-sm">Hosted by Shane</p>
    </motion.div>
  )
}

// Whiskey spotlight screen
function WhiskeyScreen({ whiskey, stage }) {
  const tastingNotes = [
    { label: 'Nose', value: whiskey.nose },
    { label: 'Palate', value: whiskey.palate },
    { label: 'Finish', value: whiskey.finish },
  ].filter(n => n.value)

  return (
    <motion.div
      key={`whiskey-${whiskey.id}-${stage}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.7 }}
      className="flex h-full w-full"
    >
      {/* Left — bottle image */}
      <div className="w-2/5 flex items-center justify-center p-16 border-r border-border/30">
        {whiskey.image_url ? (
          <motion.img
            src={whiskey.image_url}
            alt={whiskey.name}
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          />
        ) : (
          <span className="text-[12rem] opacity-20">🥃</span>
        )}
      </div>

      {/* Right — details */}
      <div className="w-3/5 flex flex-col justify-center px-16 py-12">
        {/* Now tasting label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4 font-medium"
        >
          ✦ Now Tasting — {stageLabels[stage]}
        </motion.p>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-heading text-6xl font-semibold text-foreground leading-tight mb-2"
        >
          {whiskey.name}
        </motion.h1>

        {/* Distillery */}
        {whiskey.distillery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-heading text-2xl text-muted-foreground mb-8"
          >
            {whiskey.distillery}
            {whiskey.age && ` · ${whiskey.age}`}
          </motion.p>
        )}

        {/* Details row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6 mb-8"
        >
          {[
            { label: 'ABV', value: whiskey.abv },
            { label: 'Type', value: whiskey.type },
            { label: 'Cask', value: whiskey.cask_type },
          ].filter(d => d.value).map(({ label, value }) => (
            <div key={label} className="bg-secondary/60 rounded-xl px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
              <p className="text-lg font-medium text-foreground">{value}</p>
            </div>
          ))}
          {whiskey.is_centrepiece && (
            <div className="bg-primary/15 border border-primary/30 rounded-xl px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Tonight</p>
              <p className="text-lg font-medium text-primary">Centrepiece</p>
            </div>
          )}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-8" />

        {/* Tasting notes */}
        {tastingNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            {tastingNotes.map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <span className="text-[10px] uppercase tracking-widest text-primary w-14 mt-1 flex-shrink-0">{label}</span>
                <p className="text-lg text-foreground/80 leading-snug">{value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Description */}
        {whiskey.description && !tastingNotes.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-foreground/70 leading-relaxed"
          >
            {whiskey.description}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

// Break screen
function BreakScreen({ ratings, whiskeys }) {
  const stats = whiskeys.map(w => {
    const wRatings = ratings.filter(r => r.whiskey_id === w.id)
    const totalVotes = wRatings.length
    const avgScore = totalVotes > 0
      ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
      : null
    return { ...w, avgScore, totalVotes }
  }).filter(w => w.avgScore !== null).sort((a, b) => b.avgScore - a.avgScore)

  return (
    <motion.div
      key="break"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-20"
    >
      <p className="text-6xl mb-6">☕</p>
      <h1 className="font-heading text-6xl font-semibold text-foreground mb-4">Break Time</h1>
      <p className="text-xl text-muted-foreground mb-16">Round 2 coming up shortly</p>

      {stats.length > 0 && (
        <>
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-12" />
          <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-8">Round 1 So Far</p>
          <div className="flex gap-8">
            {stats.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="text-center bg-card border border-border/50 rounded-2xl px-8 py-6 min-w-[180px]"
              >
                <p className="text-3xl mb-2">{['🥇', '🥈', '🥉'][i] || `#${i+1}`}</p>
                <p className="font-heading text-lg font-semibold text-foreground mb-1">{w.name}</p>
                <p className="font-heading text-4xl font-bold text-primary">{w.avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">{w.totalVotes} votes</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// Mystery screen
function MysteryScreen({ whiskey, revealed }) {
  if (!revealed) {
    return (
      <motion.div
        key="mystery-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <motion.div
          animate={{ rotate: [0, -3, 3, -3, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
          className="text-[8rem] mb-8"
        >
          🔒
        </motion.div>
        <h1 className="font-heading text-7xl font-semibold text-foreground mb-6">Mystery Dram</h1>
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8" />
        <p className="font-heading text-2xl italic text-primary/70">"Not all stories are told at the start."</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="mystery-revealed"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex h-full w-full"
    >
      <div className="w-2/5 flex items-center justify-center p-16 border-r border-border/30">
        {whiskey?.image_url ? (
          <motion.img
            src={whiskey.image_url}
            alt={whiskey.name}
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          />
        ) : (
          <span className="text-[12rem] opacity-20">🥃</span>
        )}
      </div>
      <div className="w-3/5 flex flex-col justify-center px-16 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4"
        >
          ✦ Revealed — The Mystery Dram
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-heading text-6xl font-semibold text-foreground leading-tight mb-3"
        >
          {whiskey?.name}
        </motion.h1>
        {whiskey?.distillery && (
          <p className="font-heading text-2xl text-muted-foreground mb-8">
            {whiskey.distillery}{whiskey.age && ` · ${whiskey.age}`}
          </p>
        )}
        {whiskey?.mystery_reason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-6"
          >
            <p className="text-xs uppercase tracking-widest text-primary mb-2">Why This Was Chosen</p>
            <p className="text-xl text-foreground/80 leading-relaxed">{whiskey.mystery_reason}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Final results screen
function ResultsScreen({ whiskeys, ratings, eventState }) {
  const stats = whiskeys
    .filter(w => !w.is_mystery || ratings.some(r => r.whiskey_id === w.id))
    .map(w => {
      const wRatings = ratings.filter(r => r.whiskey_id === w.id)
      const totalVotes = wRatings.length
      const avgScore = totalVotes > 0
        ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
        : 0
      const smashPct = totalVotes > 0
        ? (wRatings.filter(r => r.smash_or_pass === 'smash').length / totalVotes) * 100
        : 0
      return { ...w, avgScore, totalVotes, smashPct }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const winner = stats[0]
  const guestNames = [...new Set(ratings.map(r => r.user_name))]

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full"
    >
      {/* Left — winner */}
      <div className="w-2/5 flex flex-col items-center justify-center p-12 border-r border-border/30 bg-gradient-to-b from-primary/8 to-transparent">
        <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-4">🏆 Tonight's Winner</p>
        {winner?.image_url && (
          <motion.img
            src={winner.image_url}
            alt={winner.name}
            className="h-48 object-contain mb-6 drop-shadow-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        )}
        <h2 className="font-heading text-4xl font-semibold text-foreground text-center mb-2">{winner?.name}</h2>
        {winner?.distillery && (
          <p className="text-lg text-muted-foreground text-center mb-6">{winner.distillery}</p>
        )}
        <div className="flex items-end gap-2">
          <span className="font-heading text-8xl font-bold text-primary">{winner?.avgScore.toFixed(1)}</span>
          <span className="text-2xl text-muted-foreground mb-3">/10</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{Math.round(winner?.smashPct || 0)}% Smash</p>
      </div>

      {/* Right — all results */}
      <div className="w-3/5 flex flex-col justify-center px-12 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-8">Final Results</p>
        <div className="space-y-4 mb-10">
          {stats.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-5 p-4 rounded-xl border ${
                i === 0 ? 'border-primary/40 bg-primary/8' : 'border-border/40 bg-card/60'
              }`}
            >
              <span className="text-3xl">{['🥇', '🥈', '🥉'][i] || `#${i+1}`}</span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-xl font-semibold text-foreground truncate">{w.name}</p>
                <p className="text-sm text-muted-foreground">{w.totalVotes} votes · {Math.round(w.smashPct)}% Smash</p>
              </div>
              <span className="font-heading text-3xl font-bold text-primary">{w.avgScore.toFixed(1)}</span>
            </motion.div>
          ))}
        </div>

        <div className="h-px bg-border/40 mb-6" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Tonight's Tasters · {guestNames.length}
        </p>
        <p className="text-lg text-foreground/70">{guestNames.join(' · ')}</p>
      </div>
    </motion.div>
  )
}

export default function Display() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('display-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_state' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eventState'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ratings'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whiskeys' }, () => {
        queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [queryClient])

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: whiskeyApi.list,
    initialData: [],
  })

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: ratingsApi.list,
    initialData: [],
  })

  const currentStage = eventState?.current_stage || 0

  // Work out what to show
  const getWhiskeyForStage = (stage) => {
    const roundOneMap = [1, 2, 3]
    if (stage < 3) return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stage])
    if (stage >= 4 && stage <= 6) return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stage - 4])
    if (stage === 7) return whiskeys.find(w => w.is_mystery)
    return null
  }

  const currentWhiskey = getWhiskeyForStage(currentStage)
  const isBreak = currentStage === 3
  const isMystery = currentStage === 7
  const isFinal = currentStage === 8
  const isWhiskeyStage = (currentStage < 3 || (currentStage >= 4 && currentStage <= 6))

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_hsl(34,60%,35%)_0%,_transparent_70%)]" />

      {/* Stage indicator — top right */}
      <div className="absolute top-6 right-8 text-[10px] uppercase tracking-widest text-muted-foreground/50 z-10">
        Stage {currentStage + 1} of 9
      </div>

      {/* Logo — top left */}
      <div className="absolute top-5 left-8 z-10">
        <img src={LOGO_URL} alt="The Slow Pour" className="h-10 opacity-40" />
      </div>

      {/* Main content */}
      <div className="h-full w-full pt-4">
        <AnimatePresence mode="wait">
          {isFinal ? (
            <ResultsScreen key="results" whiskeys={whiskeys} ratings={ratings} eventState={eventState} />
          ) : isMystery ? (
            <MysteryScreen key="mystery" whiskey={whiskeys.find(w => w.is_mystery)} revealed={eventState?.mystery_revealed} />
          ) : isBreak ? (
            <BreakScreen key="break" ratings={ratings} whiskeys={whiskeys.filter(w => !w.is_mystery)} />
          ) : isWhiskeyStage && currentWhiskey ? (
            <WhiskeyScreen key={`${currentWhiskey.id}-${currentStage}`} whiskey={currentWhiskey} stage={currentStage} />
          ) : (
            <WelcomeScreen key="welcome" eventState={eventState} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
