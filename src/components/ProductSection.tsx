import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProducts, Product } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { ShoppingBag } from 'lucide-react';

export function ProductSection() {
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/3] bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const activeProducts = products?.filter(p => p.active).sort((a, b) => a.order - b.order) || [];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Loja</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeProducts.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => setSelectedProduct(product)}
            index={index}
          />
        ))}
      </div>

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </motion.section>
  );
}