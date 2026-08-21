import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi, findMyRating } from '../api/ratings'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/input'
import SmashPassToggle from '../components/rating/SmashPassToggle'
import ScoreSlider from '../components/rating/ScoreSlider'
import FlavourTags from '../components/rating/FlavourTags'
import GoldDivider from '../components/shared/GoldDivider'
import GlassFill from '../components/shared/GlassFill'
import { useUserName } from '../hooks/useUserName'
import { getDeviceId } from '../hooks/useDeviceId'
import { useEventState } from '../hooks/useEventState'
import { useToast } from '../components/ui/toast'
import { ArrowLeft, Lock, Info } from 'lucide-react'

export default function RateWhiskey() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { userName } = useUserName()
  const { eventState } = useEventState()
  const deviceId = getDeviceId()

  const [smashOrPass, setSmashOrPass] = useState('')
  const [score, setScore] = useState(null)
  const [flavourTags, setFlavourTags] = useState([])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existingRatingId, setExistingRatingId] = useState(null)

  const { data: whiskeys = [] } = useQuery({ queryKey: ['whiskeys'], queryFn: () => whiskeyApi.list() })
  const { data: ratings = [] } = useQuery({ queryKey: ['ratings'], queryFn: ratingsApi.list })

  const whiskey = whiskeys.find(w => w.id === id)

  useEffect(() => {
    if (ratings.length === 0) return
    const existing = findMyRating(ratings, id, deviceId, userName)
    if (existing) {
      setExistingRatingId(existing.id)
      setSmashOrPass(existing.smash_or_pass || '')
      setScore(existing.score ?? null)
      setFlavourTags(existing.flavour_tags || [])
      setNotes(existing.notes || '')
    }
  }, [ratings, userName, deviceId, id])

  const onSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    if (navigator.vibrate) navigator.vibrate(12)
    setSubmitted(true)
  }

  const createRating = useMutation({ mutationFn: ratingsApi.create, onSuccess: onSaved })
  const updateRating = useMutation({
    mutationFn: ({ ratingId, data }) => ratingsApi.update(ratingId, data),
    onSuccess: onSaved,
  })

  const handleSubmit = () => {
    if (!smashOrPass) {
      toast({ title: 'Choose Smash or Pass', variant: 'destructive' })
      return
    }
    if (score === null) {
      toast({ title: 'Slide to give it a score', variant: 'destructive' })
      return
    }
    if (!userName) {
      toast({ title: 'Set your name on the home page first', variant: 'destructive' })
      navigate('/')
      return
    }

    const ratingData = {
      whiskey_id: id,
      user_name: userName,
      device_id: deviceId,
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

  if (isLocked && !submitted) {
    const myRating = findMyRating(ratings, id, deviceId, userName)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">Votes Locked</h2>
          <p className="text-sm text-muted-foreground mb-6">The host has locked in the votes. Ratings can no longer be changed.</p>
          {myRating && (
            <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Your rating</p>
                <p className="text-sm text-foreground capitalize">{myRating.smash_or_pass}</p>
              </div>
              <div className="flex items-center gap-2">
                <GlassFill pct={(myRating.score / 10) * 100} className="w-8 h-11" />
                <span className="font-heading text-2xl font-semibold text-primary num">{myRating.score}<span className="text-sm text-muted-foreground">/10</span></span>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate('/lineup')}>Lineup</Button>
            <Button variant="outline" onClick={() => navigate(`/whiskey/${id}`)}>
              <Info className="w-4 h-4 mr-1.5" /> Whiskey Info
            </Button>
            <Button onClick={() => navigate('/leaderboard')}>View Results</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 candle-glow">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          className="text-center"
        >
          {/* the pour — your score, poured */}
          <div className="flex justify-center mb-5">
            <GlassFill pct={((score ?? 5) / 10) * 100} className="w-20 h-28" delay={0.15} />
          </div>
          <h2 className="font-heading text-3xl font-semibold text-foreground mb-1">
            {existingRatingId ? 'Rating Updated' : 'Poured & Recorded'}
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            {whiskey?.name} — <span className="text-primary font-semibold num">{score}/10</span>
          </p>
          <p className="text-xs text-muted-foreground mb-8 italic font-heading text-base">Sláinte.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/lineup')}>Back to Lineup</Button>
            <Button onClick={() => navigate('/leaderboard')}>View Results</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Bottle hero */}
      {whiskey?.image_url ? (
        <div className="relative h-60 candle-glow flex items-center justify-center overflow-hidden">
          <motion.img
            layoutId={`bottle-${whiskey.id}`}
            src={whiskey.image_url}
            alt={whiskey.name}
            className="h-full object-contain py-5"
            style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      ) : (
        <div className="px-5 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      )}

      <div className="px-5 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-semibold text-foreground leading-tight">
            {whiskey?.name || 'Whiskey'}
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground">Rating as {userName}</p>
            {existingRatingId && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Editing previous rating</span>
            )}
          </div>

          <GoldDivider />

          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Smash or Pass?</p>
            <SmashPassToggle value={smashOrPass} onChange={setSmashOrPass} />
          </div>

          <div className="mb-6">
            <ScoreSlider value={score} onChange={setScore} />
          </div>

          <GoldDivider />

          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Flavour Notes</p>
            <FlavourTags selected={flavourTags} onChange={setFlavourTags} />
          </div>

          <GoldDivider />

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Your Thoughts</p>
            <Textarea
              placeholder="Write your thoughts…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              aria-label="Tasting notes"
            />
          </div>

          <Button onClick={handleSubmit} disabled={isPending} className="w-full h-13 py-3.5 font-heading text-lg shadow-warm">
            {isPending ? 'Pouring…' : existingRatingId ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
