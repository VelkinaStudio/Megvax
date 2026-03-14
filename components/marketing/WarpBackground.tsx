'use client';

import React, { useEffect, useRef } from 'react';

export function WarpBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: { x: number; y: number; z: number; pz: number }[] = [];
        const speed = 0.05; // speed factor
        const numStars = 500;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width,
                    pz: Math.random() * canvas.width, // previous z
                });
            }
        };

        const update = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.fillStyle = '#0a0118'; // Background color matches theme
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < numStars; i++) {
                const star = stars[i];

                star.z -= speed * 200; // Move stars towards viewer

                if (star.z <= 0) {
                    star.z = canvas.width;
                    star.x = Math.random() * canvas.width - canvas.width / 2;
                    star.y = Math.random() * canvas.height - canvas.height / 2;
                    star.pz = star.z;
                }

                const x = cx + (star.x / star.z) * canvas.width;
                const y = cy + (star.y / star.z) * canvas.height;

                const px = cx + (star.x / star.pz) * canvas.width;
                const py = cy + (star.y / star.pz) * canvas.height;

                star.pz = star.z;

                if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) continue;

                const alpha = (1 - star.z / canvas.width);

                ctx.beginPath();
                ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`; // Purple warp lines
                ctx.lineWidth = alpha * 2;
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(update);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        update();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        />
    );
}
