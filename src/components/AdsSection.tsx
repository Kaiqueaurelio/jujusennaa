import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MessageCircle, Megaphone, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAds } from '@/hooks/useAds';
import { AdCarouselSkeleton } from '@/components/SkeletonLoaders';

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

const fallbackAds: AdSlide[] = [
  { id: 'fallback-1', image: adZonaFazedor, title: 'Zona do Fazedor', link: 'https://pay.kiwify.com.br/HlJSYEV', advertiser: 'Zona do Fazedor' },
  { id: 'fallback-2', image: adFerramentas, title: 'Ferramentas & Ebooks', link: 'https://pay.kiwify.com.br/HlJSYEV', advertiser: 'Zona do Fazedor' },
  { id: 'fallback-3', image: adSocialMedia, title: 'Social Media & Photoshop', link: 'https://pay.kiwify.com.br/HlJSYEV', advertiser: 'Zona do Fazedor' }
];

export function AdsSection() {
  const { data: dbAds, isLoading } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const ads: AdSlide[] = useMemo(() => {
    if (dbAds && dbAds.length > 0) {
      return dbAds.filter(ad => ad.active).map(ad => ({
        id: ad.id, image: ad.image_url || adZonaFazedor,
        title: ad.title, link: ad.link_url, advertiser: ad.advertiser_name
      }));
    }
    return fallbackAds;
  }, [dbAds]);

  // Auto-rotate
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [ads.length, isPaused]);

  // Preload adjacent images
  useEffect(() => {
    if (ads.length <= 1) return;
    const nextIdx = (currentIndex + 1) % ads.length;
    const prevIdx = (currentIndex - 1 + ads.length) % ads.length;
    [ads[nextIdx], ads[prevIdx]].forEach(ad => {
      const lower = ad.image.toLowerCase();
      if (!lower.endsWith('.mp4') && !lower.endsWith('.webm') && !lower.endsWith('.mov')) {
        const img = new Image();
        img.src = ad.image;
      }
    });
  }, [currentIndex, ads]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % ads.length);
  }, [ads.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  const handleContactClick = () => {
    const message = encodeURIComponent('Olá! Tenho interesse em anunciar na sua plataforma. Poderia me passar mais informações?');
    window.open(`https://wa.me/5511939222885?text=${message}`, '_blank');
  };

  if (isLoading) return <AdCarouselSkeleton />;
  if (ads.length === 0) return null;

  const isVideo = (url: string) => {
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Parceiros & Anúncios</h2>
        </div>
        <button
          onClick={handleContactClick}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 active:scale-95 transition-all"
        >
          <MessageCircle className="w-3 h-3" />
          Anuncie aqui
        </button>
      </div>

      {/* CSS Crossfade Carousel with native touch swipe */}
      <div
        className="relative overflow-hidden"
        style={{ willChange: 'transform' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          {ads.map((ad, index) => (
            <a
              key={ad.id}
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
              style={{
                position: index === 0 ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                opacity: index === currentIndex ? 1 : 0,
                transform: index === currentIndex ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                pointerEvents: index === currentIndex ? 'auto' : 'none',
                zIndex: index === currentIndex ? 1 : 0,
              }}
            >
              <div className="relative mx-4 overflow-hidden rounded-lg">
                {isVideo(ad.image) ? (
                  <video
                    src={ad.image}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '70vh' }}
                    autoPlay muted loop playsInline
                    draggable={false}
                  />
                ) : (
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '70vh' }}
                    draggable={false}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                </div>

                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrocinado</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Navigation arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:hover:opacity-100 hover:scale-110 active:scale-90 transition-all z-10 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:hover:opacity-100 hover:scale-110 active:scale-90 transition-all z-10 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
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
