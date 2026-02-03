import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Megaphone, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAds } from '@/hooks/useAds';
import { AdCarouselSkeleton } from '@/components/SkeletonLoaders';

// Import fallback ad images
import adZonaFazedor from '@/assets/ad-zona-fazedor.jpeg';
import adFerramentas from '@/assets/ad-ferramentas.jpeg';
import adSocialMedia from '@/assets/ad-social-media.jpeg';

interface AdSlide {
  id: string;
  image: string;
  title: string;
  link: string;
  advertiser: string;
}

// Fallback static ads when no ads in database
const fallbackAds: AdSlide[] = [
  {
    id: 'fallback-1',
    image: adZonaFazedor,
    title: 'Zona do Fazedor',
    link: 'https://pay.kiwify.com.br/HlJSYEV',
    advertiser: 'Zona do Fazedor'
  },
  {
    id: 'fallback-2',
    image: adFerramentas,
    title: 'Ferramentas & Ebooks',
    link: 'https://pay.kiwify.com.br/HlJSYEV',
    advertiser: 'Zona do Fazedor'
  },
  {
    id: 'fallback-3',
    image: adSocialMedia,
    title: 'Social Media & Photoshop',
    link: 'https://pay.kiwify.com.br/HlJSYEV',
    advertiser: 'Zona do Fazedor'
  }
];

export function AdsSection() {
  const { data: dbAds, isLoading, error } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use database ads if available, otherwise fallback
  const ads: AdSlide[] = dbAds && dbAds.length > 0 
    ? dbAds.filter(ad => ad.active).map(ad => ({
        id: ad.id,
        image: ad.image_url || adZonaFazedor,
        title: ad.title,
        link: ad.link_url,
        advertiser: ad.advertiser_name
      }))
    : fallbackAds;

  // Auto-rotate ads every 4 seconds
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [ads.length, isPaused]);

  // Scroll to current slide
  useEffect(() => {
    if (scrollRef.current && ads.length > 0) {
      const slideWidth = scrollRef.current.scrollWidth / ads.length;
      scrollRef.current.scrollTo({
        left: currentIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, ads.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % ads.length);
  };

  const handleContactClick = () => {
    const message = encodeURIComponent('Olá! Tenho interesse em anunciar na sua plataforma. Poderia me passar mais informações?');
    window.open(`https://wa.me/5511939222885?text=${message}`, '_blank');
  };

  if (isLoading) {
    return <AdCarouselSkeleton />;
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Parceiros & Anúncios
          </h2>
        </div>
        <motion.button
          onClick={handleContactClick}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-3 h-3" />
          Anuncie aqui
        </motion.button>
      </div>

      {/* Full-size carousel */}
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ads.map((ad, index) => (
            <motion.a
              key={ad.id}
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-full snap-center relative group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="relative mx-4 overflow-hidden rounded-2xl">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '70vh' }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover action */}
                <motion.div
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium block">
                      {ad.advertiser}
                    </span>
                    <span className="text-lg font-bold text-foreground drop-shadow-lg">
                      {ad.title}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-primary-foreground" />
                  </div>
                </motion.div>

                {/* Sponsored tag */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Patrocinado
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Navigation arrows */}
        {ads.length > 1 && (
          <>
            <motion.button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <motion.button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </motion.button>
          </>
        )}

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-4 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleContactClick}
          className="gap-2 border-primary/30 hover:bg-primary/10"
        >
          <MessageCircle className="w-4 h-4" />
          Quero Anunciar Aqui
        </Button>
      </div>
    </section>
  );
}
