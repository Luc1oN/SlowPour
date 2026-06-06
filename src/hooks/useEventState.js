import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventStateApi } from '../api/eventState'

export function useEventState() {
  const queryClient = useQueryClient()

  const { data: eventStates = [] } = useQuery({
    queryKey: ['eventState'],
    queryFn: eventStateApi.list,
    initialData: [],
    refetchInterval: 5000,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventState'] }),
  })

  return {
    eventState,
    updateEventState: updateMutation.mutate,
  }
}
