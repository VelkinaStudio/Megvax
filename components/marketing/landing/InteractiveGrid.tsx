'use client';

import { useRef, useEffect, useCallback } from 'react';

interface InteractiveGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
}

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  currentSize: number;
  currentR: number;
  currentG: number;
  currentB: number;
  currentA: number;
}

// Parse rgba string into components
function parseRGBA(rgba: string): [number, number, number, number] {
  const match = rgba.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!match) return [37, 99, 235, 0.15];
  return [
    parseFloat(match[1]),
    parseFloat(match[2]),
    parseFloat(match[3]),
    match[4] !== undefined ? parseFloat(match[4]) : 1,
  ];
}

export function InteractiveGrid({
  dotSize = 2,
  gap = 28,
  baseColor = 'rgba(37, 99, 235, 0.15)',
  activeColor = 'rgba(37, 99, 235, 0.6)',
  proximity = 150,
}: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const prefersReducedMotion = useRef(false);

  const [baseR, baseG, baseB, baseA] = parseRGBA(baseColor);
  const [activeR, activeG, activeB, activeA] = parseRGBA(activeColor);

  const initDots = useCallback((width: number, height: number) => {
    const dots: Dot[] = [];
    const cols = Math.ceil(width / gap) + 1;
    const rows = Math.ceil(height / gap) + 1;
    const offsetX = (width - (cols - 1) * gap) / 2;
    const offsetY = (height - (rows - 1) * gap) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * gap;
        const y = offsetY + row * gap;
        dots.push({
          x,
          y,
          baseX: x,
          baseY: y,
          currentSize: dotSize,
          currentR: baseR,
          currentG: baseG,
          currentB: baseB,
          currentA: baseA,
        });
      }
    }
    dotsRef.current = dots;
  }, [gap, dotSize, baseR, baseG, baseB, baseA]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const dots = dotsRef.current;
    const mouse = mouseRef.current;
    const maxSize = dotSize * 2.5;
    const proxSq = proximity * proximity;
    const lerpFactor = 0.08;

    // Bounding box optimization: only update dots near mouse
    const minX = mouse.x - proximity - gap;
    const maxX = mouse.x + proximity + gap;
    const minY = mouse.y - proximity - gap;
    const maxY = mouse.y + proximity + gap;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // Determine target values based on mouse proximity
      let targetSize = dotSize;
      let targetR = baseR;
      let targetG = baseG;
      let targetB = baseB;
      let targetA = baseA;

      if (
        mouse.active &&
        dot.baseX >= minX && dot.baseX <= maxX &&
        dot.baseY >= minY && dot.baseY <= maxY
      ) {
        const dx = dot.baseX - mouse.x;
        const dy = dot.baseY - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < proxSq) {
          const dist = Math.sqrt(distSq);
          const influence = 1 - dist / proximity;
          const eased = influence * influence; // quadratic ease for smoother falloff

          targetSize = dotSize + (maxSize - dotSize) * eased;
          targetR = baseR + (activeR - baseR) * eased;
          targetG = baseG + (activeG - baseG) * eased;
          targetB = baseB + (activeB - baseB) * eased;
          targetA = baseA + (activeA - baseA) * eased;
        }
      }

      // Smooth lerp toward target
      dot.currentSize += (targetSize - dot.currentSize) * lerpFactor;
      dot.currentR += (targetR - dot.currentR) * lerpFactor;
      dot.currentG += (targetG - dot.currentG) * lerpFactor;
      dot.currentB += (targetB - dot.currentB) * lerpFactor;
      dot.currentA += (targetA - dot.currentA) * lerpFactor;

      // Draw
      ctx.beginPath();
      ctx.arc(dot.baseX, dot.baseY, dot.currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.round(dot.currentR)}, ${Math.round(dot.currentG)}, ${Math.round(dot.currentB)}, ${dot.currentA.toFixed(3)})`;
      ctx.fill();
    }

    ctx.restore();

    // Radial gradient overlay: fade edges to background color
    ctx.save();
    ctx.scale(dpr, dpr);
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.25,
      width / 2, height / 2, Math.max(width, height) * 0.6
    );
    gradient.addColorStop(0, 'rgba(250, 250, 248, 0)');
    gradient.addColorStop(0.7, 'rgba(250, 250, 248, 0.3)');
    gradient.addColorStop(1, 'rgba(250, 250, 248, 0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }, [dotSize, proximity, baseR, baseG, baseB, baseA, activeR, activeG, activeB, activeA, gap]);

  const animate = useCallback(() => {
    if (!isVisibleRef.current || prefersReducedMotion.current) return;
    draw();
    rafRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    // Check reduced motion preference
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mql.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches) {
        cancelAnimationFrame(rafRef.current);
        // Draw static grid once
        draw();
      } else {
        animate();
      }
    };
    mql.addEventListener('change', handleMotionChange);

    return () => mql.removeEventListener('change', handleMotionChange);
  }, [draw, animate]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      initDots(rect.width, rect.height);

      // If reduced motion, draw static grid
      if (prefersReducedMotion.current) {
        draw();
      }
    }

    resize();

    // Intersection Observer — pause when not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !prefersReducedMotion.current) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Mouse events
    function handleMouseMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    }

    // Touch events for mobile
    function handleTouchMove(e: TouchEvent) {
      if (!container || e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      };
    }

    function handleTouchEnd() {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // Resize listener
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    // Start animation
    if (!prefersReducedMotion.current) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [initDots, draw, animate]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ willChange: 'auto' }}
      />
    </div>
  );
}
