import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import { Trophy, TrendingUp, TrendingDown, Flame, AlertTriangle } from 'lucide-react'

export default function Leaderboard() {
  const queryClient = useQueryClient()

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
    refetchInterval: 5000,
  })

  const stats = whiskeys
    .filter(w => !w.is_mystery || ratings.some(r => r.whiskey_id === w.id))
    .map(w => {
      const wRatings = ratings.filter(r => r.whiskey_id === w.id)
      const smashCount = wRatings.filter(r => r.smash_or_pass === 'smash').length
      const passCount = wRatings.filter(r => r.smash_or_pass === 'pass').length
      const totalVotes = wRatings.length
      const avgScore = totalVotes > 0
        ? wRatings.reduce((sum, r) => sum + (r.score || 0), 0) / totalVotes
        : 0
      const smashPct = totalVotes > 0 ? (smashCount / totalVotes) * 100 : 0

      return {
        ...w, totalVotes, smashCount, passCount, avgScore, smashPct,
        controversy: totalVotes > 0 ? Math.min(smashPct, 100 - smashPct) : 0,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const topSmash = [...stats].sort((a, b) => b.smashPct - a.smashPct)[0]
  const mostControversial = [...stats].sort((a, b) => b.controversy - a.controversy)[0]
  const highestScore = stats[0]
  const lowestScore = stats[stats.length - 1]

  const funStats = [
    { icon: Flame, label: 'Most Smashed', value: topSmash?.name, color: 'text-primary' },
    { icon: AlertTriangle, label: 'Most Controversial', value: mostControversial?.name, color: 'text-accent' },
    { icon: TrendingUp, label: 'Highest Average', value: highestScore ? `${highestScore.name} (${highestScore.avgScore.toFixed(1)})` : '-', color: 'text-primary' },
    { icon: TrendingDown, label: 'Lowest Average', value: lowestScore ? `${lowestScore.name} (${lowestScore.avgScore.toFixed(1)})` : '-', color: 'text-muted-foreground' },
  ]

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-5 py-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="font-heading text-2xl font-semibold text-foreground">Leaderboard</h1>
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
                  className="bg-card border border-border/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-heading text-2xl font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-heading font-medium text-foreground">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.totalVotes} votes</p>
                      </div>
                    </div>
                    <span className="font-heading text-2xl font-bold text-primary">{w.avgScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary w-8">🥃 {Math.round(w.smashPct)}%</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${w.smashPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8">{Math.round(100 - w.smashPct)}%</span>
                  </div>
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
