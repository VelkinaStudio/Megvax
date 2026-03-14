'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { parallaxConfig } from '@/lib/animations';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxScrollProps {
    children: React.ReactNode;
    className?: string;
    speed?: number; // 0 to 1, where 1 is faster
    direction?: 'vertical' | 'horizontal';
}

export function ParallaxScroll({
    children,
    className = '',
    speed = parallaxConfig.speed,
    direction = 'vertical',
}: ParallaxScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const target = targetRef.current;

        if (!container || !target) return;

        // A positive y percent movement creates a parallax "lag" effect if scrub is true
        // Or we can move it purely based on scroll position

        // Simple parallax implementation:
        // Move the target element in the opposite direction of scroll

        const yMovement = direction === 'vertical' ? (speed * 100) : 0;
        const xMovement = direction === 'horizontal' ? (speed * 100) : 0;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                target,
                {
                    y: direction === 'vertical' ? -yMovement : 0,
                    x: direction === 'horizontal' ? -xMovement : 0
                },
                {
                    y: direction === 'vertical' ? yMovement : 0,
                    x: direction === 'horizontal' ? xMovement : 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [direction, speed]);

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            <div ref={targetRef} className="will-change-transform">
                {children}
            </div>
        </div>
    );
}
