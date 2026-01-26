import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAds } from '@/hooks/useAds';
import { ExternalLink, ChevronLeft, ChevronRight, Megaphone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdsSection() {
  const { data: ads, isLoading } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeAds = ads?.filter(ad => ad.active) || [];

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    if (activeAds.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAds.length, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + activeAds.length) % activeAds.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeAds.length);
  };

  const handleContactClick = () => {
    const message = encodeURIComponent('Olá! Tenho interesse em anunciar na sua plataforma. Poderia me passar mais informações?');
    window.open(`https://wa.me/5511939222885?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <section className="px-4">
        <div className="h-6 w-40 bg-secondary/50 rounded animate-pulse mb-3" />
        <div className="h-32 bg-secondary/50 rounded-xl animate-pulse" />
      </section>
    );
  }

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
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

      {activeAds.length === 0 ? (
        // Empty state with CTA
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-secondary to-primary/10 p-6 border border-primary/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="relative z-10 text-center">
            <Megaphone className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Espaço para Anúncios
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Alcance milhares de pessoas interessadas em produtos e serviços digitais. 
              Entre em contato para anunciar aqui!
            </p>
            <Button
              onClick={handleContactClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Quero Anunciar
            </Button>
          </div>
        </motion.div>
      ) : (
        // Ads carousel
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden rounded-xl">
            <AnimatePresence mode="wait">
              <motion.a
                key={activeAds[currentIndex]?.id}
                href={activeAds[currentIndex]?.link_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="block relative group"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-secondary to-primary/10 border border-primary/20">
                  {activeAds[currentIndex]?.image_url ? (
                    <div className="relative aspect-[21/9]">
                      <img
                        src={activeAds[currentIndex].image_url}
                        alt={activeAds[currentIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-[21/9] bg-gradient-to-br from-primary/30 to-secondary" />
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">
                          {activeAds[currentIndex]?.advertiser_name}
                        </span>
                        <h3 className="text-lg font-bold text-foreground mt-1">
                          {activeAds[currentIndex]?.title}
                        </h3>
                        {activeAds[currentIndex]?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activeAds[currentIndex].description}
                          </p>
                        )}
                      </div>
                      <motion.div
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.a>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {activeAds.length > 1 && (
            <>
              <motion.button
                onClick={(e) => { e.preventDefault(); goToPrevious(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </motion.button>
              <motion.button
                onClick={(e) => { e.preventDefault(); goToNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </motion.button>
            </>
          )}

          {/* Dots indicator */}
          {activeAds.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {activeAds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-6 bg-primary' 
                      : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sponsored tag */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-background/60 backdrop-blur-sm">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Patrocinado
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
