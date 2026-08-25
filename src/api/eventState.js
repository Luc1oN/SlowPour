import { supabase } from './supabase'

export const eventStateApi = {
  // Ordered on purpose. The table is capped at a single row by a database
  // constraint, but an unordered select once meant "the first row" was
  // whatever Postgres felt like returning — which is how six conflicting
  // copies of the night's settings ended up fighting each other.
  list: async () => {
    const { data, error } = await supabase
      .from('event_state')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  create: async (state) => {
    const { data, error } = await supabase
      .from('event_state')
      .insert(state)
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (id, state) => {
    const { data, error } = await supabase
      .from('event_state')
      .update(state)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
