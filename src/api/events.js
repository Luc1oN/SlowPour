// Row Level Security already hides unpublished events, so this only ever
// returns things Shane has ticked "published" on.
export async function fetchEvents() {
  // Loaded on demand, so it never blocks the first paint.
  const { supabase } = await import('./supabase')

  const { data, error } = await supabase
    .from('slowpour_events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Today at midnight, so an event still counts as "upcoming" on the day
// it happens rather than dropping into the past that morning.
function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function splitEvents(events = []) {
  const now = today()
  const upcoming = []
  const past = []

  for (const e of events) {
    const when = new Date(e.event_date + 'T00:00:00')
    if (when >= now) upcoming.push(e)
    else past.push(e)
  }

  // Soonest first for what's coming, most recent first for what's been.
  upcoming.sort((a, b) => a.event_date.localeCompare(b.event_date))
  return { upcoming, past }
}

export function formatEventDate(date, { long = true } = {}) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-IE', {
    weekday: long ? 'long' : undefined,
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric',
  })
}

export function formatPrice(price) {
  if (price === null || price === undefined) return ''
  const n = Number(price)
  if (Number.isNaN(n)) return ''
  return n % 1 === 0 ? `€${n}` : `€${n.toFixed(2)}`
}
