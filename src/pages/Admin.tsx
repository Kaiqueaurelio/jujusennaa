import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useLinks, useAddLink, useUpdateLink, useDeleteLink, Link as LinkType } from '@/hooks/useLinks';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { useSendPushNotification } from '@/hooks/useSendPush';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import CouponsManager from '@/components/admin/CouponsManager';
import { AdsManager } from '@/components/admin/AdsManager';
import EllaChat from '@/components/admin/EllaChat';
import { ProductForm } from '@/components/admin/ProductForm';
import { LinkForm } from '@/components/admin/LinkForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ellaAvatar from '@/assets/ella-avatar.png';
import { X } from 'lucide-react';
import {
  LogOut, User, ShoppingBag, Link2, Trash2, Plus,
  Edit2, BarChart3, Eye, Upload, Loader2, Ticket, Megaphone,
  Home, TrendingUp, Zap, Crown, Sparkles
} from 'lucide-react';

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function Admin() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: links = [], isLoading: linksLoading } = useLinks();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const addLink = useAddLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const sendPush = useSendPushNotification();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [ellaOpen, setEllaOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground">Carregando painel...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  if (productsLoading || linksLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);
  const activeProducts = products.filter(p => p.active).length;
  const featuredProducts = products.filter(p => p.featured).length;

  const handleSaveProduct = (product: Product) => {
    updateProduct.mutate(product);
    setEditingProduct(null);
  };

  const handleAddNewProduct = (product: Omit<Product, 'id'>) => {
    addProduct.mutate(product, {
      onSuccess: () => {
        sendPush.mutate({
          title: '🚀 Novo Produto Disponível!',
          body: `${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`,
          url: '/'
        });
      }
    });
    setIsAddingProduct(false);
  };

  const handleSaveLink = (link: LinkType) => {
    updateLink.mutate(link);
    setEditingLink(null);
  };

  const handleAddNewLink = (link: Omit<LinkType, 'id'>) => {
    addLink.mutate(link);
    setIsAddingLink(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      uploadAvatar.mutate({ file, profileId: profile.id });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const stats = [
    { icon: ShoppingBag, label: 'Produtos', value: products.length, sub: `${activeProducts} ativos`, color: 'from-primary/20 to-primary/5' },
    { icon: Link2, label: 'Links', value: links.length, sub: `${totalClicks} cliques`, color: 'from-blue-500/20 to-blue-500/5' },
    { icon: TrendingUp, label: 'Cliques Total', value: totalClicks, sub: 'todas as plataformas', color: 'from-emerald-500/20 to-emerald-500/5' },
    { icon: Crown, label: 'Destaques', value: featuredProducts, sub: 'produtos em destaque', color: 'from-amber-500/20 to-amber-500/5' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 0 20px hsl(357 91% 47% / 0.3)' }}
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">Painel Admin</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </Button>
              <a
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={statCardVariants}
            >
              <Card className="bg-card/80 border-border/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-colors">
                <CardContent className="p-4 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary/80 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-card/80 border border-border/50 backdrop-blur-sm flex-wrap h-auto gap-0.5 p-1 w-full justify-start">
            <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Produtos</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">{products.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Link2 className="w-3.5 h-3.5" />
              <span>Links</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">{links.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <User className="w-3.5 h-3.5" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Ticket className="w-3.5 h-3.5" />
              <span>Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Anúncios</span>
            </TabsTrigger>
            <TabsTrigger value="ella" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ella IA</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AnalyticsDashboard />
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-foreground text-lg">Produtos</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{products.length} produtos cadastrados</p>
                  </div>
                  <Button onClick={() => setIsAddingProduct(true)} className="gap-2 btn-primary-glow" size="sm">
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </Button>
                </CardHeader>
                <CardContent>
                  {isAddingProduct && (
                    <ProductForm
                      onSave={handleAddNewProduct}
                      onCancel={() => setIsAddingProduct(false)}
                    />
                  )}

                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {editingProduct?.id === product.id ? (
                          <ProductForm
                            product={editingProduct}
                            onSave={handleSaveProduct}
                            onCancel={() => setEditingProduct(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-border/60 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-14 h-10 rounded-md bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-border/30">
                                {product.image ? (
                                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                                  {product.featured && (
                                    <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                  )}
                                  {!product.active && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-destructive/30 text-destructive">
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-primary font-semibold">
                                    R$ {product.price.toFixed(2).replace('.', ',')}
                                  </p>
                                  {product.originalPrice && (
                                    <p className="text-[10px] text-muted-foreground line-through">
                                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                    </p>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">• {product.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Switch
                                checked={product.active}
                                onCheckedChange={(checked) => updateProduct.mutate({ ...product, active: checked })}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProduct(product)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteProduct.mutate(product.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-foreground text-lg">Links</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{links.length} links cadastrados</p>
                  </div>
                  <Button onClick={() => setIsAddingLink(true)} className="gap-2 btn-primary-glow" size="sm">
                    <Plus className="w-4 h-4" />
                    Novo Link
                  </Button>
                </CardHeader>
                <CardContent>
                  {isAddingLink && (
                    <LinkForm
                      onSave={handleAddNewLink}
                      onCancel={() => setIsAddingLink(false)}
                    />
                  )}

                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {editingLink?.id === link.id ? (
                          <LinkForm
                            link={editingLink}
                            onSave={handleSaveLink}
                            onCancel={() => setEditingLink(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-border/60 transition-colors group">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground text-sm">{link.title}</p>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/50">{link.category}</Badge>
                                {!link.active && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-destructive/30 text-destructive">
                                    Inativo
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{link.url}</p>
                                <span className="text-[10px] text-primary font-medium">{link.clicks} cliques</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Switch
                                checked={link.active}
                                onCheckedChange={(checked) => updateLink.mutate({ ...link, active: checked })}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingLink(link)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteLink.mutate(link.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Informações do Perfil</CardTitle>
                  <p className="text-xs text-muted-foreground">Configure as informações exibidas na página principal</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {profile && (
                    <>
                      <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary/30 border border-border/30">
                        <div className="relative">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                              <User className="w-10 h-10 text-primary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Foto de Perfil</Label>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                            <Button variant="outline" size="sm" className="gap-2 border-border/50" asChild>
                              <span>
                                {uploadAvatar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Upload Foto
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</Label>
                          <Input
                            value={profile.name}
                            onChange={(e) => updateProfile.mutate({ ...profile, name: e.target.value })}
                            className="bg-secondary/50 border-border/50 text-foreground"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WhatsApp (apenas números)</Label>
                          <Input
                            value={profile.whatsapp}
                            onChange={(e) => updateProfile.mutate({ ...profile, whatsapp: e.target.value })}
                            className="bg-secondary/50 border-border/50 text-foreground"
                            placeholder="5511939222885"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</Label>
                        <Textarea
                          value={profile.bio}
                          onChange={(e) => updateProfile.mutate({ ...profile, bio: e.target.value })}
                          className="bg-secondary/50 border-border/50 text-foreground"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <CouponsManager />
            </motion.div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AdsManager />
            </motion.div>
          </TabsContent>

          {/* Ella IA Tab */}
          <TabsContent value="ella">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <EllaChat />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Ella Button & Panel */}
      <AnimatePresence>
        {ellaOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden border border-border/50"
            style={{ boxShadow: '0 10px 50px hsl(var(--primary) / 0.15)' }}
          >
            <EllaChat />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEllaOpen((prev) => !prev); }}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 transition-colors ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: '0 4px 20px hsl(var(--primary) / 0.4)' }}
      >
        <AnimatePresence mode="wait">
          {ellaOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="avatar" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={ellaAvatar} alt="Ella" />
                <AvatarFallback><Sparkles className="w-5 h-5 text-primary-foreground" /></AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
