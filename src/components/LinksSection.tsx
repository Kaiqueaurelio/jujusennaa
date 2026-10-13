import { useRef } from 'react';
import { useLinks, type Link } from '@/hooks/useLinks';
import { LinkCard } from './LinkCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Public fallback links keep this section useful even when the Supabase
// table is empty or temporarily unavailable. Admin-managed links take priority.
const fallbackLinks: Link[] = [
  {
    id: 'fallback-doacoes-bem',
    title: 'Doações do Bem 💕',
    url: 'https://go.linkdobem.com/?id=8v2gd1_ig',
    icon: 'Heart',
    category: 'content',
    clicks: 0,
    order: 1,
    active: true,
  },
  {
    id: 'fallback-produtos',
    title: 'Compre seus produtos aqui 🧡',
    url: 'https://pay.goold.club/aff/S3LYWN/WQHJRASU',
    icon: 'ShoppingBag',
    category: 'store',
    clicks: 0,
    order: 2,
    active: true,
  },
  {
    id: 'fallback-belletonn',
    title: 'Loja BELLETONN 🩵',
    url: 'https://linktr.ee/belletonn_oficial?utm_source=linktree_profile_share&ltsid=f7806fd9-dd22-44a0-bfba-cdbba044439b6',
    icon: 'ShoppingBag',
    category: 'store',
    clicks: 0,
    order: 3,
    active: true,
  },
];

export function LinksSection() {
  const { data: links, isLoading } = useLinks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 px-4">
        <div className="h-5 w-24 bg-secondary rounded-full animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[160px] h-24 bg-secondary rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const activeLinks = links?.filter(l => l.active).sort((a, b) => a.order - b.order) || [];
  const visibleLinks = activeLinks.length > 0 ? activeLinks : fallbackLinks;

  return (
    <section id="links-section" className="relative">
      <motion.h2
        className="text-lg font-bold text-foreground px-4 mb-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        🔗 Links Rápidos
      </motion.h2>

      <div className="relative group">
        <button
          aria-label="Rolar links para a esquerda"
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {visibleLinks.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} />
          ))}
        </div>

        <button
          aria-label="Rolar links para a direita"
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
