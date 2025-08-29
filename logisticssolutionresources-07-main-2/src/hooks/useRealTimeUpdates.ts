import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealTimeUpdatesOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onUpdate?: (payload: any) => void;
}

export const useRealTimeUpdates = ({
  table,
  filter,
  event = '*',
  onUpdate
}: UseRealTimeUpdatesOptions) => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channelName = `${table}-${user.id}`;
    const newChannel = supabase.channel(channelName);

    const subscription = newChannel
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter: filter || `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          onUpdate?.(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [user, table, filter, event, onUpdate]);

  return { isConnected, channel };
};