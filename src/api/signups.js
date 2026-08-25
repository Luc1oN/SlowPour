// Returns a status string rather than throwing, so the form can show the
// right message for each case without inspecting Postgres errors itself.
export async function joinList({ email, pourRequest }) {
  const clean = (email || '').trim()
  const pour = (pourRequest || '').trim()

  if (!clean) return 'invalid'

  // Loaded on demand — the client weighs more than the form does.
  const { supabase } = await import('./supabase')

  const { error } = await supabase.from('slowpour_signups').insert({
    email: clean.toLowerCase(),
    pour_request: pour || null,
  })

  if (!error) return 'success'

  // 23505 = unique violation: they're already on the list.
  if (error.code === '23505') return 'duplicate'
  // 23514 = check constraint: the address didn't look like an address.
  if (error.code === '23514') return 'invalid'

  return 'error'
}
