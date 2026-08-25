import { useEffect, useId } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventStateApi } from '../api/eventState'
import { supabase } from '../api/supabase'

export function useEventState() {
  const queryClient = useQueryClient()
  const instanceId = useId()

  const { data: eventStates = [], isLoading } = useQuery({
    queryKey: ['eventState'],
    queryFn: eventStateApi.list,
    refetchInterval: 3000, // 3s fallback — covers cases where realtime subscription misses
  })

  // Realtime: the whole room moves the instant the host advances a stage.
  useEffect(() => {
    // Unique per hook instance — multiple components use this hook
    // simultaneously (e.g. the Night Live gate and the page it renders),
    // so a shared channel name would collide.
    const channel = supabase
      .channel(`event-state-changes-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_state' }, () => {
        queryClient.invalidateQueries({ queryKey: ['eventState'] })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [queryClient, instanceId])

  const eventState = eventStates[0] || {}

  const updateMutation = useMutation({
    // Never create a second settings row. Tapping a control before the
    // first load finished used to land here with an empty eventState and
    // silently insert a fresh row — six of them accumulated that way, and
    // whichever one the database returned first became the live night.
    // Re-check against the database before concluding there isn't one.
    mutationFn: async (data) => {
      if (eventState?.id) {
        return eventStateApi.update(eventState.id, data)
      }

      const existing = await eventStateApi.list()
      if (existing?.[0]?.id) {
        return eventStateApi.update(existing[0].id, data)
      }

      return eventStateApi.create(data)
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['eventState'] })
      const previous = queryClient.getQueryData(['eventState'])
      queryClient.setQueryData(['eventState'], (old = []) =>
        old.length ? old.map((s, i) => (i === 0 ? { ...s, ...newData } : s)) : old
      )
      return { previous }
    },
    onError: (_err, _data, ctx) => {
      queryClient.setQueryData(['eventState'], ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['eventState'] })
    },
  })

  return {
    eventState,
    eventStateLoading: isLoading,
    updateEventState: updateMutation.mutate,
  }
}
