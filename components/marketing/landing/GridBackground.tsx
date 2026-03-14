'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface GridBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  maskIntensity?: number;
  mouseRadius?: number;
}

export function GridBackground({
  className = '',
  dotColor = 'rgba(99, 102, 241, 0.15)',
  dotSize = 1,
  gap = 32,
  maskIntensity = 0.8,
  mouseRadius = 200,
}: GridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      const mx = springX.get();
      const my = springY.get();

      for (let x = 0; x < dimensions.width; x += gap) {
        for (let y = 0; y < dimensions.height; y += gap) {
          const distance = Math.sqrt(Math.pow(x - mx, 2) + Math.pow(y - my, 2));
          const scale = Math.max(0, 1 - distance / mouseRadius);
          const size = dotSize + scale * 3;
          const opacity = 0.15 + scale * 0.6;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${opacity})`);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, springX, springY, gap, dotSize, dotColor, mouseRadius]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${maskIntensity}) 70%)`,
        }}
      />
    </div>
  );
}
