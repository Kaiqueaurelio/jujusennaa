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
import {
  MessageCircle, ShoppingCart, Ticket, Check, X, Loader2, Sparkles,
  ArrowRight, Zap, ShieldCheck, Clock, Infinity as InfinityIcon, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { getProductImage } from '@/data/productImages';
import { CheckoutFlow } from '@/components/CheckoutFlow';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}


function parseBenefits(fullDescription: string): string[] {
  return fullDescription
    .split(/[.;]\s+/)
    .map(s => s.trim())
    .filter(b => b.length > 8)
    .slice(0, 6);
}

function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5 border border-border/50">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span>Entrega imediata</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5 border border-border/50">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>Compra segura</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5 border border-border/50">
        <InfinityIcon className="w-3.5 h-3.5 text-primary" />
        <span>Acesso vitalício</span>
      </div>
    </div>
  );
}

function UrgencyBanner() {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <Clock className="w-4 h-4" />
      </motion.div>
      Oferta por tempo limitado
    </motion.div>
  );
}

function GuaranteeBadge() {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">Satisfação garantida ou seu dinheiro de volta</span>
    </div>
  );
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { data: profile } = useProfile();
  const validateCoupon = useValidateCoupon();
  const trackClick = useTrackProductClick();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!product) return null;

  const productImage = getProductImage(product.image);
  const isQuoteOnly = product.price == null;
  const basePrice = product.price ?? 0;
  const discount = !isQuoteOnly && product.originalPrice
    ? Math.round((1 - basePrice / product.originalPrice) * 100)
    : 0;

  const couponDiscount = !isQuoteOnly && appliedCoupon ? calculateDiscount(appliedCoupon, basePrice) : 0;
  const finalPrice = basePrice - couponDiscount;
  const benefits = parseBenefits(product.fullDescription);
  const installments = !isQuoteOnly && finalPrice > 30 ? Math.min(Math.floor(finalPrice / 10), 12) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await validateCoupon.mutateAsync({ code: couponCode, purchaseAmount: basePrice });
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


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border-[#2a2a2a] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
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
            {productImage ? (
              <motion.img 
                layoutId={`product-image-${product.id}`}
                src={productImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <ShoppingCart className="w-16 h-16 text-primary/50" />
                </motion.div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Tags + Discount Badge */}
            <motion.div 
              className="absolute top-4 left-4 flex gap-2 flex-wrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {product.tags.map((tag, i) => (
                <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg">{tag}</Badge>
                </motion.div>
              ))}
              {discount > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                  <Badge className="bg-emerald-500 text-white font-semibold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />-{discount}% OFF
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="p-6 space-y-5">
            <DialogHeader className="p-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <DialogTitle className="text-2xl font-bold text-foreground">{product.name}</DialogTitle>
                <span className="text-sm text-muted-foreground">Categoria: {product.category}</span>
              </motion.div>
            </DialogHeader>

            {/* Urgency Banner */}
            {discount > 0 && <UrgencyBanner />}

            {/* Trust Badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <TrustBadges />
            </motion.div>

            {/* Benefits List */}
            {benefits.length > 0 && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  O que você recebe
                </h4>
                <ul className="space-y-1.5">
                  {benefits.map((benefit, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Coupon Input */}
            <motion.div 
              className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
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
                    className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Check className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                      <span className="font-mono font-semibold text-emerald-500">{appliedCoupon.code}</span>
                      <span className="text-sm text-muted-foreground">
                        (-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value.toFixed(2)}`})
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
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
                      {validateCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          {/* Price */}
          <motion.div 
            className="space-y-1 pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isQuoteOnly ? (
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-primary uppercase tracking-wide">Sob consulta</span>
                <p className="text-sm text-muted-foreground">Solicite um orçamento personalizado via WhatsApp.</p>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
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
                    <motion.span className="text-lg text-muted-foreground line-through" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      R$ {(product.originalPrice || basePrice).toFixed(2).replace('.', ',')}
                    </motion.span>
                  )}
                </div>

                {installments > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ou <span className="font-semibold text-foreground">{installments}x</span> de{' '}
                    <span className="font-semibold text-foreground">
                      R$ {(finalPrice / installments).toFixed(2).replace('.', ',')}
                    </span>
                  </p>
                )}
              </>
            )}
          </motion.div>

            {/* Guarantee */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <GuaranteeBadge />
            </motion.div>

            {/* CTA / Checkout Flow */}
            {showCheckout ? (
              <CheckoutFlow
                product={product}
                finalPrice={finalPrice}
                appliedCoupon={appliedCoupon}
                whatsapp={profile?.whatsapp || '5511939222885'}
                onBack={() => setShowCheckout(false)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => {
                      if (profile) trackClick.mutate({ productId: product.id, converted: true });
                      if (isQuoteOnly) {
                        const whatsapp = profile?.whatsapp || '5511939222885';
                        const msg = encodeURIComponent(`Olá! Gostaria de um orçamento para: ${product.name}`);
                        window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
                      } else {
                        setShowCheckout(true);
                      }
                    }}
                    className="w-full btn-primary-glow py-6 text-lg font-semibold gap-3 relative overflow-hidden group bg-emerald-500 hover:bg-emerald-600" 
                    size="lg"
                  >
                    <motion.div
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                    />
                    <MessageCircle className="w-6 h-6" />
                    {isQuoteOnly ? 'Solicitar orçamento' : 'Garantir o meu agora'}
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  ⚡ Atendimento imediato via WhatsApp
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
