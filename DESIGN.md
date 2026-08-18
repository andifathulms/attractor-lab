# DESIGN — Attractor Lab

Authoritative for every visual decision in this repository. `PRD.md` says what the product is; this says what it looks like and why. When code and this document disagree, this document is right.

---

## 1. The house layer

These projects should read as siblings — recognisably from the same hand — without looking like one template recoloured. **What is shared is rhythm and rigour; what is per-app is identity.**

**Shared across every project:**

```
space    4 8 12 16 24 32 48 64 96 128     4px base
motion   fast 120ms · state 240ms · orchestrated 500–600ms · ease cubic-bezier(0.2,0,0,1)
edge     hairline 0.5px · radius 2px only
```

- **One orchestrated moment per app.** Everything else is state change. Never two competing animations.
- **The legend contract.** Every view states what it is showing and what it cannot show. Non-negotiable.
- **The citation line.** Small, monospace, always present where a claim is made.
- **Type floor 16px.** Tabular figures on anything that updates.
- **Zero runtime network. Offline after first load. Self-hosted fonts.**
- **Reduced motion gets a complete alternative**, never a degraded one.
- **No component library.**

**Per-app:** colour, typeface, layout, and the instrument.

## 2. This app's identity

**On screen: a long-exposure nocturne.** Trajectories as fine light trails accumulating on a dark field, density building where the orbit returns most often — the way star trails build on a long exposure.

**Deliberately not an oscilloscope.** Green phosphor on black is the default look for this subject and it is a cliché; it also implies an instrument reading a signal, when what is happening is a computation accumulating.

**On paper: a pen plotter.** Single-weight ink lines on white. Strange attractors are a canonical plotter subject and the medium suits the filigree.

## 3. Screen and paper want opposite things

The screen image is **additive density** — thousands of overlapping strokes brightening the regions the orbit favours. That needs darkness and opacity.

A plotter has **one pen, one weight, no opacity.** Density there comes from line proximity, not blending.

**So they are two renderings of the same trajectory, not one exported as the other.** Screenshotting the canvas produces a black rectangle no plotter can draw. `PRD.md` §4.7 treats the SVG as a first-class output for that reason.

## 4. Colour

### Ground

```
--night     #0D0F14     deep blue-black
--graticule #1E2430     axes and bounding box, barely present
```

Not pure black. A long exposure of a night sky is blue-black with lift, and pure black flattens the accumulation.

### The trajectories

```
--trail-a   #F0C05A     warm light
--trail-b   #5FB0D9     cool light
--bloom     #FFF8E8     where accumulation saturates
```

**Two colours because the divergence pair is the headline.** Warm and cool are distinguishable at low opacity, at small size, and under common colour-vision deficiencies — which matters, because two hairline traces overlapping is the exact case where hue confusion would destroy the point.

Single-trajectory views use `--trail-a` only. `--bloom` is not a colour you assign; it is what additive blending reaches on its own.

### Structure

```
--section   #A78BC4     violet — the Poincaré plane and its intersections
--readout   #B8C2CE     numeric text
--caption   #8B95A3     field labels, nav links — secondary text, AA on --night and --graticule
--rule      #2A313D     hairlines only — fails AA as text, never set as a text colour
```

Violet for the section because it is a *different kind of object* — a construction placed into the space rather than part of the trajectory.

### Not in the palette

**No phosphor green.** §2.
**No rainbow-by-velocity.** Hue carries trajectory identity; overloading it with speed destroys both signals. Speed, where shown, is trail length.
**No red.** Nothing here is an error.

## 5. Type

```
Crimson Pro       display, headings, the equations, controls, labels, prose
JetBrains Mono    parameters, Lyapunov values, step sizes, coordinates
```

**Two families.** Crimson Pro covers both display and UI/prose text — one text serif doing double duty rather than pairing it with a separate grotesque, which also keeps the "hold a paper beside the code" reading this project asks for. JetBrains Mono is kept apart because its role is functional, not decorative: tabular figures for values that update continuously and must not jitter.

**Crimson Pro is a functional choice for the equations specifically.** The equations are content, and they need real italics for variables — `σ`, `ρ`, `β`, `ẋ` set in a face with a proper italic, not a slanted roman.

**Equations are hand-set inline SVG, not KaTeX.** There are roughly twenty across all systems. Hand-setting them costs a day and avoids a 250 KB dependency with its own font payload — which would be most of the bundle budget for something used on seven pages.

```
14  16  18  22  28  36  46          1.25 ratio
```

**Dark-mode weight correction:** body 300–400, headings 500 maximum, 0.01em tracking below 16px. Text on dark reads heavier than the same text on light.

Tabular figures on every readout — they update continuously and must not jitter.

## 6. Layout

**Canvas-dominant with a floating instrument panel.** This is not a map with an editorial column; it is an instrument with controls, and the structure should say so.

- **Canvas** full-bleed, the trajectory the only bright thing on the page.
- **Parameter panel** floating upper right — system selector, parameters, integrator, step size. Collapsible to a single edge tab, because at some point you want only the picture.
- **Readout strip** along the bottom — integrator, step, elapsed system time, Lyapunov estimate, dimension. Always visible, never collapsible. **A render without its numerics is exactly what `PRD.md` §1.2 argues against.**
- **Divergence plot** docks as a narrow band above the readout strip when the pair is active — log separation against time, sharing the strip's x-alignment.

**Mobile:** canvas at 60vh, panel as a bottom sheet, readout strip fixed beneath the canvas.

## 7. Motion

**The orchestrated moment is the accumulation** — the trajectory drawing itself into the buffer, density building over seconds. That is the product, and it is the only thing that animates on its own.

**No automatic rotation.** Ever. Auto-orbit is the screensaver tell, it fights reading the structure, and it makes the image impossible to study. **Rotation is drag-only.**

Everything else is state change: a parameter moves, the buffer clears and re-accumulates; the section plane repositions; the panel collapses.

```
--dur-fast    120ms
--dur-state   240ms
--dur-clear   500ms     buffer fade before re-accumulation
```

**Reduced motion:** the trajectory renders complete and static, at full point count, immediately. The divergence pair renders both paths complete with the separation plot filled. Nothing is lost except the drawing — which is why the fallback is a legitimate alternative rather than a stripped one.

## 8. Accessibility

A visual-first subject makes this harder and more necessary.

- **Every visual claim has a numeric equivalent** in the readout strip. Divergence is a number as well as a picture.
- **Equations are real text in the accessible tree**, with proper labels — not images of equations.
- **Parameters are keyboard-operable** with arrow-key stepping and typed entry. Focus visible at 3px.
- **Colour is never the only channel:** trajectory A and B are labelled in the readout strip and in the divergence plot legend.
- Type floor 16px; AA contrast on `--night` for all readouts.
- Reduced motion has a complete path. §7.

## 9. Export

**Screen capture is not offered.** It would produce something misleading — a raster of a dark canvas that cannot be printed or plotted.

**SVG export is the output**, generated from the trajectory data rather than from the canvas: single stroke weight, no fill, no opacity, path-simplified to a plotter-sane node count, sized in millimetres with a stated paper size. Asserted by test.

The export carries a small caption block — system, parameters, integrator, step. **A printed attractor should state which approximation it is**, for the same reason the screen does.

## 10. What not to do

- No automatic rotation, no ambient motion, no screensaver mode.
- No phosphor green, no neon.
- No rainbow-by-velocity or any hue encoding beyond trajectory identity.
- No render without its integrator and step size displayed.
- No raster screenshot export.
- No fills or opacity in exported SVG.
- No KaTeX or equation images — hand-set SVG, in the accessible tree.
- No light mode on the canvas; no dark mode on the plotter output.
- No component library.
