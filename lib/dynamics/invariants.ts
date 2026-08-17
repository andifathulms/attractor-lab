/**
 * Analytic properties of each system, known independent of any integrator.
 * These are the ground truth the analytic test suite checks integrators against —
 * write once, per system, from the published source.
 */

export type FixedPoint = {
  readonly point: readonly [number, number, number];
  readonly stableFor: (params: Record<string, number>) => boolean;
};

export type SystemInvariants = {
  readonly id: string;
  /** Fixed points as functions of parameters, since e.g. Lorenz's depend on rho, beta. */
  readonly fixedPoints: (params: Record<string, number>) => readonly FixedPoint[];
  /** Divergence of the vector field, ∇·F. Constant for Lorenz; may depend on state otherwise. */
  readonly divergence: (
    params: Record<string, number>,
    state: Float64Array
  ) => number;
  /** A generous bounding box classic-parameter trajectories must never leave. */
  readonly boundingBox: {
    readonly min: readonly [number, number, number];
    readonly max: readonly [number, number, number];
  };
  /** Published values for this system's classic parameters, for the constants suite. */
  readonly published: {
    readonly lyapunovMax?: number;
    readonly kaplanYorkeDimension?: number;
  };
};

// Lorenz (1963), "Deterministic Nonperiodic Flow", J. Atmos. Sci. 20.
// Classic parameters: sigma = 10, rho = 28, beta = 8/3.
const lorenz: SystemInvariants = {
  id: 'lorenz',
  fixedPoints: (params) => {
    const { rho, beta } = params;
    const origin: FixedPoint = {
      point: [0, 0, 0],
      // Origin is stable iff rho < 1 (the only fixed point in that regime).
      stableFor: (p) => p.rho < 1,
    };
    if (rho === undefined || beta === undefined || rho < 1) {
      return [origin];
    }
    const w = Math.sqrt(beta * (rho - 1));
    const cPlus: FixedPoint = {
      point: [w, w, rho - 1],
      // C+/C- are stable for 1 < rho < sigma(sigma+beta+3)/(sigma-beta-1).
      stableFor: (p) => {
        const { sigma, rho: r, beta: b } = p;
        if (sigma === undefined || r === undefined || b === undefined) return false;
        if (sigma <= b + 1) return false;
        const rhoCrit = (sigma * (sigma + b + 3)) / (sigma - b - 1);
        return r > 1 && r < rhoCrit;
      },
    };
    const cMinus: FixedPoint = {
      point: [-w, -w, rho - 1],
      stableFor: cPlus.stableFor,
    };
    return [origin, cPlus, cMinus];
  },
  // ∇·F = ∂(σ(y−x))/∂x + ∂(x(ρ−z)−y)/∂y + ∂(xy−βz)/∂z = −σ − 1 − β. Constant everywhere.
  divergence: (params) => {
    const { sigma, beta } = params;
    if (sigma === undefined || beta === undefined) {
      throw new Error('lorenz.divergence requires sigma and beta');
    }
    return -(sigma + 1 + beta);
  },
  // Classic trajectory stays within roughly [-20, 20] x [-30, 30] x [0, 50].
  boundingBox: {
    min: [-30, -30, -10],
    max: [30, 30, 60],
  },
  published: {
    // Viswanath (2004) and standard references, sigma=10, rho=28, beta=8/3.
    lyapunovMax: 0.906,
    kaplanYorkeDimension: 2.06,
  },
};

// Rössler (1976), "An Equation for Continuous Chaos", Phys. Lett. A 57.
// Classic parameters: a = b = 0.2, c = 5.7.
const rossler: SystemInvariants = {
  id: 'rossler',
  fixedPoints: (params) => {
    const { a, b, c } = params;
    if (a === undefined || b === undefined || c === undefined) return [];
    // Solve x = -y - z, y = a x, z = b + z(x - c) for x: a x^2 - a c x + b = 0.
    const disc = a * a * c * c - 4 * a * b;
    if (disc < 0) return [];
    const sqrtDisc = Math.sqrt(disc);
    const points: FixedPoint[] = [];
    for (const sign of [1, -1] as const) {
      const x = (a * c + sign * sqrtDisc) / (2 * a);
      const y = -x / a;
      const z = -y;
      points.push({ point: [x, y, z], stableFor: () => false });
    }
    return points;
  },
  // ∇·F = ∂(−y−z)/∂x + ∂(x+ay)/∂y + ∂(b+z(x−c))/∂z = 0 + a + (x − c). State-dependent.
  divergence: (params, state) => {
    const { a, c } = params;
    if (a === undefined || c === undefined) {
      throw new Error('rossler.divergence requires a and c');
    }
    const x = state[0] ?? 0;
    return a + (x - c);
  },
  boundingBox: {
    min: [-20, -25, -1],
    max: [25, 15, 35],
  },
  published: {
    lyapunovMax: 0.0714,
  },
};

// Thomas (1999), "Deterministic Chaos Seen in Terms of Feedback Circuits",
// Int. J. Bifurcation Chaos 9. Cyclically symmetric.
// Classic parameter: b = 0.208186.
const thomas: SystemInvariants = {
  id: 'thomas',
  fixedPoints: (params) => {
    const { b } = params;
    if (b === undefined) return [];
    // Origin is always a fixed point: sin(0) - b*0 = 0 for all coordinates.
    return [{ point: [0, 0, 0], stableFor: () => b > 0 }];
  },
  // ẋ = sin(y) − bx, ẏ = sin(z) − by, ż = sin(x) − bz → ∇·F = −3b. Constant.
  divergence: (params) => {
    const { b } = params;
    if (b === undefined) throw new Error('thomas.divergence requires b');
    return -3 * b;
  },
  boundingBox: {
    min: [-6, -6, -6],
    max: [6, 6, 6],
  },
  published: {
    lyapunovMax: 0.0349,
  },
};

// Halvorsen (unpublished, popularised via Julien Sprott / Paul Bourke), cyclically symmetric.
// Classic parameter: a = 1.4.
const halvorsen: SystemInvariants = {
  id: 'halvorsen',
  fixedPoints: (params) => {
    const { a } = params;
    if (a === undefined) return [];
    // Origin: -a*0 - 4*0 - 4*0 = 0 for all three coordinates. Always a fixed point.
    return [{ point: [0, 0, 0], stableFor: () => false }];
  },
  // ẋ = −ax − 4y − 4z − y², ẏ = −ay − 4z − 4x − z², ż = −az − 4x − 4y − x²
  // ∇·F = −a − a − a = −3a. Constant.
  divergence: (params) => {
    const { a } = params;
    if (a === undefined) throw new Error('halvorsen.divergence requires a');
    return -3 * a;
  },
  boundingBox: {
    min: [-15, -15, -15],
    max: [15, 15, 15],
  },
  published: {
    lyapunovMax: 0.79,
  },
};

// Aizawa (Aizawa & Uezu, 1982-style construction; popularised by Julien Sprott).
// Classic parameters: a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1.
const aizawa: SystemInvariants = {
  id: 'aizawa',
  // No closed-form fixed point in general parameter ranges worth asserting here;
  // the origin is not a fixed point for this system (z-term has a constant f*z^3 absent -x*x*x offset).
  fixedPoints: () => [],
  // ẋ = (z−b)x − dy, ẏ = dx + (z−b)y, ż = c + az − z³/3 − (x²+y²)(1+ez) + f z x³
  // ∂ẋ/∂x = z − b, ∂ẏ/∂y = z − b, ∂ż/∂z = a − z² − e(x²+y²) + f x³. State-dependent; no constant divergence.
  divergence: (params, state) => {
    const { a, b, e, f } = params;
    if (a === undefined || b === undefined || e === undefined || f === undefined) {
      throw new Error('aizawa.divergence requires a, b, e, f');
    }
    const x = state[0] ?? 0;
    const y = state[1] ?? 0;
    const z = state[2] ?? 0;
    return (z - b) + (z - b) + (a - z * z - e * (x * x + y * y) + f * x * x * x);
  },
  boundingBox: {
    min: [-2, -2, -1],
    max: [2, 2, 2],
  },
  published: {},
};

export const invariants: Record<string, SystemInvariants> = {
  lorenz,
  rossler,
  thomas,
  halvorsen,
  aizawa,
};
