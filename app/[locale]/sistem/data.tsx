import type { ReactNode } from 'react';
import { Sup, Up } from '@/components/equation/Equation';
import type { Locale } from '@/lib/i18n/dictionaries';

export type EquationEntry = {
  readonly plain: string;
  readonly node: ReactNode;
};

export type LocalizedText = {
  readonly id: string;
  readonly en: string;
};

export type ParamEntry = {
  readonly symbol: string;
  readonly meaning: LocalizedText;
  readonly classicValue: string;
};

export type SystemReference = {
  readonly slug: string;
  readonly name: string;
  readonly kind: 'flow' | 'map';
  readonly equations: readonly EquationEntry[];
  readonly params: readonly ParamEntry[];
  readonly discoverer: LocalizedText;
  readonly year: number;
  /**
   * Real bibliographic entries (author, year, title, journal) are already
   * in their published form and conventionally aren't translated, so those
   * use the same string for both locales; the handful that are actually
   * descriptive sentences ("popularised via...") get real translations.
   */
  readonly citation: LocalizedText;
  readonly distinctiveness: LocalizedText;
};

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

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
        meaning: {
          id: 'rasio Prandtl: kecepatan difusi momentum relatif terhadap panas',
          en: 'Prandtl ratio: the speed of momentum diffusion relative to heat',
        },
        classicValue: '10',
      },
      {
        symbol: 'ρ',
        meaning: {
          id: 'bilangan Rayleigh: seberapa kuat sistem didorong menjauhi kesetimbangan',
          en: 'Rayleigh number: how strongly the system is driven away from equilibrium',
        },
        classicValue: '28',
      },
      {
        symbol: 'β',
        meaning: {
          id: 'rasio geometris kotak konveksi',
          en: 'geometric aspect ratio of the convection cell',
        },
        classicValue: '8/3',
      },
    ],
    discoverer: { id: 'Edward N. Lorenz', en: 'Edward N. Lorenz' },
    year: 1963,
    citation: {
      id: 'Lorenz, E. N. (1963). Deterministic Nonperiodic Flow. J. Atmos. Sci. 20(2), 130–141.',
      en: 'Lorenz, E. N. (1963). Deterministic Nonperiodic Flow. J. Atmos. Sci. 20(2), 130–141.',
    },
    distinctiveness: {
      id: 'Model konveksi atmosfer yang disederhanakan drastis, dan sistem yang menemukan kekacauan deterministik itu sendiri. Dua titik tetap tak-trivial simetris membentuk "sayap kupu-kupu" yang menjadi citra baku kekacauan.',
      en: "A drastically simplified model of atmospheric convection, and the system that discovered deterministic chaos itself. Two symmetric non-trivial fixed points form the \"butterfly wings\" that became chaos theory's standard image.",
    },
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
      {
        symbol: 'a',
        meaning: { id: 'kekuatan umpan-balik putaran x–y', en: 'feedback strength of the x–y loop' },
        classicValue: '0.2',
      },
      {
        symbol: 'b',
        meaning: { id: 'dorongan dasar pada z', en: 'baseline push on z' },
        classicValue: '0.2',
      },
      {
        symbol: 'c',
        meaning: { id: 'ambang yang memicu lonjakan z', en: 'threshold that triggers the z spike' },
        classicValue: '5.7',
      },
    ],
    discoverer: { id: 'Otto E. Rössler', en: 'Otto E. Rössler' },
    year: 1976,
    citation: {
      id: 'Rössler, O. E. (1976). An Equation for Continuous Chaos. Phys. Lett. A 57(5), 397–398.',
      en: 'Rössler, O. E. (1976). An Equation for Continuous Chaos. Phys. Lett. A 57(5), 397–398.',
    },
    distinctiveness: {
      id: 'Dirancang setelah Lorenz, sengaja dibuat dengan hanya satu suku nonlinear (xz pada persamaan ż): attractor kekacauan paling sederhana yang bisa ditulis, dengan struktur pita tunggal yang mudah dilacak dibanding sayap ganda Lorenz.',
      en: "Designed after Lorenz, deliberately built with only one nonlinear term (xz in the ż equation): the simplest chaotic attractor that can be written down, with a single-band structure that's easier to trace than Lorenz's double wing.",
    },
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
        meaning: {
          id: 'redaman: semakin besar, semakin cepat menuju titik tetap',
          en: 'damping: the larger it is, the faster the system settles to a fixed point',
        },
        classicValue: '0.208186',
      },
    ],
    discoverer: { id: 'René Thomas', en: 'René Thomas' },
    year: 1999,
    citation: {
      id: 'Thomas, R. (1999). Deterministic Chaos Seen in Terms of Feedback Circuits. Int. J. Bifurcation Chaos 9(10), 1889–1905.',
      en: 'Thomas, R. (1999). Deterministic Chaos Seen in Terms of Feedback Circuits. Int. J. Bifurcation Chaos 9(10), 1889–1905.',
    },
    distinctiveness: {
      id: 'Simetri siklik sempurna: menukar x→y→z→x meninggalkan persamaan tak berubah. Dibangun dari sinus, bukan perkalian suku: model sirkuit umpan-balik berlabuh biologis, bukan aliran fluida.',
      en: 'Perfect cyclic symmetry: swapping x→y→z→x leaves the equations unchanged. Built from sines rather than products of terms: a feedback-circuit model with biological roots, not a fluid flow.',
    },
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
    params: [
      { symbol: 'a', meaning: { id: 'redaman siklik', en: 'cyclic damping' }, classicValue: '1.4' },
    ],
    discoverer: {
      id: 'William Halvorsen (via Julien C. Sprott dan Paul Bourke)',
      en: 'William Halvorsen (via Julien C. Sprott and Paul Bourke)',
    },
    year: 2006,
    citation: {
      id: 'Dipopulerkan melalui katalog attractor Julien C. Sprott dan Paul Bourke, pertengahan 2000-an.',
      en: "Popularised through Julien C. Sprott and Paul Bourke's attractor catalogues, mid-2000s.",
    },
    distinctiveness: {
      id: 'Simetri siklik seperti Thomas, tapi dari umpan-balik kuadratik silang, bukan trigonometri, menghasilkan pilinan bercuping yang jauh lebih padat dan kompak.',
      en: 'Cyclic symmetry like Thomas, but from cross-quadratic feedback rather than trigonometry, producing a much denser, more compact lobed twist.',
    },
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
      { symbol: 'a', meaning: { id: 'ekspansi vertikal', en: 'vertical expansion' }, classicValue: '0.95' },
      {
        symbol: 'b',
        meaning: { id: 'offset ambang pilinan', en: 'twist-threshold offset' },
        classicValue: '0.7',
      },
      {
        symbol: 'c',
        meaning: { id: 'dorongan dasar pada z', en: 'baseline push on z' },
        classicValue: '0.6',
      },
      {
        symbol: 'd',
        meaning: { id: 'kecepatan putaran x–y', en: 'x–y rotation speed' },
        classicValue: '3.5',
      },
      {
        symbol: 'e',
        meaning: { id: 'kopling redaman-ketinggian', en: 'damping–height coupling' },
        classicValue: '0.25',
      },
      {
        symbol: 'f',
        meaning: { id: 'kopling kubik orde-tiga', en: 'third-order cubic coupling' },
        classicValue: '0.1',
      },
    ],
    discoverer: {
      id: 'Aizawa (setelah kerja sirkuit-kacau Aizawa & Uezu, 1982), via Julien C. Sprott',
      en: "Aizawa (after Aizawa & Uezu's 1982 chaotic-circuit work), via Julien C. Sprott",
    },
    year: 1982,
    citation: {
      id: 'Dipopulerkan melalui katalog attractor Julien C. Sprott, mengacu pada karya sirkuit-kacau Aizawa & Uezu (1982).',
      en: "Popularised through Julien C. Sprott's attractor catalogue, referencing Aizawa & Uezu's chaotic-circuit work (1982).",
    },
    distinctiveness: {
      id: 'Persamaan paling rumit di antara sistem kontinu dalam koleksi ini (enam parameter, satu suku kubik), menghasilkan bentuk seperti cangkang berlapis yang jauh dari sayap kupu-kupu Lorenz.',
      en: 'The most intricate equations among the continuous systems in this collection (six parameters, one cubic term), producing a layered, shell-like form far removed from Lorenz\'s butterfly wings.',
    },
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
      { symbol: 'a', meaning: { id: 'frekuensi sinus pada x', en: 'sine frequency on x' }, classicValue: '−1.4' },
      { symbol: 'b', meaning: { id: 'frekuensi sinus pada y', en: 'sine frequency on y' }, classicValue: '1.6' },
      { symbol: 'c', meaning: { id: 'bobot kosinus pada x', en: 'cosine weight on x' }, classicValue: '1.0' },
      { symbol: 'd', meaning: { id: 'bobot kosinus pada y', en: 'cosine weight on y' }, classicValue: '0.7' },
    ],
    discoverer: { id: 'Clifford A. Pickover', en: 'Clifford A. Pickover' },
    year: 1990,
    citation: {
      id: "Pickover, C. A. (1990). Computers, Pattern, Chaos and Beauty. St. Martin's Press.",
      en: "Pickover, C. A. (1990). Computers, Pattern, Chaos and Beauty. St. Martin's Press.",
    },
    distinctiveness: {
      id: 'Peta terulang, bukan aliran: tidak ada waktu kontinu, tidak ada langkah integrasi untuk dilabeli. Setiap iterasi langsung menjadi titik berikutnya, menghasilkan filigri padat dari jutaan titik diskret.',
      en: "An iterated map, not a flow: there's no continuous time, no integration step to label. Each iteration becomes the next point directly, producing a dense filigree from millions of discrete points.",
    },
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
      { symbol: 'a', meaning: { id: 'frekuensi sinus pada x', en: 'sine frequency on x' }, classicValue: '1.4' },
      {
        symbol: 'b',
        meaning: { id: 'frekuensi kosinus pada x', en: 'cosine frequency on x' },
        classicValue: '−2.3',
      },
      { symbol: 'c', meaning: { id: 'frekuensi sinus pada y', en: 'sine frequency on y' }, classicValue: '2.4' },
      {
        symbol: 'd',
        meaning: { id: 'frekuensi kosinus pada y', en: 'cosine frequency on y' },
        classicValue: '−2.1',
      },
    ],
    discoverer: { id: 'Peter de Jong', en: 'Peter de Jong' },
    year: 1980,
    citation: {
      id: 'Dipopulerkan melalui galeri peta Paul Bourke, dikaitkan dengan eksperimen Peter de Jong sekitar 1980.',
      en: "Popularised through Paul Bourke's map galleries, attributed to Peter de Jong's experiments around 1980.",
    },
    distinctiveness: {
      id: 'Empat suku trigonometri simetris (sin/cos berpasangan pada tiap sumbu) berbeda dari asimetri Clifford, menghasilkan pita-pita berlapis alih-alih filigri bertekstur seragam.',
      en: "Four symmetric trigonometric terms (paired sin/cos on each axis) differ from Clifford's asymmetry, producing layered bands instead of a uniformly textured filigree.",
    },
  },
];

export function getSystemReference(slug: string): SystemReference | undefined {
  return systemReferences.find((s) => s.slug === slug);
}
