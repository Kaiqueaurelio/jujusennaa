import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string;
  advertiser_name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export function useAds() {
  return useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Ad[];
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ads')
        .insert(ad)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ad> & { id: string }) => {
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}
