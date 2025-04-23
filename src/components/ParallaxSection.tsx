'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  bgImage?: string;
  overlay?: boolean;
  speed?: number;
  className?: string;
}

export default function ParallaxSection({
  children,
  bgImage,
  overlay = true,
  speed = 0.5,
  className = '',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {bgImage && (
        <motion.div
          style={{ y }}
          className="absolute inset-0 w-full h-full"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {overlay && (
            <div className="absolute inset-0 bg-black/50" />
          )}
        </motion.div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
