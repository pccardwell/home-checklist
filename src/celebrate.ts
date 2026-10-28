import confetti from "canvas-confetti";
import type { CelebrationLevel } from "./types";

const COLORS = ["#22c55e", "#4ade80", "#bbf7d0", "#facc15", "#f3ebe3"];
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function dayBurst() {
  confetti({ particleCount: 70, spread: 70, startVelocity: 38, origin: { y: 0.7 }, colors: COLORS });
}

function weekCannons() {
  const end = Date.now() + 1600;
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  setTimeout(() => confetti({ particleCount: 140, spread: 110, origin: { y: 0.6 }, colors: COLORS }), 300);
}

function monthFireworks() {
  const end = Date.now() + 4200;
  const timer = window.setInterval(() => {
    const left = end - Date.now();
    if (left <= 0) {
      clearInterval(timer);
      return;
    }
    const count = Math.round(60 * (left / 4200)) + 20;
    const base = { startVelocity: 32, spread: 360, ticks: 70, zIndex: 1000, colors: COLORS };
    confetti({ ...base, particleCount: count, origin: { x: 0.1 + Math.random() * 0.25, y: Math.random() * 0.4 } });
    confetti({ ...base, particleCount: count, origin: { x: 0.65 + Math.random() * 0.25, y: Math.random() * 0.4 } });
  }, 260);
  weekCannons();
  setTimeout(() => {
    confetti({ particleCount: 250, spread: 160, startVelocity: 55, origin: { y: 0.65 }, colors: COLORS, scalar: 1.3 });
  }, 3800);
  navigator.vibrate?.([80, 60, 80, 60, 180]);
}

export function celebrate(level: CelebrationLevel) {
  if (reduceMotion()) return;
  if (level === "day") dayBurst();
  else if (level === "week") weekCannons();
  else monthFireworks();
}
