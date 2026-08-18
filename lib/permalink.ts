import { classicSystem, type SystemId } from './dynamics/systems';
import type { IntegratorId } from './dynamics/integrate';

/**
 * The jelajah page's full reproducible state: same inputs here byte-identically
 * reproduce the same trajectory (lib/dynamics is deterministic — see CLAUDE.md
 * invariant 3). Encoding this into a URL turns that guarantee into something a
 * recipient can check directly, not just something the test suite asserts.
 */
export type JelajahState = {
  readonly systemId: SystemId;
  readonly params: Record<string, number>;
  readonly integrator: IntegratorId;
  readonly dt: number;
  readonly pairMode: boolean;
  readonly epsilon: number;
};

const SYSTEM_IDS: readonly SystemId[] = ['lorenz', 'rossler', 'thomas', 'halvorsen', 'aizawa'];
const INTEGRATOR_IDS: readonly IntegratorId[] = ['euler', 'rk2', 'rk4'];

function isSystemId(value: string): value is SystemId {
  return (SYSTEM_IDS as readonly string[]).includes(value);
}

function isIntegratorId(value: string): value is IntegratorId {
  return (INTEGRATOR_IDS as readonly string[]).includes(value);
}

/** Encodes state as a URL query string (no leading `?`). Pure, deterministic. */
export function encodeJelajahState(state: JelajahState): string {
  const search = new URLSearchParams();
  search.set('sys', state.systemId);
  search.set('int', state.integrator);
  search.set('dt', String(state.dt));
  search.set('pair', state.pairMode ? '1' : '0');
  if (state.pairMode) search.set('eps', String(state.epsilon));
  for (const [key, value] of Object.entries(state.params)) {
    search.set(`p_${key}`, String(value));
  }
  return search.toString();
}

/**
 * Decodes a URL query string into whatever fields are present and valid.
 * Unknown systems/integrators, non-finite numbers, and parameter keys that
 * don't belong to the resolved system are silently dropped rather than
 * producing a broken or partially-numeric state — a malformed or stale link
 * degrades to defaults for the fields it can't make sense of, never to NaN.
 */
export function decodeJelajahState(search: string): Partial<JelajahState> {
  const query = new URLSearchParams(search);
  const result: {
    systemId?: SystemId;
    integrator?: IntegratorId;
    dt?: number;
    pairMode?: boolean;
    epsilon?: number;
    params?: Record<string, number>;
  } = {};

  const sys = query.get('sys');
  if (sys !== null && isSystemId(sys)) result.systemId = sys;

  const integrator = query.get('int');
  if (integrator !== null && isIntegratorId(integrator)) result.integrator = integrator;

  const dt = query.get('dt');
  if (dt !== null) {
    const n = Number(dt);
    if (Number.isFinite(n) && n > 0) result.dt = n;
  }

  const pair = query.get('pair');
  if (pair === '0' || pair === '1') result.pairMode = pair === '1';

  const eps = query.get('eps');
  if (eps !== null) {
    const n = Number(eps);
    if (Number.isFinite(n) && n > 0) result.epsilon = n;
  }

  const resolvedSystemId = result.systemId ?? 'lorenz';
  const allowedKeys = new Set(Object.keys(classicSystem[resolvedSystemId].params));
  const params: Record<string, number> = {};
  let hasParams = false;
  for (const [key, value] of query.entries()) {
    if (!key.startsWith('p_')) continue;
    const paramKey = key.slice(2);
    if (!allowedKeys.has(paramKey)) continue;
    const n = Number(value);
    if (!Number.isFinite(n)) continue;
    params[paramKey] = n;
    hasParams = true;
  }
  if (hasParams) result.params = params;

  return result;
}
