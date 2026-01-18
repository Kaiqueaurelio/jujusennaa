import { useStore } from '@/contexts/StoreContext';
import { LinkCard } from './LinkCard';
import { Link2, Share2 } from 'lucide-react';

export function LinksSection() {
  const { links } = useStore();

  const activeLinks = links.filter(l => l.active).sort((a, b) => a.order - b.order);
  const contentLinks = activeLinks.filter(l => l.category === 'content');
  const socialLinks = activeLinks.filter(l => l.category === 'social' || l.category === 'store');

  return (
    <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {contentLinks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Conteúdo Gratuito</h2>
          </div>
          <div className="space-y-3">
            {contentLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}

      {socialLinks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Redes Sociais</h2>
          </div>
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
