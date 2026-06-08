import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { ChevronRight, Star, Lock } from 'lucide-react'
import { stageLabels } from '../components/lineup/StageCard'

export default function Lineup() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()
  const navigate = useNavigate()

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
    initialData: [],
  })

  const currentStage = eventState.current_stage || 0
  const visibleWhiskeys = whiskeys.filter(w => !w.is_mystery)
  const progress = ((currentStage + 1) / 9) * 100

  const getRound2Stage = (roundNumber) => roundNumber + 3
  const isRateable = (whiskey) => currentStage >= getRound2Stage(whiskey.round_number)

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
    await queryClient.invalidateQueries({ queryKey: ['eventState'] })
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-5 py-8 max-w-lg mx-auto">

        {/* Slim stage strip */}
        <div className="bg-card border border-border/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Now</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <p className="font-heading font-semibold text-foreground text-sm mb-3">
            {stageLabels[currentStage]}
          </p>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Page title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground">The Whiskeys</h1>
          <p className="text-sm text-muted-foreground mt-1">Tap to explore · Rate unlocks in Round 2</p>
        </motion.div>

        <GoldDivider />

        {/* Whiskey cards */}
        <div className="space-y-3">
          {visibleWhiskeys.map((whiskey) => {
            const rateable = isRateable(whiskey)

            return (
              <motion.div
                key={whiskey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(rateable ? `/rate/${whiskey.id}` : `/whiskey/${whiskey.id}`)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  rateable
                    ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/3 shadow-sm'
                    : 'border-border/50 bg-card/80'
                }`}
              >
                {whiskey.image_url ? (
                  <img src={whiskey.image_url} alt={whiskey.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground flex-shrink-0">🥃</div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-heading font-medium text-foreground truncate">{whiskey.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {whiskey.distillery} {whiskey.age && `· ${whiskey.age}`}
                  </p>
                  {whiskey.is_centrepiece && (
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-widest text-primary font-semibold">Centrepiece</span>
                  )}
                  {rateable ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full"
                    >
                      <Star className="w-2.5 h-2.5" />
                      Rate Now
                    </motion.span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" />
                      Rating opens Round 2
                    </span>
                  )}
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${rateable ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
            )
          })}

          {visibleWhiskeys.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Whiskeys will appear here once added by the host.</p>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}
