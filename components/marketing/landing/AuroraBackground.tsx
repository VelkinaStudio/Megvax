'use client';

import { useEffect, useRef } from 'react';

interface AuroraBackgroundProps {
  className?: string;
  colors?: string[];
  speed?: number;
  blur?: number;
}

export function AuroraBackground({
  className = '',
  colors = ['#4F46E5', '#7C3AED', '#EC4899', '#06B6D4'],
  speed = 0.5,
  blur = 100,
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const blobs = colors.map((color, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 300 + 200,
      color,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      phase: i * Math.PI * 0.5,
    }));

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      blobs.forEach((blob, i) => {
        blob.x += Math.sin(time + blob.phase) * blob.vx * 2;
        blob.y += Math.cos(time + blob.phase) * blob.vy * 2;

        if (blob.x < -blob.radius) blob.x = window.innerWidth + blob.radius;
        if (blob.x > window.innerWidth + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = window.innerHeight + blob.radius;
        if (blob.y > window.innerHeight + blob.radius) blob.y = -blob.radius;

        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        gradient.addColorStop(0, blob.color + '40');
        gradient.addColorStop(0.5, blob.color + '20');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [colors, speed, blur]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        filter: `blur(${blur}px)`,
        opacity: 0.6,
      }}
    />
  );
}
