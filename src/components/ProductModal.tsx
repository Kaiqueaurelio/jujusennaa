import { Product, generateWhatsAppLink } from '@/data/store';
import { useStore } from '@/contexts/StoreContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShoppingCart, X } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { profile } = useStore();

  if (!product) return null;

  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink(product, profile.whatsapp);
    window.open(link, '_blank');
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-bold text-foreground pr-8">
              {product.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-primary/50" />
              </div>
            )}
            
            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {tag}
                </Badge>
              ))}
              {discount > 0 && (
                <Badge className="bg-green-600 text-white font-semibold">
                  -{discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Categoria: {product.category}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-primary">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleWhatsAppClick}
            className="w-full btn-primary-glow py-6 text-lg font-semibold gap-3"
            size="lg"
          >
            <MessageCircle className="w-6 h-6" />
            Comprar pelo WhatsApp
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Você será redirecionado para o WhatsApp para finalizar a compra
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
