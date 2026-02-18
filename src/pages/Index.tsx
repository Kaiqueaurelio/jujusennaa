import { useState, useRef } from 'react';
import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { AdsSection } from '@/components/AdsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { BackToTop } from '@/components/BackToTop';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileMenu } from '@/components/MobileMenu';
import { SearchOverlay } from '@/components/SearchOverlay';
import { Footer } from '@/components/Footer';
import { Search, MoreVertical, Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30 });
  
  // Refined header parallax - opacity + blur only, no scale
  const headerY = useTransform(smoothScrollY, [0, 200], [0, -30]);
  const headerOpacity = useTransform(smoothScrollY, [0, 100], [1, 0.95]);
  const headerBgOpacity = useTransform(smoothScrollY, [0, 80], [0, 0.95]);
  
  // Logo parallax keeps scale
  const logoScale = useTransform(smoothScrollY, [0, 150], [1, 0.85]);
  const logoY = useTransform(smoothScrollY, [0, 150], [0, -5]);
  
  // Profile section parallax
  const profileY = useTransform(smoothScrollY, [0, 300], [0, -50]);
  const profileOpacity = useTransform(smoothScrollY, [0, 200], [1, 0.7]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Refined Parallax Header - no scale, only opacity + blur */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40"
        style={{ y: headerY, opacity: headerOpacity }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <motion.div 
          className="absolute inset-0 bg-background/95 backdrop-blur-md shadow-lg"
          style={{ opacity: headerBgOpacity }}
        />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none"
          style={{ opacity: useTransform(smoothScrollY, [0, 80], [1, 0]) }}
        />
        
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <motion.button onClick={() => setIsMenuOpen(true)} className="p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Menu className="w-6 h-6 text-foreground" />
            </motion.button>
            <motion.h1 
              className="text-2xl font-bold text-primary tracking-tight origin-left"
              style={{ scale: logoScale, y: logoY }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              DECODE
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button className="p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button className="p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </motion.button>
            <NotificationBell />
            <Link to="/admin">
              <motion.div className="p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <MoreVertical className="w-5 h-5 text-foreground" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="pt-16 pb-24">
        <motion.div
          style={{ y: profileY, opacity: profileOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="px-4 py-6"
        >
          <HeaderProfile />
        </motion.div>

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <LinksSection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <AdsSection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ProductSection />
          </motion.div>
        </div>

        <Footer />
      </div>

      <BackToTop />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
