export type Locale = 'id' | 'en';

export type Dictionary = {
  readonly brand: {
    readonly name: string;
    readonly tagline: string;
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
    readonly checkConvergence: string;
    readonly convergenceOrder: string;
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
  };
  readonly onboarding: {
    readonly intro: string;
    readonly divergenceHint: string;
    readonly dismiss: string;
  };
};

const id: Dictionary = {
  brand: {
    name: 'Attractor Lab',
    tagline: 'Atraktor aneh, diintegrasi langkah demi langkah — amati dua lintasan nyaris identik menyimpang.',
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
    checkConvergence: 'Cek konvergensi',
    convergenceOrder: 'orde konvergensi (dt → dt/2)',
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
  },
  onboarding: {
    intro: 'Atraktor aneh, dihitung langkah demi langkah oleh integrator tulisan tangan.',
    divergenceHint:
      'Dua lintasan identik, dimulai dengan perbedaan sekecil 10⁻⁸. Amati saat keduanya menyimpang — ini kekacauan deterministik, bukan noise acak.',
    dismiss: 'Mengerti',
  },
};

const en: Dictionary = {
  brand: {
    name: 'Attractor Lab',
    tagline: 'Strange attractors, integrated step by step — watch two near-identical trajectories diverge.',
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
    checkConvergence: 'Check convergence',
    convergenceOrder: 'convergence order (dt → dt/2)',
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
  },
  onboarding: {
    intro: 'A strange attractor, computed step by step by a hand-written integrator.',
    divergenceHint:
      "Two identical trajectories, started 10⁻⁸ apart. Watch them diverge — that's deterministic chaos, not random noise.",
    dismiss: 'Got it',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
