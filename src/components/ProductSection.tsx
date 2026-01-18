import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { Product } from '@/data/store';
import { ShoppingBag } from 'lucide-react';

export function ProductSection() {
  const { products } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeProducts = products.filter(p => p.active).sort((a, b) => a.order - b.order);

  return (
    <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Loja</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
