import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { supabase } from '../api/supabase'
import { useEventState } from '../hooks/useEventState'
import { motion, AnimatePresence } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import Logo from '../components/shared/Logo'
import GlassFill, { PourBar } from '../components/shared/GlassFill'
import { RankBadge, Glencairn, PassMark } from '../components/icons/Icons'
import { LeaderboardSkeleton } from '../components/shared/Skeleton'
import { TrendingUp, TrendingDown, Flame, AlertTriangle, Share2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useToast } from '../components/ui/toast'
import { toPng } from 'html-to-image'

export default function Leaderboard() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()
  const { toast } = useToast()
  const summaryRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('ratings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ratings'] })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [queryClient])

  const { data: whiskeys = [], isLoading: wLoading } = useQuery({ queryKey: ['whiskeys'], queryFn: whiskeyApi.list })
  const { data: ratings = [], isLoading: rLoading } = useQuery({ queryKey: ['ratings'], queryFn: ratingsApi.list })
  const isLoading = wLoading || rLoading

  const stats = whiskeys
    .filter(w => !w.is_mystery || ratings.some(r => r.whiskey_id === w.id))
    .map(w => {
      const wRatings = ratings.filter(r => r.whiskey_id === w.id)
      const smashCount = wRatings.filter(r => r.smash_or_pass === 'smash').length
      const totalVotes = wRatings.length
      const avgScore = totalVotes > 0
        ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
        : 0
      const smashPct = totalVotes > 0 ? (smashCount / totalVotes) * 100 : 0
      return { ...w, totalVotes, smashCount, avgScore, smashPct, controversy: totalVotes > 0 ? Math.min(smashPct, 100 - smashPct) : 0 }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const topSmash = [...stats].sort((a, b) => b.smashPct - a.smashPct)[0]
  const mostControversial = [...stats].sort((a, b) => b.controversy - a.controversy)[0]
  const highestScore = stats[0]
  const lowestScore = stats[stats.length - 1]
  const guestNames = [...new Set(ratings.map(r => r.user_name))]
  const isFinished = eventState?.votes_locked

  const funStats = [
    { icon: Flame, label: 'Most Smashed', value: topSmash?.name, color: 'text-primary' },
    { icon: AlertTriangle, label: 'Most Controversial', value: mostControversial?.name, color: 'text-primary' },
    { icon: TrendingUp, label: 'Highest Average', value: highestScore ? `${highestScore.name} (${highestScore.avgScore.toFixed(1)})` : '-', color: 'text-primary' },
    { icon: TrendingDown, label: 'Lowest Average', value: lowestScore ? `${lowestScore.name} (${lowestScore.avgScore.toFixed(1)})` : '-', color: 'text-muted-foreground' },
  ]

  // Share the summary card as an image — group-chat gold.
  const handleShare = async () => {
    if (!summaryRef.current) return
    setSharing(true)
    try {
      const dataUrl = await toPng(summaryRef.current, {
        pixelRatio: 2,
        backgroundColor: 'hsl(25, 30%, 7%)',
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'slow-pour-results.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'The Slow Pour — Results', files: [file] })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'slow-pour-results.png'
        a.click()
        toast({ title: 'Results image downloaded' })
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast({ title: "Couldn't create the share image", variant: 'destructive' })
      }
    }
    setSharing(false)
  }

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">

      {/* End of Night Summary */}
      <AnimatePresence>
        {isFinished && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div
              ref={summaryRef}
              className="rounded-2xl border border-primary/30 overflow-hidden"
              style={{ background: 'linear-gradient(180deg, hsl(28 32% 11%), hsl(25 30% 7%))' }}
            >
              {/* Header */}
              <div className="px-5 pt-6 pb-4 text-center border-b border-primary/20">
                <div className="flex justify-center mb-3"><Logo className="w-44" /></div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary/70 mb-1">Final Results</p>
                {eventState?.event_date && <p className="text-sm text-muted-foreground">{eventState.event_date}</p>}
                {eventState?.event_location && <p className="text-xs text-muted-foreground">{eventState.event_location}</p>}
              </div>

              {/* Winner */}
              {stats[0] && (
                <div className="px-5 py-5 text-center border-b border-primary/20 candle-glow">
                  <p className="text-[11px] uppercase tracking-widest text-primary/70 mb-3">Tonight's Winner</p>
                  {stats[0].image_url && (
                    <img
                      src={stats[0].image_url}
                      alt={stats[0].name}
                      crossOrigin="anonymous"
                      className="h-32 object-contain mx-auto mb-3"
                      style={{ mixBlendMode: 'screen' }}
                    />
                  )}
                  <h3 className="font-heading text-3xl font-semibold text-foreground">{stats[0].name}</h3>
                  {stats[0].distillery && <p className="text-sm text-muted-foreground mt-0.5">{stats[0].distillery}</p>}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <GlassFill pct={(stats[0].avgScore / 10) * 100} className="w-12 h-16" />
                    <div className="text-left">
                      <span className="font-heading text-5xl font-bold text-primary num">{stats[0].avgScore.toFixed(1)}</span>
                      <span className="text-lg text-muted-foreground">/10</span>
                      <p className="text-xs text-muted-foreground num">{Math.round(stats[0].smashPct)}% smash · {stats[0].totalVotes} votes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Results */}
              <div className="px-5 py-4 border-b border-primary/20">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">All Results</p>
                <div className="space-y-2.5">
                  {stats.map((w, i) => (
                    <div key={w.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RankBadge rank={i + 1} className="w-7 h-7 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">{w.name}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted-foreground num">{Math.round(w.smashPct)}%</span>
                        <span className="font-heading font-semibold text-primary num">{w.avgScore.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div className="px-5 py-4 border-b border-primary/20">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                  Tonight's Tasters · {guestNames.length}
                </p>
                <p className="text-sm text-foreground">{guestNames.join(' · ')}</p>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 text-center">
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.25em]">The Slow Pour</p>
              </div>
            </div>

            <Button onClick={handleShare} disabled={sharing} className="w-full mt-4 h-12 font-heading text-base shadow-warm">
              <Share2 className="w-4 h-4 mr-2" />
              {sharing ? 'Preparing image…' : 'Share Results'}
            </Button>

            <GoldDivider />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Leaderboard</h1>
          {!isFinished ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Live</span>
            </div>
          ) : (
            <span className="text-[11px] uppercase tracking-widest text-primary font-medium">Final</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground num">{ratings.length} total ratings</p>
      </motion.div>

      <GoldDivider />

      {isLoading ? (
        <div className="space-y-3">
          <LeaderboardSkeleton /><LeaderboardSkeleton /><LeaderboardSkeleton />
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-card/50 border border-border/40 rounded-xl">
          <Glencairn className="w-8 h-8 mx-auto text-primary/40 mb-3" />
          <p className="text-sm text-muted-foreground">No ratings yet.<br />Be the first to pour your thoughts.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {stats.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl p-4 border ${
                  i === 0
                    ? 'bg-gradient-to-br from-primary/15 to-transparent border-primary/40 shadow-warm'
                    : 'bg-card border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <RankBadge rank={i + 1} className={i === 0 ? 'w-9 h-9' : 'w-8 h-8'} />
                    <div className="min-w-0">
                      <p className={`font-heading font-semibold truncate ${i === 0 ? 'text-xl text-foreground' : 'text-lg text-foreground'}`}>
                        {w.name}
                      </p>
                      <p className="text-xs text-muted-foreground num">{w.totalVotes} {w.totalVotes === 1 ? 'vote' : 'votes'}</p>
                    </div>
                  </div>
                  {/* the pour — score as a filling glass */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <GlassFill pct={(w.avgScore / 10) * 100} className={i === 0 ? 'w-11 h-14' : 'w-9 h-12'} delay={i * 0.08 + 0.2} />
                    <div className="text-right">
                      <span className={`font-heading font-bold text-primary num ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>
                        {w.avgScore.toFixed(1)}
                      </span>
                      <p className="text-[11px] text-muted-foreground">/10</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-primary flex items-center gap-1 w-14 num">
                    <Glencairn className="w-3 h-3" /> {Math.round(w.smashPct)}%
                  </span>
                  <PourBar pct={w.smashPct} delay={i * 0.08 + 0.3} />
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 w-14 justify-end num">
                    {Math.round(100 - w.smashPct)}% <PassMark className="w-3 h-3" />
                  </span>
                </div>

                {i === 0 && w.totalVotes > 0 && (
                  <p className="text-[11px] uppercase tracking-[0.25em] text-primary/70 mt-3 text-center font-medium">
                    Tonight's Favourite
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <GoldDivider />

          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Fun Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {funStats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-secondary/40 border border-border/40 rounded-lg p-3">
                <Icon className={`w-4 h-4 ${color} mb-1`} strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground mt-1 truncate">{value || '-'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
