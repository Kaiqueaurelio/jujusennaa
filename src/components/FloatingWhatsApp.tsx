import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const { data: profile } = useProfile();

  if (!profile?.whatsapp) return null;

  const handleClick = () => {
    const message = encodeURIComponent('Olá! Vim pelo Link na Bio e gostaria de saber mais sobre os produtos.');
    window.open(`https://wa.me/${profile.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
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
  );
}