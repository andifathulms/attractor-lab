# PRD — Attractor Lab

**A system with no randomness in it, that cannot be predicted. Watch two identical trajectories, started a hair apart, become strangers.**

| | |
|---|---|
| **Status** | Draft — pre-implementation |
| **Owner** | Andi Fathul Mukminin Salahuddin |
| **Type** | Personal portfolio project, open source, educational |
| **Deployment** | GitHub Pages (static export, no server, no runtime network) |
| **Language** | English UI. Mathematical notation universal. |
| **Data dependency** | **None.** Pure computation. |
| **Design** | See `DESIGN.md`. Authoritative for every visual decision. |

*Name: explanatory. "Lab" because the point is experimenting, not watching. Alternative: **Strange Attractors**.*

---

## 1. Why not another screensaver

There are a thousand attractor renderers. Most spin a Lorenz butterfly and stop there. To be worth building, this needs an argument, and it has two.

### 1.1 Deterministic does not mean predictable

The Lorenz system contains no randomness. Given exact initial conditions it evolves exactly. And it is still unpredictable, because two trajectories separated by an arbitrarily small amount diverge exponentially.

**That is the headline feature and it should be the first thing a visitor sees**: two trajectories, differing in the twelfth decimal place, tracking together — then wobbling — then uncorrelated, while a Lyapunov readout quantifies the separation.

Most people believe chaotic means random. It does not, and this shows the difference directly.

### 1.2 The integrator's error is the subject

A chaotic system amplifies floating-point error exponentially. **So the rendered trajectory provably diverges from the true one, and quickly.** Halve the step size and you get a visibly different path after a few dozen time units.

Every attractor renderer has this property. None of them mention it. Here it becomes a feature: run RK4 against Euler on identical initial conditions and watch them separate — a demonstration of the phenomenon carried out by the tool's own numerics.

**This is the honesty layer and the pedagogy in one move.** A picture of an attractor is a picture of *one numerical approximation* of an attractor, and saying so is more interesting than pretending otherwise.

## 2. Systems in scope

**Continuous flows (ODE):**
- **Lorenz** — `ẋ = σ(y−x)`, `ẏ = x(ρ−z)−y`, `ż = xy−βz`. Classic σ=10, ρ=28, β=8/3.
- **Rössler** — `ẋ = −y−z`, `ẏ = x+ay`, `ż = b+z(x−c)`. Classic a=b=0.2, c=5.7. One nonlinearity, simpler to reason about.
- **Thomas**, **Halvorsen**, **Aizawa** — visually distinct, cyclically symmetric or otherwise structurally different.

**Iterated maps (2D):**
- **Clifford**, **De Jong** — dense filigree, no integration involved, and a useful contrast: these have no step-size question at all.

Six to seven systems. Enough for variety, few enough that each is properly documented with its equations and its published constants.

## 3. Non-goals

- **No screensaver mode, no ambient auto-rotation.** See `DESIGN.md` §7. Rotation is user-driven.
- **No arbitrary equation entry in v1.** A parser plus safety plus unbounded blow-up handling is a separate project; curated systems with exposed parameters cover the ground.
- **No claim of true trajectories.** §1.2. Every render is one approximation and is labelled with its integrator and step size.
- **No 4D or higher systems**, no delay differential equations, no PDEs.
- **No accounts, no server, no runtime network.**
- **No ML.**

## 4. Features

### 4.1 The canvas
The trajectory accumulating over a dark field, drawn as fine light trails with additive density. Orbit by drag, zoom by scroll. Long-exposure photography, not an oscilloscope. `DESIGN.md` §4.

### 4.2 The divergence pair — the headline
Two trajectories from initial conditions differing by a chosen epsilon, in two colours. A separation readout tracks `|Δ|` on a log axis alongside, with the **largest Lyapunov exponent** estimated live. Epsilon is a control: set it to 10⁻¹² and the divergence still arrives, just later.

Ships at M2. It is the reason for the project.

### 4.3 Integrator comparison
The same system, same initial condition, integrated by Euler, RK2 and RK4 at selectable step sizes, rendered together. Watch them agree, then part.

Includes the **convergence check**: halve the step, and RK4's error should fall by roughly sixteen. That relationship is verifiable on screen and asserted in the test suite (§6).

### 4.4 Poincaré section
Slice the attractor with a plane and plot the intersections. A three-dimensional tangle becomes a nearly one-dimensional map with visible structure — the insight that made chaos tractable, and something almost no visualisation shows.

### 4.5 Parameter sweep and bifurcation
Sweep a parameter and watch the attractor be born: fixed point → limit cycle → period doubling → chaos. Paired with a bifurcation diagram built from the sweep, so the picture and the phenomenon are the same object.

### 4.6 Readouts
Integrator, step size, elapsed system time, estimated largest Lyapunov exponent, and box-counting dimension. Always visible, monospace, tabular.

### 4.7 Plotter export
SVG output suited to an actual pen plotter — single stroke weight, no fills, no opacity, path-simplified, physical dimensions in millimetres. **Screen and paper want opposite renderings** (`DESIGN.md` §4), and this is a first-class deliverable, not a screenshot button. People want these as prints, and every printed one carries the project.

### 4.8 System reference
Per system: equations, parameter meanings, classic values, discoverer and year, and what makes it structurally different from its neighbours.

## 5. Architecture

Static Next.js 14 App Router export. No backend, no runtime network.

```
system + parameters + initial condition + integrator + step
  → integrate (pure)  → trajectory points
  → project + accumulate → canvas
  → section | bifurcation | readouts | plotter SVG
```

**`lib/dynamics` is pure and runs in Node.** Systems as pure derivative functions; integrators as pure step functions. No DOM, no React, no clock, no network. This is what makes §6 possible.

**Integration is deterministic.** Same system, parameters, initial condition, integrator and step produce a byte-identical trajectory. No unseeded randomness anywhere — seeding for the divergence pair's epsilon is explicit and reproducible.

**Rendering accumulates rather than redraws.** Points blend additively into a persistent buffer; the buffer clears only on parameter change. Density is the image.

**Integration runs off the main thread** in a worker, streaming point batches, so long runs never block interaction.

**No integration library.** Writing RK4 is twenty lines and is the point.

## 6. Testing — the part that makes this more than a picture

The absence of data is replaced by an abundance of **analytically known truth**, which is a stronger position than most of these projects have.

**Fixed points.** Lorenz's fixed points are exact: the origin, and `(±√(β(ρ−1)), ±√(β(ρ−1)), ρ−1)`. For ρ below 1 the origin is stable and the integrator must converge to it. Asserted.

**Volume contraction.** The Lorenz divergence is constant: `∇·F = −(σ+1+β)`. Phase-space volume must contract at exactly `e^{−(σ+1+β)t}`. Integrate a small ensemble and assert the contraction rate against the analytic value. **This is an exact property of the system and a direct check on the integrator.**

**Convergence order.** Halve the step; RK4's global error must fall by approximately 2⁴, RK2's by 2², Euler's by 2. Asserted across all three — a classic and unambiguous integrator test.

**Published constants.** Lorenz's largest Lyapunov exponent (≈ 0.906) and Kaplan–Yorke dimension (≈ 2.06) are published; the estimators must reproduce them within tolerance.

**Boundedness.** Classic-parameter trajectories stay inside a known bounding region indefinitely. A trajectory escaping is a bug, not chaos.

**Determinism.** Identical inputs produce byte-identical trajectories.

**Plotter output.** Exported SVG asserted to contain no fills, no opacity, a single stroke weight, and physical dimensions — a plotter cannot render any of those things.

## 7. Milestones

| | | |
|---|---|---|
| **M0** | The engine | Scaffold; systems as derivative functions; Euler, RK2, RK4; analytic test suite green. **No UI.** |
| **M1** | The canvas | Accumulating render, orbit and zoom, Lorenz and Rössler, readouts, performance benchmark. |
| **M2** | Divergence | The pair, epsilon control, separation plot, live Lyapunov estimate. **Ship publicly here — this is the argument.** |
| **M3** | Integrator comparison | Euler/RK2/RK4 side by side, step control, convergence demonstration. |
| **M4** | Structure | Poincaré section, parameter sweep, bifurcation diagram. |
| **M5** | Breadth | Remaining systems, 2D maps, system reference pages. |
| **M6** | Paper | Plotter SVG export, print sizing, sharing. |

M0 has no interface because a wrong integrator produces a picture that looks entirely convincing.

## 8. Success criteria

- Volume contraction matches the analytic rate for Lorenz.
- Convergence order verified for all three integrators.
- Lyapunov exponent and box dimension reproduce published values within tolerance.
- Trajectories remain bounded under classic parameters.
- Identical inputs produce byte-identical trajectories.
- Every render displays its integrator and step size — no unlabelled picture anywhere.
- Exported SVG opens cleanly in plotter software with no fills or opacity.
- Divergence is visible within one interaction of arriving.
- Sustained frame rate on a mid-range phone at the stated point budget.
- Zero network requests after first load. JS ≤ 200 KB gzipped.

## 9. Deployment

`output: 'export'`, `basePath` matching the repository name, `.nojekyll` in the output root. Fonts self-hosted. Verify under the production `basePath` with `pnpm preview` before pushing.

## 10. Risks

| Risk | Mitigation |
|---|---|
| **Reads as a screensaver.** | The divergence pair ships at M2, before breadth. No auto-rotation. Every render labelled with its numerics. |
| **A wrong integrator produces a convincing picture.** | Analytic suite at M0 — fixed points, volume contraction, convergence order — before any rendering exists. |
| **Presenting one approximation as the attractor.** | Integrator and step always displayed; §1.2 is a feature, not a caveat. |
| **Performance on mobile.** | Point budget, worker integration, benchmark at M1 before UI polish. |
| **Scope creep into an equation parser.** | §3 is binding. Curated systems with exposed parameters. |
| **Plotter export that no plotter can use.** | Asserted by test: no fills, no opacity, single stroke weight, physical units. |
