'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Zap, TrendingUp, Brain, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const features = [
    {
        id: 'ai-optimization',
        icon: Brain,
        color: 'from-purple-500 to-blue-600',
        bgGlow: 'bg-purple-600/20',
    },
    {
        id: 'auto-scaling',
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-600',
        bgGlow: 'bg-blue-600/20',
    },
    {
        id: 'predictive',
        icon: BarChart3,
        color: 'from-emerald-500 to-teal-600',
        bgGlow: 'bg-emerald-600/20',
    },
    {
        id: 'real-time',
        icon: Zap,
        color: 'from-orange-500 to-red-600',
        bgGlow: 'bg-orange-600/20',
    },
];

export function InteractiveFeatureTour() {
    const thp = useTranslations('homepage');
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    return (
        <section ref={containerRef} className="relative py-32 bg-gradient-to-b from-[#0a0118] to-[#02040a] overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Features
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        {thp('features_title') || 'A Next-Gen'}{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            {thp('features_highlight') || 'Ad Management'}
                        </span>{' '}
                        Experience
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        {thp('features_subtitle') || 'AI-powered automation that transforms how you manage advertising campaigns'}
                    </p>
                </motion.div>

                {/* Horizontal Scrolling Feature Cards */}
                <div className="relative">
                    <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-4 px-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, x: 100 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="flex-shrink-0 w-[90vw] md:w-[600px] snap-center"
                                >
                                    <div className="group relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
                                        {/* Glow Effect */}
                                        <div className={`absolute -inset-1 ${feature.bgGlow} blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10">
                                            {/* Icon */}
                                            <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-2xl`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>

                                            {/* Content */}
                                            <h3 className="text-3xl font-black text-white mb-4">
                                                {thp(`${feature.id}_title`) || feature.id}
                                            </h3>
                                            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                                {thp(`${feature.id}_desc`) || 'Advanced feature description'}
                                            </p>

                                            {/* Visual Demo */}
                                            <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/5 overflow-hidden">
                                                {/* Animated Chart/Visual */}
                                                <div className="absolute inset-0 flex items-end justify-around p-6 gap-2">
                                                    {[...Array(8)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={`w-full bg-gradient-to-t ${feature.color} rounded-t-lg`}
                                                            initial={{ height: 0 }}
                                                            whileInView={{ height: `${Math.random() * 80 + 20}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{
                                                                delay: index * 0.2 + i * 0.1,
                                                                duration: 0.8,
                                                                ease: 'easeOut',
                                                            }}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Overlay Label */}
                                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white">
                                                    Live Demo
                                                </div>
                                            </div>

                                            {/* Learn More */}
                                            <button className="mt-6 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group/btn">
                                                {thp('learn_more') || 'Learn More'}
                                                <motion.span
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    →
                                                </motion.span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Scroll Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {features.map((_, index) => (
                            <div
                                key={index}
                                className="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    );
}
