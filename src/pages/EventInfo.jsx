import React, { useState } from 'react'
import { motion } from 'framer-motion'
import GoldDivider from '../components/shared/GoldDivider'
import { useEventState } from '../hooks/useEventState'
import { MapPin, Calendar, User, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '../components/ui/alert-dialog'

const LOGO_URL = 'https://media.base44.com/images/public/69c2768139029255606813e3/8048bcdcd_ChatGPTImageApr13202610_13_31AM-Edited.png'

export default function EventInfo() {
  const { eventState } = useEventState()
  const [deleted, setDeleted] = useState(false)

  const handleDeleteAccount = () => {
    localStorage.removeItem('whiskey_night_user_name')
    setDeleted(true)
    setTimeout(() => window.location.replace('/'), 800)
  }

  const infoItems = [
    { icon: User, label: 'Host', value: 'Shane' },
    { icon: Calendar, label: 'Date', value: eventState.event_date || 'TBC' },
    { icon: MapPin, label: 'Location', value: eventState.event_location || 'TBC' },
  ]

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex justify-center mb-8"
      >
        <img src={LOGO_URL} alt="The Slow Pour" className="w-64" />
      </motion.div>

      <GoldDivider />

      <div className="space-y-4 mb-8">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <GoldDivider />

      <h2 className="font-heading text-lg font-semibold text-foreground mb-3">How It Works</h2>
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="font-medium text-foreground mb-1">1. Taste</p>
          <p>Each round features a whiskey to sip and explore.</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="font-medium text-foreground mb-1">2. Rate</p>
          <p>Smash or Pass, score out of 10, and add flavour notes.</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="font-medium text-foreground mb-1">3. Reveal</p>
          <p>At the end, we reveal the group favourite and the mystery dram.</p>
        </div>
      </div>

      <GoldDivider />

      <p className="text-xs text-muted-foreground text-center mb-8">
        Whiskey Night – The Slow Pour · All rights reserved
      </p>

      <GoldDivider />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your saved name and local data. Your ratings already submitted remain on the host's records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleted ? 'Clearing…' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
