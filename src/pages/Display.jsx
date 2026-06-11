import React, { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { supabase } from '../api/supabase'
import { useEventState } from '../hooks/useEventState'
import Logo from '../components/shared/Logo'
import GlassFill from '../components/shared/GlassFill'
import { RankBadge, Glencairn, PocketWatch, WaxSeal, Laurel } from '../components/icons/Icons'
import { STAGES } from '../lib/stages'

const APP_URL = 'https://luc1on.github.io/SlowPour/'

// QR generated locally — no third-party service to fail mid-event.
function useQrCode() {
  const [qr, setQr] = useState(null)
  useEffect(() => {
    QRCode.toDataURL(APP_URL, {
      width: 480,
      margin: 2,
      color: { dark: '#171009', light: '#ead9bd' },
    }).then(setQr).catch(() => setQr(null))
  }, [])
  return qr
}

const formatSteps = [
  { Icon: Glencairn, label: 'Round 1', desc: 'Taste three whiskeys, take your notes' },
  { Icon: PocketWatch, label: 'Break', desc: 'Pause and reflect' },
  { Icon: Glencairn, label: 'Round 2', desc: 'Revisit all three and rate as you go' },
  { Icon: WaxSeal, label: 'Mystery Dram', desc: 'The seal is broken' },
  { Icon: Laurel, label: 'Final Results', desc: "Tonight's winner announced" },
]

function PreShowScreen({ eventState, qr }) {
  return (
    <motion.div
      key="preshow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full"
    >
      <div className="w-1/2 flex flex-col items-center justify-center p-16 border-r border-border/30 candle-glow">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <Logo className="w-[26rem]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          {eventState?.event_date && (
            <p className="font-heading text-2xl text-foreground/85">{eventState.event_date}</p>
          )}
          {eventState?.event_location && (
            <p className="font-heading text-xl text-muted-foreground">{eventState.event_location}</p>
          )}
          <p className="text-sm text-muted-foreground/70 uppercase tracking-[0.3em] pt-3">Hosted by Shane</p>
        </motion.div>

        <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-10 mb-10" />

        {qr && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <img src={qr} alt="Scan to join" className="w-40 h-40 rounded-2xl shadow-warm-lg" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">Scan to join</p>
          </motion.div>
        )}
      </div>

      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[11px] uppercase tracking-[0.4em] text-primary/70 mb-10"
        >
          Tonight's Format
        </motion.p>

        <div className="space-y-7">
          {formatSteps.map(({ Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-5"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center flex-shrink-0 text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">{label}</p>
                <p className="text-base text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 pt-8 border-t border-border/30 text-sm text-muted-foreground/60"
        >
          Scan the QR code or visit{' '}
          <span className="text-primary/70 font-medium">luc1on.github.io/SlowPour</span>
        </motion.p>
      </div>
    </motion.div>
  )
}

function WelcomeScreen({ eventState }) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-16 candle-glow"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-10"
      >
        <Logo className="w-[30rem]" />
      </motion.div>
      {eventState?.event_date && (
        <p className="font-heading text-3xl text-foreground/80 mb-2">{eventState.event_date}</p>
      )}
      {eventState?.event_location && (
        <p className="font-heading text-2xl text-muted-foreground">{eventState.event_location}</p>
      )}
      <p className="text-base text-muted-foreground/70 tracking-[0.3em] uppercase mt-8">Hosted by Shane</p>
    </motion.div>
  )
}

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
      <div className="w-2/5 flex items-center justify-center p-16 border-r border-border/30 candle-glow relative">
        {whiskey.image_url ? (
          <>
            <motion.img
              src={whiskey.image_url}
              alt={whiskey.name}
              className="max-h-full max-w-full object-contain relative z-10"
              style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.7))' }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-8 rounded-[100%] bg-primary/15 blur-xl" />
          </>
        ) : (
          <Glencairn className="w-56 h-56 text-primary/15" />
        )}
      </div>

      <div className="w-3/5 flex flex-col justify-center px-16 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm uppercase tracking-[0.4em] text-primary/70 mb-5 font-medium"
        >
          Now Tasting — {STAGES[stage]?.label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-heading text-7xl font-semibold text-foreground leading-[1.05] mb-3"
        >
          {whiskey.name}
        </motion.h1>
        {whiskey.distillery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-heading text-3xl italic text-muted-foreground mb-9"
          >
            {whiskey.distillery}{whiskey.age && ` · ${whiskey.age}`}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-5 mb-9"
        >
          {[
            { label: 'ABV', value: whiskey.abv },
            { label: 'Type', value: whiskey.type },
            { label: 'Cask', value: whiskey.cask_type },
          ].filter(d => d.value).map(({ label, value }) => (
            <div key={label} className="bg-secondary/60 border border-border/50 rounded-xl px-6 py-3.5">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-medium text-foreground">{value}</p>
            </div>
          ))}
          {whiskey.is_centrepiece && (
            <div className="bg-primary/15 border border-primary/30 rounded-xl px-6 py-3.5">
              <p className="text-[11px] uppercase tracking-widest text-primary mb-1">Tonight</p>
              <p className="text-xl font-medium text-primary">Centrepiece</p>
            </div>
          )}
        </motion.div>
        <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-9" />
        {tastingNotes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-5"
          >
            {tastingNotes.map(({ label, value }) => (
              <div key={label} className="flex gap-5">
                <span className="text-[11px] uppercase tracking-widest text-primary w-16 mt-1.5 flex-shrink-0">{label}</span>
                <p className="text-xl text-foreground/85 leading-snug">{value}</p>
              </div>
            ))}
          </motion.div>
        ) : whiskey.description ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl text-foreground/75 leading-relaxed font-heading"
          >
            {whiskey.description}
          </motion.p>
        ) : null}
      </div>
    </motion.div>
  )
}

function BreakScreen({ ratings, whiskeys }) {
  const stats = whiskeys
    .filter(w => !w.is_mystery)
    .map(w => {
      const wRatings = ratings.filter(r => r.whiskey_id === w.id)
      const totalVotes = wRatings.length
      const avgScore = totalVotes > 0
        ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
        : null
      return { ...w, avgScore, totalVotes }
    })
    .filter(w => w.avgScore !== null)
    .sort((a, b) => b.avgScore - a.avgScore)

  return (
    <motion.div
      key="break"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-20 candle-glow"
    >
      <PocketWatch className="w-20 h-20 text-primary/70 mb-6" />
      <h1 className="font-heading text-7xl font-semibold text-foreground mb-3">Break Time</h1>
      <p className="text-2xl text-muted-foreground font-heading italic mb-16">Take it slow — Round 2 is coming</p>
      {stats.length > 0 && (
        <>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/70 mb-10">Scores So Far</p>
          <div className="flex gap-8">
            {stats.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="text-center bg-card border border-border/60 rounded-2xl px-10 py-7 min-w-[200px] shadow-deep"
              >
                <div className="flex justify-center mb-3"><RankBadge rank={i + 1} className="w-10 h-10" /></div>
                <p className="font-heading text-xl font-semibold text-foreground mb-2">{w.name}</p>
                <div className="flex items-center justify-center gap-3">
                  <GlassFill pct={(w.avgScore / 10) * 100} className="w-9 h-12" delay={i * 0.15 + 0.3} />
                  <p className="font-heading text-5xl font-bold text-primary num">{w.avgScore.toFixed(1)}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2 num">{w.totalVotes} votes</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// The theatrical peak of the night: seal trembles, the room dims,
// golden light rises, the bottle emerges.
function MysteryScreen({ whiskey, revealed }) {
  if (!revealed) {
    return (
      <motion.div
        key="mystery-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.2 } }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <motion.div
          animate={{ rotate: [0, -3, 3, -3, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
          className="text-primary/70 mb-10"
        >
          <WaxSeal className="w-44 h-44" />
        </motion.div>
        <h1 className="font-heading text-8xl font-semibold text-foreground mb-8">Mystery Dram</h1>
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8" />
        <p className="font-heading text-3xl italic text-primary/70">"Not all stories are told at the start."</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="mystery-revealed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4 }}
      className="flex h-full w-full"
    >
      <div className="w-2/5 flex items-center justify-center p-16 border-r border-border/30 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 60%, hsl(38 60% 35% / 0.35), transparent 70%)' }}
        />
        {whiskey?.image_url ? (
          <motion.img
            src={whiskey.image_url}
            alt={whiskey.name}
            className="max-h-full max-w-full object-contain relative z-10"
            style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.7))' }}
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 2, ease: [0.22, 0.9, 0.3, 1] }}
          />
        ) : (
          <Glencairn className="w-56 h-56 text-primary/15" />
        )}
      </div>
      <div className="w-3/5 flex flex-col justify-center px-16 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-sm uppercase tracking-[0.4em] text-primary/70 mb-5"
        >
          Revealed — The Mystery Dram
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="font-heading text-7xl font-semibold text-foreground leading-[1.05] mb-4"
        >
          {whiskey?.name}
        </motion.h1>
        {whiskey?.distillery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="font-heading text-3xl italic text-muted-foreground mb-9"
          >
            {whiskey.distillery}{whiskey.age && ` · ${whiskey.age}`}
          </motion.p>
        )}
        {whiskey?.mystery_reason && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.9, duration: 0.8 }}
          >
            <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-8" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-4">Why this dram</p>
            <p className="font-heading text-3xl italic text-foreground/85 leading-relaxed">
              "{whiskey.mystery_reason}"
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function ResultsScreen({ whiskeys, ratings }) {
  const stats = whiskeys
    .map(w => {
      const wRatings = ratings.filter(r => r.whiskey_id === w.id)
      const totalVotes = wRatings.length
      const avgScore = totalVotes > 0
        ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
        : null
      const smashPct = totalVotes > 0
        ? (wRatings.filter(r => r.smash_or_pass === 'smash').length / totalVotes) * 100
        : 0
      return { ...w, avgScore, totalVotes, smashPct }
    })
    .filter(w => w.avgScore !== null)
    .sort((a, b) => b.avgScore - a.avgScore)

  const winner = stats[0]

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-20 candle-glow"
    >
      <Laurel className="w-16 h-16 text-primary mb-4" />
      <p className="text-sm uppercase tracking-[0.4em] text-primary/70 mb-2">Tonight's Winner</p>
      {winner ? (
        <>
          <h1 className="font-heading text-8xl font-semibold text-foreground mb-2 text-center leading-[1.05]">{winner.name}</h1>
          {winner.distillery && <p className="font-heading text-3xl italic text-muted-foreground mb-8">{winner.distillery}</p>}
          <div className="flex items-center gap-5 mb-14">
            <GlassFill pct={(winner.avgScore / 10) * 100} className="w-[4.2rem] h-[5.5rem]" delay={0.4} />
            <div>
              <span className="font-heading text-8xl font-bold text-primary num">{winner.avgScore.toFixed(1)}</span>
              <span className="text-3xl text-muted-foreground">/10</span>
              <p className="text-base text-muted-foreground num">{Math.round(winner.smashPct)}% smash · {winner.totalVotes} votes</p>
            </div>
          </div>
          <div className="flex gap-6">
            {stats.slice(0, 4).map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className={`text-center rounded-2xl px-8 py-5 min-w-[170px] border ${
                  i === 0 ? 'bg-primary/10 border-primary/40 shadow-warm' : 'bg-card border-border/60'
                }`}
              >
                <div className="flex justify-center mb-2"><RankBadge rank={i + 1} className="w-9 h-9" /></div>
                <p className="font-heading text-lg font-semibold text-foreground mb-1">{w.name}</p>
                <p className="font-heading text-3xl font-bold text-primary num">{w.avgScore.toFixed(1)}</p>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <p className="font-heading text-3xl text-muted-foreground italic">Awaiting the first ratings…</p>
      )}
    </motion.div>
  )
}

export default function Display() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()
  const qr = useQrCode()

  const { data: whiskeys = [] } = useQuery({ queryKey: ['whiskeys'], queryFn: whiskeyApi.list })
  const { data: ratings = [] } = useQuery({ queryKey: ['ratings'], queryFn: ratingsApi.list })

  useEffect(() => {
    const channel = supabase
      .channel('display-ratings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ratings'] })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [queryClient])

  const stage = eventState?.current_stage || 0
  const stageInfo = STAGES[stage]
  const nightStarted = eventState?.night_started

  let screen
  if (!nightStarted) {
    screen = <PreShowScreen eventState={eventState} qr={qr} />
  } else if (stageInfo?.type === 'tasting') {
    // Primary lookup: match round_number field to slot number
    // Fallback: use sorted position (handles null/wrong round_number in DB)
    const nonMystery = whiskeys
      .filter(w => !w.is_mystery)
      .sort((a, b) => (a.round_number || 99) - (b.round_number || 99))
    const whiskey =
      nonMystery.find(w => w.round_number === stageInfo.slot) ||
      nonMystery[stageInfo.slot - 1] ||
      null
    screen = whiskey
      ? <WhiskeyScreen whiskey={whiskey} stage={stage} />
      : <WelcomeScreen eventState={eventState} />
  } else if (stageInfo?.type === 'break') {
    screen = <BreakScreen ratings={ratings} whiskeys={whiskeys} />
  } else if (stageInfo?.type === 'mystery') {
    const mystery = whiskeys.find(w => w.is_mystery)
    screen = <MysteryScreen whiskey={mystery} revealed={eventState?.mystery_revealed} />
  } else if (stageInfo?.type === 'results') {
    screen = <ResultsScreen whiskeys={whiskeys} ratings={ratings} />
  } else {
    screen = <WelcomeScreen eventState={eventState} />
  }

  return (
    <div className="h-screen w-screen bg-background font-body overflow-hidden">
      <AnimatePresence mode="wait">{screen}</AnimatePresence>
    </div>
  )
}
