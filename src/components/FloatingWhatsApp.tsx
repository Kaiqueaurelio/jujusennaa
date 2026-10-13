import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { MessageCircle, X } from 'lucide-react';

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  // WhatsApp is temporarily disabled until the contact number is configured.
  return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
      {/* Animated tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg mb-2 max-w-[160px] relative"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5 text-muted-foreground" />
            </button>
            <p className="text-xs text-foreground font-medium">Precisa de ajuda? 💬</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full -z-10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
