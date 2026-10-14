import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useProducts } from '@/hooks/useProducts';
import { Play, Info } from 'lucide-react';
import { useState } from 'react';
import { ProductModal } from './ProductModal';
import { Product } from '@/hooks/useProducts';
const heroVideos = [
  { webm: '/videos/juju-video-1.webm', mp4: '/videos/juju-video-1.mp4' },
  { webm: '/videos/juju-video-2.webm', mp4: '/videos/juju-video-2.mp4' },
];

export function HeroBillboard() {
  const { data: profile } = useProfile();
  const { data: products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const featuredProduct = products?.find(p => p.featured && p.active);

  return (
    <>
      <div className="relative w-full h-[55vh] min-h-[340px] sm:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2" aria-label="Vídeos da Juju Senna">
          {heroVideos.map((video, index) => (
            <video
              key={video.mp4}
              aria-label={`Vídeo da Juju Senna ${index + 1}`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={(event) => {
                event.currentTarget.play().catch(() => undefined);
              }}
              className="block w-full h-full min-h-0 object-cover"
            >
              <source src={video.webm} type="video/webm" />
              <source src={video.mp4} type="video/mp4" />
            </video>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 30px hsl(var(--background) / 0.85)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/30 pointer-events-none" />
        {featuredProduct && (
          <div className="absolute bottom-[15%] right-4 sm:right-12 flex items-center gap-2 z-10">
            <div className="px-3 py-1 border-l-2 border-foreground/50 bg-background/40 backdrop-blur-sm text-foreground/80 text-sm font-medium">
              {featuredProduct.category}
            </div>
          </div>
        )}
        <div className="absolute bottom-[15%] left-0 px-4 sm:px-12 max-w-xl z-10">
          <motion.h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-2 drop-shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {profile?.name || 'JUJU SENNA'}
          </motion.h1>
          <motion.p className="text-sm sm:text-lg text-foreground/80 mb-5 line-clamp-3 drop-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            {featuredProduct?.description || profile?.bio}
          </motion.p>
          <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            {featuredProduct && (
              <button onClick={() => setSelectedProduct(featuredProduct)} className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors">
                <Play className="w-5 h-5 fill-current" /> Ver Detalhes
              </button>
            )}
            <button onClick={() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-foreground/30 backdrop-blur-sm text-foreground font-semibold text-sm hover:bg-foreground/40 transition-colors">
              <Info className="w-5 h-5" /> Ver Loja
            </button>
          </motion.div>
        </div>
      </div>
      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  );
}
