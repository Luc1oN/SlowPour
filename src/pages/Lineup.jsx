import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import StageCard from '../components/lineup/StageCard'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { ChevronRight } from 'lucide-react'

export default function Lineup() {
  const queryClient = useQueryClient()
  const { eventState } = useEventState()

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
    initialData: [],
  })

  const visibleWhiskeys = whiskeys.filter(w => !w.is_mystery)
  const progress = ((eventState.current_stage + 1) / 9) * 100

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
            return <StageCard key={i} index={i} currentStage={eventState.current_stage || 0} whiskeyName={whiskeyName} />
          })}
        </div>

        <GoldDivider />

        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">The Whiskeys</h2>
        <div className="space-y-3">
          {visibleWhiskeys.map((whiskey) => (
            <Link key={whiskey.id} to={`/whiskey/${whiskey.id}`}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/80 hover:border-primary/30 transition-all"
              >
                {whiskey.image_url ? (
                  <img src={whiskey.image_url} alt={whiskey.name} className="w-12 h-16 object-cover rounded" />
                ) : (
                  <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center text-muted-foreground text-xs">🥃</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-medium text-foreground truncate">{whiskey.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{whiskey.distillery} {whiskey.age && `· ${whiskey.age}`}</p>
                  {whiskey.is_centrepiece && (
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-widest text-primary font-semibold">Centrepiece</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.div>
            </Link>
          ))}
          {visibleWhiskeys.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Whiskeys will appear here once added by the host.</p>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}
