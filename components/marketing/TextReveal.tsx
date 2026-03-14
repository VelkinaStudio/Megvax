'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    mode?: 'char' | 'word' | 'line';
    trigger?: boolean; // Whether to trigger on scroll
}

export function TextReveal({
    text,
    className = '',
    delay = 0,
    mode = 'word',
}: TextRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Split logic would go here, but for simplicity/performance in this iteration,
        // we'll rely on CSS animation classes or look for a split-text library if needed.
        // For now, let's just animate the whole block or simple spans if we manually split.

        // Standard fade-up entry
        const ctx = gsap.context(() => {
            gsap.fromTo(
                container,
                {
                    y: 50,
                    opacity: 0,
                    rotateX: -20
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    duration: 1.2,
                    delay: delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [delay, text]);

    return (
        <div ref={containerRef} className={`will-change-transform ${className}`}>
            {text}
        </div>
    );
}
