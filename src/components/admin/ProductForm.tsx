import { useState, useRef } from 'react';
import { useGenerateProductImage, Product } from '@/hooks/useProducts';
import { useUploadProductImage } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X, Upload, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductFormProps {
  product?: Product;
  onSave: (product: any) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const generateImage = useGenerateProductImage();
  const uploadImage = useUploadProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    fullDescription: product?.fullDescription || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    image: product?.image || '',
    category: product?.category || '',
    tags: product?.tags?.join(', ') || '',
    order: product?.order || 1,
    active: product?.active ?? true,
    featured: product?.featured ?? false,
  });

  const handleGenerateImage = async () => {
    if (!form.name) return;
    const imageUrl = await generateImage.mutateAsync({
      productName: form.name,
      productCategory: form.category,
    });
    if (imageUrl) {
      setForm({ ...form, image: imageUrl });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await uploadImage.mutateAsync({ file, productId: product?.id });
      if (imageUrl) {
        setForm({ ...form, image: imageUrl });
      }
    }
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      originalPrice: form.originalPrice || null,
    };
    if (product) {
      onSave({ ...product, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 mb-4 rounded-xl bg-card border border-border/50 space-y-5 shadow-lg"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-secondary/50 border-border/50 text-foreground focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</Label>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-secondary/50 border-border/50 text-foreground focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição curta</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-secondary/50 border-border/50 text-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição completa</Label>
        <Textarea
          value={form.fullDescription}
          onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
          className="bg-secondary/50 border-border/50 text-foreground"
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="bg-secondary/50 border-border/50 text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço original</Label>
          <Input
            type="number"
            step="0.01"
            value={form.originalPrice || ''}
            onChange={(e) => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
            className="bg-secondary/50 border-border/50 text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ordem</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
            className="bg-secondary/50 border-border/50 text-foreground"
          />
        </div>
      </div>

      {/* Image Section */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Imagem do Produto</Label>
        <div className="flex gap-3 items-end">
          {form.image && (
            <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden ring-1 ring-border/50">
              <img src={form.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className="gap-2 border-border/50"
            >
              {uploadImage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              disabled={generateImage.isPending || !form.name}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              {generateImage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Gerar IA
            </Button>
          </div>
        </div>
        <Input
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="bg-secondary/50 border-border/50 text-foreground text-xs"
          placeholder="Ou cole a URL da imagem..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags (separadas por vírgula)</Label>
        <Input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="bg-secondary/50 border-border/50 text-foreground"
          placeholder="Novo, Mais vendido"
        />
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
          <span className="text-sm text-foreground">Ativo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
          <span className="text-sm text-foreground">Destaque</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <X className="w-4 h-4" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="gap-2 btn-primary-glow">
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </motion.div>
  );
}
