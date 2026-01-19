import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { User } from 'lucide-react';

export function HeaderProfile() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center text-center animate-pulse">
        <div className="w-24 h-24 rounded-full bg-secondary mb-4" />
        <div className="h-8 w-48 bg-secondary rounded mb-2" />
        <div className="h-4 w-72 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative mb-4"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
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
        <motion.div 
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        />
      </motion.div>
      
      <motion.h1 
        className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {profile.name}
      </motion.h1>
      
      <motion.p 
        className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {profile.bio}
      </motion.p>
    </motion.div>
  );
}
