import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
  active: boolean;
}

const mapDbToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  fullDescription: row.full_description,
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : null,
  image: row.image_url,
  category: row.category,
  tags: row.tags || [],
  featured: row.featured,
  order: row.sort_order,
  active: row.active,
});

const mapProductToDb = (product: Partial<Product>) => ({
  name: product.name,
  description: product.description,
  full_description: product.fullDescription,
  price: product.price,
  original_price: product.originalPrice || null,
  image_url: product.image,
  category: product.category,
  tags: product.tags,
  featured: product.featured,
  sort_order: product.order,
  active: product.active,
});

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data.map(mapDbToProduct);
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(mapProductToDb(product))
        .select()
        .single();

      if (error) throw error;
      return mapDbToProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar produto: ' + error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      const { data, error } = await supabase
        .from('products')
        .update(mapProductToDb(product))
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produto: ' + error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover produto: ' + error.message);
    },
  });
}

export function useGenerateProductImage() {
  return useMutation({
    mutationFn: async ({ productName, productCategory }: { productName: string; productCategory: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { productName, productCategory },
      });

      if (error) throw error;
      return data.imageUrl;
    },
    onError: (error) => {
      toast.error('Erro ao gerar imagem: ' + error.message);
    },
  });
}
