import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { Instagram, MessageCircle, Mail, Heart } from 'lucide-react';

export function Footer() {
  const { data: profile } = useProfile();

  const whatsappUrl = profile?.whatsapp
    ? `https://wa.me/${profile.whatsapp}`
    : '#';

  return (
    <motion.footer
      className="mt-16 border-t border-border pt-8 pb-6 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Brand */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-primary">DECODE</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.bio || 'Transformando dados em decisões.'}
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="mailto:contato@decode.com"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            © {new Date().getFullYear()} Decode Analytics — Feito com
            <Heart className="w-3 h-3 text-primary fill-primary" />
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
