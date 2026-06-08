import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import StageCard from '../components/lineup/StageCard'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { ChevronRight, Star, Lock } from 'lucide-react'

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

  // Stage 4 = index 4 (Whiskey 1 Round 2), 5, 6 = Round 2 whiskeys
  // Stage 7 = Mystery, Stage 8 = Final Results
  // Round 2 stages are indexes 4, 5, 6
  const getRound2Stage = (roundNumber) => {
    // round_number 1 → stage index 4, round_number 2 → stage 5, round_number 3 → stage 6
    return roundNumber + 3
  }

  const isRateable = (whiskey) => {
    const round2Stage = getRound2Stage(whiskey.round_number)
    return currentStage >= round2Stage
  }

  const isUpcoming = (whiskey) => {
    const round2Stage = getRound2Stage(whiskey.round_number)
    return currentStage < round2Stage
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
    await queryClient.invalidateQueries({ queryKey: ['eventState'] })
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-5 py-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Tonight's Format</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow along as the night unfolds</p>
        </motion.div>

        <div className="mt-6 mb-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <GoldDivider />

        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => {
            const roundOneMap = [1, 2, 3]
            let whiskeyName = null
            if (i < 3) {
              const w = whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[i])
              whiskeyName = w?.name || null
            } else if (i >= 4 && i <= 6) {
              const w = whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[i - 4])
              whiskeyName = w?.name || null
            }
            return <StageCard key={i} index={i} currentStage={currentStage} whiskeyName={whiskeyName} />
          })}
        </div>

        <GoldDivider />

        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">The Whiskeys</h2>
        <div className="space-y-3">
          {visibleWhiskeys.map((whiskey) => {
            const rateable = isRateable(whiskey)
            const upcoming = isUpcoming(whiskey)

            return (
              <motion.div
                key={whiskey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: rateable ? 0.98 : 1 }}
                onClick={() => {
                  if (rateable) {
                    navigate(`/rate/${whiskey.id}`)
                  } else {
                    navigate(`/whiskey/${whiskey.id}`)
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  rateable
                    ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/3 shadow-sm'
                    : 'border-border/50 bg-card/80'
                }`}
              >
                {/* Bottle image */}
                {whiskey.image_url ? (
                  <img src={whiskey.image_url} alt={whiskey.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground flex-shrink-0">🥃</div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-medium text-foreground truncate">{whiskey.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {whiskey.distillery} {whiskey.age && `· ${whiskey.age}`}
                  </p>
                  {whiskey.is_centrepiece && (
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-widest text-primary font-semibold">Centrepiece</span>
                  )}

                  {/* Status label */}
                  {rateable && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full"
                    >
                      <Star className="w-2.5 h-2.5" />
                      Rate Now
                    </motion.span>
                  )}
                  {upcoming && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" />
                      Rating opens Round 2
                    </span>
                  )}
                </div>

                {/* Right arrow */}
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
