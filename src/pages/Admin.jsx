import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { supabase } from '../api/supabase'
import { useEventState } from '../hooks/useEventState'
import { Button } from '../components/ui/button'
import { Input, Textarea, Label } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import GoldDivider from '../components/shared/GoldDivider'
import { useToast } from '../components/ui/toast'
import { STAGES, LAST_STAGE } from '../lib/stages'
import { Glencairn, PassMark } from '../components/icons/Icons'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Eye, Upload,
  Lock, Unlock, KeyRound, Download, CheckCircle2, AlertCircle,
} from 'lucide-react'

const emptyWhiskey = {
  name: '', distillery: '', age: '', abv: '', type: '', cask_type: '',
  description: '', nose: '', palate: '', finish: '', image_url: '',
  round_number: 1, is_mystery: false, is_centrepiece: false, mystery_reason: '',
}

// ─────────────────────────────────────────────────────────
// Auth — real Supabase sign-in. The database itself is
// protected by RLS; this is no longer just a UI curtain.
// ─────────────────────────────────────────────────────────
function useSession() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  return session
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setPending(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setPending(false)
    if (err) setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password' : err.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 candle-glow">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <KeyRound className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">Host Access</h1>
        <p className="text-sm text-muted-foreground mb-8">Sign in with your host account</p>
        <GoldDivider />
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="text-center h-12"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`text-center h-12 ${error ? 'border-destructive' : ''}`}
            autoComplete="current-password"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={pending} className="w-full h-12 font-heading text-lg">
            {pending ? 'Signing in…' : 'Enter'}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
          The host account is created in the Supabase dashboard —<br />see SETUP.md, step 2.
        </p>
      </div>
    </div>
  )
}

// Debounced inputs: typing event details no longer fires a
// database write per keystroke.
function DebouncedInput({ value, onCommit, placeholder }) {
  const [local, setLocal] = useState(value || '')
  const timer = useRef(null)

  useEffect(() => { setLocal(value || '') }, [value])

  const handleChange = (e) => {
    const v = e.target.value
    setLocal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onCommit(v), 700)
  }

  return (
    <Input
      placeholder={placeholder}
      value={local}
      onChange={handleChange}
      onBlur={() => { clearTimeout(timer.current); onCommit(local) }}
    />
  )
}

function Checklist({ whiskeys, eventState }) {
  const nonMystery = whiskeys.filter(w => !w.is_mystery)
  const items = [
    { ok: nonMystery.length >= 3, label: `${nonMystery.length} of 3 whiskeys added` },
    { ok: whiskeys.length > 0 && whiskeys.every(w => w.image_url), label: 'Every whiskey has an image' },
    { ok: whiskeys.some(w => w.is_mystery), label: 'Mystery dram set' },
    { ok: whiskeys.some(w => w.is_centrepiece), label: 'Centrepiece chosen' },
    { ok: !!eventState.event_date, label: 'Event date set' },
    { ok: !!eventState.event_location, label: 'Location set' },
  ]
  const ready = items.every(i => i.ok)

  return (
    <div className={`rounded-xl border p-4 mb-6 ${ready ? 'border-accent/50 bg-accent/5' : 'border-border/60 bg-card'}`}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
        {ready ? 'Ready for the night' : 'Pre-night checklist'}
      </p>
      <div className="grid grid-cols-1 gap-1.5">
        {items.map(({ ok, label }) => (
          <div key={label} className="flex items-center gap-2">
            {ok
              ? <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />}
            <span className={`text-xs ${ok ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminPanel() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { eventState, updateEventState } = useEventState()
  const [editingWhiskey, setEditingWhiskey] = useState(null)
  const [form, setForm] = useState(emptyWhiskey)
  const [uploading, setUploading] = useState(false)

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
  })

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: ratingsApi.list,
    refetchInterval: 5000,
  })

  const createWhiskey = useMutation({
    mutationFn: whiskeyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
      setForm(emptyWhiskey)
      setEditingWhiskey(null)
      toast({ title: 'Whiskey added' })
    },
  })

  const updateWhiskey = useMutation({
    mutationFn: ({ id, data }) => whiskeyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
      setForm(emptyWhiskey)
      setEditingWhiskey(null)
      toast({ title: 'Whiskey updated' })
    },
  })

  const deleteWhiskey = useMutation({
    mutationFn: whiskeyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
      toast({ title: 'Whiskey removed' })
    },
  })

  const deleteRating = useMutation({
    mutationFn: ratingsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ratings'] }),
  })

  const clearAllRatings = async () => {
    await Promise.all(ratings.map(r => ratingsApi.delete(r.id)))
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    toast({ title: 'All ratings cleared' })
  }

  const clearWhiskeyRatings = async (whiskeyId, whiskeyName) => {
    const toDelete = ratings.filter(r => r.whiskey_id === whiskeyId)
    await Promise.all(toDelete.map(r => ratingsApi.delete(r.id)))
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    toast({ title: `Ratings cleared for ${whiskeyName}` })
  }

  // Insurance policy: the night's data, downloadable in one tap.
  const exportCSV = () => {
    const header = ['whiskey', 'guest', 'smash_or_pass', 'score', 'flavour_tags', 'notes', 'created_at']
    const rows = ratings.map(r => {
      const w = whiskeys.find(x => x.id === r.whiskey_id)
      const cells = [
        w?.name || r.whiskey_id, r.user_name, r.smash_or_pass, r.score,
        (r.flavour_tags || []).join('; '), r.notes || '', r.created_at || '',
      ]
      return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `slow-pour-ratings-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast({ title: 'Ratings exported' })
  }

  const handleSave = () => {
    if (!form.name) {
      toast({ title: 'Name is required', variant: 'destructive' })
      return
    }
    if (editingWhiskey) {
      updateWhiskey.mutate({ id: editingWhiskey, data: form })
    } else {
      createWhiskey.mutate(form)
    }
  }

  const handleEdit = (w) => {
    setEditingWhiskey(w.id)
    setForm({
      name: w.name || '', distillery: w.distillery || '', age: w.age || '',
      abv: w.abv || '', type: w.type || '', cask_type: w.cask_type || '',
      description: w.description || '', nose: w.nose || '', palate: w.palate || '',
      finish: w.finish || '', image_url: w.image_url || '',
      round_number: w.round_number || 1, is_mystery: w.is_mystery || false,
      is_centrepiece: w.is_centrepiece || false, mystery_reason: w.mystery_reason || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    e.target.value = ''
    try {
      const url = await whiskeyApi.uploadImage(file)
      setForm(prev => ({ ...prev, image_url: url }))
    } catch {
      toast({ title: 'Image upload failed', variant: 'destructive' })
    }
    setUploading(false)
  }

  const currentStage = eventState?.current_stage || 0

  // v1 bug fixed: arrows can now reach the final stage.
  const advanceStage = (dir) => {
    const next = Math.max(0, Math.min(LAST_STAGE, currentStage + dir))
    updateEventState({ current_stage: next })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Host Admin</h1>
        <button
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Sign out
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Manage the night</p>

      <GoldDivider />

      <Checklist whiskeys={whiskeys} eventState={eventState} />

      {/* Stage Control */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Current Stage</p>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => advanceStage(-1)} disabled={currentStage === 0} aria-label="Previous stage">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <p className="font-heading font-semibold text-foreground">{STAGES[currentStage]?.label}</p>
            <p className="text-xs text-muted-foreground num">Stage {currentStage + 1} of {STAGES.length}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => advanceStage(1)} disabled={currentStage === LAST_STAGE} aria-label="Next stage">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => updateEventState({ current_stage: stage.id })}
              className={`px-2 py-1.5 rounded-lg text-[10px] uppercase tracking-wide font-medium transition-all border ${
                stage.id === currentStage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lock Votes */}
      <div className={`bg-card border rounded-xl p-4 mb-4 transition-colors ${eventState?.votes_locked ? 'border-destructive/50' : 'border-border/60'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {eventState?.votes_locked
              ? <Lock className="w-4 h-4 text-destructive" strokeWidth={1.5} />
              : <Unlock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Votes</p>
              <p className="text-sm text-foreground mt-0.5">
                {eventState?.votes_locked ? 'Locked — no edits allowed' : 'Open — guests can edit'}
              </p>
            </div>
          </div>
          <Switch
            checked={eventState?.votes_locked || false}
            onCheckedChange={(v) => updateEventState({ votes_locked: v })}
            aria-label="Lock votes"
          />
        </div>
      </div>

      {/* Mystery Reveal */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Mystery Dram</p>
            <p className="text-sm text-foreground mt-1">{eventState?.mystery_revealed ? 'Revealed' : 'Sealed'}</p>
          </div>
          <Switch
            checked={eventState?.mystery_revealed || false}
            onCheckedChange={(v) => updateEventState({ mystery_revealed: v })}
            aria-label="Reveal mystery dram"
          />
        </div>
      </div>

      {/* Night Live toggle — gates both the guest landing page and the display */}
      <div className={`bg-card border rounded-xl p-4 mb-4 transition-colors ${eventState?.night_started ? 'border-accent/50' : 'border-border/60'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Night Live</p>
            <p className="text-sm text-foreground mt-0.5">
              {eventState?.night_started
                ? 'Live — guests see "Enter Whiskey Night"'
                : 'Not started — guests see the format preview'}
            </p>
          </div>
          <Switch
            checked={eventState?.night_started || false}
            onCheckedChange={(v) => updateEventState({ night_started: v })}
            aria-label="Start the night on the display"
          />
        </div>
      </div>

      {/* Event Details — debounced, not write-per-keystroke */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 space-y-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Event Details</p>
        <DebouncedInput
          placeholder="Event date"
          value={eventState?.event_date}
          onCommit={(v) => v !== (eventState?.event_date || '') && updateEventState({ event_date: v })}
        />
        <DebouncedInput
          placeholder="Event location"
          value={eventState?.event_location}
          onCommit={(v) => v !== (eventState?.event_location || '') && updateEventState({ event_location: v })}
        />
      </div>

      <GoldDivider />

      {/* Live Ratings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground num">
              Live Ratings ({ratings.length}) · {new Set(ratings.map(r => r.user_name)).size} guests
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={exportCSV} className="text-xs h-7 px-2" disabled={ratings.length === 0}>
              <Download className="w-3 h-3 mr-1" /> CSV
            </Button>
            {ratings.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs h-7 px-2">
                    <Trash2 className="w-3 h-3 mr-1" /> Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all ratings?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes {ratings.length} rating{ratings.length === 1 ? '' : 's'} from {new Set(ratings.map(r => r.user_name)).size} guest{new Set(ratings.map(r => r.user_name)).size === 1 ? '' : 's'}. It cannot be undone — export the CSV first if you want a record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllRatings} className="bg-destructive text-destructive-foreground">
                      Delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="space-y-1">
          {whiskeys.map(w => {
            const wRatings = ratings.filter(r => r.whiskey_id === w.id)
            return (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="min-w-0">
                  <span className="text-sm text-foreground">{w.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wRatings.map(r => (
                      <span key={r.id} className="text-[10px] bg-secondary rounded px-1.5 py-0.5 text-muted-foreground flex items-center gap-1 num">
                        {r.user_name} ·
                        {r.smash_or_pass === 'smash'
                          ? <Glencairn className="w-2.5 h-2.5 text-primary" />
                          : <PassMark className="w-2.5 h-2.5 text-destructive" />}
                        {r.score}/10
                        <button onClick={() => deleteRating.mutate(r.id)} aria-label={`Delete ${r.user_name}'s rating`} className="text-destructive/60 hover:text-destructive ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground num">{wRatings.length}</span>
                  {wRatings.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-destructive/60 hover:text-destructive" aria-label={`Clear ratings for ${w.name}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear ratings for {w.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This deletes {wRatings.length} rating{wRatings.length === 1 ? '' : 's'} and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => clearWhiskeyRatings(w.id, w.name)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <GoldDivider />

      {/* Whiskey Form */}
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
        {editingWhiskey ? 'Edit Whiskey' : 'Add Whiskey'}
      </h2>
      <div className="space-y-3 mb-4">
        <Input placeholder="Bottle name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Distillery" value={form.distillery} onChange={(e) => setForm({ ...form, distillery: e.target.value })} />
          <Input placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="ABV" value={form.abv} onChange={(e) => setForm({ ...form, abv: e.target.value })} />
          <Input placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </div>
        <Input placeholder="Cask type" value={form.cask_type} onChange={(e) => setForm({ ...form, cask_type: e.target.value })} />
        <Textarea placeholder="Description / story" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[80px]" />
        <Input placeholder="Nose" value={form.nose} onChange={(e) => setForm({ ...form, nose: e.target.value })} />
        <Input placeholder="Palate" value={form.palate} onChange={(e) => setForm({ ...form, palate: e.target.value })} />
        <Input placeholder="Finish" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
        <Input type="number" placeholder="Round number" value={form.round_number} onChange={(e) => setForm({ ...form, round_number: parseInt(e.target.value) || 1 })} />

        <div>
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 block">Bottle Image</Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors text-sm text-foreground">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {form.image_url && <img src={form.image_url} className="w-10 h-14 object-contain rounded" alt="" style={{ mixBlendMode: 'screen' }} />}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_mystery} onCheckedChange={(v) => setForm({ ...form, is_mystery: v })} aria-label="Mystery dram" />
            <Label className="text-sm text-foreground">Mystery Dram</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_centrepiece} onCheckedChange={(v) => setForm({ ...form, is_centrepiece: v })} aria-label="Centrepiece" />
            <Label className="text-sm text-foreground">Centrepiece</Label>
          </div>
        </div>

        {form.is_mystery && (
          <Textarea placeholder="Why was this chosen?" value={form.mystery_reason} onChange={(e) => setForm({ ...form, mystery_reason: e.target.value })} className="min-h-[60px]" />
        )}
      </div>

      <div className="flex gap-3 mb-8">
        <Button onClick={handleSave} className="flex-1">
          <Plus className="w-4 h-4 mr-1" /> {editingWhiskey ? 'Update' : 'Add'} Whiskey
        </Button>
        {editingWhiskey && (
          <Button variant="outline" onClick={() => { setEditingWhiskey(null); setForm(emptyWhiskey) }}>Cancel</Button>
        )}
      </div>

      <GoldDivider />

      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Current Whiskeys</h2>
      <div className="space-y-3">
        {whiskeys.map(w => (
          <div key={w.id} className="flex items-center justify-between p-3 bg-card border border-border/60 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              {w.image_url ? (
                <img src={w.image_url} className="w-8 h-12 object-contain rounded flex-shrink-0" alt="" style={{ mixBlendMode: 'screen' }} />
              ) : (
                <div className="w-8 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0 text-primary/50">
                  <Glencairn className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {w.is_mystery ? 'Mystery' : w.is_centrepiece ? 'Centrepiece' : `Round ${w.round_number}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(w)}>Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${w.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {w.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the whiskey from the lineup. Its ratings remain until cleared.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteWhiskey.mutate(w.id)} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hooks-order violation from v1 fixed: this component renders
// one of two children — neither branch skips hooks.
export default function Admin() {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return session ? <AdminPanel /> : <AdminLogin />
}
