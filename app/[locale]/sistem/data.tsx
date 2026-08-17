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
      { symbol: 'σ', meaning: 'rasio Prandtl — kecepatan difusi momentum relatif terhadap panas', classicValue: '10' },
      { symbol: 'ρ', meaning: 'bilangan Rayleigh — seberapa kuat sistem didorong menjauhi kesetimbangan', classicValue: '28' },
      { symbol: 'β', meaning: 'rasio geometris kotak konveksi', classicValue: '8/3' },
    ],
    discoverer: 'Edward N. Lorenz',
    year: 1963,
    citation: 'Lorenz, E. N. (1963). Deterministic Nonperiodic Flow. J. Atmos. Sci. 20(2), 130–141.',
    distinctiveness:
      'Model konveksi atmosfer yang disederhanakan drastis, dan sistem yang menemukan kekacauan deterministik itu sendiri. Dua titik tetap tak-trivial simetris membentuk "sayap kupu-kupu" yang menjadi citra baku kekacauan.',
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
      { symbol: 'a', meaning: 'kekuatan umpan-balik putaran x–y', classicValue: '0.2' },
      { symbol: 'b', meaning: 'dorongan dasar pada z', classicValue: '0.2' },
      { symbol: 'c', meaning: 'ambang yang memicu lonjakan z', classicValue: '5.7' },
    ],
    discoverer: 'Otto E. Rössler',
    year: 1976,
    citation: 'Rössler, O. E. (1976). An Equation for Continuous Chaos. Phys. Lett. A 57(5), 397–398.',
    distinctiveness:
      'Dirancang setelah Lorenz, sengaja dibuat dengan hanya satu suku nonlinear (xz pada persamaan ż) — attractor kekacauan paling sederhana yang bisa ditulis, dengan struktur pita tunggal yang mudah dilacak dibanding sayap ganda Lorenz.',
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
    params: [{ symbol: 'b', meaning: 'redaman — semakin besar, semakin cepat menuju titik tetap', classicValue: '0.208186' }],
    discoverer: 'René Thomas',
    year: 1999,
    citation:
      'Thomas, R. (1999). Deterministic Chaos Seen in Terms of Feedback Circuits. Int. J. Bifurcation Chaos 9(10), 1889–1905.',
    distinctiveness:
      'Simetri siklik sempurna: menukar x→y→z→x meninggalkan persamaan tak berubah. Dibangun dari sinus, bukan perkalian suku — model sirkuit umpan-balik berlabuh biologis, bukan aliran fluida.',
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
    params: [{ symbol: 'a', meaning: 'redaman siklik', classicValue: '1.4' }],
    discoverer: 'William Halvorsen (via Julien C. Sprott dan Paul Bourke)',
    year: 2006,
    citation: 'Dipopulerkan melalui katalog attractor Julien C. Sprott dan Paul Bourke, pertengahan 2000-an.',
    distinctiveness:
      'Simetri siklik seperti Thomas, tapi dari umpan-balik kuadratik silang, bukan trigonometri — menghasilkan pilinan bercuping yang jauh lebih padat dan kompak.',
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
      { symbol: 'a', meaning: 'ekspansi vertikal', classicValue: '0.95' },
      { symbol: 'b', meaning: 'offset ambang pilinan', classicValue: '0.7' },
      { symbol: 'c', meaning: 'dorongan dasar pada z', classicValue: '0.6' },
      { symbol: 'd', meaning: 'kecepatan putaran x–y', classicValue: '3.5' },
      { symbol: 'e', meaning: 'kopling redaman-ketinggian', classicValue: '0.25' },
      { symbol: 'f', meaning: 'kopling kubik orde-tiga', classicValue: '0.1' },
    ],
    discoverer: 'Aizawa (setelah kerja sirkuit-kacau Aizawa & Uezu, 1982) — via Julien C. Sprott',
    year: 1982,
    citation: 'Dipopulerkan melalui katalog attractor Julien C. Sprott, mengacu pada karya sirkuit-kacau Aizawa & Uezu (1982).',
    distinctiveness:
      'Persamaan paling rumit di antara sistem kontinu dalam koleksi ini — enam parameter, satu suku kubik — menghasilkan bentuk seperti cangkang berlapis yang jauh dari sayap kupu-kupu Lorenz.',
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
      { symbol: 'a', meaning: 'frekuensi sinus pada x', classicValue: '−1.4' },
      { symbol: 'b', meaning: 'frekuensi sinus pada y', classicValue: '1.6' },
      { symbol: 'c', meaning: 'bobot kosinus pada x', classicValue: '1.0' },
      { symbol: 'd', meaning: 'bobot kosinus pada y', classicValue: '0.7' },
    ],
    discoverer: 'Clifford A. Pickover',
    year: 1990,
    citation: 'Pickover, C. A. (1990). Computers, Pattern, Chaos and Beauty. St. Martin\'s Press.',
    distinctiveness:
      'Peta terulang, bukan aliran — tidak ada waktu kontinu, tidak ada langkah integrasi untuk dilabeli. Setiap iterasi langsung menjadi titik berikutnya, menghasilkan filigri padat dari jutaan titik diskret.',
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
      { symbol: 'a', meaning: 'frekuensi sinus pada x', classicValue: '1.4' },
      { symbol: 'b', meaning: 'frekuensi kosinus pada x', classicValue: '−2.3' },
      { symbol: 'c', meaning: 'frekuensi sinus pada y', classicValue: '2.4' },
      { symbol: 'd', meaning: 'frekuensi kosinus pada y', classicValue: '−2.1' },
    ],
    discoverer: 'Peter de Jong',
    year: 1980,
    citation: 'Dipopulerkan melalui galeri peta Paul Bourke, dikaitkan dengan eksperimen Peter de Jong sekitar 1980.',
    distinctiveness:
      'Empat suku trigonometri simetris (sin/cos berpasangan pada tiap sumbu) berbeda dari asimetri Clifford — menghasilkan pita-pita berlapis alih-alih filigri bertekstur seragam.',
  },
];



export function getSystemReference(slug: string): SystemReference | undefined {
  return systemReferences.find((s) => s.slug === slug);
}
