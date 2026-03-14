'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        name: "Selin Yilmaz",
        role: "Marketing Director @ TechFlow",
        text: "Megvax completely transformed our ad management. Thanks to AI optimization, we increased our ROAS by 140% in 3 months. The sleek interface takes the user experience to a whole new level.",
        avatar: "https://i.pravatar.cc/150?u=selin",
        rating: 5
    },
    {
        name: "Can Demir",
        role: "Founder @ GrowthLab",
        text: "Incredibly easy to use and results come fast. It offers smarter data analytics than any tool we've used before. The support team is always by your side.",
        avatar: "https://i.pravatar.cc/150?u=can",
        rating: 5
    },
    {
        name: "Melis Erten",
        role: "E-commerce Manager",
        text: "I'm amazed by its precision in budget management. It instantly cuts wasted spend and focuses on success. Truly a next-gen experience.",
        avatar: "https://i.pravatar.cc/150?u=melis",
        rating: 5
    }
];

export function TestimonialCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-32 bg-[#02040a] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-purple-400 text-xs font-black uppercase tracking-widest mb-6"
                    >
                        User Testimonials
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Grow with <span className="text-purple-500">Confidence</span></h2>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-dark rounded-[48px] p-12 md:p-20 border border-white/10 shadow-3xl text-center relative"
                        >
                            <Quote className="w-20 h-20 text-white/5 absolute top-10 left-10" />

                            <div className="flex justify-center gap-1 mb-8">
                                {[...Array(testimonials[index].rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-purple-500 text-purple-500" />
                                ))}
                            </div>

                            <p className="text-2xl md:text-4xl font-medium text-white mb-12 italic leading-tight">
                                "{testimonials[index].text}"
                            </p>

                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full border-2 border-purple-500/30 p-1 mb-4 shadow-2xl">
                                    <img
                                        src={testimonials[index].avatar}
                                        alt={testimonials[index].name}
                                        className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <h4 className="text-xl font-bold text-white">{testimonials[index].name}</h4>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">{testimonials[index].role}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-center gap-6 mt-12">
                        <button
                            onClick={prev}
                            className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-90"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={next}
                            className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-90"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        </section>
    );
}
