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

// Find this device's rating for a whiskey.
// device_id is authoritative; user_name is the legacy fallback
// so ratings from v1 nights still match.
export function findMyRating(ratings, whiskeyId, deviceId, userName) {
  return (
    ratings.find(r => r.whiskey_id === whiskeyId && r.device_id && r.device_id === deviceId) ||
    ratings.find(r => r.whiskey_id === whiskeyId && !r.device_id && r.user_name === userName)
  )
}
