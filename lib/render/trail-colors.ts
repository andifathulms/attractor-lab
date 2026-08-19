// Canvas 2D fillStyle/strokeStyle cannot read Tailwind classes or CSS
// variables, so every rgba trail colour used by a canvas draw call lives
// here, keyed by role, rather than as a module-level constant per
// component. Values are the DESIGN.md §4 tokens at each role's alpha:
//   trail-a   #F0C05A -> rgb(240, 192, 90)
//   trail-b   #5FB0D9 -> rgb(95, 176, 217)
//   section   #A78BC4 -> rgb(167, 139, 196)
// rk4 keeps trail-a because RK4 is the reference every render implicitly
// trusts elsewhere in this app. euler is the one that visibly departs
// first, so it gets the cool trail-b. rk2 — a different kind of
// construction from either endpoint of the comparison — takes the
// section violet.
//
// sectionTrajectory renders faint — it's context for the plane, not the
// subject. section is violet: "a different kind of object... a
// construction placed into the space rather than part of the trajectory."
// DESIGN.md §4.
export const TRAIL_COLORS = {
  trailA: 'rgba(240, 192, 90, 0.14)',
  trailB: 'rgba(95, 176, 217, 0.14)',
  euler: 'rgba(95, 176, 217, 0.14)',
  rk2: 'rgba(167, 139, 196, 0.14)',
  rk4: 'rgba(240, 192, 90, 0.14)',
  section: 'rgba(167, 139, 196, 0.9)',
  sectionTrajectory: 'rgba(240, 192, 90, 0.05)',
  mapTrail: 'rgba(240, 192, 90, 0.08)',
} as const;
