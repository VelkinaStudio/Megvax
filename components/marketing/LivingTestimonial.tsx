'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface LivingTestimonialProps {
    avatar: string;
    name: string;
    role: string;
    company: string;
    quote: string;
    delay?: number;
}

export function LivingTestimonial({
    avatar,
    name,
    role,
    company,
    quote,
    delay = 0,
}: LivingTestimonialProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const textElement = textRef.current;
        const cursor = cursorRef.current;
        const status = statusRef.current;

        if (!container || !textElement || !cursor) return;

        // Initial state
        gsap.set(container, { y: 30, opacity: 0 });
        gsap.set(cursor, { opacity: 0 });

        // Status pulsing (online indicator)
        if (status) {
            gsap.to(status, {
                scale: 1.2,
                opacity: 0.7,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // 1. Fade in container
        tl.to(container, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: delay,
            ease: 'power2.out'
        });

        // 2. Typing effect
        // We'll use a text plugin alternative logic since we might not have the TextPlugin installed
        // Split text logic: animate opacity of characters (if we split) or just use the GSAP TextPlugin if available.
        // Since we don't have TextPlugin guaranteed, let's use a "reveal" mask or clip-path.

        // Actually, simulated typing with pure JS + GSAP updates is safer without plugins.
        const chars = quote.split('');
        textElement.textContent = ''; // Clear initial

        // Cursor blinking
        gsap.to(cursor, { opacity: 1, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });

        // Type characters
        chars.forEach((char, i) => {
            tl.call(() => {
                textElement.textContent += char;
            }, [], `+=${Math.random() * 0.05 + 0.02}`); // Random typing speed
        });

        // Stop cursor blinking after typing
        tl.to(cursor, { opacity: 0, duration: 0.2 }, "+=0.5");

        return () => {
            tl.kill();
        };
    }, [quote, delay]);

    return (
        <div
            ref={containerRef}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-md w-full hover:bg-white/10 transition-colors duration-300"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                        {/* Fallback avatar if image fails or for preview */}
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {name.charAt(0)}
                        </div>
                    </div>
                    {/* Online Status */}
                    <div
                        ref={statusRef}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0118] rounded-full"
                    />
                </div>
                <div>
                    <h4 className="text-white font-bold">{name}</h4>
                    <p className="text-xs text-gray-400">{role} @ <span className="text-purple-400">{company}</span></p>
                </div>
            </div>

            <div className="relative min-h-[80px]">
                <p ref={textRef} className="text-gray-300 leading-relaxed inline">
                    {/* Text will be typed here */}
                </p>
                <span ref={cursorRef} className="inline-block w-0.5 h-4 bg-purple-400 ml-1 translate-y-0.5" />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                <span>Just now</span>
            </div>
        </div>
    );
}
