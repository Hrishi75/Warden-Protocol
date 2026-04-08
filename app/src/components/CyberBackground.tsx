"use client";

import React, { useEffect, useRef } from "react";

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let resizing = false;

    const resize = () => {
      if (resizing) return;
      resizing = true;
      requestAnimationFrame(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        resizing = false;
      });
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", resize);

    // Particles — reduced count for performance
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.7 ? "#FF0033" : Math.random() > 0.4 ? "#00E5CC" : "#6C5CE7",
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Moving grid
      const gridSize = 80;
      const offsetY = (time * 60) % gridSize;
      ctx.strokeStyle = "rgba(0, 229, 204, 0.03)";
      ctx.lineWidth = 1;

      for (let y = -gridSize + offsetY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Single scan line (red)
      const scanY = ((time * 80) % (h + 200)) - 100;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, "rgba(255, 0, 51, 0)");
      scanGrad.addColorStop(0.5, "rgba(255, 0, 51, 0.05)");
      scanGrad.addColorStop(1, "rgba(255, 0, 51, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, w, 60);

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const flicker = 0.5 + 0.5 * Math.sin(time * 2 + p.x * 0.01);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.fill();

        // Subtle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.globalAlpha = p.alpha * 0.1;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Connection lines — only check first 15 particles to avoid O(n²) perf hit
      const connectLimit = Math.min(particles.length, 15);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < connectLimit; i++) {
        for (let j = i + 1; j < connectLimit; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          // Skip expensive sqrt if clearly too far
          if (Math.abs(dx) > 120 || Math.abs(dy) > 120) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.06;
            ctx.strokeStyle = "rgba(0, 229, 204, 0.05)";
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
