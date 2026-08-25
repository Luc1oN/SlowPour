import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { archivesApi } from '../../api/archives'
import { Button } from '../../components/ui/button'
import { Input, Label } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import { useToast } from '../../components/ui/toast'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '../../components/ui/alert-dialog'
import { Archive, Trash2, ChevronDown, ChevronUp, Trophy } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 10)

function fmt(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Standings({ standings = [] }) {
  if (!standings.length) return null
  return (
    <ol className="mt-3 space-y-1.5">
      {standings.map((s, i) => (
        <li key={s.whiskey_id || i} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-foreground">
            <span className="num mr-2 text-muted-foreground">{i + 1}.</span>
            {s.name}
            {s.is_mystery && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">mystery</span>
            )}
          </span>
          <span className="num flex-shrink-0 text-muted-foreground">
            {s.avg_score != null ? `${s.avg_score} · ${s.votes} vote${s.votes === 1 ? '' : 's'}` : 'not rated'}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function PastNights({ whiskeys = [], ratings = [] }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(today())
  const [createDraft, setCreateDraft] = useState(true)
  const [openId, setOpenId] = useState(null)

  const { data: archives = [], isLoading } = useQuery({
    queryKey: ['archives'],
    queryFn: archivesApi.list,
  })

  const hasLiveData = whiskeys.length > 0 || ratings.length > 0

  // The database refuses to clear anything newer than the last archive.
  // Mirror that here so the button reflects reality before it's pressed.
  const lastArchivedAt = archives[0]?.archived_at ? new Date(archives[0].archived_at) : null
  const newestRating = ratings.reduce(
    (max, r) => (r.created_at && new Date(r.created_at) > max ? new Date(r.created_at) : max),
    new Date(0),
  )
  const coveredByArchive =
    !!lastArchivedAt && (ratings.length === 0 || newestRating <= lastArchivedAt)

  const archive = useMutation({
    mutationFn: () => archivesApi.archiveNight({ title, eventDate, createEventDraft: createDraft }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['archives'] })
      setTitle('')
      toast({
        title: `Saved “${title}”`,
        description: `${result?.whiskeys ?? 0} whiskeys, ${result?.ratings ?? 0} ratings, ${result?.tasters ?? 0} tasters.${
          result?.event_draft_id ? ' Added to the website as an unpublished draft.' : ''
        }`,
      })
    },
    onError: (e) => toast({ title: 'Could not archive', description: e.message, variant: 'destructive' }),
  })

  const clear = useMutation({
    mutationFn: archivesApi.clearNight,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['whiskeys'] })
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: ['eventState'] })
      toast({
        title: 'Night cleared',
        description: `Removed ${result?.ratings_deleted ?? 0} ratings and ${result?.whiskeys_deleted ?? 0} whiskeys. Ready for the next one.`,
      })
    },
    onError: (e) => toast({ title: 'Could not clear', description: e.message, variant: 'destructive' }),
  })

  const removeArchive = useMutation({
    mutationFn: archivesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archives'] })
      toast({ title: 'Archive deleted' })
    },
  })

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Archive className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <p className="num text-[11px] uppercase tracking-widest text-muted-foreground">
          Past Nights ({archives.length})
        </p>
      </div>

      {/* ── Save tonight ─────────────────────────────── */}
      <div className="mb-4 space-y-3 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm text-foreground">Save tonight</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Keeps every whiskey, every score, note and flavour tag, who rated what, and the
          final standings. Nothing is deleted by saving.
        </p>

        <div className="space-y-2">
          <Label htmlFor="archive-title" className="text-xs">Name this night</Label>
          <Input
            id="archive-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The First One"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="archive-date" className="text-xs">Date it happened</Label>
          <Input
            id="archive-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="min-w-0">
            <p className="text-sm text-foreground">Add to the website</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Creates an unpublished past event with the date, venue and lineup. No guest
              names or scores. You write the description and publish it yourself.
            </p>
          </div>
          <Switch checked={createDraft} onCheckedChange={setCreateDraft} aria-label="Add to website as a draft" />
        </div>

        <Button
          className="w-full"
          disabled={!title.trim() || !hasLiveData || archive.isPending}
          onClick={() => archive.mutate()}
        >
          {archive.isPending ? 'Saving…' : 'Save this night'}
        </Button>

        {!hasLiveData && (
          <p className="text-xs text-muted-foreground">
            Nothing to save — there are no whiskeys or ratings yet.
          </p>
        )}
      </div>

      {/* ── Clear, only once it's saved ──────────────── */}
      <div className="mb-5 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm text-foreground">Start a fresh night</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Removes the whiskeys and ratings and resets the stage back to the start.
          {coveredByArchive
            ? ' Tonight is saved, so this is safe.'
            : ' Save the night first — this stays locked until everything is in an archive.'}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-3 w-full text-destructive"
              disabled={!coveredByArchive || !hasLiveData || clear.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {clear.isPending ? 'Clearing…' : 'Clear the night'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear the night?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes {ratings.length} rating{ratings.length === 1 ? '' : 's'} and{' '}
                {whiskeys.length} whiskey{whiskeys.length === 1 ? '' : 's'}, and resets the stage.
                {archives[0] ? ` It's all saved in "${archives[0].title}", so you can still look it up afterwards.` : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clear.mutate()}
                className="bg-destructive text-destructive-foreground"
              >
                Clear it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ── The archive itself ───────────────────────── */}
      {isLoading ? (
        <div className="h-16 rounded-xl border border-border/40 bg-card/40" aria-hidden="true" />
      ) : archives.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          No saved nights yet. The first one you save will appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {archives.map((a) => {
            const open = openId === a.id
            return (
              <div key={a.id} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                <button
                  onClick={() => setOpenId(open ? null : a.id)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-heading text-lg leading-tight text-foreground">{a.title}</p>
                    <p className="num mt-0.5 text-xs text-muted-foreground">
                      {a.event_date || fmt(a.archived_at)} · {a.rating_count} rating
                      {a.rating_count === 1 ? '' : 's'} · {a.taster_count} taster
                      {a.taster_count === 1 ? '' : 's'}
                    </p>
                    {a.winner_name && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                        <Trophy className="h-3 w-3" strokeWidth={1.5} />
                        <span className="truncate">{a.winner_name}</span>
                        {a.winner_avg != null && <span className="num">· {a.winner_avg}</span>}
                      </p>
                    )}
                  </div>
                  {open
                    ? <ChevronUp className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    : <ChevronDown className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                </button>

                {open && (
                  <div className="border-t border-border/40 px-4 pb-4 pt-3">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Final standings
                    </p>
                    <Standings standings={a.standings} />

                    {a.event_location && (
                      <p className="mt-3 text-xs text-muted-foreground">{a.event_location.trim()}</p>
                    )}
                    <p className="num mt-1 text-xs text-muted-foreground/70">
                      Saved {fmt(a.archived_at)}
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="mt-3 h-7 px-2 text-xs text-destructive hover:text-destructive">
                          <Trash2 className="mr-1 h-3 w-3" /> Delete this archive
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{a.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes the saved record of that night — all{' '}
                            {a.rating_count} ratings and the standings. It cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeArchive.mutate(a.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
