'use client';

import React from 'react';

interface InfiniteMarqueeProps {
    children: React.ReactNode;
    direction?: 'left' | 'right';
    speed?: 'slow' | 'normal' | 'fast';
    className?: string;
    pauseOnHover?: boolean;
}

export function InfiniteMarquee({
    children,
    direction = 'left',
    speed = 'normal',
    className = '',
    pauseOnHover = false,
}: InfiniteMarqueeProps) {
    const speedClass = {
        slow: 'duration-[40s]',
        normal: 'duration-[25s]',
        fast: 'duration-[15s]',
    };

    return (
        <div className={`group flex overflow-hidden p-2 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] ${className}`}>
            <div
                className={`flex min-w-full shrink-0 gap-12 py-4 px-12 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
                    } ${speedClass[speed]} ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
                style={{ animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
            >
                {children}
                {children}
            </div>
            <div
                className={`flex min-w-full shrink-0 gap-12 py-4 px-12 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
                    } ${speedClass[speed]} ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
                style={{ animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
                aria-hidden="true"
            >
                {children}
                {children}
            </div>
        </div>
    );
}
