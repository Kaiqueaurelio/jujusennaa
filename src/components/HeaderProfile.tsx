import { useStore } from '@/contexts/StoreContext';
import { User } from 'lucide-react';

export function HeaderProfile() {
  const { profile } = useStore();

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div className="relative mb-4">
        {profile.avatar ? (
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary glow-effect"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-effect">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        {profile.name}
      </h1>
      
      <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
        {profile.bio}
      </p>
    </div>
  );
}
