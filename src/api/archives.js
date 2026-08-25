import { supabase } from './supabase'

// Saved nights. The heavy snapshot lives in `payload`, so the list query
// deliberately leaves it out — you don't want every past night's ratings
// coming down the wire to render a list of three rows.
export const archivesApi = {
  list: async () => {
    const { data, error } = await supabase
      .from('slowpour_night_archives')
      .select('id, title, event_date, event_location, archived_at, whiskey_count, rating_count, taster_count, winner_name, winner_avg, standings')
      .order('archived_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('slowpour_night_archives')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Snapshots whiskeys, ratings, standings and the event settings in one
  // go, inside the database, so nothing can be half-saved.
  archiveNight: async ({ title, eventDate, createEventDraft = true }) => {
    const { data, error } = await supabase.rpc('archive_current_night', {
      p_title: title,
      p_event_date: eventDate,
      p_create_event_draft: createEventDraft,
    })
    if (error) throw error
    return data
  },

  // Refuses unless the current data is already covered by an archive.
  clearNight: async () => {
    const { data, error } = await supabase.rpc('clear_current_night')
    if (error) throw error
    return data
  },

  remove: async (id) => {
    const { error } = await supabase
      .from('slowpour_night_archives')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
