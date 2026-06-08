import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import GoldDivider from '../components/shared/GoldDivider'
import { useUserName } from '../hooks/useUserName'
import { useEventState } from '../hooks/useEventState'

const LOGO_URL = 'https://media.base44.com/images/public/69c2768139029255606813e3/8048bcdcd_ChatGPTImageApr13202610_13_31AM-Edited.png'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <img src={LOGO_URL} alt="The Slow Pour" className="w-64 mx-auto mb-2" />
        </motion.div>

        <GoldDivider />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-2 text-sm text-muted-foreground mb-2"
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
          Welcome to Whiskey Night. Tonight we take things slow — four exceptional whiskeys,
          good company, and a bit of craic. After each round you will rate the whiskey:
          Smash or Pass, score out of 10, and optional tasting notes. At the end we will
          reveal the group favourite and the mystery dram.
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
          />
          <Button
            onClick={handleEnter}
            disabled={!name.trim()}
            className="w-full h-14 font-heading text-xl tracking-wide"
          >
            Enter Whiskey Night
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
