'use client';

import { useEffect, useRef } from 'react';

interface FloatingLinesProps {
  className?: string;
  lineColor?: string;
  lineWidth?: number;
  lineCount?: number;
  speed?: number;
}

export function FloatingLines({
  className = '',
  lineColor = 'rgba(99, 102, 241, 0.15)',
  lineWidth = 2,
  lineCount = 8,
  speed = 0.5,
}: FloatingLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      vx1: number;
      vy1: number;
      vx2: number;
      vy2: number;
      opacity: number;
    }> = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const initLines = () => {
      lines = [];
      for (let i = 0; i < lineCount; i++) {
        lines.push({
          x1: Math.random() * window.innerWidth,
          y1: Math.random() * window.innerHeight,
          x2: Math.random() * window.innerWidth,
          y2: Math.random() * window.innerHeight,
          vx1: (Math.random() - 0.5) * speed,
          vy1: (Math.random() - 0.5) * speed,
          vx2: (Math.random() - 0.5) * speed,
          vy2: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    resize();
    initLines();
    window.addEventListener('resize', () => {
      resize();
      initLines();
    });

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      lines.forEach((line) => {
        // Update positions
        line.x1 += line.vx1;
        line.y1 += line.vy1;
        line.x2 += line.vx2;
        line.y2 += line.vy2;

        // Bounce off edges
        if (line.x1 < 0 || line.x1 > window.innerWidth) line.vx1 *= -1;
        if (line.y1 < 0 || line.y1 > window.innerHeight) line.vy1 *= -1;
        if (line.x2 < 0 || line.x2 > window.innerWidth) line.vx2 *= -1;
        if (line.y2 < 0 || line.y2 > window.innerHeight) line.vy2 *= -1;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${line.opacity})`);
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [lineColor, lineWidth, lineCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
