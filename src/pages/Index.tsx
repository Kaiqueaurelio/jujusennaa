import { useState } from 'react';
import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { AdsSection } from '@/components/AdsSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileMenu } from '@/components/MobileMenu';
import { Search, MoreVertical, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Netflix-style Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background via-background/80 to-transparent"
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

      <div className="pt-16 pb-24">
        {/* Profile Section - Hero Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="px-4 py-6"
        >
          <HeaderProfile />
        </motion.div>

        {/* Netflix-style Content Sections */}
        <div className="space-y-8">
          {/* Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            <LinksSection />
          </motion.div>
          
          {/* Ads Section - Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          >
            <AdsSection />
          </motion.div>
          
          {/* Products Section - Netflix Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          >
            <ProductSection />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="mt-12 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
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
