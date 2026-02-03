import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProducts, Product } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { ProductsSkeleton } from './SkeletonLoaders';
import { ChevronLeft, ChevronRight, Flame, ShoppingCart, Sparkles } from 'lucide-react';

export function ProductSection() {
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  const activeProducts = products?.filter(p => p.active).sort((a, b) => a.order - b.order) || [];
  const featuredProducts = activeProducts.filter(p => p.featured);
  const regularProducts = activeProducts;

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const renderCarousel = (
    ref: React.RefObject<HTMLDivElement>,
    productList: Product[],
    keyPrefix: string = ''
  ) => (
    <div className="relative group">
      {/* Left Arrow */}
      <motion.button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
        onClick={() => scroll(ref, 'left')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </motion.button>

      {/* Scrollable Container */}
      <div 
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {productList.map((product, index) => (
          <motion.div
            key={`${keyPrefix}${product.id}`}
            className="snap-start"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ 
              delay: index * 0.08,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <ProductCard 
              product={product} 
              onClick={() => setSelectedProduct(product)}
              index={index}
            />
          </motion.div>
        ))}
      </div>

      {/* Right Arrow */}
      <motion.button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
        onClick={() => scroll(ref, 'right')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </motion.button>
    </div>
  );

  return (
    <>
      {/* Featured Products - Destaques */}
      {featuredProducts.length > 0 && (
        <motion.section 
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="flex items-center gap-2 px-4 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-foreground">Destaques</h2>
          </motion.div>
          
          {renderCarousel(scrollRef1, featuredProducts, 'featured-')}
        </motion.section>
      )}

      {/* All Products - Minha Loja */}
      <motion.section 
        className="relative mt-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div 
          className="flex items-center gap-2 px-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingCart className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Minha Loja</h2>
        </motion.div>
        
        {renderCarousel(scrollRef2, regularProducts, 'store-')}
      </motion.section>

      {/* Recommendations - Principais escolhas */}
      {regularProducts.length > 2 && (
        <motion.section 
          className="relative mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="flex items-center gap-2 px-4 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-foreground">Principais escolhas para você</h2>
          </motion.div>
          
          {renderCarousel(scrollRef3, [...regularProducts].reverse(), 'rec-')}
        </motion.section>
      )}

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
