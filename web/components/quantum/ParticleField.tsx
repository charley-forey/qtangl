"use client";

import { useEffect, useRef } from "react";

import usePrefersReducedMotion from "@/lib/usePrefersReducedMotion";

type ParticleFieldProps = {
  className?: string;
  density?: number;
};

type Point = {
  x: number;
  y: number;
};

function cubicPoint(start: Point, controlA: Point, controlB: Point, end: Point, t: number) {
  const inverse = 1 - t;

  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * controlA.x +
      3 * inverse * t ** 2 * controlB.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * controlA.y +
      3 * inverse * t ** 2 * controlB.y +
      t ** 3 * end.y,
  };
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  density: number,
  reduceMotion: boolean
) {
  ctx.clearRect(0, 0, width, height);

  const leftNode = { x: width * 0.18, y: height * 0.52 };
  const rightNode = { x: width * 0.82, y: height * 0.48 };
  const centerNode = { x: width * 0.5, y: height * 0.5 };
  const sweep = reduceMotion ? 0 : Math.sin(time * 0.00025) * height * 0.05;
  const lanes = [
    {
      start: leftNode,
      controlA: { x: width * 0.32, y: height * 0.1 + sweep },
      controlB: { x: width * 0.68, y: height * 0.9 - sweep },
      end: rightNode,
      alpha: 0.82,
      width: 1.5,
      speed: 0.00008,
    },
    {
      start: leftNode,
      controlA: { x: width * 0.34, y: height * 0.9 - sweep * 0.4 },
      controlB: { x: width * 0.66, y: height * 0.08 + sweep * 0.6 },
      end: rightNode,
      alpha: 0.46,
      width: 1.2,
      speed: 0.00006,
    },
    {
      start: { x: width * 0.2, y: height * 0.28 },
      controlA: { x: width * 0.4, y: height * 0.18 + sweep * 0.4 },
      controlB: { x: width * 0.64, y: height * 0.66 - sweep * 0.3 },
      end: { x: width * 0.8, y: height * 0.72 },
      alpha: 0.24,
      width: 1,
      speed: 0.00005,
    },
  ];

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  const step = Math.max(36, Math.round(width / 14));
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  drawGlow(ctx, leftNode.x, leftNode.y, Math.min(width, height) * 0.2, 0.1);
  drawGlow(ctx, rightNode.x, rightNode.y, Math.min(width, height) * 0.2, 0.09);
  drawGlow(ctx, centerNode.x, centerNode.y, Math.min(width, height) * 0.26, 0.05);

  lanes.forEach((lane) => {
    ctx.beginPath();
    ctx.moveTo(lane.start.x, lane.start.y);
    ctx.bezierCurveTo(
      lane.controlA.x,
      lane.controlA.y,
      lane.controlB.x,
      lane.controlB.y,
      lane.end.x,
      lane.end.y
    );
    ctx.strokeStyle = `rgba(255,255,255,${lane.alpha})`;
    ctx.lineWidth = lane.width;
    ctx.stroke();

    const particleCount = Math.max(8, density);
    for (let index = 0; index < particleCount; index += 1) {
      const trailOffset = index / particleCount;
      const motion = reduceMotion ? 0.08 : time * lane.speed;
      const t = (trailOffset + motion) % 1;

      for (let trail = 0; trail < 3; trail += 1) {
        const trailT = (t - trail * 0.035 + 1) % 1;
        const point = cubicPoint(lane.start, lane.controlA, lane.controlB, lane.end, trailT);
        const opacity = (1 - trail * 0.3) * (lane.alpha * 0.72);
        const radius = trail === 0 ? 2.2 : 1.3 - trail * 0.15;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.arc(point.x, point.y, Math.max(radius, 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  [
    leftNode,
    rightNode,
    centerNode,
    { x: width * 0.35, y: height * 0.28 },
    { x: width * 0.64, y: height * 0.68 },
  ].forEach((point, index) => {
    ctx.beginPath();
    ctx.fillStyle = index < 2 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.28)";
    ctx.arc(point.x, point.y, index < 2 ? 6.5 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  [leftNode, rightNode].forEach((point) => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.arc(point.x, point.y, 26, 0, Math.PI * 2);
    ctx.stroke();
  });
}

export default function ParticleField({
  className = "",
  density = 14,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastPaint = 0;
    let isInViewport = true;
    let isDocumentVisible = document.visibilityState !== "hidden";

    const getDensity = () => {
      if (width < 768) {
        return Math.max(8, Math.round(density * 0.55));
      }

      return density;
    };

    const draw = (time: number) => {
      drawField(context, width, height, time, getDensity(), Boolean(reduceMotion));
    };

    const stop = () => {
      if (!frame) {
        return;
      }

      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const shouldAnimate = () => !reduceMotion && isInViewport && isDocumentVisible;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(bounds.width));
      const nextHeight = Math.max(1, Math.floor(bounds.height));
      const dprCap = nextWidth < 768 ? 1.25 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.floor(nextWidth * dpr);
      canvas.height = Math.floor(nextHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (time: number) => {
      if (!shouldAnimate()) {
        frame = 0;
        return;
      }

      if (!lastPaint || time - lastPaint >= 1000 / 30) {
        draw(time);
        lastPaint = time;
      }

      frame = window.requestAnimationFrame(render);
    };

    const viewportObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              isInViewport = entry.isIntersecting;

              if (shouldAnimate()) {
                if (!frame) {
                  lastPaint = 0;
                  frame = window.requestAnimationFrame(render);
                }
              } else {
                stop();
                draw(performance.now());
              }
            },
            {
              threshold: 0,
              rootMargin: "240px 0px",
            }
          );

    viewportObserver?.observe(canvas);

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== "hidden";

      if (shouldAnimate()) {
        if (!frame) {
          lastPaint = 0;
          frame = window.requestAnimationFrame(render);
        }
      } else {
        stop();
        draw(performance.now());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (shouldAnimate()) {
      frame = window.requestAnimationFrame(render);
    }

    return () => {
      observer.disconnect();
      viewportObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stop();
    };
  }, [density, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={["h-full w-full", className].filter(Boolean).join(" ")}
    />
  );
}
