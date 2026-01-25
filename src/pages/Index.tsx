import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { NotificationBell } from '@/components/NotificationBell';
import { Settings, Search, MoreVertical, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Netflix-style Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/80 to-transparent"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-foreground" />
            <motion.h1 
              className="text-2xl font-bold text-primary tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              DECODE
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-foreground" />
            <NotificationBell />
            <Link 
              to="/admin" 
              className="p-1"
              aria-label="Admin"
            >
              <MoreVertical className="w-5 h-5 text-foreground" />
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="pt-16 pb-24">
        {/* Profile Section - Hero Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="px-4 py-6"
        >
          <HeaderProfile />
        </motion.div>

        {/* Netflix-style Content Sections */}
        <div className="space-y-6">
          {/* Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <LinksSection />
          </motion.div>
          
          {/* Products Section - Netflix Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <ProductSection />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="mt-12 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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