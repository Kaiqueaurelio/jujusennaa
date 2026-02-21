import { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Play, Plus, ChevronDown, Flame, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { getProductImage } from '@/data/productImages';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

function getBadge(product: Product): { text: string; color: string; icon?: 'flame' | 'trending' } | null {
  if (product.tags?.includes('mais vendido')) return { text: 'Mais Vendido', color: 'bg-primary', icon: 'flame' };
  if (product.tags?.includes('popular')) return { text: 'Popular', color: 'bg-primary', icon: 'flame' };
  if (product.featured) return { text: 'Premium', color: 'bg-primary' };
  if (product.tags?.includes('novo')) return { text: 'Novo', color: 'bg-emerald-500', icon: 'trending' };
  return null;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const { data: profile } = useProfile();
  const [isHovered, setIsHovered] = useState(false);
  
  const badge = getBadge(product);
  const productImage = getProductImage(product.image);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsapp = profile?.whatsapp || '5511939222885';
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name}\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')}`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="flex-shrink-0 w-[230px] sm:w-[300px]">
      <div
        className="relative rounded-md overflow-hidden bg-card cursor-pointer transition-all duration-300 ease-out"
        style={{
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
          zIndex: isHovered ? 50 : 1,
          boxShadow: isHovered ? '0 16px 48px hsl(0 0% 0% / 0.7)' : 'none',
          transitionDelay: isHovered ? '0ms' : '0ms',
        }}
        onMouseEnter={() => {
          const timer = setTimeout(() => setIsHovered(true), 300);
          (window as any).__hoverTimer = timer;
        }}
        onMouseLeave={() => {
          clearTimeout((window as any).__hoverTimer);
          setIsHovered(false);
        }}
        onClick={onClick}
      >
        {/* Thumbnail 16:9 */}
        <div className="relative aspect-video overflow-hidden">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground text-4xl font-bold">{product.name.charAt(0)}</span>
            </div>
          )}

          {/* Badge */}
          {badge && !isHovered && (
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold text-white ${badge.color} flex items-center gap-1`}>
              {badge.icon === 'flame' && <Flame className="w-3 h-3" />}
              {badge.icon === 'trending' && <TrendingUp className="w-3 h-3" />}
              {badge.text}
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && !isHovered && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-emerald-500">
              -{discount}%
            </div>
          )}

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          )}
        </div>

        {/* Normal title (below thumbnail) */}
        {!isHovered && (
          <div className="p-2">
            <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
          </div>
        )}

        {/* Hover expanded info */}
        {isHovered && (
          <div className="p-3 space-y-2 bg-card">
            {/* Action buttons row */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="w-8 h-8 rounded-full border-2 border-foreground bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="w-8 h-8 rounded-full border-2 border-muted-foreground/50 text-foreground flex items-center justify-center hover:border-foreground transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="flex-1" />
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="w-8 h-8 rounded-full border-2 border-muted-foreground/50 text-foreground flex items-center justify-center hover:border-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Title + Price */}
            <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-sm">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-muted-foreground text-xs line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
