import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, Product } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { ProductsSkeleton } from './SkeletonLoaders';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

export function ProductSection() {
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

  const activeProducts = useMemo(() => 
    products?.filter(p => p.active).sort((a, b) => a.order - b.order) || []
  , [products]);

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category))];
    return ['Todos', ...cats];
  }, [activeProducts]);

  const featuredProducts = useMemo(() => activeProducts.filter(p => p.featured), [activeProducts]);
  const filteredProducts = useMemo(() => 
    selectedCategory === 'Todos'
      ? activeProducts
      : activeProducts.filter(p => p.category === selectedCategory)
  , [activeProducts, selectedCategory]);

  const scroll = useCallback((ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  const renderCarousel = (
    ref: React.RefObject<HTMLDivElement>,
    productList: Product[],
    keyPrefix: string = '',
    showRank: boolean = false
  ) => (
    <div className="relative group">
      {/* Left Arrow - Netflix style full-height gradient */}
      <button
        className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
        onClick={() => scroll(ref, 'left')}
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </button>

      {/* Scrollable Container */}
      <motion.div
        ref={ref as any}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4 scroll-smooth pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
      >
        {productList.map((product, idx) => (
          <motion.div
            key={`${keyPrefix}${product.id}`}
            variants={itemVariants}
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard
              product={product}
              onClick={() => setSelectedProduct(product)}
              rank={showRank ? idx + 1 : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Right Arrow */}
      <button
        className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
        onClick={() => scroll(ref, 'right')}
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </button>
    </div>
  );

  return (
    <div id="product-section">
      {/* Category Filter - Netflix underline style */}
      <div className="px-4 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 text-sm font-medium transition-colors pb-1 border-b-2 ${
                selectedCategory === cat
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground border-transparent hover:text-foreground/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products - Top 10 */}
      {featuredProducts.length > 0 && selectedCategory === 'Todos' && (
        <section className="relative mb-2">
          <h2 className="text-xl font-bold text-foreground px-4 mb-3">
            {featuredProducts.length >= 3 ? 'Top 10 no Brasil Hoje' : 'Destaques'}
          </h2>
          {renderCarousel(scrollRef1, featuredProducts, 'featured-', featuredProducts.length >= 3)}
        </section>
      )}

      {/* All Products - Minha Loja */}
      <section className="relative mb-2">
        <h2 className="text-xl font-bold text-foreground px-4 mb-3">Minha Loja</h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCarousel(scrollRef2, filteredProducts, 'store-')}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Recommendations */}
      {filteredProducts.length > 2 && selectedCategory === 'Todos' && (
        <section className="relative mb-2">
          <h2 className="text-xl font-bold text-foreground px-4 mb-3">Principais escolhas para você</h2>
          {renderCarousel(scrollRef3, [...filteredProducts].reverse(), 'rec-')}
        </section>
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
