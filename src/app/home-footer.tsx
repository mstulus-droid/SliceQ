"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type StarLayer = "far" | "mid" | "near";

type Star = {
  layer: StarLayer;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  twinkle: number;
  twinkleOffset: number;
};

export function HomeFooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const footer = linkRef.current;

    if (!canvas || !footer) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return undefined;
    }

    const state = {
      stars: [] as Star[],
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      rafId: 0,
      lastTs: 0,
    };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    const palette = [
      "rgba(255,255,255,0.95)",
      "rgba(226,232,240,0.82)",
      "rgba(186,230,253,0.9)",
      "rgba(125,211,252,0.88)",
    ];

    function createStar(layer: StarLayer, initial = false): Star {
      const baseY = {
        far: [8, state.height * 0.78],
        mid: [8, state.height * 0.66],
        near: [10, state.height * 0.54],
      }[layer];

      const radius = {
        far: rand(0.5, 1.1),
        mid: rand(0.9, 1.9),
        near: rand(1.4, 2.8),
      }[layer];

      const travel =
        {
          far: rand(10, 22),
          mid: rand(24, 46),
          near: rand(52, 96),
        }[layer] *
        (0.85 + radius * 0.12);

      const direction =
        layer === "far"
          ? { vx: -travel, vy: -(travel * rand(0.08, 0.2)) }
          : layer === "mid"
            ? { vx: travel * rand(0.42, 0.62), vy: travel * rand(0.14, 0.26) }
            : { vx: travel * rand(0.78, 1.02), vy: travel * rand(0.28, 0.46) };

      const spawn = (() => {
        if (initial) {
          return {
            x: rand(0, state.width),
            y: rand(baseY[0], Math.max(baseY[0] + 10, baseY[1])),
          };
        }

        if (layer === "far") {
          return {
            x: state.width + rand(10, 120),
            y: state.height + rand(4, 36),
          };
        }

        return {
          x: -rand(14, 90),
          y: -rand(6, 36),
        };
      })();

      return {
        layer,
        x: spawn.x,
        y: spawn.y,
        r: radius,
        vx: direction.vx,
        vy: direction.vy,
        alpha: {
          far: rand(0.26, 0.46),
          mid: rand(0.46, 0.78),
          near: rand(0.58, 0.82),
        }[layer],
        color: pick(palette),
        twinkle: rand(0.6, 1.4),
        twinkleOffset: rand(0, Math.PI * 2),
      };
    }

    function buildStars() {
      state.stars = [
        ...Array.from({ length: 24 }, () => createStar("far", true)),
        ...Array.from({ length: 11 }, () => createStar("mid", true)),
        ...Array.from({ length: 3 }, () => createStar("near", true)),
      ];
    }

    function resize() {
      const rect = footer.getBoundingClientRect();
      state.width = Math.max(1, rect.width);
      state.height = Math.max(1, rect.height);
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      buildStars();
    }

    function drawStar(star: Star, tsSec: number) {
      const twinkle =
        0.84 + Math.sin(tsSec * star.twinkle + star.twinkleOffset) * 0.16;
      const alpha = Math.max(0.08, Math.min(1, star.alpha * twinkle));

      ctx.beginPath();
      ctx.fillStyle = star.color.replace(/[\d.]+\)$/u, `${alpha})`);
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate(ts: number) {
      if (!state.lastTs) {
        state.lastTs = ts;
      }

      const delta = Math.min(0.05, (ts - state.lastTs) / 1000);
      state.lastTs = ts;
      const tsSec = ts / 1000;

      ctx.clearRect(0, 0, state.width, state.height);

      for (let index = 0; index < state.stars.length; index += 1) {
        const star = state.stars[index];
        star.x += star.vx * delta;
        star.y += star.vy * delta;

        const isFar = star.layer === "far";
        const outOfBounds = isFar
          ? star.x < -(star.r * 10) || star.y < -(star.r * 10)
          : star.x > state.width + star.r * 10 || star.y > state.height + star.r * 10;

        if (outOfBounds) {
          state.stars[index] = createStar(star.layer, false);
          continue;
        }

        drawStar(star, tsSec);
      }

      state.rafId = window.requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    state.rafId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(state.rafId);
    };
  }, []);

  return (
    <div className="mt-6 -mb-6 sm:-mb-7">
      <Link
        ref={linkRef}
        href="https://rhadzor.id"
        target="_blank"
        rel="noopener noreferrer"
        className="relative -mx-4 block min-h-[56px] overflow-hidden rounded-none border border-slate-400/20 bg-[radial-gradient(circle_at_50%_-18%,rgba(147,197,253,0.18),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,#08111f_0%,#0f172a_52%,#111827_100%)] px-1 py-1 shadow-[0_20px_42px_rgba(2,6,23,0.34)] transition hover:border-sky-300/30 hover:shadow-[0_24px_50px_rgba(2,6,23,0.42)] sm:-mx-6 lg:-mx-10"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-x-1/2 bottom-[-34px] h-[92px] w-[220px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(56,189,248,0.24),transparent_68%)] blur-[20px]" />
        <div className="absolute inset-0 z-[1] flex w-full -translate-y-1/2 flex-col items-center justify-center gap-[1px] px-4 text-center top-1/2">
          <div className="m-0 text-[10px] uppercase leading-none tracking-[2.1px] text-slate-200/70">
            Powered By
          </div>
          <div className="m-0 text-2xl font-bold leading-[1.02] tracking-[0.15px] text-slate-50 [text-shadow:0_0_18px_rgba(147,197,253,0.08)]">
            Rhadzor<span className="text-sky-300">.id</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
