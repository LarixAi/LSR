import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface RealtimeOptions {
  table?: string
  filter?: Record<string, any>
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export const useRealtimeSubscription = (options: RealtimeOptions) => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user || !options.table) return

    // Create unique channel name
    const channelName = `${options.table}_${user.id}_${Date.now()}`
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.table,
          filter: options.filter ? Object.entries(options.filter)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join(',') : undefined
        },
        (payload) => {
          console.log('Realtime event:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload)
              break
            case 'UPDATE':
              options.onUpdate?.(payload)
              break
            case 'DELETE':
              options.onDelete?.(payload)
              break
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        setIsConnected(false)
      }
    }
  }, [user, options.table, JSON.stringify(options.filter)])

  return { isConnected }
}

export const useWebSocketConnection = () => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const connect = async (channelName: string = 'default') => {
    if (!user) {
      setConnectionError('User not authenticated')
      return
    }

    try {
      // Use Supabase realtime for WebSocket functionality
      const channel = supabase.channel(`websocket_${channelName}_${user.id}`)
      
      channel
        .on('broadcast', { event: 'message' }, (payload) => {
          console.log('WebSocket message:', payload)
        })
        .subscribe((status) => {
          console.log('WebSocket subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
          if (status === 'SUBSCRIBED') {
            setConnectionError(null)
          }
        })

    } catch (error) {
      console.error('WebSocket connection error:', error)
      setConnectionError(error.message || 'Connection failed')
    }
  }

  const disconnect = () => {
    setIsConnected(false)
  }

  const sendMessage = (type: string, payload: any) => {
    // Use Supabase broadcast for messaging
    if (isConnected) {
      console.log('Sending message:', { type, payload })
    }
  }

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage
  }
}

export const useBackgroundTasks = () => {
  const queueTask = async (
    taskType: string,
    payload: any,
    priority: number = 5,
    scheduledAt?: Date
  ) => {
    try {
      // Use edge function to queue background tasks
      const response = await supabase.functions.invoke('background-processor', {
        body: {
          action: 'queue',
          task_type: taskType,
          payload,
          priority,
          scheduled_at: scheduledAt?.toISOString()
        }
      })

      if (response.error) throw response.error

      console.log(`Queued background task: ${taskType}`, response.data)
      return response.data
    } catch (error) {
      console.error('Failed to queue background task:', error)
      throw error
    }
  }

  const processTasksManually = async () => {
    try {
      const response = await supabase.functions.invoke('background-processor', {
        body: { action: 'process' }
      })

      if (response.error) throw response.error

      console.log('Background tasks processed:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to process tasks:', error)
      throw error
    }
  }

  return {
    queueTask,
    processTasksManually
  }
}