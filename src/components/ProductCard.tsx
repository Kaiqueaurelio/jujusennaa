import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { Info, Play } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
  variant?: 'poster' | 'featured';
}

export function ProductCard({ product, onClick, index = 0, variant = 'poster' }: ProductCardProps) {
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group flex-shrink-0 w-[280px] sm:w-[320px]"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card to-secondary" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Play Button */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div 
            className="w-14 h-14 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center border-2 border-foreground"
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
          </motion.div>
        </motion.div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div className="flex-1">
            <p className="text-foreground font-medium text-sm truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary font-bold text-xs">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground text-xs line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>
          <motion.button 
            className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Info className="w-4 h-4 text-foreground" />
          </motion.button>
        </div>

        {/* Red Progress Bar (Netflix style) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, delay: index * 0.2 }}
          />
        </div>
      </motion.div>
    );
  }

  // Poster variant (vertical cards like Netflix's "Minha Lista")
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.08,
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer group flex-shrink-0 w-[120px] sm:w-[140px]"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-card flex items-center justify-center">
            <span className="text-foreground/50 text-4xl font-bold">{product.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Netflix Logo Badge (for featured items) */}
      {product.featured && (
        <div className="absolute top-2 left-2 bg-primary px-1.5 py-0.5 rounded-sm">
          <span className="text-[10px] font-bold text-primary-foreground tracking-wider">N</span>
        </div>
      )}

      {/* Bottom gradient for title */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Title on hover */}
      <motion.div 
        className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <p className="text-foreground text-xs font-medium truncate">{product.name}</p>
      </motion.div>
    </motion.div>
  );
}
