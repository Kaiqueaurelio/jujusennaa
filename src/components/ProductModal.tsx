import { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { useValidateCoupon, calculateDiscount, Coupon } from '@/hooks/useCoupons';
import { useTrackProductClick } from '@/hooks/useAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShoppingCart, Ticket, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const generateWhatsAppLink = (product: Product, whatsapp: string, coupon?: Coupon, finalPrice?: number): string => {
  let message = `Olá! Quero comprar o produto *${product.name}*\n`;
  
  if (coupon && finalPrice) {
    message += `💰 Valor: R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
    message += ` (cupom ${coupon.code} aplicado)\n`;
  } else {
    message += `💰 Valor: R$ ${product.price.toFixed(2).replace('.', ',')}\n`;
  }
  
  message += `🆔 Código: ${product.id}\n`;
  message += `📲 Origem: Link na Bio\n\n`;
  message += `Pode me informar as formas de pagamento?`;
  
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
};

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { data: profile } = useProfile();
  const validateCoupon = useValidateCoupon();
  const trackClick = useTrackProductClick();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const couponDiscount = appliedCoupon ? calculateDiscount(appliedCoupon, product.price) : 0;
  const finalPrice = product.price - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const coupon = await validateCoupon.mutateAsync({ 
        code: couponCode, 
        purchaseAmount: product.price 
      });
      setAppliedCoupon(coupon);
      toast.success('Cupom aplicado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleWhatsAppClick = () => {
    if (profile) {
      trackClick.mutate({ productId: product.id, converted: true });
      const link = generateWhatsAppLink(product, profile.whatsapp, appliedCoupon || undefined, appliedCoupon ? finalPrice : undefined);
      window.open(link, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground pr-8">{product.name}</DialogTitle>
        </DialogHeader>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="relative aspect-video bg-secondary rounded-lg overflow-hidden" whileHover={{ scale: 1.02 }}>
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-primary/50" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Badge key={tag} className="bg-primary text-primary-foreground font-semibold">{tag}</Badge>
              ))}
              {discount > 0 && <Badge className="bg-green-600 text-white font-semibold">-{discount}% OFF</Badge>}
            </div>
          </motion.div>

          <div className="space-y-4">
            <span className="text-sm text-muted-foreground">Categoria: {product.category}</span>
            <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>

            {/* Coupon Input */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Ticket className="w-4 h-4 text-primary" />
                Cupom de Desconto
              </div>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-mono font-semibold text-green-500">{appliedCoupon.code}</span>
                    <span className="text-sm text-muted-foreground">
                      (-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value.toFixed(2)}`})
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    className="bg-background border-border font-mono uppercase"
                  />
                  <Button onClick={handleApplyCoupon} disabled={validateCoupon.isPending || !couponCode.trim()} variant="outline">
                    {validateCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                  </Button>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-primary">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
              {(product.originalPrice || appliedCoupon) && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {(product.originalPrice || product.price).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>

          <div>
            <Button onClick={handleWhatsAppClick} className="w-full btn-primary-glow py-6 text-lg font-semibold gap-3" size="lg">
              <MessageCircle className="w-6 h-6" />
              Comprar pelo WhatsApp
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">Você será redirecionado para o WhatsApp</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
