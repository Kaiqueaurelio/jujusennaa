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

const CATEGORY_ORDER = ['Informática', 'Mídias Sociais', 'Edição', 'Templates Notion', 'Acadêmicos'];

function CarouselRow({ products, keyPrefix, onSelect }: {
  products: Product[];
  keyPrefix: string;
  onSelect: (p: Product) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <button
        className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </button>

      <motion.div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4 scroll-smooth pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
      >
        {products.map((product) => (
          <motion.div
            key={`${keyPrefix}${product.id}`}
            variants={itemVariants}
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard
              product={product}
              onClick={() => onSelect(product)}
            />
          </motion.div>
        ))}
      </motion.div>

      <button
        className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </button>
    </div>
  );
}

export function ProductSection() {
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const activeProducts = useMemo(() => 
    products?.filter(p => p.active).sort((a, b) => a.order - b.order) || []
  , [products]);

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category))];
    const ordered = CATEGORY_ORDER.filter(c => cats.includes(c));
    const remaining = cats.filter(c => !CATEGORY_ORDER.includes(c));
    return ['Todos', ...ordered, ...remaining];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => 
    selectedCategory === 'Todos'
      ? activeProducts
      : activeProducts.filter(p => p.category === selectedCategory)
  , [activeProducts, selectedCategory]);

  const productsByCategory = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category))];
    const ordered = CATEGORY_ORDER.filter(c => cats.includes(c));
    const remaining = cats.filter(c => !CATEGORY_ORDER.includes(c));
    return [...ordered, ...remaining].map(cat => ({
      category: cat,
      products: activeProducts.filter(p => p.category === cat),
    }));
  }, [activeProducts]);

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <div id="product-section">
      {/* Category Filter */}
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

      {selectedCategory === 'Todos' ? (
        <>
          {productsByCategory.map((group) => (
            <section key={group.category} className="relative mb-2">
              <h2 className="text-xl font-bold text-foreground px-4 mb-3">{group.category}</h2>
              <CarouselRow
                products={group.products}
                keyPrefix={`cat-${group.category}-`}
                onSelect={setSelectedProduct}
              />
            </section>
          ))}
        </>
      ) : (
        <section className="relative mb-2">
          <h2 className="text-xl font-bold text-foreground px-4 mb-3">{selectedCategory}</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CarouselRow
                products={filteredProducts}
                keyPrefix="store-"
                onSelect={setSelectedProduct}
              />
            </motion.div>
          </AnimatePresence>
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
