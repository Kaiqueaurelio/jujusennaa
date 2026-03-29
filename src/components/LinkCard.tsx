import { motion } from 'framer-motion';
import { Link, useIncrementLinkClick } from '@/hooks/useLinks';
import { useMagneticTilt } from '@/hooks/useMagneticTilt';
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

const categoryGradients: Record<string, string> = {
  social: 'from-pink-500 via-rose-500 to-red-500',
  content: 'from-violet-500 via-purple-500 to-indigo-500',
  store: 'from-emerald-500 via-green-500 to-teal-500',
};

interface LinkCardProps {
  link: Link;
  index?: number;
}

export function LinkCard({ link, index = 0 }: LinkCardProps) {
  const incrementClick = useIncrementLinkClick();
  const Icon = iconMap[link.icon] || ExternalLink;
  const gradient = categoryGradients[link.category] || 'from-blue-500 via-cyan-500 to-teal-500';

  const handleClick = () => {
    incrementClick.mutate(link.id);
  };

  const tilt = useMagneticTilt({ maxTilt: 12, scale: 1.05 });

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="relative block flex-shrink-0 w-[160px] sm:w-[180px] group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div
        ref={tilt.ref}
        style={tilt.style}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={`h-24 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} relative shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)'
          }} />
        </div>

        <div className="relative h-full p-3 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {link.title}
          </h3>
        </div>
      </div>
    </motion.a>
  );
}
