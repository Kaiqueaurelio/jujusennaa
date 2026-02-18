import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, purchaseAmount }: { code: string; purchaseAmount: number }) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Cupom não encontrado');

      const coupon = data as Coupon;

      // Check if expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Cupom expirado');
      }

      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        throw new Error('Cupom esgotado');
      }

      // Check min purchase
      if (purchaseAmount < coupon.min_purchase) {
        throw new Error(`Compra mínima de R$ ${coupon.min_purchase.toFixed(2)}`);
      }

      return coupon;
    },
  });
}

export function useAddCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: coupon.code.toUpperCase(),
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_purchase: coupon.min_purchase || 0,
          max_uses: coupon.max_uses,
          active: coupon.active,
          expires_at: coupon.expires_at,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar cupom: ' + error.message);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Coupon) => {
      const { data, error } = await supabase
        .from('coupons')
        .update({
          code: coupon.code.toUpperCase(),
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_purchase: coupon.min_purchase,
          max_uses: coupon.max_uses,
          active: coupon.active,
          expires_at: coupon.expires_at,
        })
        .eq('id', coupon.id)
        .select()
        .single();

      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cupom: ' + error.message);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover cupom: ' + error.message);
    },
  });
}

export function useIncrementCouponUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('increment_coupon_usage', { _coupon_id: id }) as { data: any; error: any };
      if (error) throw error;
      if (data && Array.isArray(data) && data.length > 0 && !data[0]?.success) {
        throw new Error(data[0]?.message || 'Cupom esgotado');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function calculateDiscount(coupon: Coupon, amount: number): number {
  if (coupon.discount_type === 'percentage') {
    return amount * (coupon.discount_value / 100);
  }
  return Math.min(coupon.discount_value, amount);
}
