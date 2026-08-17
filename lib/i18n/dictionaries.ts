export type Locale = 'id' | 'en';

export type Dictionary = {
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
    readonly openPanel: string;
    readonly closePanel: string;
    readonly system: string;
    readonly integrator: string;
    readonly step: string;
    readonly parameters: string;
    readonly pairMode: string;
    readonly epsilon: string;
    readonly exportSvg: string;
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
  };
  readonly sistem: {
    readonly indexTitle: string;
    readonly parameters: string;
    readonly distinctiveness: string;
    readonly flow: string;
    readonly map: string;
  };
};

const id: Dictionary = {
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
    openPanel: 'Buka panel kontrol',
    closePanel: 'Tutup panel kontrol',
    system: 'Sistem',
    integrator: 'Integrator',
    step: 'Langkah (dt)',
    parameters: 'Parameter',
    pairMode: 'Pasangan divergensi',
    epsilon: 'Epsilon (ε)',
    exportSvg: 'Ekspor SVG',
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
  },
  sistem: {
    indexTitle: 'Sistem',
    parameters: 'Parameter',
    distinctiveness: 'Yang membedakannya',
    flow: 'aliran (ODE)',
    map: 'peta terulang',
  },
};

const en: Dictionary = {
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
    openPanel: 'Open control panel',
    closePanel: 'Close control panel',
    system: 'System',
    integrator: 'Integrator',
    step: 'Step (dt)',
    parameters: 'Parameters',
    pairMode: 'Divergence pair',
    epsilon: 'Epsilon (ε)',
    exportSvg: 'Export SVG',
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
  },
  sistem: {
    indexTitle: 'Systems',
    parameters: 'Parameters',
    distinctiveness: 'What sets it apart',
    flow: 'flow (ODE)',
    map: 'iterated map',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { id, en };
