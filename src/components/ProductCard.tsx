import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { Eye, MessageCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { getProductImage } from '@/data/productImages';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

function getBadge(product: Product): { text: string; color: string } | null {
  if (product.featured) return { text: 'Premium', color: 'bg-primary' };
  if (product.tags?.includes('popular')) return { text: 'Popular', color: 'bg-primary' };
  if (product.tags?.includes('novo')) return { text: 'Novo', color: 'bg-primary' };
  return null;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const { data: profile } = useProfile();
  
  const badge = getBadge(product);
  const productImage = getProductImage(product.image);
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsapp = profile?.whatsapp || '5511939222885';
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name}\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')}`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  const isFeatured = product.featured;

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px]">
      <div 
        className={`relative rounded-2xl overflow-hidden bg-card border group cursor-pointer ${
          isFeatured ? 'border-transparent' : 'border-border/50'
        }`}
        style={{
          boxShadow: isFeatured
            ? '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 0 20px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {isFeatured && (
          <>
            <div 
              className="absolute inset-0 rounded-2xl z-0"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6, #d946ef, #06b6d4, #8b5cf6)',
                backgroundSize: '300% 100%',
                animation: 'neonBorderFlow 3s linear infinite',
                padding: '2px',
              }}
            />
            <div className="absolute inset-[2px] rounded-2xl bg-card z-0" />
          </>
        )}
        {/* Image Container - layoutId for shared element transition */}
        <div 
          className="relative aspect-square overflow-hidden z-[1]"
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-background/50 pointer-events-none z-10" />
          
          {productImage ? (
            <motion.img 
              layoutId={`product-image-${product.id}`}
              src={productImage} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/30 via-card to-background flex items-center justify-center">
              <span className="text-foreground/30 text-6xl font-bold">{product.name.charAt(0)}</span>
            </div>
          )}

          {badge && (
            <motion.div 
              className={`absolute top-3 left-3 px-3 py-1 rounded-md ${badge.color} text-primary-foreground text-xs font-semibold z-20`}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
            >
              {badge.text}
            </motion.div>
          )}

          <motion.div 
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            initial={false}
          >
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/10 border border-foreground/30 text-foreground hover:bg-foreground/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClick}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Ver detalhes</span>
            </motion.button>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent z-10" />
        </div>

        {/* Product Info */}
        <div className="relative z-[1] p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-base line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-primary font-bold text-xl">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted-foreground text-sm line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleWhatsAppClick}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-5 h-5" />
            Comprar pelo WhatsApp
          </motion.button>
        </div>
      </div>
    </div>
  );
}
