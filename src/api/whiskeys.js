import { supabase } from './supabase'

export const whiskeyApi = {
  list: async (orderBy = 'round_number') => {
  const { data, error } = await supabase
    .from('whiskeys')
    .select('*')
    .order(orderBy)
  if (error) throw error
  return data
},

  create: async (whiskey) => {
    const { data, error } = await supabase
      .from('whiskeys')
      .insert(whiskey)
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (id, whiskey) => {
    const { data, error } = await supabase
      .from('whiskeys')
      .update(whiskey)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('whiskeys')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  uploadImage: async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('whiskey-images')
      .upload(fileName, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage
      .from('whiskey-images')
      .getPublicUrl(fileName)
    return data.publicUrl
  },
}
