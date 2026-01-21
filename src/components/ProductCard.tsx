import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group netflix-card cursor-pointer overflow-hidden relative"
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(357 91% 47% / 0.2) 0%, transparent 50%)',
          boxShadow: '0 0 40px hsl(357 91% 47% / 0.3)'
        }}
      />
      
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {product.image ? (
          <motion.img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ShoppingCart className="w-12 h-12 text-primary/50" />
            </motion.div>
          </div>
        )}
        
        {/* Tags with staggered animation */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {product.tags.map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 + i * 0.1 + 0.3 }}
            >
              <Badge 
                className="bg-primary text-primary-foreground text-xs font-semibold shadow-lg"
              >
                {tag}
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Featured sparkle */}
        {product.featured && (
          <motion.div
            className="absolute top-3 right-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
          </motion.div>
        )}

        {/* Overlay gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        />

        {/* View details overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm shadow-lg"
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
          >
            Ver Detalhes
          </motion.span>
        </motion.div>
      </div>
      
      <div className="p-4 relative">
        <motion.h3 
          className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors"
          layout
        >
          {product.name}
        </motion.h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-xl font-bold text-primary"
            whileHover={{ scale: 1.1 }}
          >
            R$ {product.price.toFixed(2).replace('.', ',')}
          </motion.span>
          {product.originalPrice && (
            <motion.span 
              className="text-sm text-muted-foreground line-through"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}