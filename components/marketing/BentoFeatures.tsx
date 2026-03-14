'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import {
    BarChart3,
    Target,
    Sparkles,
    Zap,
    Shield,
    Globe,
    Cpu,
    Layers,
    ArrowRight
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100
        } as any
    }
};

export function BentoFeatures() {
    const thp = useTranslations('homepage');

    const features = [
        {
            title: thp('ai_optimization_title'),
            description: thp('ai_optimization_desc'),
            icon: "/ai_optimization_icon_1770235070900.png",
            size: 'large',
            color: 'from-blue-500/20 to-purple-500/20',
        },
        {
            title: thp('auto_scaling_title'),
            description: thp('auto_scaling_desc'),
            icon: "/global_reach_icon_1770235082781.png",
            size: 'small',
            color: 'from-blue-500/20 to-cyan-500/20',
        },
        {
            title: thp('predictive_title'),
            description: thp('predictive_desc'),
            icon: "/secure_data_icon_1770235096721.png",
            size: 'small',
            color: 'from-emerald-500/20 to-teal-500/20',
        },
        {
            title: thp('real_time_title'),
            description: thp('real_time_desc'),
            icon: Zap,
            size: 'medium',
            color: 'from-orange-500/20 to-red-500/20',
        }
    ];

    return (
        <section id="features" className="py-32 bg-[#02040a] relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-6"
                    >
                        Features
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter"
                    >
                        A <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Next-Gen</span> Ad Management Experience
                    </motion.h2>
                    <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
                        {thp('features_subtitle')}
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[280px]"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { duration: 0.4, ease: "easeOut" }
                            }}
                            className={`
                relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.03] p-10 flex flex-col justify-between group backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07]
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${feature.size === 'medium' ? 'md:col-span-2' : ''}
              `}
                        >
                            {/* Subtle Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                            {/* Animated Ray */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="mb-6">
                                    {typeof feature.icon === 'string' ? (
                                        <div className="w-16 h-16 rounded-2xl bg-[#0a0c14] border border-white/10 flex items-center justify-center overflow-hidden p-1 shadow-2xl">
                                            <Image
                                                src={feature.icon}
                                                alt={feature.title}
                                                width={64}
                                                height={64}
                                                className="object-contain grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <feature.icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed max-w-sm group-hover:text-gray-300 transition-colors">{feature.description}</p>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white transition-colors">
                                <span className="uppercase tracking-widest">{thp('learn_more')}</span>
                                <ArrowRight size={16} className="translate-x-0 group-hover:translate-x-2 transition-transform duration-500" />
                            </div>

                            {/* Holographic Border Effect */}
                            <div className="absolute inset-[1px] rounded-[39px] bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
