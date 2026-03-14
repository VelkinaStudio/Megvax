'use client';
import { useRef, useEffect, useCallback, useMemo } from 'react';

import './DotGrid.css';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

interface Dot {
  cx: number;
  cy: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function DotGrid({
  dotSize = 2,
  gap = 28,
  baseColor = '#ffffff',
  activeColor = '#6366f1',
  proximity = 120,
  shockRadius = 200,
  shockStrength = 8,
  className = '',
  style
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cell = dotSize + gap;
    const cols = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / cell) + 1;
    const offsetX = (width - (cols - 1) * cell) / 2;
    const offsetY = (height - (rows - 1) * cell) / 2;

    const dots: Dot[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          cx: offsetX + c * cell,
          cy: offsetY + r * cell,
          ox: 0, oy: 0,
          vx: 0, vy: 0
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    buildGrid();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(buildGrid);
      if (wrapperRef.current) ro.observe(wrapperRef.current);
      return () => ro?.disconnect();
    }
    const handleResize = () => buildGrid();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buildGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const proxSq = proximity * proximity;
    const spring = 0.03;
    const damping = 0.85;
    const baseAlpha = 0.15;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
      ctx.clearRect(0, 0, w, h);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        if (dsq < proxSq && px > -999) {
          const dist = Math.sqrt(dsq);
          const force = (1 - dist / proximity) * 12;
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;
        }

        dot.vx += (0 - dot.ox) * spring;
        dot.vy += (0 - dot.oy) * spring;
        dot.vx *= damping;
        dot.vy *= damping;
        dot.ox += dot.vx;
        dot.oy += dot.vy;

        const finalX = dot.cx + dot.ox;
        const finalY = dot.cy + dot.oy;
        const displacement = Math.sqrt(dot.ox * dot.ox + dot.oy * dot.oy);

        let alpha = baseAlpha;
        let r = baseRgb.r, g = baseRgb.g, b = baseRgb.b;

        if (dsq < proxSq && px > -999) {
          const t = 1 - Math.sqrt(dsq) / proximity;
          alpha = baseAlpha + t * 0.85;
          r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        }

        if (displacement > 0.5) {
          alpha = Math.min(1, alpha + displacement * 0.02);
        }

        ctx.beginPath();
        ctx.arc(finalX, finalY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [proximity, baseRgb, activeRgb, dotSize]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    };

    const onLeave = () => {
      pointerRef.current.x = -9999;
      pointerRef.current.y = -9999;
    };

    const onClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius) {
          const falloff = 1 - dist / shockRadius;
          const angle = Math.atan2(dot.cy - cy, dot.cx - cx);
          dot.vx += Math.cos(angle) * shockStrength * falloff * 20;
          dot.vy += Math.sin(angle) * shockStrength * falloff * 20;
        }
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click', onClick);
    };
  }, [shockRadius, shockStrength]);

  return (
    <div className={`dot-grid ${className}`} style={style}>
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </div>
  );
}
