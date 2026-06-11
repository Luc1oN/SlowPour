import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import GlassFill from '../components/shared/GlassFill'
import { WhiskeyCardSkeleton } from '../components/shared/Skeleton'
import { useEventState } from '../hooks/useEventState'
import { ChevronRight } from 'lucide-react'
import { Glencairn, WaxSeal } from '../components/icons/Icons'
import { STAGES, LAST_STAGE, isRateable } from '../lib/stages'

export default function Lineup() {
  const { eventState } = useEventState()
  const navigate = useNavigate()

  const { data: whiskeys = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
  })

  const currentStage = eventState.current_stage || 0
  const visibleWhiskeys = whiskeys.filter(w => !w.is_mystery)
  const mystery = whiskeys.find(w => w.is_mystery)
  const progressPct = (currentStage / LAST_STAGE) * 100

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">

      {/* Stage strip — the pour fills as the night progresses */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-deep flex items-center gap-4">
        <GlassFill pct={progressPct} className="w-9 h-12 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">Now</p>
          <p className="font-heading font-semibold text-foreground text-base leading-tight">
            {STAGES[currentStage]?.label}
          </p>
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {STAGES.map(s => (
            <span
              key={s.id}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                s.id < currentStage ? 'bg-primary/40' : s.id === currentStage ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Page title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">The Whiskeys</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap to explore · rating unlocks in Round 2</p>
      </motion.div>

      <GoldDivider />

      {/* Whiskey cards */}
      <div className="space-y-3">
        {isLoading && (
          <>
            <WhiskeyCardSkeleton />
            <WhiskeyCardSkeleton />
            <WhiskeyCardSkeleton />
          </>
        )}

        {isError && !isLoading && (
          <div className="text-center py-8 bg-card border border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-3">Couldn't reach the cellar.</p>
            <button onClick={() => refetch()} className="text-sm text-primary font-medium">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && visibleWhiskeys.map((whiskey) => {
          const rateable = isRateable(whiskey, currentStage)
          return (
            <motion.div
              key={whiskey.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(rateable ? `/rate/${whiskey.id}` : `/whiskey/${whiskey.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(rateable ? `/rate/${whiskey.id}` : `/whiskey/${whiskey.id}`)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                rateable
                  ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-transparent shadow-warm'
                  : 'border-border/60 bg-card/80'
              }`}
            >
              {whiskey.image_url ? (
                <motion.img
                  layoutId={`bottle-${whiskey.id}`}
                  src={whiskey.image_url}
                  alt={whiskey.name}
                  className="w-12 h-16 object-contain rounded-lg flex-shrink-0"
                  style={{ mixBlendMode: 'screen' }}
                />
              ) : (
                <div className="w-12 h-16 bg-secondary rounded-lg flex items-center justify-center text-primary/50 flex-shrink-0">
                  <Glencairn className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg font-medium text-foreground truncate leading-tight">{whiskey.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {whiskey.distillery} {whiskey.age && `· ${whiskey.age}`}
                </p>
                {whiskey.is_centrepiece && (
                  <span className="inline-block mt-1 text-[11px] uppercase tracking-widest text-primary font-semibold">Centrepiece</span>
                )}
                {rateable ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full"
                  >
                    <Glencairn className="w-3 h-3" />
                    Rate Now
                  </motion.span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Rating opens Round 2
                  </span>
                )}
              </div>

              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${rateable ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
          )
        })}

        {/* The mystery dram — a sealed card until the reveal */}
        {!isLoading && !isError && mystery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={eventState.mystery_revealed ? { scale: 0.98 } : {}}
            onClick={() => eventState.mystery_revealed && navigate('/mystery')}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              eventState.mystery_revealed
                ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-transparent cursor-pointer shadow-warm'
                : 'border-border/40 bg-card/40 border-dashed'
            }`}
          >
            <div className="w-12 h-16 rounded-lg flex items-center justify-center text-primary/60 flex-shrink-0 bg-secondary/50">
              <WaxSeal className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-lg font-medium text-foreground leading-tight">
                {eventState.mystery_revealed ? mystery.name : 'The Mystery Dram'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 italic font-heading text-sm">
                {eventState.mystery_revealed ? 'Revealed — tap to read its story' : '"Not all stories are told at the start."'}
              </p>
            </div>
            {eventState.mystery_revealed && <ChevronRight className="w-4 h-4 flex-shrink-0 text-primary" />}
          </motion.div>
        )}

        {!isLoading && !isError && visibleWhiskeys.length === 0 && (
          <div className="text-center py-10 bg-card/50 border border-border/40 rounded-xl">
            <Glencairn className="w-8 h-8 mx-auto text-primary/40 mb-3" />
            <p className="text-sm text-muted-foreground">The lineup is being decanted.<br />Whiskeys appear here once the host adds them.</p>
          </div>
        )}
      </div>
    </div>
  )
}
