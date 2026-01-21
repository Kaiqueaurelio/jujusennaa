import { motion } from 'framer-motion';
import { useLinks } from '@/hooks/useLinks';
import { LinkCard } from './LinkCard';
import { Link2, Share2 } from 'lucide-react';

export function LinksSection() {
  const { data: links, isLoading } = useLinks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const activeLinks = links?.filter(l => l.active).sort((a, b) => a.order - b.order) || [];
  const contentLinks = activeLinks.filter(l => l.category === 'content');
  const socialLinks = activeLinks.filter(l => l.category === 'social' || l.category === 'store');

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {contentLinks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Links</h2>
          </div>
          <div className="space-y-3">
            {contentLinks.map((link, index) => (
              <LinkCard key={link.id} link={link} index={index} />
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
            {socialLinks.map((link, index) => (
              <LinkCard key={link.id} link={link} index={index} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}