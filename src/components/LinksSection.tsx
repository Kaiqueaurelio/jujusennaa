import { useRef } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { LinkCard } from './LinkCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        <div className="h-5 w-20 bg-secondary rounded animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[180px] h-20 bg-secondary rounded-md animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const activeLinks = links?.filter(l => l.active).sort((a, b) => a.order - b.order) || [];
  if (activeLinks.length === 0) return null;

  return (
    <section className="relative">
      <h2 className="text-lg font-bold text-foreground px-4 mb-3">Links Rápidos</h2>

      <div className="relative group">
        <button
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeLinks.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} />
          ))}
        </div>

        <button
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
