import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendPushParams {
  title: string;
  body: string;
  url?: string;
  productId?: string;
}

export function useSendPushNotification() {
  return useMutation({
    mutationFn: async ({ title, body, url, productId }: SendPushParams) => {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: { title, body, url, productId }
      });

      if (error) throw error;
      return data;
    }
  });
}