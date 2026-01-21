import { motion } from 'framer-motion';
import { Link, useIncrementLinkClick } from '@/hooks/useLinks';
import { ExternalLink, Palette, BookOpen, Globe, Instagram, MessageCircle, Youtube, Twitter, Linkedin, Github, Music, Mail, Phone, Link2, FileText, Video, Camera, Mic, Headphones, Zap, Star, Heart, Award, Target, Rocket, Coffee, Code, Database, Cloud, Lock, Settings, Users, ShoppingBag, CreditCard, Gift, Calendar, Clock, Bell, Bookmark, Download, Upload, Share2, Send, MessageSquare, Search, Filter, Layout, Grid, List, Menu, MoreHorizontal, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, BookOpen, Globe, Instagram, MessageCircle, ExternalLink,
  Youtube, Twitter, Linkedin, Github, Music, Mail, Phone, Link2,
  FileText, Video, Camera, Mic, Headphones, Zap, Star, Heart,
  Award, Target, Rocket, Coffee, Code, Database, Cloud, Lock,
  Settings, Users, ShoppingBag, CreditCard, Gift, Calendar, Clock,
  Bell, Bookmark, Download, Upload, Share2, Send, MessageSquare,
  Search, Filter, Layout, Grid, List, Menu, MoreHorizontal, ChevronRight
};

interface LinkCardProps {
  link: Link;
  index?: number;
}

export function LinkCard({ link, index = 0 }: LinkCardProps) {
  const incrementClick = useIncrementLinkClick();
  const Icon = iconMap[link.icon] || ExternalLink;

  const handleClick = () => {
    incrementClick.mutate(link.id);
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block w-full netflix-card p-4 hover:border-primary/50 border border-transparent transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02, 
        x: 8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, hsl(357 91% 47% / 0.1) 0%, transparent 100%)'
        }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(357 91% 47% / 0.1), transparent)'
        }}
      />
      
      <div className="flex items-center gap-4 relative z-10">
        <motion.div 
          className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors relative"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                '0 0 0 0 hsl(357 91% 47% / 0)',
                '0 0 0 4px hsl(357 91% 47% / 0.2)',
                '0 0 0 0 hsl(357 91% 47% / 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.span 
            className="block font-semibold text-foreground group-hover:text-primary transition-colors truncate"
            layout
          >
            {link.title}
          </motion.span>
          <span className="text-xs text-muted-foreground truncate block">
            {new URL(link.url).hostname.replace('www.', '')}
          </span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </motion.div>
      </div>
    </motion.a>
  );
}