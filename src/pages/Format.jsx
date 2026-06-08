import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { Check, Circle, ChevronRight } from 'lucide-react'

const formatStages = [
  { label: 'Whiskey 1 – Round 1', emoji: '🥃', stageIndex: 0 },
  { label: 'Whiskey 2 – Round 1', emoji: '🥃', stageIndex: 1 },
  { label: 'Whiskey 3 – Round 1', emoji: '🥃', stageIndex: 2 },
  { label: 'Break', emoji: '☕', stageIndex: 3 },
  { label: 'Whiskey 1 – Round 2', emoji: '🔁', stageIndex: 4 },
  { label: 'Whiskey 2 – Round 2', emoji: '🔁', stageIndex: 5 },
  { label: 'Whiskey 3 – Round 2', emoji: '🔁', stageIndex: 6 },
  { label: 'Break', emoji: '☕', stageIndex: 6.5 },
  { label: 'Mystery Dram', emoji: '🔒', stageIndex: 7 },
  { label: 'Final Results', emoji: '🏆', stageIndex: 8 },
]

export default function Format() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()
  const navigate = useNavigate()

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
    initialData: [],
  })

  const currentStage = eventState.current_stage || 0
  const progress = ((currentStage + 1) / 9) * 100

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
    await queryClient.invalidateQueries({ queryKey: ['eventState'] })
  }

  const getWhiskeyForStage = (stageIndex) => {
    const roundOneMap = [1, 2, 3]
    if (stageIndex < 3) return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stageIndex])
    if (stageIndex >= 4 && stageIndex <= 6) return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stageIndex - 4])
    return null
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
          {formatStages.map((stage, i) => {
            const isPast = currentStage > stage.stageIndex
            const isCurrent = currentStage === stage.stageIndex
            const whiskey = getWhiskeyForStage(stage.stageIndex)
            const isBreak = stage.emoji === '☕'
            const clickable = whiskey !== null && whiskey !== undefined

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => clickable && navigate(`/whiskey/${whiskey.id}`)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-primary/50 bg-gradient-to-r from-primary/12 to-primary/4 shadow-sm'
                    : isPast
                    ? 'border-border/30 bg-secondary/30 opacity-60'
                    : isBreak
                    ? 'border-border/20 bg-card/30'
                    : 'border-border/40 bg-card/60'
                } ${clickable ? 'cursor-pointer hover:border-primary/30' : ''}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isPast
                    ? 'bg-accent/70 text-accent-foreground'
                    : 'bg-secondary border border-border text-muted-foreground'
                }`}>
                  {isPast ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <span>{stage.emoji}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {stage.label}
                  </p>
                  {whiskey && (
                    <p className={`text-xs mt-0.5 truncate ${
                      isCurrent ? 'text-primary/70' : 'text-muted-foreground/60'
                    }`}>
                      {whiskey.name}
                    </p>
                  )}
                </div>

                {/* Right */}
                {isCurrent && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Now</span>
                  </div>
                )}
                {!isCurrent && clickable && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                {isPast && !clickable && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 flex-shrink-0">Done</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </PullToRefresh>
  )
}
