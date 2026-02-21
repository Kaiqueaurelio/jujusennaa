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
      className="relative block flex-shrink-0 w-[180px] sm:w-[200px] group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="h-20 rounded-md overflow-hidden bg-secondary border border-transparent hover:ring-1 hover:ring-primary transition-all">
        <div className="h-full p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="text-foreground font-medium text-sm truncate">
            {link.title}
          </h3>
        </div>
      </div>
    </motion.a>
  );
}
