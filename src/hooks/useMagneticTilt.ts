import { useCallback, useRef } from 'react';

interface MagneticTiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useMagneticTilt({ maxTilt = 8, scale = 1.02, speed = 400 }: MagneticTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -maxTilt;
    const tiltY = (x - 0.5) * maxTilt;
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale},${scale},${scale})`;
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }, []);

  return {
    ref,
    style: { transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`, willChange: 'transform' as const },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
