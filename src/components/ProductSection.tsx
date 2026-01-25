import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProducts, Product } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductSection() {
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4">
        <div className="h-6 w-32 bg-secondary/50 rounded animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[120px] aspect-[2/3] bg-secondary/50 rounded-md animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const activeProducts = products?.filter(p => p.active).sort((a, b) => a.order - b.order) || [];
  const featuredProducts = activeProducts.filter(p => p.featured);
  const regularProducts = activeProducts;

  return (
    <>
      {/* Featured Products - "Continuar assistindo" style */}
      {featuredProducts.length > 0 && (
        <section className="relative">
          <h2 className="text-lg font-semibold text-foreground px-4 mb-3">
            Destaques
          </h2>
          
          <div className="relative group">
            {/* Left Arrow */}
            <motion.button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
              onClick={() => scroll(scrollRef1, 'left')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-8 h-8 text-foreground" />
            </motion.button>

            {/* Scrollable Container */}
            <div 
              ref={scrollRef1}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => setSelectedProduct(product)}
                  index={index}
                  variant="featured"
                />
              ))}
            </div>

            {/* Right Arrow */}
            <motion.button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
              onClick={() => scroll(scrollRef1, 'right')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-8 h-8 text-foreground" />
            </motion.button>
          </div>
        </section>
      )}

      {/* All Products - "Minha Lista" style */}
      <section className="relative mt-6">
        <h2 className="text-lg font-semibold text-foreground px-4 mb-3">
          Minha Loja
        </h2>
        
        <div className="relative group">
          {/* Left Arrow */}
          <motion.button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
            onClick={() => scroll(scrollRef2, 'left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </motion.button>

          {/* Scrollable Container */}
          <div 
            ref={scrollRef2}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {regularProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                index={index}
                variant="poster"
              />
            ))}
          </div>

          {/* Right Arrow */}
          <motion.button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
            onClick={() => scroll(scrollRef2, 'right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-8 h-8 text-foreground" />
          </motion.button>
        </div>
      </section>

      {/* Additional Row - "Principais escolhas para você" */}
      {regularProducts.length > 4 && (
        <section className="relative mt-6">
          <h2 className="text-lg font-semibold text-foreground px-4 mb-3">
            Principais escolhas para você
          </h2>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...regularProducts].reverse().map((product, index) => (
              <ProductCard 
                key={`rec-${product.id}`} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                index={index}
                variant="poster"
              />
            ))}
          </div>
        </section>
      )}

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
