'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface GlassStatCardProps {
    label: string;
    value: number;
    suffix: string;
    color: string;
    index: number;
}

export function GlassStatCard({ label, value, suffix, color, index }: GlassStatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.01 }}
            className="relative group p-8 rounded-[24px] overflow-hidden"
        >
            {/* Glass Background - Refined & Subtle */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/[0.15]" />

            {/* Gradient Glow Effect on Hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${getGradient(color)}`} />

            {/* Content */}
            <div className="relative z-10 text-center">
                <div className={`text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 ${color.replace('text-', 'from-')}`}>
                    <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                    {label}
                </p>
            </div>

            {/* Decorative Shine */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}

// Helper to map text colors to gradients for the background glow
function getGradient(colorClass: string) {
    if (colorClass.includes('emerald')) return 'from-emerald-500 to-transparent';
    if (colorClass.includes('indigo')) return 'from-blue-500 to-transparent';
    if (colorClass.includes('purple')) return 'from-purple-500 to-transparent';
    if (colorClass.includes('pink')) return 'from-pink-500 to-transparent';
    return 'from-white to-transparent';
}
