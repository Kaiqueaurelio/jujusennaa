import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Base shimmer skeleton
function ShimmerSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-secondary/50", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['0%', '200%'] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: 'linear' as const
        }}
      />
    </div>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <motion.div 
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <ShimmerSkeleton className="w-28 h-28 rounded-full" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShimmerSkeleton className="h-6 w-40" />
        <ShimmerSkeleton className="h-4 w-56" />
      </div>
    </motion.div>
  );
}

// Card skeleton for products
export function ProductCardSkeleton() {
  return (
    <motion.div 
      className="flex-shrink-0 w-[230px] sm:w-[300px] space-y-2"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' as const }}
    >
      <ShimmerSkeleton className="w-full aspect-video rounded-md" />
      <div className="space-y-1.5 px-1">
        <ShimmerSkeleton className="h-3 w-full" />
        <ShimmerSkeleton className="h-3 w-2/3" />
      </div>
    </motion.div>
  );
}

// Products section skeleton
export function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="px-4 flex items-center gap-3">
        <ShimmerSkeleton className="h-6 w-32" />
        <ShimmerSkeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <ProductCardSkeleton />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Link card skeleton
export function LinkCardSkeleton() {
  return (
    <motion.div 
      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' as const }}
    >
      <ShimmerSkeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-3 w-1/2" />
      </div>
      <ShimmerSkeleton className="w-8 h-8 rounded-full" />
    </motion.div>
  );
}

// Links section skeleton
export function LinksSkeleton() {
  return (
    <div className="space-y-4 px-4">
      <ShimmerSkeleton className="h-6 w-24" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <LinkCardSkeleton />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Ad carousel skeleton
export function AdCarouselSkeleton() {
  return (
    <div className="space-y-4">
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="w-5 h-5 rounded-full" />
          <ShimmerSkeleton className="h-5 w-40" />
        </div>
        <ShimmerSkeleton className="h-4 w-24" />
      </div>
      <motion.div 
        className="mx-4 overflow-hidden rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ShimmerSkeleton className="w-full aspect-[16/10]" />
      </motion.div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
          >
            <ShimmerSkeleton className={cn("h-1.5 rounded-full", i === 1 ? "w-8" : "w-1.5")} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Admin table skeleton
export function AdminTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <ShimmerSkeleton className="w-20 h-12 rounded" />
          <div className="flex-1 space-y-2">
            <ShimmerSkeleton className="h-4 w-1/3" />
            <ShimmerSkeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-2">
            <ShimmerSkeleton className="w-8 h-8 rounded" />
            <ShimmerSkeleton className="w-8 h-8 rounded" />
            <ShimmerSkeleton className="w-10 h-6 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Full page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <ProfileSkeleton />
        <LinksSkeleton />
        <AdCarouselSkeleton />
        <ProductsSkeleton />
      </motion.div>
    </div>
  );
}
