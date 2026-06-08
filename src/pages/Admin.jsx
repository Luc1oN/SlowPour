import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whiskeyApi } from '../api/whiskeys'
import { ratingsApi } from '../api/ratings'
import { useEventState } from '../hooks/useEventState'
import { Button } from '../components/ui/button'
import { Input, Textarea, Label } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import GoldDivider from '../components/shared/GoldDivider'
import { useToast } from '../components/ui/toast'
import { stageLabels } from '../components/lineup/StageCard'
import { Plus, Trash2, ChevronLeft, ChevronRight, Eye, Upload, Lock, Unlock, KeyRound } from 'lucide-react'

const ADMIN_PASSWORD = 'scproductions'
const STORAGE_KEY = 'slowpour_admin_auth'

const emptyWhiskey = {
  name: '', distillery: '', age: '', abv: '', type: '', cask_type: '',
  description: '', nose: '', palate: '', finish: '', image_url: '',
  round_number: 1, is_mystery: false, is_centrepiece: false, mystery_reason: '',
}

function AdminLogin() {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      window.location.reload()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <KeyRound className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">Host Access</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter the admin password to continue</p>
        <GoldDivider />
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`text-center h-12 ${error ? 'border-destructive' : ''}`}
          />
          {error && <p className="text-xs text-destructive">Incorrect password</p>}
          <Button onClick={handleSubmit} className="w-full h-12 font-heading text-lg">
            Enter
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const isAuthed = localStorage.getItem(STORAGE_KEY) === 'true'
  if (!isAuthed) return <AdminLogin />

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { eventState, updateEventState } = useEventState()
  const [editingWhiskey, setEditingWhiskey] = useState(null)
  const [form, setForm] = useState(emptyWhiskey)
  const [uploading, setUploading] = useState(false)

  const { data: whiskeys = [] } = useQuery({
    queryKey: ['whiskeys'],
    queryFn: () => whiskeyApi.list('round_number'),
    initialData: [],
  })

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: ratingsApi.list,
    initialData: [],
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whiskeys'] }),
  })

  const deleteRating = useMutation({
    mutationFn: ratingsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ratings'] }),
  })

  const clearAllRatings = async () => {
    if (!window.confirm('Clear ALL ratings? This cannot be undone.')) return
    await Promise.all(ratings.map(r => ratingsApi.delete(r.id)))
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    toast({ title: 'All ratings cleared' })
  }

  const clearWhiskeyRatings = async (whiskeyId, whiskeyName) => {
    if (!window.confirm(`Clear all ratings for ${whiskeyName}?`)) return
    const toDelete = ratings.filter(r => r.whiskey_id === whiskeyId)
    await Promise.all(toDelete.map(r => ratingsApi.delete(r.id)))
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    toast({ title: `Ratings cleared for ${whiskeyName}` })
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
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    e.target.value = ''
    try {
      const url = await whiskeyApi.uploadImage(file)
      setForm(prev => ({ ...prev, image_url: url }))
    } catch (err) {
      toast({ title: 'Image upload failed', variant: 'destructive' })
    }
    setUploading(false)
  }

  const currentStage = eventState?.current_stage || 0

  const advanceStage = (dir) => {
    const next = Math.max(0, Math.min(7, currentStage + dir))
    updateEventState({ current_stage: next })
  }

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Host Admin</h1>
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload() }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Lock
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Manage the night</p>

      <GoldDivider />

      {/* Stage Control */}
      <div className="bg-card border border-border/50 rounded-lg p-4 mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Current Stage</p>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => advanceStage(-1)} disabled={currentStage === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <p className="font-heading font-semibold text-foreground">{stageLabels[currentStage]}</p>
            <p className="text-xs text-muted-foreground">Stage {currentStage + 1} of 8</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => advanceStage(1)} disabled={currentStage === 7}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lock Votes */}
      <div className={`bg-card border rounded-lg p-4 mb-4 transition-colors ${eventState?.votes_locked ? 'border-destructive/50' : 'border-border/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {eventState?.votes_locked
              ? <Lock className="w-4 h-4 text-destructive" strokeWidth={1.5} />
              : <Unlock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            }
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Votes</p>
              <p className="text-sm text-foreground mt-0.5">
                {eventState?.votes_locked ? 'Locked – no edits allowed' : 'Open – users can edit'}
              </p>
            </div>
          </div>
          <Switch
            checked={eventState?.votes_locked || false}
            onCheckedChange={(v) => updateEventState({ votes_locked: v })}
          />
        </div>
      </div>

      {/* Mystery Reveal */}
      <div className="bg-card border border-border/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Mystery Dram</p>
            <p className="text-sm text-foreground mt-1">{eventState?.mystery_revealed ? 'Revealed' : 'Hidden'}</p>
          </div>
          <Switch
            checked={eventState?.mystery_revealed || false}
            onCheckedChange={(v) => updateEventState({ mystery_revealed: v })}
          />
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-card border border-border/50 rounded-lg p-4 mb-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Event Details</p>
        <Input
          placeholder="Event date"
          value={eventState?.event_date || ''}
          onChange={(e) => updateEventState({ event_date: e.target.value })}
        />
        <Input
          placeholder="Event location"
          value={eventState?.event_location || ''}
          onChange={(e) => updateEventState({ event_location: e.target.value })}
        />
      </div>

      <GoldDivider />

      {/* Live Ratings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Live Ratings ({ratings.length}) · {new Set(ratings.map(r => r.user_name)).size} guests
            </p>
          </div>
          {ratings.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllRatings} className="text-destructive hover:text-destructive text-xs h-7 px-2">
              <Trash2 className="w-3 h-3 mr-1" /> Clear All
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {whiskeys.map(w => {
            const wRatings = ratings.filter(r => r.whiskey_id === w.id)
            return (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <span className="text-sm text-foreground">{w.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wRatings.map(r => (
                      <span key={r.id} className="text-[10px] bg-secondary rounded px-1.5 py-0.5 text-muted-foreground flex items-center gap-1">
                        {r.user_name} · {r.smash_or_pass === 'smash' ? '🥃' : '❌'} {r.score}/10
                        <button onClick={() => deleteRating.mutate(r.id)} className="text-destructive/60 hover:text-destructive ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">{wRatings.length}</span>
                  {wRatings.length > 0 && (
                    <button onClick={() => clearWhiskeyRatings(w.id, w.name)} className="text-destructive/60 hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <GoldDivider />

      {/* Whiskey Form */}
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
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
          <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Bottle Image</Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors text-sm text-foreground">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {form.image_url && <img src={form.image_url} className="w-10 h-14 object-cover rounded" alt="" />}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_mystery} onCheckedChange={(v) => setForm({ ...form, is_mystery: v })} />
            <Label className="text-sm text-foreground">Mystery Dram</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_centrepiece} onCheckedChange={(v) => setForm({ ...form, is_centrepiece: v })} />
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

      <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Current Whiskeys</h2>
      <div className="space-y-3">
        {whiskeys.map(w => (
          <div key={w.id} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              {w.image_url ? (
                <img src={w.image_url} className="w-8 h-12 object-cover rounded flex-shrink-0" alt="" />
              ) : (
                <div className="w-8 h-12 bg-secondary rounded flex items-center justify-center text-xs flex-shrink-0">🥃</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {w.is_mystery ? '🔒 Mystery' : w.is_centrepiece ? '⭐ Centrepiece' : `Round ${w.round_number}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(w)}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={() => deleteWhiskey.mutate(w.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
