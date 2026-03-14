'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  type?: 'words' | 'chars' | 'lines';
  once?: boolean;
}

export function AnimatedText({
  text,
  className = '',
  delay = 0,
  staggerChildren = 0.03,
  type = 'words',
  once = true,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: '-100px' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const getItems = () => {
    switch (type) {
      case 'chars':
        return text.split('');
      case 'lines':
        return text.split('\n');
      default:
        return text.split(' ');
    }
  };

  const items = getItems();

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{ perspective: 1000 }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={itemVariants}
          style={{ transformOrigin: 'center bottom' }}
        >
          {item}
          {type === 'words' && index < items.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  );
}

interface GradientTextProps {
  text: string;
  className?: string;
  gradient?: string;
  animate?: boolean;
}

export function GradientText({
  text,
  className = '',
  gradient = 'from-blue-400 via-purple-400 to-pink-400',
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${
        animate ? 'animate-gradient bg-[length:200%_auto]' : ''
      } ${className}`}
    >
      {text}
    </span>
  );
}

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function SplitText({ text, className = '', delay = 0, duration = 0.5 }: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%', opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {text}
      </motion.span>
    </span>
  );
}
