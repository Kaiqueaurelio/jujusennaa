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
import { TechBackground } from '@/components/TechBackground';
import { CursorTrail } from '@/components/CursorTrail';
import { Search, Menu, Sun, Moon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-background overflow-x-hidden">
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
            <h1 className="text-2xl font-bold text-primary tracking-tight">DECODE</h1>
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
            <button className="p-1" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
            <NotificationBell />
            <Link to="/admin">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="pb-24">
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
