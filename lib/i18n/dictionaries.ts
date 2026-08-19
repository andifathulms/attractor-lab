export type Locale = 'id' | 'en';

export type Dictionary = {
  readonly brand: {
    readonly name: string;
    readonly tagline: string;
  };
  readonly canvas: {
    readonly label: string;
    readonly sectionLabel: string;
    readonly mapLabel: string;
  };
  readonly divergence: {
    readonly axisExplain: string;
    readonly rateLabel: string;
    readonly definitionNote: string;
    readonly notYetDiverged: string;
    readonly horizonNote: string;
    readonly horizonThresholdRule: string;
  };
  readonly nav: {
    readonly jelajah: string;
    readonly banding: string;
    readonly irisan: string;
    readonly cabang: string;
    readonly sistem: string;
  };
  readonly systemNames: {
    readonly lorenz: string;
    readonly rossler: string;
    readonly thomas: string;
    readonly halvorsen: string;
    readonly aizawa: string;
  };
  readonly integratorNames: {
    readonly euler: string;
    readonly rk2: string;
    readonly rk4: string;
  };
  readonly panel: {
    readonly title: string;
    readonly intro: string;
    readonly openPanel: string;
    readonly closePanel: string;
    readonly system: string;
    readonly integrator: string;
    readonly step: string;
    readonly parameters: string;
    readonly pairMode: string;
    readonly epsilon: string;
    readonly exportSvg: string;
    readonly copyLink: string;
    readonly linkCopied: string;
    readonly verify: string;
    readonly verifying: string;
    readonly verifyDeltaLabel: string;
    readonly verifyDeltaScaleSuffix: string;
    readonly clickToJump: string;
    readonly jumpToTrajectory: string;
    readonly bifurcationExplain: string;
    readonly sectionExplain: string;
    readonly tryCompareCuePrefix: string;
    readonly tryCompareCueSuffix: string;
    readonly checkConvergence: string;
    readonly convergenceOrder: string;
    readonly convergenceExplain: string;
    readonly sweptParameter: string;
    readonly min: string;
    readonly max: string;
    readonly sampleCount: string;
    readonly localMaximaAxis: string;
    readonly plane: string;
    readonly axis: string;
    readonly offset: string;
  };
  readonly readout: {
    readonly integrator: string;
    readonly step: string;
    readonly elapsedTime: string;
    readonly lyapunovMax: string;
    readonly epsilon: string;
    readonly plane: string;
    readonly crossings: string;
    readonly sweep: string;
    readonly progress: string;
    readonly done: string;
    readonly separationA: string;
    readonly separationB: string;
    readonly horizon: string;
  };
  readonly sistem: {
    readonly indexTitle: string;
    readonly parameters: string;
    readonly distinctiveness: string;
    readonly flow: string;
    readonly map: string;
    readonly checkedConstants: string;
    readonly computed: string;
    readonly published: string;
    readonly withinTolerance: string;
    readonly outsideTolerance: string;
    readonly verifyingConstants: string;
    readonly kaplanYorkeDimension: string;
    readonly constantsReady: string;
    readonly constantsExplain: string;
  };
  readonly onboarding: {
    readonly intro: string;
    readonly divergenceHint: string;
    readonly dismiss: string;
  };
  readonly notFound: {
    readonly title: string;
    readonly description: string;
    readonly backLink: string;
  };
  readonly skipToContent: string;
};

const id: Dictionary = {
  brand: {
    name: 'Attractor Lab',
    tagline: 'Atraktor aneh, diintegrasi langkah demi langkah: amati dua lintasan nyaris identik menyimpang.',
  },
  canvas: {
    label:
      'Render lintasan 3D. Panah kiri/kanan memutar horizontal, panah atas/bawah memutar vertikal, +/− memperbesar/memperkecil.',
    sectionLabel:
      'Render lintasan 3D dengan bidang Poincaré (ungu) dan titik potongnya. Panah kiri/kanan memutar horizontal, panah atas/bawah memutar vertikal, +/− memperbesar/memperkecil.',
    mapLabel: 'Render peta {name} dengan 200.000 titik iterasi.',
  },
  divergence: {
    axisExplain:
      'Garis di atas menelusuri jarak antara lintasan A dan B setiap saat. Kenaikan yang lurus berarti perpisahannya eksponensial, ciri kekacauan deterministik.',
    rateLabel: 'laju kasar saat ini',
    definitionNote:
      'Ini definisi eksponen Lyapunov: |Δ(t)| ≈ ε·e^(λt). λ maks di bawah adalah estimasi yang lebih cermat (metode Benettin: dua lintasan, pertumbuhan log dirata-rata seiring waktu), bukan dihitung langsung dari dua titik ini.',
    notYetDiverged: '|Δ| belum melewati ε. Perpisahan belum terlihat pada skala ini.',
    horizonNote:
      "Cakrawala prediksi di bawah menjawab: dengan λ dan ε ini, kapan |Δ| diperkirakan mencapai ambang 'tak berkaitan'? Rumusnya t ≈ ln(ambang/ε)/λ.",
    horizonThresholdRule: 'Ambang itu dipilih sebagai 10% dari diagonal kotak pembatas sistem: patokan eksplisit, bukan konstanta sembarang',
  },
  nav: {
    jelajah: 'Jelajah',
    banding: 'Banding',
    irisan: 'Irisan',
    cabang: 'Cabang',
    sistem: 'Sistem',
  },
  systemNames: {
    lorenz: 'Lorenz',
    rossler: 'Rössler',
    thomas: 'Thomas',
    halvorsen: 'Halvorsen',
    aizawa: 'Aizawa',
  },
  integratorNames: {
    euler: 'Euler',
    rk2: 'RK2',
    rk4: 'RK4',
  },
  panel: {
    title: 'Kontrol',
    intro: 'Setiap kombinasi sistem, integrator, dan langkah menghasilkan gambar yang berbeda.',
    openPanel: 'Buka panel kontrol',
    closePanel: 'Tutup panel kontrol',
    system: 'Sistem',
    integrator: 'Integrator',
    step: 'Langkah (dt)',
    parameters: 'Parameter',
    pairMode: 'Pasangan divergensi',
    epsilon: 'Epsilon (ε)',
    exportSvg: 'Ekspor SVG',
    copyLink: 'Salin tautan',
    linkCopied: 'Tautan disalin',
    verify: 'Verifikasi tampilan ini',
    verifying: 'Menghitung…',
    verifyDeltaLabel: 'Δ pada dt/2',
    verifyDeltaScaleSuffix: 'dari skala sistem',
    clickToJump: 'Klik diagram untuk melihat lintasannya',
    jumpToTrajectory: 'Lompat ke lintasan',
    bifurcationExplain:
      'Setiap titik adalah satu maksimum lokal sumbu {axis} sepanjang lintasan, pada nilai parameter itu. Bukan lintasan penuh, hanya puncaknya. Satu titik di atas satu nilai parameter berarti periodik; sebaran vertikal (smear) berarti kacau.',
    sectionExplain:
      'Setiap kali lintasan menembus bidang irisan (dari satu sisi), posisi (u, v)-nya pada bidang itu digambar di sini. Tangle 3D yang rumit menjadi peta yang hampir satu dimensi. Ini adalah wawasan yang membuat kekacauan bisa dipelajari: struktur yang tersembunyi dalam kekusutan menjadi terlihat begitu diiris.',
    tryCompareCuePrefix: 'Ingin lihat integrator gagal? Buka',
    tryCompareCueSuffix: ', naikkan dt, dan bandingkan Euler, RK2, RK4 berdampingan.',
    checkConvergence: 'Cek konvergensi',
    convergenceOrder: 'orde konvergensi (dt → dt/2)',
    convergenceExplain:
      'Tiap integrator dijalankan pada dt dan dt/2, dibandingkan dengan referensi RK4 pada dt/64. Orde = log₂(error(dt) / error(dt/2)): Euler ≈1, RK2 ≈2, RK4 ≈4, sesuai perilaku pemotongan lokalnya.',
    sweptParameter: 'Parameter yang disapu',
    min: 'Min',
    max: 'Maks',
    sampleCount: 'Jumlah sampel',
    localMaximaAxis: 'Sumbu maksima lokal',
    plane: 'Bidang irisan',
    axis: 'Sumbu',
    offset: 'Offset',
  },
  readout: {
    integrator: 'integrator',
    step: 'langkah (dt)',
    elapsedTime: 'waktu sistem',
    lyapunovMax: 'λ maks',
    epsilon: 'ε',
    plane: 'bidang',
    crossings: 'perpotongan',
    sweep: 'sapuan',
    progress: 'kemajuan',
    done: 'selesai',
    separationA: '|euler − rk4|',
    separationB: '|rk2 − rk4|',
    horizon: 'cakrawala prediksi',
  },
  sistem: {
    indexTitle: 'Sistem',
    parameters: 'Parameter',
    distinctiveness: 'Yang membedakannya',
    flow: 'aliran (ODE)',
    map: 'peta terulang',
    checkedConstants: 'Konstanta terverifikasi',
    computed: 'dihitung',
    published: 'terpublikasi',
    withinTolerance: 'sesuai toleransi',
    outsideTolerance: 'di luar toleransi',
    verifyingConstants: 'menghitung…',
    kaplanYorkeDimension: 'dimensi Kaplan–Yorke',
    constantsReady: 'Konstanta terverifikasi selesai dihitung.',
    constantsExplain:
      'λ maks mengukur seberapa cepat dua lintasan yang berdekatan berpisah (satuan 1/waktu). Dimensi Kaplan–Yorke memperkirakan dimensi fraktal atraktor dari spektrum Lyapunov penuh: D = j + (jumlah j eksponen teratas) / |eksponen berikutnya|, dengan j indeks terbesar yang jumlah parsialnya masih ≥0. Keduanya estimasi numerik, bukan nilai analitik tertutup, karena itu ada kolom toleransi di atas.',
  },
  onboarding: {
    intro: 'Atraktor aneh, dihitung langkah demi langkah oleh integrator tulisan tangan.',
    divergenceHint:
      'Dua lintasan identik, dimulai dengan perbedaan sekecil 10⁻⁸. Amati saat keduanya menyimpang: ini kekacauan deterministik, bukan noise acak.',
    dismiss: 'Mengerti',
  },
  notFound: {
    title: 'Halaman tidak ditemukan',
    description: 'Tautan ini tidak mengarah ke lintasan mana pun di Attractor Lab.',
    backLink: 'Kembali ke Jelajah',
  },
  skipToContent: 'Langsung ke konten',
};

const en: Dictionary = {
  brand: {
    name: 'Attractor Lab',
    tagline: 'Strange attractors, integrated step by step: watch two near-identical trajectories diverge.',
  },
  canvas: {
    label:
      'Rendered 3D trajectory. Left/right arrows rotate horizontally, up/down arrows rotate vertically, +/- zoom in/out.',
    sectionLabel:
      'Rendered 3D trajectory with its Poincaré plane (violet) and crossing points. Left/right arrows rotate horizontally, up/down arrows rotate vertically, +/- zoom in/out.',
    mapLabel: 'Rendered {name} map with 200,000 iterated points.',
  },
  divergence: {
    axisExplain:
      "The line above traces the distance between trajectory A and B at each moment. A straight climb means the separation is exponential, the signature of deterministic chaos.",
    rateLabel: 'rough rate right now',
    definitionNote:
      'This is the definition of the Lyapunov exponent: |Δ(t)| ≈ ε·e^(λt). λ max below is a more careful estimate (the Benettin method: two trajectories, log growth averaged over time), not computed directly from these two points.',
    notYetDiverged: "|Δ| hasn't passed ε yet. The separation isn't visible at this scale yet.",
    horizonNote:
      "The predictability horizon below answers: with this λ and ε, when is |Δ| expected to reach the 'unrelated' threshold? The formula is t ≈ ln(threshold/ε)/λ.",
    horizonThresholdRule: "That threshold is chosen as 10% of the system's bounding-box diagonal: an explicit rule, not an arbitrary constant",
  },
  nav: {
    jelajah: 'Explore',
    banding: 'Compare',
    irisan: 'Section',
    cabang: 'Bifurcation',
    sistem: 'Systems',
  },
  systemNames: {
    lorenz: 'Lorenz',
    rossler: 'Rössler',
    thomas: 'Thomas',
    halvorsen: 'Halvorsen',
    aizawa: 'Aizawa',
  },
  integratorNames: {
    euler: 'Euler',
    rk2: 'RK2',
    rk4: 'RK4',
  },
  panel: {
    title: 'Controls',
    intro: 'Each combination of system, integrator, and step renders a different picture.',
    openPanel: 'Open control panel',
    closePanel: 'Close control panel',
    system: 'System',
    integrator: 'Integrator',
    step: 'Step (dt)',
    parameters: 'Parameters',
    pairMode: 'Divergence pair',
    epsilon: 'Epsilon (ε)',
    exportSvg: 'Export SVG',
    copyLink: 'Copy link',
    linkCopied: 'Link copied',
    verify: 'Verify this view',
    verifying: 'Computing…',
    verifyDeltaLabel: 'Δ at dt/2',
    verifyDeltaScaleSuffix: 'of system scale',
    clickToJump: 'Click the diagram to see its trajectory',
    jumpToTrajectory: 'Jump to trajectory',
    bifurcationExplain:
      'Each dot is one local maximum of the {axis} axis along the trajectory, at that parameter value. Not the full trajectory, just its peaks. One dot above a single parameter value means periodic; a vertical smear means chaotic.',
    sectionExplain:
      "Each time the trajectory pierces the section plane (from one side), its (u, v) position on that plane is drawn here. A tangled 3D curve becomes a nearly one-dimensional map. This is the insight that made chaos tractable to study: structure hidden in the tangle becomes visible once it's sliced.",
    tryCompareCuePrefix: 'Want to see an integrator fail? Open',
    tryCompareCueSuffix: ', push dt up, and watch Euler, RK2, and RK4 side by side.',
    checkConvergence: 'Check convergence',
    convergenceOrder: 'convergence order (dt → dt/2)',
    convergenceExplain:
      'Each integrator runs at dt and dt/2, compared against an RK4 reference at dt/64. Order = log₂(error(dt) / error(dt/2)): ≈1 for Euler, ≈2 for RK2, ≈4 for RK4, matching each one’s local truncation behavior.',
    sweptParameter: 'Swept parameter',
    min: 'Min',
    max: 'Max',
    sampleCount: 'Sample count',
    localMaximaAxis: 'Local-maxima axis',
    plane: 'Section plane',
    axis: 'Axis',
    offset: 'Offset',
  },
  readout: {
    integrator: 'integrator',
    step: 'step (dt)',
    elapsedTime: 'system time',
    lyapunovMax: 'λ max',
    epsilon: 'ε',
    plane: 'plane',
    crossings: 'crossings',
    sweep: 'sweep',
    progress: 'progress',
    done: 'done',
    separationA: '|euler − rk4|',
    separationB: '|rk2 − rk4|',
    horizon: 'predictability horizon',
  },
  sistem: {
    indexTitle: 'Systems',
    parameters: 'Parameters',
    distinctiveness: 'What sets it apart',
    flow: 'flow (ODE)',
    map: 'iterated map',
    checkedConstants: 'Verified constants',
    computed: 'computed',
    published: 'published',
    withinTolerance: 'within tolerance',
    outsideTolerance: 'outside tolerance',
    verifyingConstants: 'computing…',
    kaplanYorkeDimension: 'Kaplan–Yorke dimension',
    constantsReady: 'Verified constants finished computing.',
    constantsExplain:
      'λ max measures how fast two nearby trajectories separate (units of 1/time). The Kaplan–Yorke dimension estimates the attractor\'s fractal dimension from the full Lyapunov spectrum: D = j + (sum of the top j exponents) / |the next exponent|, where j is the largest index whose partial sum is still ≥0. Both are numerical estimates, not closed-form analytic values. That\'s why there\'s a tolerance column above.',
  },
  onboarding: {
    intro: 'A strange attractor, computed step by step by a hand-written integrator.',
    divergenceHint:
      "Two identical trajectories, started 10⁻⁸ apart. Watch them diverge: that's deterministic chaos, not random noise.",
    dismiss: 'Got it',
  },
  notFound: {
    title: 'Page not found',
    description: "This link doesn't point to any trajectory in Attractor Lab.",
    backLink: 'Back to Explore',
  },
  skipToContent: 'Skip to content',
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
