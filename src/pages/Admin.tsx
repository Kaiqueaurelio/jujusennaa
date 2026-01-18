import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, User, ShoppingBag, Link2, Settings, Trash2, Plus, 
  Edit2, Save, X, BarChart3, Eye
} from 'lucide-react';
import { Product, Link as LinkType } from '@/data/store';

export default function Admin() {
  const { isAuthenticated, logout } = useAuth();
  const { products, links, profile, updateProduct, addProduct, deleteProduct, updateLink, addLink, deleteLink, updateProfile } = useStore();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product);
      setEditingProduct(null);
    }
  };

  const handleAddNewProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddingProduct(false);
  };

  const handleSaveLink = (link: LinkType) => {
    if (editingLink) {
      updateLink(link);
      setEditingLink(null);
    }
  };

  const handleAddNewLink = (link: Omit<LinkType, 'id'>) => {
    addLink(link);
    setIsAddingLink(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Preview
            </a>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Links</p>
                  <p className="text-2xl font-bold text-foreground">{links.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliques Total</p>
                  <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link2 className="w-4 h-4" />
              Links
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Nome</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => updateProfile({ ...profile, name: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">WhatsApp (apenas números)</Label>
                    <Input
                      value={profile.whatsapp}
                      onChange={(e) => updateProfile({ ...profile, whatsapp: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                      placeholder="5511939222885"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => updateProfile({ ...profile, bio: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">URL do Avatar</Label>
                  <Input
                    value={profile.avatar}
                    onChange={(e) => updateProfile({ ...profile, avatar: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Produtos</CardTitle>
                <Button onClick={() => setIsAddingProduct(true)} className="gap-2">
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

                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id}>
                      {editingProduct?.id === product.id ? (
                        <ProductForm
                          product={editingProduct}
                          onSave={handleSaveProduct}
                          onCancel={() => setEditingProduct(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{product.name}</p>
                                {product.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                              <p className="text-sm text-primary font-semibold">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.active}
                              onCheckedChange={(checked) => updateProduct({ ...product, active: checked })}
                            />
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Links</CardTitle>
                <Button onClick={() => setIsAddingLink(true)} className="gap-2">
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

                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id}>
                      {editingLink?.id === link.id ? (
                        <LinkForm
                          link={editingLink}
                          onSave={handleSaveLink}
                          onCancel={() => setEditingLink(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{link.title}</p>
                              <Badge variant="outline" className="text-xs">{link.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-md">{link.url}</p>
                            <p className="text-xs text-primary">{link.clicks} cliques</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={link.active}
                              onCheckedChange={(checked) => updateLink({ ...link, active: checked })}
                            />
                            <Button variant="ghost" size="icon" onClick={() => setEditingLink(link)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteLink(link.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Product Form Component
function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product?: Product; 
  onSave: (product: any) => void; 
  onCancel: () => void;
}) {
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

  const handleSubmit = () => {
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      originalPrice: form.originalPrice || undefined,
    };
    if (product) {
      onSave({ ...product, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <div className="p-4 mb-4 rounded-lg bg-muted border border-border space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Nome</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Categoria</Label>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Descrição curta</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Descrição completa</Label>
        <Textarea
          value={form.fullDescription}
          onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
          className="bg-secondary border-border text-foreground"
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-foreground">Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Preço original (opcional)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.originalPrice || ''}
            onChange={(e) => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Ordem</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">URL da imagem</Label>
          <Input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="bg-secondary border-border text-foreground"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Tags (separadas por vírgula)</Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="bg-secondary border-border text-foreground"
            placeholder="Novo, Mais vendido"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

// Link Form Component
function LinkForm({ 
  link, 
  onSave, 
  onCancel 
}: { 
  link?: LinkType; 
  onSave: (link: any) => void; 
  onCancel: () => void;
}) {
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
    <div className="p-4 mb-4 rounded-lg bg-muted border border-border space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Título</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Categoria</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
            className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground"
          >
            <option value="content">Conteúdo</option>
            <option value="social">Redes Sociais</option>
            <option value="store">Loja</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">URL</Label>
        <Input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="bg-secondary border-border text-foreground"
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Ícone</Label>
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground"
          >
            <option value="ExternalLink">Link</option>
            <option value="Instagram">Instagram</option>
            <option value="MessageCircle">WhatsApp</option>
            <option value="Globe">Website</option>
            <option value="BookOpen">Ebook</option>
            <option value="Palette">Portfolio</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Ordem</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
