import { describe, expect, it } from 'vitest';
import { decodeJelajahState, encodeJelajahState, type JelajahState } from '../../lib/permalink';

describe('permalink', () => {
  it('round-trips a full state', () => {
    const state: JelajahState = {
      systemId: 'rossler',
      params: { a: 0.15, b: 0.2, c: 5.7 },
      integrator: 'rk2',
      dt: 0.01,
      pairMode: true,
      epsilon: 1e-6,
    };
    const decoded = decodeJelajahState(encodeJelajahState(state));
    expect(decoded).toEqual(state);
  });

  it('omits epsilon when pairMode is off, and decode reflects that', () => {
    const state: JelajahState = {
      systemId: 'lorenz',
      params: { sigma: 10, rho: 28, beta: 8 / 3 },
      integrator: 'rk4',
      dt: 0.005,
      pairMode: false,
      epsilon: 1e-8,
    };
    const search = encodeJelajahState(state);
    expect(search).not.toContain('eps=');
    const decoded = decodeJelajahState(search);
    expect(decoded.epsilon).toBeUndefined();
  });

  it('drops an unknown system id rather than accepting it', () => {
    const decoded = decodeJelajahState('sys=notasystem&int=rk4&dt=0.005');
    expect(decoded.systemId).toBeUndefined();
    expect(decoded.integrator).toBe('rk4');
  });

  it('drops non-finite or non-positive numeric fields', () => {
    const decoded = decodeJelajahState('dt=-1&eps=NaN&p_sigma=notanumber');
    expect(decoded.dt).toBeUndefined();
    expect(decoded.epsilon).toBeUndefined();
    expect(decoded.params).toBeUndefined();
  });

  it('drops parameter keys that do not belong to the resolved system', () => {
    const decoded = decodeJelajahState('sys=lorenz&p_a=1&p_sigma=10');
    expect(decoded.params).toEqual({ sigma: 10 });
  });

  it('decodes an empty string to an empty object', () => {
    expect(decodeJelajahState('')).toEqual({});
  });
});
