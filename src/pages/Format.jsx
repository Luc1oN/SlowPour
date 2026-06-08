import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import PullToRefresh from '../components/shared/PullToRefresh'
import { motion } from 'framer-motion'
import StageCard from '../components/lineup/StageCard'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'

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
    if (stageIndex < 3) {
      return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stageIndex])
    } else if (stageIndex >= 4 && stageIndex <= 6) {
      return whiskeys.find(w => !w.is_mystery && w.round_number === roundOneMap[stageIndex - 4])
    }
    return null
  }

  const isStageClickable = (stageIndex) => getWhiskeyForStage(stageIndex) !== null

  const handleStageClick = (stageIndex) => {
    const whiskey = getWhiskeyForStage(stageIndex)
    if (whiskey) navigate(`/whiskey/${whiskey.id}`)
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
            const whiskey = getWhiskeyForStage(i)
            const clickable = isStageClickable(i)
            return (
              <div
                key={i}
                onClick={() => clickable && handleStageClick(i)}
                className={clickable ? 'cursor-pointer' : ''}
              >
                <StageCard
                  index={i}
                  currentStage={currentStage}
                  whiskeyName={whiskey?.name || null}
                  clickable={clickable}
                />
              </div>
            )
          })}
        </div>
      </div>
    </PullToRefresh>
  )
}
