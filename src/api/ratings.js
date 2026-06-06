import { supabase } from './supabase'

export const ratingsApi = {
  list: async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
    if (error) throw error
    return data
  },

  create: async (rating) => {
    const { data, error } = await supabase
      .from('ratings')
      .insert(rating)
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (id, rating) => {
    const { data, error } = await supabase
      .from('ratings')
      .update(rating)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
