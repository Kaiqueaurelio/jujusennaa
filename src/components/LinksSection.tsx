import { useRef } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { LinkCard } from './LinkCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import video1 from '@/assets/juju-video-1.mp4.asset.json';
import video2 from '@/assets/juju-video-2.mp4.asset.json';

const quickVideos = [video1.url, video2.url];

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
          {quickVideos.map((src) => (
            <div key={src} className="relative flex-shrink-0 w-[45vw] max-w-[240px] min-h-[120px] rounded-2xl overflow-hidden bg-secondary">
              <video src={src} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeLinks = links?.filter(l => l.active).sort((a, b) => a.order - b.order) || [];
  if (activeLinks.length === 0) return null;

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
