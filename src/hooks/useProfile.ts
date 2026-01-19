import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  avatar: string | null;
  whatsapp: string;
}

const mapDbToProfile = (row: any): Profile => ({
  id: row.id,
  name: row.name,
  bio: row.bio,
  avatar: row.avatar_url,
  whatsapp: row.whatsapp,
});

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return mapDbToProfile(data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar,
          whatsapp: profile.whatsapp,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, profileId }: { file: File; profileId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${profileId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao fazer upload do avatar: ' + error.message);
    },
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({ file, productId }: { file: File; productId?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${productId || Date.now()}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(fileName);
      return publicUrl.publicUrl;
    },
    onError: (error) => {
      toast.error('Erro ao fazer upload da imagem: ' + error.message);
    },
  });
}
