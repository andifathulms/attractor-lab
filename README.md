<p align="center">
  <img src=".github/assets/lockup-horizontal-dark.png" alt="Attractor Lab" width="480">
</p>

<p align="center">
  <a href="https://github.com/andifathulms/attractor-lab/actions/workflows/deploy.yml"><img src="https://github.com/andifathulms/attractor-lab/actions/workflows/deploy.yml/badge.svg" alt="Deploy status"></a>
  <img src="https://img.shields.io/badge/Next.js-14-000000" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/tests-vitest-6E9F18" alt="Tests: Vitest">
</p>

<p align="center"><strong><a href="https://andifathulms.github.io/attractor-lab/">Live demo →</a></strong></p>

---

A system with no randomness in it, that cannot be predicted. Watch two identical trajectories, started a hair apart, become strangers.

There are a thousand attractor renderers. Most spin a Lorenz butterfly and stop there. This one has an argument, made twice:

- **Deterministic doesn't mean predictable.** Two trajectories separated by an arbitrarily small ε diverge exponentially — that's the divergence pair, the app's headline feature, with a live Lyapunov exponent quantifying the separation and a worked example connecting the number to what you're watching happen.
- **The integrator's error is the subject, not a defect.** A chaotic system amplifies floating-point error exponentially, so every rendered trajectory is one numerical approximation — provably, checkably, not just as a disclaimer. Every render states its integrator and step size. Nothing here claims to show you the true orbit.

## What's in it

| | |
|---|---|
| **Jelajah** (Explore) | The canvas — accumulating trajectory, orbit by drag, zoom by scroll, the divergence pair with epsilon control and a live separation plot |
| **Banding** (Compare) | The same system integrated by Euler, RK2, and RK4 side by side, with a convergence-order check showing the actual error at `dt` and `dt/2` |
| **Irisan** (Section) | A Poincaré section — slice the attractor with a plane and watch a 3D tangle flatten into a nearly one-dimensional map |
| **Cabang** (Bifurcation) | Sweep a parameter and watch the attractor be born: fixed point → limit cycle → period doubling → chaos |
| **Sistem** (Systems) | Reference pages per system — equations hand-set as accessible SVG, parameters, and published constants checked live against what the app itself computes |

Six systems (Lorenz, Rössler, Thomas, Halvorsen, Aizawa, plus the Clifford and De Jong iterated maps), plotter-ready SVG export, keyboard-operable throughout.

## Why it's honest

- `lib/dynamics` is pure and runs in Node — no DOM, no clock, no network, no randomness anywhere. Same system, parameters, initial condition, integrator, and step produce a byte-identical trajectory, every time.
- The analytic test suite is the actual correctness guarantee: Lorenz's fixed points, its exact volume-contraction rate, convergence order for all three integrators, and published Lyapunov exponent / Kaplan–Yorke dimension, all asserted against known values — not eyeballed.
- Every numeric claim on screen is computed where you can see it, from a rule stated next to it — not a black box, not a tooltip you have to go find.

## Stack

Next.js 14 (App Router, static export) · TypeScript (strict) · Tailwind CSS · Canvas 2D · Vitest · pnpm

No integration library, no math library, no charting library. Writing RK4 is twenty lines and is the point.

## Running it

```bash
pnpm install
pnpm dev              # http://localhost:3000
```

```bash
pnpm build             # static export to ./out
pnpm preview            # serve ./out under the production basePath
pnpm test:run           # full suite, once
pnpm test:analytic       # fixed points, volume contraction, boundedness — gates the build
pnpm test:order          # convergence order for Euler, RK2, RK4 — gates the build
pnpm typecheck
pnpm lint
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages automatically via Actions — the analytic and convergence-order suites gate every deploy, so a wrong integrator never ships.

---

<p align="center">
  <sub>Designed & built by <a href="https://andifathulms.github.io/en/">Andi Fathul Mukminin</a></sub>
</p>
