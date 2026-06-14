import React, { useEffect, useRef, useCallback } from 'react';
import './LogoColorTrail.css';

/** Paleta extraída del globo aerostático del logo LUXES */
const LOGO_PALETTE = [
  '#F9D423',
  '#4CAF50',
  '#29B6F6',
  '#FF9800',
  '#8BC34A',
  '#E91E63',
  '#00BCD4',
  '#1565C0',
];

const MAX_TRAIL_POINTS = 90;
const MIN_POINT_DISTANCE = 10;
const POINT_RADIUS = 4;
const LINE_WIDTH = 2.5;
const LIFE_DECAY = 0.018;

const nextColor = (index) => LOGO_PALETTE[index % LOGO_PALETTE.length];

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const LogoColorTrail = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const trailRef = useRef([]);
  const colorIndexRef = useRef(0);
  const frameRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const drawTrail = useCallback((ctx, trail) => {
    if (trail.length < 2) {
      if (trail.length === 1) {
        const p = trail[0];
        ctx.save();
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, POINT_RADIUS * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    for (let i = 0; i < trail.length - 1; i += 1) {
      const a = trail[i];
      const b = trail[i + 1];
      const alpha = Math.min(a.life, b.life) * 0.75;

      if (alpha <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = LINE_WIDTH * Math.min(a.life, b.life);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    trail.forEach((p) => {
      if (p.life <= 0.02) return;

      ctx.save();
      ctx.globalAlpha = p.life * 0.95;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, POINT_RADIUS * (0.55 + p.life * 0.45), 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = p.life * 0.35;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x - 0.6, p.y - 0.6, POINT_RADIUS * 0.25 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  const addTrailPoint = useCallback((x, y) => {
    const trail = trailRef.current;
    const last = trail[trail.length - 1];

    if (last && distance(last, { x, y }) < MIN_POINT_DISTANCE) return;

    const color = nextColor(colorIndexRef.current);
    colorIndexRef.current += 1;

    trail.push({ x, y, color, life: 1 });

    if (trail.length > MAX_TRAIL_POINTS) trail.shift();
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const trail = trailRef.current;

    for (let i = trail.length - 1; i >= 0; i -= 1) {
      trail[i].life -= LIFE_DECAY;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    ctx.clearRect(0, 0, width, height);
    drawTrail(ctx, trail);

    frameRef.current = requestAnimationFrame(tick);
  }, [drawTrail]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth;
    const h = container.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    const wrap = containerRef.current;
    const canvas = canvasRef.current;
    const page = wrap?.parentElement;
    if (!wrap || !canvas || !page) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = prefersReduced.matches;

    const handleMotionChange = (e) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) trailRef.current = [];
    };
    prefersReduced.addEventListener('change', handleMotionChange);

    const handleMouseMove = (e) => {
      if (reducedMotionRef.current) return;

      const rect = wrap.getBoundingClientRect();
      addTrailPoint(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
      trailRef.current = [];
      colorIndexRef.current = 0;
    };

    resizeCanvas();
    frameRef.current = requestAnimationFrame(tick);

    page.addEventListener('mousemove', handleMouseMove);
    page.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      prefersReduced.removeEventListener('change', handleMotionChange);
      page.removeEventListener('mousemove', handleMouseMove);
      page.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [resizeCanvas, tick, addTrailPoint]);

  return (
    <div ref={containerRef} className="logo-color-trail-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="logo-color-trail" />
    </div>
  );
};
