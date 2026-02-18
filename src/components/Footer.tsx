import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { Instagram, MessageCircle, Mail, Heart } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

export function Footer() {
  const { data: profile } = useProfile();

  const whatsappUrl = profile?.whatsapp
    ? `https://wa.me/${profile.whatsapp}`
    : '#';

  const socialLinks = [
    { href: whatsappUrl, icon: MessageCircle, label: 'WhatsApp' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'mailto:contato@decode.com', icon: Mail, label: 'Email' },
  ];

  return (
    <motion.footer
      className="mt-16 border-t border-border pt-8 pb-6 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Brand */}
        <motion.div className="text-center" variants={itemVariants}>
          <h3 className="text-lg font-bold text-primary">DECODE</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.bio || 'Transformando dados em decisões.'}
          </p>
        </motion.div>

        {/* Social Links with stagger */}
        <motion.div className="flex justify-center gap-4" variants={containerVariants}>
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            © {new Date().getFullYear()} Decode Analytics — Feito com
            <Heart className="w-3 h-3 text-primary fill-primary" />
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
