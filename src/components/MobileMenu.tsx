import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Link2, Settings, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Início', href: '/' },
  { icon: ShoppingBag, label: 'Loja', href: '/#loja' },
  { icon: Link2, label: 'Links', href: '/#links' },
  { icon: Bell, label: 'Notificações', href: '/#notificacoes' },
  { icon: User, label: 'Perfil', href: '/#perfil' },
  { icon: Settings, label: 'Admin', href: '/admin' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { data: profile } = useProfile();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-72 bg-background z-50 overflow-hidden border-r border-border/30"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header with profile */}
            <div className="flex items-center gap-3 p-4 border-b border-border/30">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{profile?.name?.charAt(0) || 'D'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile?.name || 'JUJU SENNA'}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Menu Items - simple list */}
            <nav className="p-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                >
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-secondary transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground text-sm">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} Juju Senna
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
