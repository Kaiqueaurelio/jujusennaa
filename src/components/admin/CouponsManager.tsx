import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCoupons, useAddCoupon, useUpdateCoupon, useDeleteCoupon, Coupon } from '@/hooks/useCoupons';
import { Plus, Edit2, Trash2, Save, X, Ticket, Loader2, Percent, DollarSign } from 'lucide-react';

export default function CouponsManager() {
  const { data: coupons = [], isLoading } = useCoupons();
  const addCoupon = useAddCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAdd = (data: Omit<Coupon, 'id' | 'used_count' | 'created_at'>) => {
    addCoupon.mutate(data);
    setIsAdding(false);
  };

  const handleUpdate = (coupon: Coupon) => {
    updateCoupon.mutate(coupon);
    setEditingCoupon(null);
  };

  const formatExpiry = (date: string | null) => {
    if (!date) return 'Sem expiração';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Cupons de Desconto
        </CardTitle>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cupom
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <CouponForm
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div key={coupon.id}>
              {editingCoupon?.id === coupon.id ? (
                <CouponForm
                  coupon={editingCoupon}
                  onSave={handleUpdate}
                  onCancel={() => setEditingCoupon(null)}
                />
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="w-6 h-6 text-primary" />
                      ) : (
                        <DollarSign className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-foreground text-lg">{coupon.code}</p>
                        {!coupon.active && <Badge variant="secondary">Inativo</Badge>}
                        {isExpired(coupon.expires_at) && <Badge variant="destructive">Expirado</Badge>}
                      </div>
                      <p className="text-sm text-primary font-semibold">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% de desconto`
                          : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Usos: {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''} • 
                        Expira: {formatExpiry(coupon.expires_at)} •
                        Mín: R$ {coupon.min_purchase.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={(checked) => updateCoupon.mutate({ ...coupon, active: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setEditingCoupon(coupon)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteCoupon.mutate(coupon.id)} 
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {coupons.length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cupom criado ainda
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CouponForm({
  coupon,
  onSave,
  onCancel,
}: {
  coupon?: Coupon;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'percentage' as 'percentage' | 'fixed',
    discount_value: coupon?.discount_value || 10,
    min_purchase: coupon?.min_purchase || 0,
    max_uses: coupon?.max_uses || null as number | null,
    active: coupon?.active ?? true,
    expires_at: coupon?.expires_at ? coupon.expires_at.split('T')[0] : '',
  });

  const handleSubmit = () => {
    const data = {
      ...form,
      code: form.code.toUpperCase(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      max_uses: form.max_uses || null,
    };
    
    if (coupon) {
      onSave({ ...coupon, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <div className="p-4 mb-4 rounded-lg bg-muted border border-border space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Código do Cupom</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="bg-secondary border-border text-foreground font-mono uppercase"
            placeholder="DESCONTO10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Tipo de Desconto</Label>
          <select
            value={form.discount_type}
            onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
            className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground"
          >
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-foreground">
            Valor do Desconto {form.discount_type === 'percentage' ? '(%)' : '(R$)'}
          </Label>
          <Input
            type="number"
            step={form.discount_type === 'percentage' ? '1' : '0.01'}
            min="0"
            max={form.discount_type === 'percentage' ? '100' : undefined}
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Compra Mínima (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.min_purchase}
            onChange={(e) => setForm({ ...form, min_purchase: parseFloat(e.target.value) || 0 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Máximo de Usos (opcional)</Label>
          <Input
            type="number"
            min="0"
            value={form.max_uses || ''}
            onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || null })}
            className="bg-secondary border-border text-foreground"
            placeholder="Ilimitado"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Data de Expiração (opcional)</Label>
        <Input
          type="date"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          className="bg-secondary border-border text-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.active}
          onCheckedChange={(checked) => setForm({ ...form, active: checked })}
        />
        <Label className="text-foreground">Ativo</Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!form.code || form.discount_value <= 0}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
