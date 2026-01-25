import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';

export function HeaderProfile() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-secondary" />
        <div className="flex-1">
          <div className="h-6 w-32 bg-secondary rounded mb-2" />
          <div className="h-4 w-48 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Avatar */}
      <motion.div 
        className="relative flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {profile.avatar ? (
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-2 border-primary">
            <span className="text-2xl font-bold text-primary-foreground">
              {profile.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Online indicator */}
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        />
      </motion.div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <motion.h1 
          className="text-xl font-bold text-foreground truncate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {profile.name}
        </motion.h1>
        
        <motion.p 
          className="text-muted-foreground text-sm line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {profile.bio}
        </motion.p>
      </div>
    </motion.div>
  );
}
