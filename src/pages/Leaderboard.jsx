import React, { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { supabase } from '../api/supabase'
import { useEventState } from '../hooks/useEventState'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion, AnimatePresence } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import { Trophy, TrendingUp, TrendingDown, Flame, AlertTriangle, Share2 } from 'lucide-react'
import { Button } from '../components/ui/button'

const LOGO_URL = 'https://media.base44.com/images/public/69c2768139029255606813e3/8048bcdcd_ChatGPTImageApr13202610_13_31AM-Edited.png'

export default function Leaderboard() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()
  const summaryRef = useRef(null)

  useEffect(() => {
    const channel = supabase
      .channel('ratings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ratings',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['ratings'] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [queryClient])

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
    await queryClient.invalidateQueries({ queryKey: ['ratings'] })
  }

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

      return {
        ...w, totalVotes, smashCount, avgScore, smashPct,
        controversy: totalVotes > 0 ? Math.min(smashPct, 100 - smashPct) : 0,
      }
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

  const medalEmoji = ['🥇', '🥈', '🥉']

  const handleShare = async () => {
    const winner = stats[0]
    const text = `🥃 The Slow Pour — ${eventState?.event_date || 'Whiskey Night'}\n\n` +
      `🏆 Winner: ${winner?.name} (${winner?.avgScore.toFixed(1)}/10)\n\n` +
      stats.map((w, i) => `${medalEmoji[i] || `#${i+1}`} ${w.name} — ${w.avgScore.toFixed(1)}/10 · ${Math.round(w.smashPct)}% Smash`).join('\n') +
      `\n\n${guestNames.length} tasters · ${ratings.length} ratings`

    if (navigator.share) {
      await navigator.share({ title: 'The Slow Pour Results', text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Results copied to clipboard!')
    }
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-5 py-8 max-w-lg mx-auto">

        {/* End of Night Summary */}
        <AnimatePresence>
          {isFinished && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              ref={summaryRef}
              className="mb-8"
            >
              {/* Summary Card */}
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-primary/3 overflow-hidden">
                {/* Header */}
                <div className="px-5 pt-6 pb-4 text-center border-b border-primary/20">
                  <img src={LOGO_URL} alt="The Slow Pour" className="w-28 mx-auto mb-4 opacity-90" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-1">Final Results</p>
                  <h2 className="font-heading text-2xl font-semibold text-foreground">Whiskey Night</h2>
                  {eventState?.event_date && (
                    <p className="text-sm text-muted-foreground mt-1">{eventState.event_date}</p>
                  )}
                  {eventState?.event_location && (
                    <p className="text-xs text-muted-foreground">{eventState.event_location}</p>
                  )}
                </div>

                {/* Winner */}
                {stats[0] && (
                  <div className="px-5 py-5 text-center border-b border-primary/20">
                    <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-2">🏆 Tonight's Winner</p>
                    {stats[0].image_url && (
                      <img
                        src={stats[0].image_url}
                        alt={stats[0].name}
                        className="h-32 object-contain mx-auto mb-3"
                      />
                    )}
                    <h3 className="font-heading text-2xl font-semibold text-foreground">{stats[0].name}</h3>
                    {stats[0].distillery && (
                      <p className="text-sm text-muted-foreground mt-0.5">{stats[0].distillery}</p>
                    )}
                    <div className="flex items-end justify-center gap-1 mt-3">
                      <span className="font-heading text-5xl font-bold text-primary">{stats[0].avgScore.toFixed(1)}</span>
                      <span className="text-lg text-muted-foreground mb-1">/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(stats[0].smashPct)}% Smash · {stats[0].totalVotes} votes
                    </p>
                  </div>
                )}

                {/* All Results */}
                <div className="px-5 py-4 border-b border-primary/20">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">All Results</p>
                  <div className="space-y-2">
                    {stats.map((w, i) => (
                      <div key={w.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{medalEmoji[i] || `#${i+1}`}</span>
                          <span className="text-sm font-medium text-foreground">{w.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{Math.round(w.smashPct)}% 🥃</span>
                          <span className="font-heading font-semibold text-primary">{w.avgScore.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div className="px-5 py-4 border-b border-primary/20">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Tonight's Tasters · {guestNames.length}
                  </p>
                  <p className="text-sm text-foreground">{guestNames.join(' · ')}</p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 text-center">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                    Whiskey Night – The Slow Pour
                  </p>
                </div>
              </div>

              {/* Share Button */}
              <Button
                onClick={handleShare}
                className="w-full mt-4 h-12 font-heading text-base"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>

              <GoldDivider />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h1 className="font-heading text-2xl font-semibold text-foreground">Leaderboard</h1>
            </div>
            {!isFinished && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
              </div>
            )}
            {isFinished && (
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Final</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{ratings.length} total ratings</p>
        </motion.div>

        <GoldDivider />

        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No ratings yet. Be the first to rate!</p>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {stats.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-xl p-4 border ${
                    i === 0
                      ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40 shadow-sm'
                      : i === 1
                      ? 'bg-card border-border/60'
                      : 'bg-card border-border/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medalEmoji[i] || `#${i + 1}`}</span>
                      <div>
                        <p className={`font-heading font-semibold ${i === 0 ? 'text-lg text-foreground' : 'text-base text-foreground'}`}>
                          {w.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{w.totalVotes} {w.totalVotes === 1 ? 'vote' : 'votes'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-heading font-bold text-primary ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>
                        {w.avgScore.toFixed(1)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">/10</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary w-10">🥃 {Math.round(w.smashPct)}%</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${w.smashPct}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-10 text-right">{Math.round(100 - w.smashPct)}% ❌</span>
                  </div>

                  {i === 0 && w.totalVotes > 0 && (
                    <p className="text-[10px] uppercase tracking-widest text-primary/70 mt-3 text-center font-medium">
                      ✦ Tonight's Favourite ✦
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            <GoldDivider />

            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Fun Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {funStats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-secondary/50 rounded-lg p-3">
                  <Icon className={`w-4 h-4 ${color} mb-1`} strokeWidth={1.5} />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">{value || '-'}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PullToRefresh>
  )
}
