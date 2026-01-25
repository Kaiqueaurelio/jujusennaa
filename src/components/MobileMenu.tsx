import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Link2, Settings, User, Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border z-50 overflow-hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <motion.h2 
                className="text-xl font-bold text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                DECODE
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-all group"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} Decode Analytics
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
