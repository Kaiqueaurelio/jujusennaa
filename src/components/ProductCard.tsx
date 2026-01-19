import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group netflix-card cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {product.image ? (
          <motion.img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-primary/50" />
          </div>
        )}
        
        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {product.tags.map((tag) => (
            <Badge 
              key={tag} 
              className="bg-primary text-primary-foreground text-xs font-semibold"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
