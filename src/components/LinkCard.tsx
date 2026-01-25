import { motion } from 'framer-motion';
import { Link, useIncrementLinkClick } from '@/hooks/useLinks';
import { ExternalLink, Palette, BookOpen, Globe, Instagram, MessageCircle, Youtube, Twitter, Linkedin, Github, Music, Mail, Phone, Link2, FileText, Video, Camera, Mic, Headphones, Zap, Star, Heart, Award, Target, Rocket, Coffee, Code, Database, Cloud, Lock, Settings, Users, ShoppingBag, CreditCard, Gift, Calendar, Clock, Bell, Bookmark, Download, Upload, Share2, Send, MessageSquare, Search, Filter, Layout, Grid, List, Menu, MoreHorizontal, Play } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, BookOpen, Globe, Instagram, MessageCircle, ExternalLink,
  Youtube, Twitter, Linkedin, Github, Music, Mail, Phone, Link2,
  FileText, Video, Camera, Mic, Headphones, Zap, Star, Heart,
  Award, Target, Rocket, Coffee, Code, Database, Cloud, Lock,
  Settings, Users, ShoppingBag, CreditCard, Gift, Calendar, Clock,
  Bell, Bookmark, Download, Upload, Share2, Send, MessageSquare,
  Search, Filter, Layout, Grid, List, Menu, MoreHorizontal, Play
};

// Generate colors based on category
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'content': 'from-blue-600 to-blue-800',
    'social': 'from-pink-600 to-purple-800',
    'store': 'from-green-600 to-teal-800',
  };
  return colors[category] || 'from-primary to-primary/70';
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
      className="relative block flex-shrink-0 w-[200px] sm:w-[220px] group"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.25, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card Container */}
      <div className={`relative h-24 rounded-lg overflow-hidden bg-gradient-to-br ${getCategoryColor(link.category)}`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {/* Content */}
        <div className="relative h-full p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                <Play className="w-3 h-3 text-background fill-background ml-0.5" />
              </div>
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-foreground font-semibold text-sm truncate">
              {link.title}
            </h3>
            <p className="text-foreground/70 text-xs truncate">
              {new URL(link.url).hostname.replace('www.', '')}
            </p>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)'
          }}
        />
      </div>
    </motion.a>
  );
}
