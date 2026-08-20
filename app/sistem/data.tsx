import type { ReactNode } from 'react';
import { Sup, Up } from '@/components/equation/Equation';

export type EquationEntry = {
  readonly plain: string;
  readonly node: ReactNode;
};

export type ParamEntry = {
  readonly symbol: string;
  readonly meaning: string;
  readonly classicValue: string;
};

export type SystemReference = {
  readonly slug: string;
  readonly name: string;
  readonly kind: 'flow' | 'map';
  readonly equations: readonly EquationEntry[];
  readonly params: readonly ParamEntry[];
  readonly discoverer: string;
  readonly year: number;
  readonly citation: string;
  readonly distinctiveness: string;
};

export const systemReferences: readonly SystemReference[] = [
  {
    slug: 'lorenz',
    name: 'Lorenz',
    kind: 'flow',
    equations: [
      {
        plain: 'ẋ = σ(y − x)',
        node: (
          <>
            ẋ <Up> = σ(y − x)</Up>
          </>
        ),
      },
      {
        plain: 'ẏ = x(ρ − z) − y',
        node: (
          <>
            ẏ <Up> = x(ρ − z) − y</Up>
          </>
        ),
      },
      {
        plain: 'ż = xy − βz',
        node: (
          <>
            ż <Up> = xy − βz</Up>
          </>
        ),
      },
    ],
    params: [
      {
        symbol: 'σ',
        meaning: 'Prandtl ratio: the speed of momentum diffusion relative to heat',
        classicValue: '10',
      },
      {
        symbol: 'ρ',
        meaning: 'Rayleigh number: how strongly the system is driven away from equilibrium',
        classicValue: '28',
      },
      {
        symbol: 'β',
        meaning: 'geometric aspect ratio of the convection cell',
        classicValue: '8/3',
      },
    ],
    discoverer: 'Edward N. Lorenz',
    year: 1963,
    citation: 'Lorenz, E. N. (1963). Deterministic Nonperiodic Flow. J. Atmos. Sci. 20(2), 130–141.',
    distinctiveness:
      "A drastically simplified model of atmospheric convection, and the system that discovered deterministic chaos itself. Two symmetric non-trivial fixed points form the \"butterfly wings\" that became chaos theory's standard image.",
  },
  {
    slug: 'rossler',
    name: 'Rössler',
    kind: 'flow',
    equations: [
      {
        plain: 'ẋ = −y − z',
        node: (
          <>
            ẋ <Up> = −y − z</Up>
          </>
        ),
      },
      {
        plain: 'ẏ = x + ay',
        node: (
          <>
            ẏ <Up> = x + ay</Up>
          </>
        ),
      },
      {
        plain: 'ż = b + z(x − c)',
        node: (
          <>
            ż <Up> = b + z(x − c)</Up>
          </>
        ),
      },
    ],
    params: [
      { symbol: 'a', meaning: 'feedback strength of the x–y loop', classicValue: '0.2' },
      { symbol: 'b', meaning: 'baseline push on z', classicValue: '0.2' },
      { symbol: 'c', meaning: 'threshold that triggers the z spike', classicValue: '5.7' },
    ],
    discoverer: 'Otto E. Rössler',
    year: 1976,
    citation: 'Rössler, O. E. (1976). An Equation for Continuous Chaos. Phys. Lett. A 57(5), 397–398.',
    distinctiveness:
      "Designed after Lorenz, deliberately built with only one nonlinear term (xz in the ż equation): the simplest chaotic attractor that can be written down, with a single-band structure that's easier to trace than Lorenz's double wing.",
  },
  {
    slug: 'thomas',
    name: 'Thomas',
    kind: 'flow',
    equations: [
      {
        plain: 'ẋ = sin(y) − bx',
        node: (
          <>
            ẋ <Up> = sin(y) − bx</Up>
          </>
        ),
      },
      {
        plain: 'ẏ = sin(z) − by',
        node: (
          <>
            ẏ <Up> = sin(z) − by</Up>
          </>
        ),
      },
      {
        plain: 'ż = sin(x) − bz',
        node: (
          <>
            ż <Up> = sin(x) − bz</Up>
          </>
        ),
      },
    ],
    params: [
      {
        symbol: 'b',
        meaning: 'damping: the larger it is, the faster the system settles to a fixed point',
        classicValue: '0.208186',
      },
    ],
    discoverer: 'René Thomas',
    year: 1999,
    citation:
      'Thomas, R. (1999). Deterministic Chaos Seen in Terms of Feedback Circuits. Int. J. Bifurcation Chaos 9(10), 1889–1905.',
    distinctiveness:
      'Perfect cyclic symmetry: swapping x→y→z→x leaves the equations unchanged. Built from sines rather than products of terms: a feedback-circuit model with biological roots, not a fluid flow.',
  },
  {
    slug: 'halvorsen',
    name: 'Halvorsen',
    kind: 'flow',
    equations: [
      {
        plain: 'ẋ = −ax − 4y − 4z − y²',
        node: (
          <>
            ẋ <Up> = −ax − 4y − 4z − y</Up>
            <Sup>2</Sup>
          </>
        ),
      },
      {
        plain: 'ẏ = −ay − 4z − 4x − z²',
        node: (
          <>
            ẏ <Up> = −ay − 4z − 4x − z</Up>
            <Sup>2</Sup>
          </>
        ),
      },
      {
        plain: 'ż = −az − 4x − 4y − x²',
        node: (
          <>
            ż <Up> = −az − 4x − 4y − x</Up>
            <Sup>2</Sup>
          </>
        ),
      },
    ],
    params: [{ symbol: 'a', meaning: 'cyclic damping', classicValue: '1.4' }],
    discoverer: 'William Halvorsen (via Julien C. Sprott and Paul Bourke)',
    year: 2006,
    citation: "Popularised through Julien C. Sprott and Paul Bourke's attractor catalogues, mid-2000s.",
    distinctiveness:
      'Cyclic symmetry like Thomas, but from cross-quadratic feedback rather than trigonometry, producing a much denser, more compact lobed twist.',
  },
  {
    slug: 'aizawa',
    name: 'Aizawa',
    kind: 'flow',
    equations: [
      {
        plain: 'ẋ = (z − b)x − dy',
        node: (
          <>
            ẋ <Up> = (z − b)x − dy</Up>
          </>
        ),
      },
      {
        plain: 'ẏ = dx + (z − b)y',
        node: (
          <>
            ẏ <Up> = dx + (z − b)y</Up>
          </>
        ),
      },
      {
        plain: 'ż = c + az − z³/3 − (x² + y²)(1 + ez) + fzx³',
        node: (
          <>
            ż <Up> = c + az − z</Up>
            <Sup>3</Sup>
            <Up>/3 − (x</Up>
            <Sup>2</Sup>
            <Up> + y</Up>
            <Sup>2</Sup>
            <Up>)(1 + ez) + fzx</Up>
            <Sup>3</Sup>
          </>
        ),
      },
    ],
    params: [
      { symbol: 'a', meaning: 'vertical expansion', classicValue: '0.95' },
      { symbol: 'b', meaning: 'twist-threshold offset', classicValue: '0.7' },
      { symbol: 'c', meaning: 'baseline push on z', classicValue: '0.6' },
      { symbol: 'd', meaning: 'x–y rotation speed', classicValue: '3.5' },
      { symbol: 'e', meaning: 'damping–height coupling', classicValue: '0.25' },
      { symbol: 'f', meaning: 'third-order cubic coupling', classicValue: '0.1' },
    ],
    discoverer: "Aizawa (after Aizawa & Uezu's 1982 chaotic-circuit work), via Julien C. Sprott",
    year: 1982,
    citation:
      "Popularised through Julien C. Sprott's attractor catalogue, referencing Aizawa & Uezu's chaotic-circuit work (1982).",
    distinctiveness:
      "The most intricate equations among the continuous systems in this collection (six parameters, one cubic term), producing a layered, shell-like form far removed from Lorenz's butterfly wings.",
  },
  {
    slug: 'clifford',
    name: 'Clifford',
    kind: 'map',
    equations: [
      {
        plain: "x' = sin(ay) + c cos(ax)",
        node: (
          <>
            x&#8242; <Up> = sin(ay) + c cos(ax)</Up>
          </>
        ),
      },
      {
        plain: "y' = sin(bx) + d cos(by)",
        node: (
          <>
            y&#8242; <Up> = sin(bx) + d cos(by)</Up>
          </>
        ),
      },
    ],
    params: [
      { symbol: 'a', meaning: 'sine frequency on x', classicValue: '−1.4' },
      { symbol: 'b', meaning: 'sine frequency on y', classicValue: '1.6' },
      { symbol: 'c', meaning: 'cosine weight on x', classicValue: '1.0' },
      { symbol: 'd', meaning: 'cosine weight on y', classicValue: '0.7' },
    ],
    discoverer: 'Clifford A. Pickover',
    year: 1990,
    citation: "Pickover, C. A. (1990). Computers, Pattern, Chaos and Beauty. St. Martin's Press.",
    distinctiveness:
      "An iterated map, not a flow: there's no continuous time, no integration step to label. Each iteration becomes the next point directly, producing a dense filigree from millions of discrete points.",
  },
  {
    slug: 'dejong',
    name: 'De Jong',
    kind: 'map',
    equations: [
      {
        plain: "x' = sin(ay) − cos(bx)",
        node: (
          <>
            x&#8242; <Up> = sin(ay) − cos(bx)</Up>
          </>
        ),
      },
      {
        plain: "y' = sin(cx) − cos(dy)",
        node: (
          <>
            y&#8242; <Up> = sin(cx) − cos(dy)</Up>
          </>
        ),
      },
    ],
    params: [
      { symbol: 'a', meaning: 'sine frequency on x', classicValue: '1.4' },
      { symbol: 'b', meaning: 'cosine frequency on x', classicValue: '−2.3' },
      { symbol: 'c', meaning: 'sine frequency on y', classicValue: '2.4' },
      { symbol: 'd', meaning: 'cosine frequency on y', classicValue: '−2.1' },
    ],
    discoverer: 'Peter de Jong',
    year: 1980,
    citation:
      "Popularised through Paul Bourke's map galleries, attributed to Peter de Jong's experiments around 1980.",
    distinctiveness:
      "Four symmetric trigonometric terms (paired sin/cos on each axis) differ from Clifford's asymmetry, producing layered bands instead of a uniformly textured filigree.",
  },
];

export function getSystemReference(slug: string): SystemReference | undefined {
  return systemReferences.find((s) => s.slug === slug);
}
