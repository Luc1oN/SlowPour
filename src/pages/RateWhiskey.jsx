import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/input'
import SmashPassToggle from '../components/rating/SmashPassToggle'
import ScoreSlider from '../components/rating/ScoreSlider'
import FlavourTags from '../components/rating/FlavourTags'
import GoldDivider from '../components/shared/GoldDivider'
import { useUserName } from '../hooks/useUserName'
import { useEventState } from '../hooks/useEventState'
import { useToast } from '../components/ui/toast'
import { ArrowLeft, Check, Lock } from 'lucide-react'

export default function RateWhiskey() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { userName } = useUserName()
  const { eventState } = useEventState()

  const [smashOrPass, setSmashOrPass] = useState('')
  const [score, setScore] = useState(5)
  const [flavourTags, setFlavourTags] = useState([])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existingRatingId, setExistingRatingId] = useState(null)

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: whiskeyApi.list,
    initialData: [],
  })

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: ratingsApi.list,
    initialData: [],
  })

  const whiskey = whiskeys.find(w => w.id === id)

  useEffect(() => {
    if (!userName || ratings.length === 0) return
    const existing = ratings.find(r => r.whiskey_id === id && r.user_name === userName)
    if (existing) {
      setExistingRatingId(existing.id)
      setSmashOrPass(existing.smash_or_pass || '')
      setScore(existing.score || 5)
      setFlavourTags(existing.flavour_tags || [])
      setNotes(existing.notes || '')
    }
  }, [ratings, userName, id])

  const createRating = useMutation({
    mutationFn: ratingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      setSubmitted(true)
    },
  })

  const updateRating = useMutation({
    mutationFn: ({ ratingId, data }) => ratingsApi.update(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      setSubmitted(true)
    },
  })

  const handleSubmit = () => {
    if (!smashOrPass) {
      toast({ title: 'Choose Smash or Pass', variant: 'destructive' })
      return
    }
    if (!userName) {
      toast({ title: 'Please set your name on the home page', variant: 'destructive' })
      navigate('/')
      return
    }

    const ratingData = {
      whiskey_id: id,
      user_name: userName,
      smash_or_pass: smashOrPass,
      score,
      flavour_tags: flavourTags,
      notes,
    }

    if (existingRatingId) {
      updateRating.mutate({ ratingId: existingRatingId, data: ratingData })
    } else {
      createRating.mutate(ratingData)
    }
  }

  const isLocked = eventState?.votes_locked
  const isPending = createRating.isPending || updateRating.isPending

  if (isLocked) {
    const myRating = ratings.find(r => r.whiskey_id === id && r.user_name === userName)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">Votes Locked</h2>
          <p className="text-sm text-muted-foreground mb-6">The host has locked in the votes. Ratings can no longer be changed.</p>
          {myRating && (
            <div className="bg-card border border-border/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Rating</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{myRating.smash_or_pass === 'smash' ? '🥃 Smash' : '❌ Pass'}</span>
                <span className="font-heading text-xl font-semibold text-primary">{myRating.score}/10</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/lineup')}>Lineup</Button>
            <Button onClick={() => navigate('/leaderboard')}>View Results</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-accent-foreground" />
          </div>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
            {existingRatingId ? 'Rating Updated' : 'Rating Submitted'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Your thoughts on {whiskey?.name} have been recorded.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/lineup')}>Back to Lineup</Button>
            <Button onClick={() => navigate('/leaderboard')}>View Results</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {existingRatingId ? 'Update Rating' : 'Rate'} {whiskey?.name || 'Whiskey'}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">Rating as {userName}</p>
          {existingRatingId && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Editing previous rating</span>
          )}
        </div>

        <GoldDivider />

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Smash or Pass?</p>
          <SmashPassToggle value={smashOrPass} onChange={setSmashOrPass} />
        </div>

        <div className="mb-6">
          <ScoreSlider value={score} onChange={setScore} />
        </div>

        <GoldDivider />

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Flavour Notes</p>
          <FlavourTags selected={flavourTags} onChange={setFlavourTags} />
        </div>

        <GoldDivider />

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Your Thoughts</p>
          <Textarea
            placeholder="Write your thoughts…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="w-full h-12 font-heading text-base">
          {isPending ? 'Saving…' : existingRatingId ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </motion.div>
    </div>
  )
}
