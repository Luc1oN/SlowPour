import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { Lock, Droplets } from 'lucide-react'

export default function MysteryDram() {
  const navigate = useNavigate()
  const { eventState } = useEventState()

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: whiskeyApi.list,
    initialData: [],
  })

  const mysteryWhiskey = whiskeys.find(w => w.is_mystery)

  if (!eventState.mystery_revealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
            className="mb-6"
          >
            <Lock className="w-16 h-16 text-primary/60 mx-auto" strokeWidth={1} />
          </motion.div>
          <h1 className="font-heading text-3xl font-semibold text-foreground mb-3">Mystery Dram</h1>
          <GoldDivider />
          <p className="font-heading text-lg italic text-primary/80 mb-8">"Not all stories are told at the start."</p>
          <p className="text-sm text-muted-foreground">The host will reveal the mystery dram when the time is right. Stay tuned.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">Revealed</span>
            <h1 className="font-heading text-3xl font-semibold text-foreground mt-2">Mystery Dram</h1>
          </div>

          {mysteryWhiskey ? (
            <>
              {mysteryWhiskey.image_url && (
                <div className="flex justify-center mb-6">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    src={mysteryWhiskey.image_url}
                    alt={mysteryWhiskey.name}
                    className="h-48 object-contain rounded-lg"
                  />
                </div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <h2 className="font-heading text-2xl font-semibold text-primary text-center">{mysteryWhiskey.name}</h2>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {mysteryWhiskey.distillery} {mysteryWhiskey.age && `· ${mysteryWhiskey.age}`}
                </p>

                <GoldDivider />

                {mysteryWhiskey.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mysteryWhiskey.description}</p>
                )}

                {mysteryWhiskey.mystery_reason && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <p className="text-xs uppercase tracking-widest text-primary mb-1">Why This Was Chosen</p>
                    <p className="text-sm text-foreground/80">{mysteryWhiskey.mystery_reason}</p>
                  </div>
                )}

                {(mysteryWhiskey.nose || mysteryWhiskey.palate || mysteryWhiskey.finish) && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <h3 className="font-heading text-lg font-semibold text-foreground">Tasting Notes</h3>
                    </div>
                    <div className="space-y-3 mb-6">
                      {[
                        { label: 'Nose', value: mysteryWhiskey.nose },
                        { label: 'Palate', value: mysteryWhiskey.palate },
                        { label: 'Finish', value: mysteryWhiskey.finish },
                      ].filter(n => n.value).map(({ label, value }) => (
                        <div key={label} className="bg-card border border-border/50 rounded-lg p-4">
                          <p className="text-xs uppercase tracking-widest text-primary mb-1">{label}</p>
                          <p className="text-sm text-foreground/80">{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Button onClick={() => navigate(`/rate/${mysteryWhiskey.id}`)} className="w-full h-12 font-heading text-base">
                  Rate the Mystery Dram
                </Button>
              </motion.div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Mystery whiskey details coming soon…</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
