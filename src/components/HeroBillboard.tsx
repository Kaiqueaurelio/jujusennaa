import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useProducts } from '@/hooks/useProducts';
import { getProductImage } from '@/data/productImages';
import { Play, Info } from 'lucide-react';
import { useState } from 'react';
import { ProductModal } from './ProductModal';
import { Product } from '@/hooks/useProducts';

export function HeroBillboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const featuredProduct = products?.find(p => p.featured && p.active);
  const heroImage = featuredProduct ? getProductImage(featuredProduct.image) : null;

  if (profileLoading || !profile) {
    return (
      <div className="relative w-full h-[40vh] sm:h-[60vh] bg-secondary animate-pulse" />
    );
  }

  return (
    <>
      <div className="relative w-full h-[40vh] sm:h-[60vh] overflow-hidden">
        {/* Background Image */}
        {heroImage ? (
          <motion.img
            src={heroImage}
            alt={featuredProduct?.name || ''}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: 'easeOut' }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-card to-background" />
        )}

        {/* Gradient overlays + stronger vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 100px 40px hsl(var(--background))' }} />

        {/* Category badge - maturity rating style */}
        {featuredProduct && (
          <div className="absolute bottom-[15%] right-4 sm:right-12 flex items-center gap-2 z-10">
            <div className="px-3 py-1 border-l-2 border-foreground/50 bg-background/40 backdrop-blur-sm text-foreground/80 text-sm font-medium">
              {featuredProduct.category}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-[15%] left-0 px-4 sm:px-12 max-w-xl z-10">
          <motion.h1
            className="text-3xl sm:text-5xl font-extrabold text-foreground mb-2 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {profile.name}
          </motion.h1>

          <motion.p
            className="text-sm sm:text-lg text-foreground/80 mb-5 line-clamp-3 drop-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {featuredProduct?.description || profile.bio}
          </motion.p>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {featuredProduct && (
              <button
                onClick={() => setSelectedProduct(featuredProduct)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                Ver Detalhes
              </button>
            )}
            <button
              onClick={() => {
                document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-foreground/30 backdrop-blur-sm text-foreground font-semibold text-sm hover:bg-foreground/40 transition-colors"
            >
              <Info className="w-5 h-5" />
              Ver Loja
            </button>
          </motion.div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
