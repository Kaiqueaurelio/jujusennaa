import { useState } from 'react';
import { z } from 'zod';
import { Product } from '@/hooks/useProducts';
import { Coupon } from '@/hooks/useCoupons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MessageCircle, ArrowRight, ArrowLeft, Minus, Plus, User, Mail, Phone,
  ShoppingCart, CheckCircle2, Package, AlertCircle
} from 'lucide-react';

interface CheckoutFlowProps {
  product: Product;
  finalPrice: number;
  appliedCoupon: Coupon | null;
  whatsapp: string;
  onBack: () => void;
}

const buyerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  phone: z.string().optional(),
});

type BuyerData = z.infer<typeof buyerSchema>;

export function CheckoutFlow({ product, finalPrice, appliedCoupon, whatsapp, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [buyer, setBuyer] = useState<BuyerData>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof BuyerData, string>>>({});

  const totalPrice = finalPrice * quantity;
  const installments = totalPrice > 30 ? Math.min(Math.floor(totalPrice / 10), 12) : 0;

  const validateBuyer = (): boolean => {
    const result = buyerSchema.safeParse(buyer);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BuyerData, string>> = {};
      result.error.errors.forEach(e => {
        const field = e.path[0] as keyof BuyerData;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateBuyer()) return;
    setStep(prev => prev + 1);
  };

  const handleSendWhatsApp = () => {
    let message = `🛒 *NOVO PEDIDO*\n\n`;
    message += `👤 *Cliente:* ${buyer.name}\n`;
    message += `📧 *E-mail:* ${buyer.email}\n`;
    if (buyer.phone) message += `📱 *Telefone:* ${buyer.phone}\n`;
    message += `\n`;
    message += `📦 *Produto:* ${product.name}\n`;
    message += `🔢 *Quantidade:* ${quantity}\n`;
    message += `💰 *Valor unitário:* R$ ${finalPrice.toFixed(2).replace('.', ',')}\n`;
    if (appliedCoupon) {
      message += `🎟️ *Cupom:* ${appliedCoupon.code} (-${appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value.toFixed(2)}`})\n`;
    }
    message += `\n💵 *Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n`;
    if (installments > 0) {
      message += `ou ${installments}x de R$ ${(totalPrice / installments).toFixed(2).replace('.', ',')}\n`;
    }
    message += `\n🆔 Código: ${product.id}\n`;
    message += `📲 Origem: Link na Bio`;

    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const steps = ['Quantidade', 'Seus dados', 'Resumo', 'Confirmar'];

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1 px-1">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <span className={`text-[10px] transition-colors duration-300 ${
              i <= step ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content with CSS transition */}
      <div className="min-h-[200px]">
        {/* Step 0: Quantity */}
        <div
          className="transition-all duration-300"
          style={{
            display: step === 0 ? 'block' : 'none',
            opacity: step === 0 ? 1 : 0,
          }}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Quantas unidades?</h3>
            </div>

            <div className="flex items-center justify-center gap-6 py-6">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent active:scale-90 transition-all disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <Minus className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-5xl font-bold text-foreground tabular-nums w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent active:scale-90 transition-all disabled:opacity-40"
                disabled={quantity >= 10}
              >
                <Plus className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {quantity}x R$ {finalPrice.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-2xl font-bold text-primary">
                Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
              </p>
              {installments > 0 && (
                <p className="text-sm text-muted-foreground">
                  ou {installments}x de R$ {(totalPrice / installments).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: Buyer data */}
        <div
          className="transition-all duration-300"
          style={{
            display: step === 1 ? 'block' : 'none',
            opacity: step === 1 ? 1 : 0,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Seus dados</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-name" className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nome completo *
                </Label>
                <Input
                  id="checkout-name"
                  value={buyer.name}
                  onChange={e => { setBuyer(b => ({ ...b, name: e.target.value })); setErrors(e => ({ ...e, name: undefined })); }}
                  placeholder="Seu nome completo"
                  className={errors.name ? 'border-destructive' : ''}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> E-mail *
                </Label>
                <Input
                  id="checkout-email"
                  type="email"
                  inputMode="email"
                  value={buyer.email}
                  onChange={e => { setBuyer(b => ({ ...b, email: e.target.value })); setErrors(e => ({ ...e, email: undefined })); }}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-phone" className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefone (opcional)
                </Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  inputMode="tel"
                  value={buyer.phone}
                  onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Summary */}
        <div
          className="transition-all duration-300"
          style={{
            display: step === 2 ? 'block' : 'none',
            opacity: step === 2 ? 1 : 0,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Resumo do pedido</h3>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produto</span>
                <span className="font-medium text-foreground">{product.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="font-medium text-foreground">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor unitário</span>
                <span className="font-medium text-foreground">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cupom</span>
                  <span className="font-medium text-emerald-500">
                    {appliedCoupon.code} (-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value.toFixed(2)}`})
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-primary">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {installments > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                  ou {installments}x de R$ {(totalPrice / installments).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados do comprador</p>
              <div className="space-y-1 text-sm">
                <p className="text-foreground"><span className="text-muted-foreground">Nome:</span> {buyer.name}</p>
                <p className="text-foreground"><span className="text-muted-foreground">E-mail:</span> {buyer.email}</p>
                {buyer.phone && <p className="text-foreground"><span className="text-muted-foreground">Telefone:</span> {buyer.phone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Confirm */}
        <div
          className="transition-all duration-300"
          style={{
            display: step === 3 ? 'block' : 'none',
            opacity: step === 3 ? 1 : 0,
          }}
        >
          <div className="space-y-5 text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Tudo pronto!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clique abaixo para enviar seu pedido via WhatsApp. Nosso atendimento é imediato!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-left">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{quantity}x {product.name}</span>
                {' • '}
                <span className="font-bold text-primary">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </p>
            </div>

            <Button
              onClick={handleSendWhatsApp}
              className="w-full py-6 text-lg font-semibold gap-3 bg-emerald-500 hover:bg-emerald-600 relative overflow-hidden group"
              size="lg"
            >
              <div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
              />
              <MessageCircle className="w-6 h-6" />
              Enviar pedido via WhatsApp
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground">⚡ Atendimento imediato</p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Voltar ao produto' : 'Voltar'}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <Button
          variant="ghost"
          onClick={() => setStep(2)}
          className="w-full gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Revisar pedido
        </Button>
      )}
    </div>
  );
}
