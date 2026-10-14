import { useState, useRef } from 'react';
import { HeroBillboard } from '@/components/HeroBillboard';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { AdsSection } from '@/components/AdsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { EllaPublicChat } from '@/components/EllaPublicChat';
import { BackToTop } from '@/components/BackToTop';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileMenu } from '@/components/MobileMenu';
import { SearchOverlay } from '@/components/SearchOverlay';
import { Footer } from '@/components/Footer';
import { Search, Menu, Instagram } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';

const jujuAvatar = '/juju-avatar.png?v=20261013';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const { data: profile } = useProfile();
  
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30 });
  const headerBgOpacity = useTransform(smoothScrollY, [0, 80], [0, 1]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 80) {
      setHeaderVisible(latest < previous);
    } else {
      setHeaderVisible(true);
    }
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Netflix-style Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40"
        animate={{ y: headerVisible ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Solid bg that appears on scroll */}
        <motion.div
          className="absolute inset-0 bg-background"
          style={{ opacity: headerBgOpacity }}
        />
        {/* Gradient overlay for top of page */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-background/80 to-transparent pointer-events-none"
          style={{ opacity: useTransform(smoothScrollY, [0, 80], [1, 0]) }}
        />

        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-1 sm:hidden">
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <img src={jujuAvatar} alt="Juju Senna" className="w-9 h-9 rounded-full object-cover border border-primary/50" />
              <h1 className="text-2xl font-bold text-primary tracking-tight">JUJU SENNA</h1>
            </div>
            {/* Inline nav - desktop */}
            <nav className="hidden sm:flex items-center gap-4 ml-4">
              <a href="#" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Início</a>
              <a href="#product-section" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Loja</a>
              <a href="#links-section" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Links</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <a href="https://instagram.com/juju.sennaa" target="_blank" rel="noopener noreferrer" className="p-1" aria-label="Instagram da Juju">
              <Instagram className="w-5 h-5 text-foreground" />
            </a>
            <NotificationBell />
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="pb-24 relative z-10">
        {/* Hero Billboard - replaces HeaderProfile */}
        <HeroBillboard />

        <div className="space-y-6 -mt-8 relative z-10">
          <LinksSection />
          <AdsSection />
          <ProductSection />
        </div>

        <Footer />
      </div>

      <BackToTop />
      <EllaPublicChat />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
