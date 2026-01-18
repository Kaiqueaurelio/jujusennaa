import { Link as LinkType } from '@/data/store';
import { useStore } from '@/contexts/StoreContext';
import { ExternalLink, Palette, BookOpen, Globe, Instagram, MessageCircle } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  BookOpen,
  Globe,
  Instagram,
  MessageCircle,
  ExternalLink,
};

interface LinkCardProps {
  link: LinkType;
}

export function LinkCard({ link }: LinkCardProps) {
  const { incrementLinkClick } = useStore();
  const Icon = iconMap[link.icon] || ExternalLink;

  const handleClick = () => {
    incrementLinkClick(link.id);
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block w-full netflix-card p-4 hover:border-primary/50 border border-transparent transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
          {link.title}
        </span>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
      </div>
    </a>
  );
}
