import { supabase } from './supabase'

export const eventStateApi = {
  list: async () => {
    const { data, error } = await supabase
      .from('event_state')
      .select('*')
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
