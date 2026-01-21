import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { useValidateCoupon, calculateDiscount, Coupon } from '@/hooks/useCoupons';
import { useTrackProductClick } from '@/hooks/useAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShoppingCart, Ticket, Check, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          {/* Image Section */}
          <motion.div 
            className="relative aspect-video bg-secondary overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {product.image ? (
              <motion.img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <ShoppingCart className="w-16 h-16 text-primary/50" />
                </motion.div>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Tags */}
            <motion.div 
              className="absolute top-4 left-4 flex gap-2 flex-wrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {product.tags.map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge className="bg-green-600 text-white font-semibold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    -{discount}% OFF
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="p-6 space-y-6">
            <DialogHeader className="p-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {product.name}
                </DialogTitle>
                <span className="text-sm text-muted-foreground">
                  Categoria: {product.category}
                </span>
              </motion.div>
            </DialogHeader>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-muted-foreground leading-relaxed">
                {product.fullDescription}
              </p>

              {/* Coupon Input */}
              <motion.div 
                className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Ticket className="w-4 h-4 text-primary" />
                  </motion.div>
                  Cupom de Desconto
                </div>
                
                <AnimatePresence mode="wait">
                  {appliedCoupon ? (
                    <motion.div 
                      key="applied"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </motion.div>
                        <span className="font-mono font-semibold text-green-500">{appliedCoupon.code}</span>
                        <span className="text-sm text-muted-foreground">
                          (-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value.toFixed(2)}`})
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Digite o código"
                        className="bg-background border-border font-mono uppercase"
                      />
                      <Button 
                        onClick={handleApplyCoupon} 
                        disabled={validateCoupon.isPending || !couponCode.trim()} 
                        variant="outline"
                        className="min-w-[100px]"
                      >
                        {validateCoupon.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Price */}
              <motion.div 
                className="flex items-baseline gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span 
                  className="text-4xl font-bold text-primary"
                  key={finalPrice}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </motion.span>
                {(product.originalPrice || appliedCoupon) && (
                  <motion.span 
                    className="text-lg text-muted-foreground line-through"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    R$ {(product.originalPrice || product.price).toFixed(2).replace('.', ',')}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleWhatsAppClick} 
                  className="w-full btn-primary-glow py-6 text-lg font-semibold gap-3 relative overflow-hidden group" 
                  size="lg"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                    }}
                  />
                  <MessageCircle className="w-6 h-6" />
                  Comprar pelo WhatsApp
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Você será redirecionado para o WhatsApp
              </p>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}