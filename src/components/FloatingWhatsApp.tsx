import { useStore } from '@/contexts/StoreContext';
import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const { profile } = useStore();

  const handleClick = () => {
    const message = encodeURIComponent('Olá! Vim pelo Link na Bio e gostaria de saber mais sobre os produtos.');
    window.open(`https://wa.me/${profile.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110 animate-float"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" fill="white" />
    </button>
  );
}
