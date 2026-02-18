import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAds, useCreateAd, useUpdateAd, useDeleteAd, Ad } from '@/hooks/useAds';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminTableSkeleton } from '@/components/SkeletonLoaders';
import { 
  Plus, Pencil, Trash2, ExternalLink, Megaphone, Upload, 
  GripVertical, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon, Film, FileImage
} from 'lucide-react';
import { toast } from 'sonner';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25, delay: i * 0.06 }
  }),
  exit: { opacity: 0, x: -80, scale: 0.9, transition: { type: "spring" as const, stiffness: 400, damping: 30 } }
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 20, delay: i * 0.1 }
  })
};

const buttonHover = { scale: 1.15, transition: { type: "spring" as const, stiffness: 400, damping: 15 } };
const buttonTap = { scale: 0.85 };

// Detect media type from URL or filename
function getMediaType(url: string): 'image' | 'video' | 'gif' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.gif')) return 'gif';
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.avi')) return 'video';
  return 'image';
}

// Accepted file types for ads
const ACCEPTED_MEDIA = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

export function AdsManager() {
  const { data: ads, isLoading } = useAds();
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      title: '', description: '', image_url: '', link_url: '',
      advertiser_name: '', active: true, sort_order: 1, expires_at: '',
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Formato não suportado. Use JPG, PNG, GIF, WebP, MP4 ou WebM');
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB video, 10MB image
    if (file.size > maxSize) {
      toast.error(`O arquivo deve ter no máximo ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ad-${Date.now()}.${fileExt}`;
      const filePath = `ads/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success(`${isVideo ? 'Vídeo' : isImage && file.type === 'image/gif' ? 'GIF' : 'Imagem'} enviado(a) com sucesso!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('O título é obrigatório'); return; }
    if (!formData.link_url.trim()) { toast.error('O link é obrigatório'); return; }
    if (!formData.advertiser_name.trim()) { toast.error('O nome do anunciante é obrigatório'); return; }

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
      console.error('Save error:', error);
      toast.error('Erro ao salvar anúncio. Verifique se você tem permissão de administrador.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;
    try {
      await deleteAd.mutateAsync(id);
      toast.success('Anúncio excluído com sucesso!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir anúncio');
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      await updateAd.mutateAsync({ id: ad.id, active: !ad.active });
      toast.success(ad.active ? 'Anúncio desativado' : 'Anúncio ativado');
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Render media preview (image, gif, or video)
  const renderMediaPreview = (url: string, className?: string) => {
    const type = getMediaType(url);
    if (type === 'video') {
      return (
        <video
          src={url}
          className={className || 'w-full h-full object-cover'}
          muted
          loop
          autoPlay
          playsInline
        />
      );
    }
    return <img src={url} alt="Preview" className={className || 'w-full h-full object-cover'} />;
  };

  // Render media thumbnail with type indicator
  const renderMediaThumbnail = (url: string) => {
    const type = getMediaType(url);
    return (
      <div className="relative w-full h-full">
        {type === 'video' ? (
          <video src={url} className="w-full h-full object-cover" muted playsInline />
        ) : (
          <motion.img
            src={url}
            alt="Thumbnail"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
          />
        )}
        {type !== 'image' && (
          <div className="absolute bottom-0.5 right-0.5 bg-background/80 backdrop-blur-sm rounded px-1 py-0.5">
            {type === 'video' ? (
              <Film className="w-3 h-3 text-primary" />
            ) : (
              <FileImage className="w-3 h-3 text-primary" />
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Gerenciar Anúncios</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Anúncio
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                {editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Media Upload (Image/GIF/Video) */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Mídia do Anúncio
                  <span className="text-xs text-muted-foreground font-normal">(imagem, GIF ou vídeo)</span>
                </Label>
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="wait">
                    {formData.image_url ? (
                      <motion.div
                        key="preview"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary"
                      >
                        {renderMediaPreview(formData.image_url)}
                        {getMediaType(formData.image_url) !== 'image' && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              {getMediaType(formData.image_url) === 'video' ? (
                                <><Film className="w-3 h-3" /> Vídeo</>
                              ) : (
                                <><FileImage className="w-3 h-3" /> GIF</>
                              )}
                            </Badge>
                          </div>
                        )}
                        <Button
                          type="button" variant="destructive" size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        whileHover={{ borderColor: 'hsl(var(--primary))', scale: 1.01 }}
                        className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 cursor-pointer bg-secondary/30 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {isUploading ? 'Enviando...' : 'Clique para enviar mídia'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          JPG, PNG, GIF, WebP, MP4, WebM
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_MEDIA}
                    className="hidden"
                    onChange={handleMediaUpload}
                    disabled={isUploading}
                  />
                  <div className="text-xs text-muted-foreground">Ou insira a URL da mídia:</div>
                  <Input type="url" value={formData.image_url} onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))} placeholder="https://exemplo.com/banner.jpg ou .gif ou .mp4" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advertiser_name">Nome do Anunciante *</Label>
                <Input id="advertiser_name" value={formData.advertiser_name} onChange={e => setFormData(prev => ({ ...prev, advertiser_name: e.target.value }))} placeholder="Ex: Empresa XYZ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio *</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Ex: Oferta Especial de Verão!" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição detalhada do anúncio..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link do Anúncio *
                </Label>
                <Input id="link_url" type="url" value={formData.link_url} onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))} placeholder="https://exemplo.com/oferta" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordem de Exibição</Label>
                  <Input id="sort_order" type="number" value={formData.sort_order} onChange={e => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))} min={1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Data de Expiração</Label>
                  <Input id="expires_at" type="date" value={formData.expires_at} onChange={e => setFormData(prev => ({ ...prev, expires_at: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {formData.active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  <Label htmlFor="active" className="cursor-pointer">
                    {formData.active ? 'Anúncio Ativo' : 'Anúncio Inativo'}
                  </Label>
                </div>
                <Switch id="active" checked={formData.active} onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))} />
              </div>

              <Button type="submit" className="w-full" disabled={createAd.isPending || updateAd.isPending || isUploading}>
                {createAd.isPending || updateAd.isPending ? 'Salvando...' : (editingAd ? 'Salvar Alterações' : 'Criar Anúncio')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: ads?.length || 0, label: 'Total', color: 'text-primary' },
          { value: ads?.filter(a => a.active).length || 0, label: 'Ativos', color: 'text-green-500' },
          { value: ads?.filter(a => !a.active).length || 0, label: 'Inativos', color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={statVariants} initial="hidden" animate="visible">
            <Card className="bg-secondary/30">
              <CardContent className="p-3 text-center">
                <motion.div
                  className={`text-2xl font-bold ${stat.color}`}
                  key={stat.value}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ads List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {ads?.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                    <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  </motion.div>
                  <p className="text-muted-foreground">Nenhum anúncio cadastrado</p>
                  <Button variant="link" onClick={() => handleOpenDialog()}>Criar primeiro anúncio</Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            ads?.map((ad, index) => (
              <motion.div
                key={ad.id}
                layout
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ scale: 1.008, transition: { type: "spring" as const, stiffness: 400, damping: 25 } }}
              >
                <motion.div animate={{ opacity: ad.active ? 1 : 0.55 }} transition={{ duration: 0.3 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-muted-foreground cursor-move">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        {/* Thumbnail with media type indicator */}
                        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                          {ad.image_url ? (
                            renderMediaThumbnail(ad.image_url)
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">
                                  {ad.advertiser_name}
                                </span>
                                {ad.image_url && getMediaType(ad.image_url) !== 'image' && (
                                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-primary/30 text-primary">
                                    {getMediaType(ad.image_url) === 'video' ? '🎬 Vídeo' : '✨ GIF'}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground truncate">{ad.title}</h3>
                              {ad.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <LinkIcon className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{ad.link_url}</span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(ad.link_url, '_blank')}>
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(ad)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(ad.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <Switch checked={ad.active} onCheckedChange={() => handleToggleActive(ad)} />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Ordem: {ad.sort_order}</span>
                            {ad.expires_at && (
                              <span>Expira: {new Date(ad.expires_at).toLocaleDateString('pt-BR')}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full ${ad.active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                              {ad.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
