import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { useEventState } from '../hooks/useEventState'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import GoldDivider from '../components/shared/GoldDivider'
import { ArrowLeft, Droplets } from 'lucide-react'

export default function WhiskeyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { eventState } = useEventState()

  const { data: whiskeys = [], isLoading } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: whiskeyApi.list,
    initialData: [],
  })

  const whiskey = whiskeys.find(w => w.id === id)
  const currentStage = eventState?.current_stage || 0

  // Round 2 stage for this whiskey — round_number 1 = stage 4, 2 = stage 5, 3 = stage 6
  const round2Stage = whiskey ? whiskey.round_number + 3 : 99
  const isRateable = currentStage >= round2Stage

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!whiskey) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-muted-foreground">Whiskey not found</p>
        <Button variant="ghost" className="mt-4 text-primary" onClick={() => navigate('/lineup')}>
          Back to Lineup
        </Button>
      </div>
    )
  }

  const details = [
    { label: 'Distillery', value: whiskey.distillery },
    { label: 'Age', value: whiskey.age },
    { label: 'ABV', value: whiskey.abv },
    { label: 'Type', value: whiskey.type },
    { label: 'Cask', value: whiskey.cask_type },
  ].filter(d => d.value)

  const tastingNotes = [
    { label: 'Nose', value: whiskey.nose },
    { label: 'Palate', value: whiskey.palate },
    { label: 'Finish', value: whiskey.finish },
  ].filter(n => n.value)

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {whiskey.image_url && (
          <div className="flex justify-center mb-6">
            <img src={whiskey.image_url} alt={whiskey.name} className="h-56 object-contain rounded-lg" />
          </div>
        )}

        <h1 className="font-heading text-3xl font-semibold text-foreground">{whiskey.name}</h1>
        {whiskey.is_centrepiece && (
          <span className="inline-block mt-2 text-[10px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
            Centrepiece
          </span>
        )}

        <GoldDivider />

        <div className="grid grid-cols-2 gap-3">
          {details.map(({ label, value }) => (
            <div key={label} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-1">{value}</p>
            </div>
          ))}
        </div>

        {whiskey.description && (
          <>
            <GoldDivider />
            <p className="text-sm text-muted-foreground leading-relaxed">{whiskey.description}</p>
          </>
        )}

        {tastingNotes.length > 0 && (
          <>
            <GoldDivider />
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h2 className="font-heading text-lg font-semibold text-foreground">Tasting Notes</h2>
            </div>
            <div className="space-y-3">
              {tastingNotes.map(({ label, value }) => (
                <div key={label} className="bg-card border border-border/50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-widest text-primary mb-1">{label}</p>
                  <p className="text-sm text-foreground/80">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 mb-4">
          {isRateable ? (
            <Button
              onClick={() => navigate(`/rate/${whiskey.id}`)}
              className="w-full h-12 font-heading text-base"
            >
              Rate This Whiskey
            </Button>
          ) : (
            <div className="w-full h-12 rounded-lg border border-border/40 bg-secondary/30 flex items-center justify-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Rating opens in Round 2</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
