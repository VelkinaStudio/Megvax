'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { MagneticButton } from './MagneticButton';
import { TextReveal } from './TextReveal';

export function StoryHero() {
    const t = useTranslations('hero');
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mouse tracking for 3D tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [2, -2]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-2, 2]), { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0118] via-[#0f051d] to-[#1a0b2e]">
            {/* Premium Background - Clean & Deep */}
            <div className="absolute inset-0 bg-[#0a0118]">
                {/* Subtle Gradient Mesh - High End Feel */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.15),transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(79,70,229,0.1),transparent_50%)]" />

                {/* Noise Texture for Texture (Optional, adds premium feel) */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />
            </div>

            {/* Floating Particles - Reduced to minimal for elegance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isMounted && [...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        }}
                        animate={{
                            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>{t('badge')}</span>
                        </div>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center mb-6 max-w-5xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight">
                            <TextReveal text={t('title')} delay={0.2} className="inline-block" />{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient bg-[length:200%_auto]">
                                {t('highlight')}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-300 text-center max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                        {t('description')}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
                    >
                        <Link href="/signup">
                            <MagneticButton className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    {t('cta_primary')}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </MagneticButton>
                        </Link>

                        <Link href="/book">
                            <MagneticButton className="px-8 py-4 bg-white/5 text-white border-2 border-white/20 rounded-full font-bold text-lg transition-all hover:bg-white/10 hover:border-white/40 backdrop-blur-sm">
                                Schedule Demo
                            </MagneticButton>
                        </Link>
                    </motion.div>

                    {/* Story-Driven Visual: Before → AI → After */}
                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="relative max-w-6xl mx-auto z-20"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* 3D Container with Perspective */}
                        <motion.div
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: 'preserve-3d',
                            }}
                            className="relative"
                        >
                            {/* Glow Effect */}
                            <div className="absolute -inset-20 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-[100px] rounded-full" />

                            {/* Main Visual Container */}
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                                <div className="grid md:grid-cols-3 gap-8 items-center">
                                    {/* BEFORE: Chaos */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 1 }}
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-2xl group-hover:bg-red-500/20 transition-colors" />
                                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-red-500/20">
                                            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Before</div>
                                            <Image
                                                src="/hero_chaos_before_1770239344803.png"
                                                alt="Fragmented Ad Chaos"
                                                width={400}
                                                height={400}
                                                className="w-full h-auto rounded-lg"
                                            />
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                    <span>Scattered Data</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                                    <span>Manual Work</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* CENTER: AI Transformation */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, delay: 1.2 }}
                                        className="relative flex flex-col items-center justify-center"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-600/30 blur-2xl rounded-full animate-pulse" />
                                            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <Zap className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <div className="text-sm font-bold text-purple-400 uppercase tracking-wider">AI Processing</div>
                                            <div className="text-xs text-gray-400 mt-1">Intelligent Optimization</div>
                                        </div>
                                        {/* Animated Arrow */}
                                        <motion.div
                                            animate={{ x: [0, 10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block"
                                        >
                                            <ArrowRight className="w-6 h-6 text-purple-400" />
                                        </motion.div>
                                    </motion.div>

                                    {/* AFTER: Unified Control */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 1.4 }}
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-2xl group-hover:bg-green-500/20 transition-colors" />
                                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-green-500/20">
                                            <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">After</div>
                                            <Image
                                                src="/hero_unified_after_1770239360771.png"
                                                alt="Unified Intelligence"
                                                width={400}
                                                height={400}
                                                className="w-full h-auto rounded-lg"
                                            />
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                    <span>Unified Dashboard</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    <span>Automated Insights</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Bottom Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 1.6 }}
                                    className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-white mb-1">8.4x</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">ROI Increase</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-white mb-1">92%</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Time Saved</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-white mb-1">24/7</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">AI Monitoring</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
