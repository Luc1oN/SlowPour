import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventStateApi } from '../api/eventState'

export function useEventState() {
  const queryClient = useQueryClient()

  const { data: eventStates = [] } = useQuery({
    queryKey: ['eventState'],
    queryFn: eventStateApi.list,
    initialData: [],
    refetchInterval: 10000,
  })

  const eventState = eventStates[0] || {}

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (eventState?.id) {
        return eventStateApi.update(eventState.id, data)
      } else {
        return eventStateApi.create(data)
      }
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['eventState'] })
      const previous = queryClient.getQueryData(['eventState'])
      queryClient.setQueryData(['eventState'], (old = []) =>
        old.map((s, i) => i === 0 ? { ...s, ...newData } : s)
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
    updateEventState: updateMutation.mutate,
  }
}
