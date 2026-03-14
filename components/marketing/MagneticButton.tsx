'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { magneticConfig } from '@/lib/animations';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number; // How strong the magnetic pull is
    onClick?: () => void;
}

export function MagneticButton({
    children,
    className = '',
    strength = magneticConfig.strength,
    onClick,
}: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        const text = textRef.current;

        if (!button || !text) return;

        const xTo = gsap.quickTo(button, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
        const yTo = gsap.quickTo(button, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

        // Independent text movement for parallax feeling within button
        const xToText = gsap.quickTo(text, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
        const yToText = gsap.quickTo(text, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = button.getBoundingClientRect();

            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            // Move button
            xTo(x * strength);
            yTo(y * strength);

            // Move text slightly more for depth effect
            xToText(x * (strength * 1.2));
            yToText(y * (strength * 1.2));
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
            xToText(0);
            yToText(0);
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            className={`relative inline-flex items-center justify-center ${className}`}
        >
            <span ref={textRef} className="relative z-10 block pointer-events-none">
                {children}
            </span>
        </button>
    );
}
