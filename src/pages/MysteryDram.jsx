import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { whiskeyApi } from '../api/whiskeys'
import { useEventState } from '../hooks/useEventState'
import GoldDivider from '../components/shared/GoldDivider'
import { WaxSeal } from '../components/icons/Icons'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function MysteryDram() {
  const navigate = useNavigate()
  const { eventState } = useEventState()
  const { data: whiskeys = [] } = useQuery({ queryKey: ['whiskeys'], queryFn: () => whiskeyApi.list() })
  const mystery = whiskeys.find(w => w.is_mystery)
  const revealed = eventState.mystery_revealed

  if (!revealed || !mystery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center candle-glow">
        <motion.div
          animate={{ rotate: [0, -3, 3, -3, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
          className="text-primary/70 mb-6"
        >
          <WaxSeal className="w-20 h-20" />
        </motion.div>
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-3">Mystery Dram</h1>
        <p className="font-heading text-lg italic text-primary/70 mb-8">"Not all stories are told at the start."</p>
        <Button variant="outline" onClick={() => navigate('/lineup')}>Back to Lineup</Button>
      </div>
    )
  }

  const details = [
    { label: 'Distillery', value: mystery.distillery },
    { label: 'Age', value: mystery.age },
    { label: 'ABV', value: mystery.abv },
    { label: 'Type', value: mystery.type },
    { label: 'Cask', value: mystery.cask_type },
  ].filter(d => d.value)

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary/70 mb-2">Revealed · The Mystery Dram</p>

        {mystery.image_url && (
          <div className="flex justify-center my-6 candle-glow rounded-2xl py-6">
            <img src={mystery.image_url} alt={mystery.name} className="h-56 object-contain" style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }} />
          </div>
        )}

        <h1 className="font-heading text-3xl font-semibold text-foreground">{mystery.name}</h1>
        {mystery.distillery && <p className="font-heading text-lg text-muted-foreground italic mt-1">{mystery.distillery}</p>}

        <GoldDivider />

        <div className="grid grid-cols-2 gap-3">
          {details.map(({ label, value }) => (
            <div key={label} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-1">{value}</p>
            </div>
          ))}
        </div>

        {mystery.mystery_reason && (
          <>
            <GoldDivider />
            <p className="text-[11px] uppercase tracking-widest text-primary mb-2">Why this dram</p>
            <p className="font-heading text-lg text-foreground/85 italic leading-relaxed">"{mystery.mystery_reason}"</p>
          </>
        )}

        {mystery.description && (
          <>
            <GoldDivider />
            <p className="text-sm text-muted-foreground leading-relaxed">{mystery.description}</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
