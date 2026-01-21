import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Admin link with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Link 
            to="/admin" 
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-all hover:scale-110 hover:rotate-90 duration-300"
            aria-label="Admin"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </motion.div>

        <motion.div 
          className="space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <HeaderProfile />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <LinksSection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ProductSection />
          </motion.div>
        </motion.div>

        {/* Footer with animation */}
        <motion.footer 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Decode Analytics
          </p>
        </motion.footer>
      </div>

      <FloatingWhatsApp />
    </div>
  );
};

export default Index;