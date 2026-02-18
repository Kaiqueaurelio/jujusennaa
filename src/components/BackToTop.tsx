import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-primary transition-colors"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
