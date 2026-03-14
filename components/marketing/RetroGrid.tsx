'use client';

import React from 'react';

export function RetroGrid({ className = "" }: { className?: string }) {
    return (
        <div className={`pointer-events-none absolute h-full w-full overflow-hidden opacity-50 [perspective:200px] ${className}`}>
            {/* Grid Container */}
            <div className="absolute inset-0 [transform:rotateX(35deg)]">
                <div
                    className="animate-grid [background-repeat:repeat] [background-size:60px_60px] [height:300%] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600%] [background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]"
                />
            </div>

            {/* Gradient Overlay for Fade Out */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent to-90%" />
        </div>
    );
}
