# CLAUDE.md — Attractor Lab

Strange attractor explorer. Hand-written integrators, a divergence demonstration, integrator comparison, and plotter-ready export. Static site, GitHub Pages, no backend, no runtime network, no data dependency.

Read `PRD.md` before starting any task, and **`DESIGN.md` before writing any UI** — it opens with the shared house layer used across these projects.

**Four things shape everything:**

1. **A wrong integrator produces a convincing picture.** There is no data to contradict it and no reviewer to catch it. Analytic tests — fixed points, volume contraction, convergence order — land at M0, before any rendering exists.
2. **The integrator's error is the subject, not a defect.** Every render displays its integrator and step size. `PRD.md` §1.2.
3. **The divergence pair is the argument.** Two trajectories a hair apart becoming strangers. It ships at M2, before breadth of systems.
4. **No automatic rotation, ever.** It is the screensaver tell, it fights reading the structure, and it makes the image impossible to study.

---

## Stack

- Next.js 14, App Router, `output: 'export'` — static only
- TypeScript, `strict: true`
- Tailwind CSS, tokens from `DESIGN.md`
- Canvas 2D with additive blending; WebGL only if the point budget demands it
- Vitest
- pnpm
- **No integration library, no math library, no charting library, no KaTeX.** RK4 is twenty lines and is the point.
- Fonts via `next/font`, self-hosted.

## Commands

```bash
pnpm dev
pnpm build                  # static export to ./out
pnpm preview                # serve ./out under the production basePath
pnpm test                   # vitest watch
pnpm test:run               # vitest once — before every commit
pnpm test:analytic          # fixed points, volume contraction, boundedness
pnpm test:order             # convergence order for Euler, RK2, RK4
pnpm test:constants         # Lyapunov exponent, box dimension vs published values
pnpm test:export            # plotter SVG constraints
pnpm bench:points           # point budget + frame rate on a mid-range profile
pnpm typecheck
pnpm lint
```

`pnpm test:analytic` and `pnpm test:order` gate the build and CI.

## Layout

```
app/
  [locale]/                 # id (default), en
    jelajah/                # the canvas + panel + readouts
    sistem/[slug]/          # system reference — equations, constants, history
    banding/                # integrator comparison
    irisan/                 # Poincaré section
    cabang/                 # parameter sweep + bifurcation
components/
  canvas/                   # accumulating render buffer, orbit, zoom
  panel/                    # system, parameters, integrator, step
  readout/                  # the always-visible numeric strip
  divergence/               # the pair + log separation plot
  section/                  # Poincaré plane and intersections
  equation/                 # hand-set inline SVG, accessible text
lib/
  dynamics/                 # THE CORE. Pure. Runs in Node.
    systems/                # lorenz.ts, rossler.ts, thomas.ts, … derivative functions
    maps/                   # clifford.ts, dejong.ts — iterated, no integration
    integrate/              # euler.ts, rk2.ts, rk4.ts — pure step functions
    lyapunov.ts             # largest exponent estimator
    dimension.ts            # box-counting
    invariants.ts           # analytic properties per system, for tests and display
  render/                   # projection, accumulation buffer
  export/                   # trajectory → plotter SVG
workers/
  integrate.worker.ts
tests/
  analytic/  order/  constants/  export/
```

## Invariants

1. **`lib/dynamics` is pure and runs in Node.** Numbers in, numbers out. No DOM, no React, no clock, no network, no module-level mutable state. This is what makes the analytic suite possible and it is the project's only real correctness guarantee.

2. **Systems are derivative functions; integrators are step functions. They never know about each other.** `integrate(system, state, dt)` — adding a system must not require touching an integrator, and vice versa. A system with integration logic inside it is a design error.

3. **Integration is deterministic.** Same system, parameters, initial condition, integrator and step produce a byte-identical trajectory. **No unseeded randomness anywhere** — the divergence pair's epsilon is an explicit parameter, not a random perturbation.

4. **Every render displays its integrator and step size.** The readout strip is never collapsible and never optional. An unlabelled attractor image is exactly what this project argues against.

5. **No automatic rotation.** No auto-orbit, no idle animation, no screensaver mode, no "ambient" flag. Rotation is drag-only. `DESIGN.md` §7.

6. **The accumulation buffer clears only on parameter change.** Density is the image; clearing per frame would destroy it.

7. **Integration runs in a worker**, streaming point batches. The main thread never integrates.

8. **Hue carries trajectory identity only.** Never encode velocity, curvature, or time in hue. Speed, where shown, is trail length. `DESIGN.md` §4.

9. **Exported SVG contains no fills, no opacity, and one stroke weight**, is path-simplified, and carries physical dimensions in millimetres. Asserted by test — a plotter can render none of those things.

10. **No raster export.** Screen capture of a dark accumulation buffer is misleading and unprintable. `DESIGN.md` §9.

11. **Equations are hand-set inline SVG with accessible text**, never KaTeX and never images. A 250 KB dependency for twenty equations would be most of the bundle.

12. **Trajectories that escape the known bounding region are a bug**, not chaos. Assert boundedness under classic parameters rather than letting a blow-up render.

13. **Zero network requests at runtime.**

14. **Nothing is computed in a component.**

## Working style

- **Write `invariants.ts` before the integrators.** The analytic properties — Lorenz's fixed points, its constant divergence `−(σ+1+β)`, the bounding region — are what tell you the integrator is right. They come first.
- **M0 has no UI on purpose.** Do not start rendering until `test:analytic` and `test:order` are green.
- **When an analytic test fails, the integrator is wrong.** Not the tolerance, not the analytic value. Investigate in that order.
- **Never widen a tolerance to pass.** Convergence order and volume contraction are exact relationships; a failure means a real error.
- **Ship the divergence pair at M2, before adding systems.** Breadth without the argument makes this a screensaver.
- **Benchmark on a mid-range phone at M1**, before UI polish.
- **When adding a system, add its published constants too** — Lyapunov exponent and dimension where known — and assert them. A system without checkable constants is a system you cannot verify.
- **Don't touch `next.config.js`, the Actions workflow, or the analytic suite without saying so explicitly.**
- **Don't add an integration, math, or equation-rendering dependency.**
- **Never weaken a test to make something pass.**

## Conventions

- Named exports; defaults only where Next requires them.
- Discriminated unions for systems, integrators and results, keyed on `type`. Exhaustive `switch` with a `never` default — this is how adding an integrator surfaces every site that must handle it.
- No `any`. No non-null `!` in `lib/dynamics`.
- Follow the literature's notation in identifiers: `sigma`, `rho`, `beta` for Lorenz; `a`, `b`, `c` for Rössler; `dt` for step; `t` for system time. This is the one place terse names are correct — a reader should be able to hold a paper beside the code.
- State vectors as `Float64Array`, never objects. Precision matters here in a way it does not elsewhere: this system amplifies error by design.
- Comments cite the original paper and year for each system, and the source of any published constant.
- System ids stable and readable: `lorenz`, `rossler`, `thomas`, `halvorsen`, `aizawa`, `clifford`, `dejong`. They appear in URLs and export captions.
- Indonesian first in UI copy; mathematical notation universal.
- Tailwind tokens exactly as in `DESIGN.md` — `night`, `graticule`, `trail-a`, `trail-b`, `bloom`, `section`, `readout`, `rule`. Never raw hex in components.

## Testing rules

- `pnpm test:run` before every commit; `test:analytic` and `test:order` before any commit touching `lib/dynamics`.
- **Volume contraction** asserted against the analytic divergence for every system that has one — integrate a small ensemble and check the rate.
- **Fixed points** asserted: computed analytically, and the integrator must converge to them in the parameter ranges where they are stable.
- **Convergence order** asserted for all three integrators: halving the step reduces global error by ≈2, ≈4, ≈16 respectively.
- **Published constants** asserted within tolerance — Lorenz's largest Lyapunov exponent and Kaplan–Yorke dimension.
- **Boundedness** asserted under classic parameters over long runs.
- **Determinism** asserted on every trajectory.
- **Export** asserted: no fill attributes, no opacity attributes, single stroke weight, physical units present, node count under the plotter budget.
- `bench:points` asserted against the budget and frame rate.
- Bug fix → failing test first.

## Deployment

`main` builds and deploys via Actions; the analytic and order suites gate it. `basePath` must match the repository name; `.nojekyll` must exist in `out/`. Verify with `pnpm preview` before pushing.

## Framing

Every render states its integrator and step size, and the method page explains why: a chaotic system amplifies floating-point error exponentially, so any rendered trajectory is one numerical approximation rather than the true orbit. Each system cites its original paper. No OIKN or government branding anywhere.

## Current state

Built past M0. Six routes exist under `app/[locale]/`, each in both `id` and `en`: `jelajah` (single trajectory / divergence pair), `banding` (integrator comparison), `irisan` (Poincaré section), `cabang` (bifurcation diagram + parameter sweep), `sistem` (system reference index) and `sistem/[slug]` (per-system reference page). The root `app/page.tsx` redirects to `/id/jelajah`.

`lib/dynamics` is scaffolded and pure per invariant 1: `systems/` (Lorenz, Rössler, Thomas, Halvorsen, Aizawa), `maps/` (Clifford, De Jong), `integrate/` (Euler, RK2, RK4), plus `invariants.ts`, `lyapunov.ts`, `dimension.ts`, `convergence.ts`, `bifurcation.ts`, `section.ts`, `trajectory.ts`. Rendering exists on top of it: five canvas-owning components (`components/canvas/AttractorCanvas`, `components/divergence/DivergencePairCanvas`, `components/comparison/ComparisonCanvas`, `components/section/SectionCanvas`, `components/maps/MapPreview`) each stream from their own worker (`workers/integrate`, `divergence`, `compare`, `section` — `MapPreview` iterates synchronously, no worker, no step-size question) and draw additively via `lib/render/accumulate.ts`. Two more workers exist for off-canvas computation: `constants.worker.ts` (drives `VerifiedConstants`) and `verify.worker.ts` (drives `ControlPanel`'s verify button). Export (`lib/export/plotter.ts`, `simplify.ts`) and the analytic/order/constants/export/bench suites are in place and gating.

**Two known deviations from the rest of this document:**
- The Next config file is `next.config.mjs`, not `next.config.js` — the "Commands" and "Layout" sections above should be read with that in mind.
- The "Layout" tree above shows a single `components/panel/` and `components/readout/`. On disk these are per-route: `components/panel/ControlPanel.tsx` is `jelajah`-only, and each of `banding`, `irisan`, `cabang` has its own panel (`ComparisonPanel`, `SectionPanel`, `BifurcationPanel`) and its own readout strip (`ComparisonReadoutStrip`, `SectionReadoutStrip`, `BifurcationReadoutStrip`) alongside the shared `components/readout/ReadoutStrip.tsx` used by `jelajah`. `DESIGN-REWORK.md` §2 tracks unifying these; nothing has been merged yet.

`pnpm test:analytic` and `pnpm test:order` are green. Trail colours are centralised in `lib/render/trail-colors.ts`, keyed by role, with `tests/design/no-raw-trail-colors.test.ts` failing the build on any `rgba(`/`rgb(` literal reintroduced under `components/`. `banding` now has its own separation plot (`components/comparison/ComparisonSeparationPlot.tsx`, fed by `workers/compare.worker.ts`'s per-step `eulerVsRk4`/`rk2VsRk4` series) docked above its readout strip, same log-axis primitive (`lib/render/separation-plot.ts`) as `jelajah`'s divergence pair — curves told apart by dash pattern, never hue, per invariant 8. Clicking "check convergence" swaps that plot to a static before/after view — the same two curves at `dt` and `dt/2` (`lib/convergence-series.ts`, outside `lib/dynamics`) — so halving the step's effect on the error is a visible gap, not just the numeric rows `ComparisonPanel` still shows underneath. Next per `DESIGN-REWORK.md`'s build order: unify the four canvases (`AttractorCanvas`, `DivergencePairCanvas`, `ComparisonCanvas`, `SectionCanvas`) into one `TrajectoryCanvas`, then their readout strips and panels.
