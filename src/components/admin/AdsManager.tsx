import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAds, useCreateAd, useUpdateAd, useDeleteAd, Ad } from '@/hooks/useAds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export function AdsManager() {
  const { data: ads, isLoading } = useAds();
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    advertiser_name: '',
    active: true,
    sort_order: 1,
    expires_at: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      advertiser_name: '',
      active: true,
      sort_order: 1,
      expires_at: '',
    });
    setEditingAd(null);
  };

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        description: ad.description || '',
        image_url: ad.image_url || '',
        link_url: ad.link_url,
        advertiser_name: ad.advertiser_name,
        active: ad.active,
        sort_order: ad.sort_order,
        expires_at: ad.expires_at ? ad.expires_at.split('T')[0] : '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const adData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim() || null,
      link_url: formData.link_url.trim(),
      advertiser_name: formData.advertiser_name.trim(),
      active: formData.active,
      sort_order: formData.sort_order,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    };

    try {
      if (editingAd) {
        await updateAd.mutateAsync({ id: editingAd.id, ...adData });
        toast.success('Anúncio atualizado com sucesso!');
      } else {
        await createAd.mutateAsync(adData);
        toast.success('Anúncio criado com sucesso!');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar anúncio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;
    
    try {
      await deleteAd.mutateAsync(id);
      toast.success('Anúncio excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir anúncio');
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      await updateAd.mutateAsync({ id: ad.id, active: !ad.active });
      toast.success(ad.active ? 'Anúncio desativado' : 'Anúncio ativado');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Gerenciar Anúncios</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advertiser_name">Nome do Anunciante</Label>
                <Input
                  id="advertiser_name"
                  value={formData.advertiser_name}
                  onChange={e => setFormData(prev => ({ ...prev, advertiser_name: e.target.value }))}
                  placeholder="Empresa XYZ"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Oferta Especial!"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do anúncio..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">Link do Anúncio</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://exemplo.com/banner.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordem</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expira em</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={e => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createAd.isPending || updateAd.isPending}>
                {editingAd ? 'Salvar Alterações' : 'Criar Anúncio'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {ads?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum anúncio cadastrado</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>
                Criar primeiro anúncio
              </Button>
            </CardContent>
          </Card>
        ) : (
          ads?.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={!ad.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-secondary">
                        <img 
                          src={ad.image_url} 
                          alt={ad.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">
                            {ad.advertiser_name}
                          </span>
                          <h3 className="font-semibold text-foreground truncate">
                            {ad.title}
                          </h3>
                          {ad.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {ad.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(ad.link_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(ad)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={ad.active}
                            onCheckedChange={() => handleToggleActive(ad)}
                          />
                        </div>
                      </div>
                      {ad.expires_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expira: {new Date(ad.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
