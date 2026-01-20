import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductClick {
  id: string;
  product_id: string;
  clicked_at: string;
  converted: boolean;
}

export interface ClicksByDay {
  date: string;
  clicks: number;
  conversions: number;
}

export interface ProductStats {
  productId: string;
  productName: string;
  totalClicks: number;
  conversions: number;
}

export function useProductClicks() {
  return useQuery({
    queryKey: ['product-clicks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (error) throw error;
      return data as ProductClick[];
    },
  });
}

export function useTrackProductClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, converted = false }: { productId: string; converted?: boolean }) => {
      const { error } = await supabase
        .from('product_clicks')
        .insert({ product_id: productId, converted });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-clicks'] });
    },
  });
}

export function useMarkConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clickId: string) => {
      const { error } = await supabase
        .from('product_clicks')
        .update({ converted: true })
        .eq('id', clickId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-clicks'] });
    },
  });
}

export function useClicksByDay(days: number = 30) {
  return useQuery({
    queryKey: ['clicks-by-day', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('product_clicks')
        .select('clicked_at, converted')
        .gte('clicked_at', startDate.toISOString());

      if (error) throw error;

      // Group by day
      const clicksByDay: Record<string, { clicks: number; conversions: number }> = {};
      
      data.forEach((click) => {
        const date = new Date(click.clicked_at).toISOString().split('T')[0];
        if (!clicksByDay[date]) {
          clicksByDay[date] = { clicks: 0, conversions: 0 };
        }
        clicksByDay[date].clicks++;
        if (click.converted) {
          clicksByDay[date].conversions++;
        }
      });

      // Generate all dates in range
      const result: ClicksByDay[] = [];
      const currentDate = new Date(startDate);
      const endDate = new Date();

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          clicks: clicksByDay[dateStr]?.clicks || 0,
          conversions: clicksByDay[dateStr]?.conversions || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      // Get clicks with product info
      const { data: clicks, error: clicksError } = await supabase
        .from('product_clicks')
        .select('product_id, converted');

      if (clicksError) throw clicksError;

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name');

      if (productsError) throw productsError;

      // Create product name map
      const productNameMap: Record<string, string> = {};
      products.forEach((p) => {
        productNameMap[p.id] = p.name;
      });

      // Aggregate stats
      const statsMap: Record<string, { totalClicks: number; conversions: number }> = {};
      
      clicks.forEach((click) => {
        if (!statsMap[click.product_id]) {
          statsMap[click.product_id] = { totalClicks: 0, conversions: 0 };
        }
        statsMap[click.product_id].totalClicks++;
        if (click.converted) {
          statsMap[click.product_id].conversions++;
        }
      });

      const result: ProductStats[] = Object.entries(statsMap)
        .map(([productId, stats]) => ({
          productId,
          productName: productNameMap[productId] || 'Produto removido',
          totalClicks: stats.totalClicks,
          conversions: stats.conversions,
        }))
        .sort((a, b) => b.totalClicks - a.totalClicks);

      return result;
    },
  });
}
