import { useState, useEffect, useRef } from 'react';
import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { AdsSection } from '@/components/AdsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileMenu } from '@/components/MobileMenu';
import { Search, MoreVertical, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  // Detect scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Netflix-style Header with scroll effect */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-background via-background/80 to-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </motion.button>
            <motion.h1 
              className="text-2xl font-bold text-primary tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              DECODE
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>
            <NotificationBell />
            <Link to="/admin">
              <motion.div
                className="p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreVertical className="w-5 h-5 text-foreground" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main content with smooth scroll */}
      <div className="pt-16 pb-24">
        {/* Profile Section - Hero Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="px-4 py-6"
        >
          <HeaderProfile />
        </motion.div>

        {/* Netflix-style Content Sections with infinite scroll feel */}
        <div className="space-y-10">
          {/* Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <LinksSection />
          </motion.div>
          
          {/* Ads Section - Full Width Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <AdsSection />
          </motion.div>
          
          {/* Products Section - Netflix Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ProductSection />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="mt-16 text-center px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Decode Analytics
          </p>
        </motion.footer>
      </div>

      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
