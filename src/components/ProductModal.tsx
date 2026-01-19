import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShoppingCart } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const generateWhatsAppLink = (product: Product, whatsapp: string): string => {
  const message = encodeURIComponent(
    `Olá! Quero comprar o produto *${product.name}*\n` +
    `💰 Valor: R$ ${product.price.toFixed(2).replace('.', ',')}\n` +
    `🆔 Código: ${product.id}\n` +
    `📲 Origem: Link na Bio\n\n` +
    `Pode me informar as formas de pagamento?`
  );
  return `https://wa.me/${whatsapp}?text=${message}`;
};

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { data: profile } = useProfile();

  if (!product) return null;

  const handleWhatsAppClick = () => {
    if (profile) {
      const link = generateWhatsAppLink(product, profile.whatsapp);
      window.open(link, '_blank');
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Image */}
          <motion.div 
            className="relative aspect-video bg-secondary rounded-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Categoria: {product.category}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Price */}
            <motion.div 
              className="flex items-baseline gap-3 pt-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="text-3xl font-bold text-primary">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button 
              onClick={handleWhatsAppClick}
              className="w-full btn-primary-glow py-6 text-lg font-semibold gap-3"
              size="lg"
            >
              <MessageCircle className="w-6 h-6" />
              Comprar pelo WhatsApp
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Você será redirecionado para o WhatsApp para finalizar a compra
            </p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
