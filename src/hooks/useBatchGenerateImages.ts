import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface BatchProgress {
  current: number;
  total: number;
  productName: string;
  status: 'idle' | 'running' | 'done' | 'cancelled';
  errors: string[];
  successes: number;
}

export function useBatchGenerateImages() {
  const [progress, setProgress] = useState<BatchProgress>({
    current: 0, total: 0, productName: '', status: 'idle', errors: [], successes: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const generate = useCallback(async (skipExisting = true) => {
    abortRef.current = new AbortController();
    setProgress({ current: 0, total: 0, productName: '', status: 'running', errors: [], successes: 0 });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/generate-all-images`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ skipExisting }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            
            if (event.type === 'start') {
              setProgress(p => ({ ...p, total: event.total }));
            } else if (event.type === 'progress') {
              setProgress(p => ({ ...p, current: event.current, productName: event.productName }));
            } else if (event.type === 'success') {
              setProgress(p => ({ ...p, successes: p.successes + 1 }));
            } else if (event.type === 'error') {
              setProgress(p => ({ ...p, errors: [...p.errors, `${event.productName}: ${event.error}`] }));
            } else if (event.type === 'done') {
              setProgress(p => ({ ...p, status: 'done' }));
              queryClient.invalidateQueries({ queryKey: ['products'] });
              toast.success('Geração de imagens concluída!');
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setProgress(p => ({ ...p, status: 'cancelled' }));
        toast.info('Geração cancelada');
      } else {
        setProgress(p => ({ ...p, status: 'done' }));
        toast.error('Erro: ' + err.message);
      }
    }
  }, [queryClient]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setProgress({ current: 0, total: 0, productName: '', status: 'idle', errors: [], successes: 0 });
  }, []);

  return { progress, generate, cancel, reset };
}
