import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Instagram, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Footer } from '@/components/Footer';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contato() {
  const { data: profile } = useProfile();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const whatsappUrl = profile?.whatsapp
    ? `https://wa.me/${profile.whatsapp}?text=Olá! Vim pelo site da Juju Senna.`
    : '#';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mensagem enviada! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <span className="text-lg font-black text-primary ml-auto">JUJU SENNA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Contato</h1>
        <p className="text-muted-foreground mb-8">Entre em contato com a Juju Senna pelos canais abaixo.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <a
            href="mailto:juju.senna@admin.br"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border/30 hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">E-mail</span>
            <span className="text-xs text-muted-foreground">juju.senna@admin.br</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border/30 hover:border-green-500/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm font-medium text-foreground">WhatsApp</span>
            <span className="text-xs text-muted-foreground">Mensagem direta</span>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border/30 hover:border-pink-500/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
            <span className="text-sm font-medium text-foreground">Instagram</span>
            <span className="text-xs text-muted-foreground">@juju.sennaa</span>
          </a>
        </div>

        <div className="rounded-xl bg-card border border-border/30 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Envie uma mensagem</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Como podemos ajudar?"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Enviar mensagem
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
