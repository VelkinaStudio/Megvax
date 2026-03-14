'use client';

import { motion } from 'framer-motion';
import { Search, Rocket, BarChart2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export function ProcessSection() {
    const thp = useTranslations('homepage');

    const steps = [
        {
            title: "Data Integration",
            desc: "Connect your ad accounts in seconds. We collect all raw data in a single pool.",
            icon: Search,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            title: "AI Analysis",
            desc: "Megvax AI processes millions of data points to uncover hidden opportunities and budget gaps.",
            icon: BarChart2,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            title: "Smart Optimization",
            desc: "Shift your budget to the most efficient campaigns with one click and reach your ROAS targets.",
            icon: Rocket,
            color: "text-purple-400",
            bg: "bg-purple-400/10"
        }
    ];

    return (
        <section className="py-32 bg-[#02040a] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                                From Data to <span className="text-blue-500">Profit</span> <br /> The Shortest Path
                            </h2>
                            <p className="text-xl text-gray-400 font-medium max-w-lg">
                                Stop wasting time with complex ad panels. Gain clarity at every step with Megvax.
                            </p>

                            <div className="space-y-6 pt-6">
                                {steps.map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.2 }}
                                        className="flex items-start gap-6 group"
                                    >
                                        <div className={`w-14 h-14 shrink-0 rounded-2xl ${step.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                                            <step.icon className={`w-7 h-7 ${step.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{step.title}</h3>
                                            <p className="text-gray-400 leading-relaxed font-medium">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <div className="glass-dark rounded-[48px] p-8 border border-white/10 shadow-3xl overflow-hidden aspect-square flex flex-col items-center justify-center text-center">
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-48 h-48 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center mb-10"
                                >
                                    <div className="w-32 h-32 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                                    <ShieldCheck className="absolute w-20 h-20 text-blue-400" />
                                </motion.div>
                                <h4 className="text-3xl font-black text-white mb-4">Fully Automated Data Flow</h4>
                                <p className="text-gray-400 px-10">Your privacy is everything to us. Your data is protected with bank-level security protocols.</p>

                                <div className="mt-12 group cursor-pointer flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest text-sm">
                                    <span>Take a Closer Look at the Tech</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
