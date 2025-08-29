import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebSocketMessage {
  type: string
  channel: string
  payload: any
  sessionToken?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  let sessionInfo: {
    user_id: string
    organization_id: string
    channel_name: string
  } | null = null

  console.log('WebSocket connection established')

  socket.onopen = () => {
    console.log('WebSocket opened, waiting for authentication...')
  }

  socket.onmessage = async (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      console.log('Received message:', message.type)

      switch (message.type) {
        case 'auth':
          if (!message.sessionToken) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Session token required'
            }))
            return
          }

          // Validate session token
          const { data: sessionData, error: sessionError } = await supabase
            .rpc('validate_websocket_session', {
              p_session_token: message.sessionToken
            })

          if (sessionError || !sessionData || sessionData.length === 0) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Invalid session token'
            }))
            socket.close()
            return
          }

          sessionInfo = sessionData[0]
          console.log('Session authenticated:', sessionInfo)

          socket.send(JSON.stringify({
            type: 'auth_success',
            channel: sessionInfo.channel_name
          }))

          // Log authentication event
          await supabase.rpc('log_realtime_event', {
            p_event_type: 'websocket_auth',
            p_payload: { channel: sessionInfo.channel_name }
          })
          break

        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }))
          break

        case 'subscribe':
          if (!sessionInfo) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Not authenticated'
            }))
            return
          }

          // Subscribe to real-time updates based on organization
          const channel = supabase
            .channel(`org_${sessionInfo.organization_id}`)
            .on('postgres_changes', {
              event: '*',
              schema: 'public'
            }, (payload) => {
              socket.send(JSON.stringify({
                type: 'db_change',
                table: payload.table,
                eventType: payload.eventType,
                new: payload.new,
                old: payload.old
              }))
            })
            .subscribe()

          socket.send(JSON.stringify({
            type: 'subscribed',
            channel: `org_${sessionInfo.organization_id}`
          }))
          break

        case 'broadcast':
          if (!sessionInfo) {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Not authenticated'
            }))
            return
          }

          // Broadcast message to organization channel
          await supabase
            .channel(`org_${sessionInfo.organization_id}`)
            .send({
              type: 'broadcast',
              event: message.payload.event,
              payload: {
                ...message.payload,
                user_id: sessionInfo.user_id,
                timestamp: new Date().toISOString()
              }
            })

          // Log broadcast event
          await supabase.rpc('log_realtime_event', {
            p_event_type: 'websocket_broadcast',
            p_payload: message.payload
          })
          break

        default:
          socket.send(JSON.stringify({
            type: 'error',
            error: `Unknown message type: ${message.type}`
          }))
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format'
      }))
    }
  }

  socket.onclose = async () => {
    console.log('WebSocket connection closed')
    
    if (sessionInfo) {
      // Log disconnect event
      try {
        await supabase.rpc('log_realtime_event', {
          p_event_type: 'websocket_disconnect',
          p_payload: { channel: sessionInfo.channel_name }
        })
      } catch (error) {
        console.error('Error logging disconnect:', error)
      }
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  return response
})