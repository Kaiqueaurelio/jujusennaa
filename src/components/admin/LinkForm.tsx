import { useState } from 'react';
import { Link as LinkType } from '@/hooks/useLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LinkFormProps {
  link?: LinkType;
  onSave: (link: any) => void;
  onCancel: () => void;
}

export function LinkForm({ link, onSave, onCancel }: LinkFormProps) {
  const [form, setForm] = useState({
    title: link?.title || '',
    url: link?.url || '',
    icon: link?.icon || 'ExternalLink',
    category: link?.category || 'content' as 'social' | 'content' | 'store',
    order: link?.order || 1,
    active: link?.active ?? true,
    clicks: link?.clicks || 0,
  });

  const handleSubmit = () => {
    if (link) {
      onSave({ ...link, ...form });
    } else {
      onSave(form);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 mb-4 rounded-xl bg-card border border-border/50 space-y-4 shadow-lg"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">
          {link ? 'Editar Link' : 'Novo Link'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-secondary/50 border-border/50 text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
            className="w-full h-10 px-3 rounded-md bg-secondary/50 border border-border/50 text-foreground text-sm"
          >
            <option value="content">Links</option>
            <option value="social">Redes Sociais</option>
            <option value="store">Loja</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">URL</Label>
        <Input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="bg-secondary/50 border-border/50 text-foreground"
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ícone</Label>
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full h-10 px-3 rounded-md bg-secondary/50 border border-border/50 text-foreground text-sm"
          >
            <option value="ExternalLink">Link</option>
            <option value="Instagram">Instagram</option>
            <option value="MessageCircle">WhatsApp</option>
            <option value="Globe">Website</option>
            <option value="BookOpen">Ebook</option>
            <option value="Palette">Portfolio</option>
          </select>
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
