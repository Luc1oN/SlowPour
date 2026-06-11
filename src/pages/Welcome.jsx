import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import GoldDivider from '../components/shared/GoldDivider'
import Logo from '../components/shared/Logo'
import { useUserName } from '../hooks/useUserName'
import { useEventState } from '../hooks/useEventState'

export default function Welcome() {
  const navigate = useNavigate()
  const { userName, saveName } = useUserName()
  const { eventState } = useEventState()
  const [name, setName] = useState(userName)

  const handleEnter = () => {
    if (name.trim()) {
      saveName(name.trim())
      navigate('/lineup')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 candle-glow">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6 flex justify-center"
        >
          <Logo className="w-72" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-1 text-sm text-muted-foreground mb-2"
        >
          <p className="font-medium text-foreground/80">Hosted by Shane</p>
          {eventState.event_date && <p>{eventState.event_date}</p>}
          {eventState.event_location && <p>{eventState.event_location}</p>}
        </motion.div>

        <GoldDivider />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm text-muted-foreground leading-relaxed mb-8"
        >
          Tonight we take things slow — exceptional whiskeys, good company,
          and a bit of craic. In Round 2 you'll rate each dram: Smash or Pass,
          a score out of ten, and your tasting notes. At the end we reveal the
          group favourite and the mystery dram.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="space-y-4"
        >
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center h-12"
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            aria-label="Your name"
          />
          <Button
            onClick={handleEnter}
            disabled={!name.trim()}
            className="w-full h-14 font-heading text-xl tracking-wide shadow-warm"
          >
            Enter Whiskey Night
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
