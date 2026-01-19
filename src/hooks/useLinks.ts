import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: 'social' | 'content' | 'store';
  clicks: number;
  order: number;
  active: boolean;
}

const mapDbToLink = (row: any): Link => ({
  id: row.id,
  title: row.title,
  url: row.url,
  icon: row.icon,
  category: row.category as 'social' | 'content' | 'store',
  clicks: row.clicks,
  order: row.sort_order,
  active: row.active,
});

const mapLinkToDb = (link: Partial<Link>) => ({
  title: link.title,
  url: link.url,
  icon: link.icon,
  category: link.category,
  clicks: link.clicks,
  sort_order: link.order,
  active: link.active,
});

export function useLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data.map(mapDbToLink);
    },
  });
}

export function useAddLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Omit<Link, 'id'>) => {
      const { data, error } = await supabase
        .from('links')
        .insert(mapLinkToDb(link))
        .select()
        .single();

      if (error) throw error;
      return mapDbToLink(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar link: ' + error.message);
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Link) => {
      const { data, error } = await supabase
        .from('links')
        .update(mapLinkToDb(link))
        .eq('id', link.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToLink(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar link: ' + error.message);
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover link: ' + error.message);
    },
  });
}

export function useIncrementLinkClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current, error: fetchError } = await supabase
        .from('links')
        .select('clicks')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('links')
        .update({ clicks: (current?.clicks || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}
