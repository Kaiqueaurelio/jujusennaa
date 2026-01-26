import { useRef } from 'react';
import { motion } from 'framer-motion';
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
        <div className="h-6 w-24 bg-secondary/50 rounded animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[200px] h-24 bg-secondary/50 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const activeLinks = links?.filter(l => l.active).sort((a, b) => a.order - b.order) || [];
  
  if (activeLinks.length === 0) return null;

  return (
    <section className="relative">
      <motion.h2 
        className="text-lg font-semibold text-foreground px-4 mb-3"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        Links
      </motion.h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <motion.button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start"
          onClick={() => scroll('left')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </motion.button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeLinks.map((link, index) => (
            <motion.div
              key={link.id}
              className="snap-start"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <LinkCard link={link} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        <motion.button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
          onClick={() => scroll('right')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-7 h-7 text-foreground" />
        </motion.button>
      </div>
    </section>
  );
}
