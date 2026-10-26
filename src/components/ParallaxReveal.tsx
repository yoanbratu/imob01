import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  parallaxOffset?: number;
}

/**
 * High-performance Reveal-on-Scroll Section with subtle scroll-linked parallax
 * and smooth spring interpolation.
 */
export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  id,
  className = '',
  children,
  parallaxOffset = 28,
}) => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [parallaxOffset, 0, -parallaxOffset * 0.65]);
  const smoothY = useSpring(rawY, {
    stiffness: 110,
    damping: 26,
    mass: 0.4,
  });

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <motion.div style={{ y: smoothY }} className="will-change-transform">
        {children}
      </motion.div>
    </motion.section>
  );
};

interface RevealBlockProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  parallaxStrength?: number;
}

/**
 * Individual content block that reveals on scroll with fade-in, subtle blur-to-sharp
 * transition, and subtle scroll-linked vertical parallax.
 */
export const RevealBlock: React.FC<RevealBlockProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 28,
  parallaxStrength = 16,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ['start end', 'end start'],
  });

  const rawParallaxY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [parallaxStrength, 0, -parallaxStrength]
  );

  const smoothParallaxY = useSpring(rawParallaxY, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
  });

  const initialOffset = {
    x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
  };

  return (
    <motion.div
      ref={blockRef}
      initial={{
        opacity: 0,
        x: initialOffset.x,
        y: initialOffset.y,
        scale: 0.985,
        filter: 'blur(4px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -40px 0px' }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ y: parallaxStrength > 0 ? smoothParallaxY : 0 }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
