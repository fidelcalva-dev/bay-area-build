// Shared animation components and hooks for section reveals
import { ReactNode, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

// Animation variants with proper typing
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Viewport trigger threshold (0-1) */
  threshold?: number;
}

/**
 * Wrapper for section-level reveal animations
 * Triggers when section enters viewport
 */
export function AnimatedSection({ 
  children, 
  className = '',
  delay = 0,
  threshold = 0.1 
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay 
          } 
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between children (seconds) */
  staggerDelay?: number;
}

/**
 * Container for staggered child animations
 */
export function StaggeredContainer({ 
  children, 
  className = '',
  staggerDelay = 0.08 
}: StaggeredContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight';
}

/**
 * Animated item for use within StaggeredContainer
 */
export function AnimatedItem({ 
  children, 
  className = '',
  variant = 'fadeUp' 
}: AnimatedItemProps) {
  const variants: Record<string, Variants> = {
    fadeUp: fadeInUp,
    fadeIn,
    scaleIn,
    slideLeft: slideInLeft,
    slideRight: slideInRight,
  };

  return (
    <motion.div variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  );
}
