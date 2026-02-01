'use client';

import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const particles: { x: number, y: number, vx: number, vy: number, life: number }[] = [];

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);

        const createParticle = () => {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100 + 100
            };
        };

        for (let i = 0; i < 60; i++) {
            particles.push(createParticle());
        }

        const drawGrid = () => {
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.03)';
            ctx.lineWidth = 1;
            const gridSize = 50;

            // Perspective Grid
            for (let x = 0; x <= w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y <= h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, w, h);

            // Draw static grid
            drawGrid();

            // Update and draw particles (simulating digital nodes)
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
                    particles[i] = createParticle();
                }

                // Neon glow effect for particles
                const particleColor = i % 3 === 0 ? '#bc13fe' : '#00f3ff';
                ctx.globalAlpha = (p.life / 200) * 0.8;
                ctx.fillStyle = particleColor;
                ctx.shadowBlur = 10;
                ctx.shadowColor = particleColor;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow for lines
                ctx.shadowBlur = 0;

                // Connect nearby particles
                particles.forEach((p2, j) => {
                    if (i === j) return;
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = i % 3 === 0 ? `rgba(188, 19, 254, ${0.15 - dist / 1200})` : `rgba(0, 243, 255, ${0.15 - dist / 1200})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
};

export default Background;
