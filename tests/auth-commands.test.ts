// Unit tests for the local credential commands (FILE-AUTH-COMMANDS). Side effects
// are injected via a fake AuthIO, so NO real keychain / `security` call happens.

import { describe, it, expect } from 'vitest';

import {
  AUTH_COMMANDS,
  maskKey,
  runLogout,
  runSetKey,
  runShowKey,
} from '../src/auth-commands.js';

const KEY = 'pyk_ab23cd45_0123456789abcdef0123456789abcdef';
const SECRET = '0123456789abcdef0123456789abcdef';

function fakeIO(stored: string | null = null) {
  const lines: string[] = [];
  let key = stored;
  return {
    io: {
      out: (l: string) => lines.push(l),
      getKey: () => key,
      setKey: (k: string) => {
        key = k;
      },
      deleteKey: () => {
        key = null;
      },
    },
    lines,
    get stored() {
      return key;
    },
  };
}

describe('maskKey', () => {
  it('keeps the prefix, hides the secret, shows the last 4', () => {
    expect(maskKey(KEY)).toBe('pyk_ab23cd45_…cdef');
  });
  it('never reveals the full secret', () => {
    expect(maskKey(KEY)).not.toContain(SECRET);
  });
  it('degrades gracefully on a malformed key', () => {
    expect(maskKey('garbage')).toBe('pyk_…');
  });
});

describe('runSetKey', () => {
  it('stores a valid key and returns 0', () => {
    const f = fakeIO();
    expect(runSetKey(['set-key', KEY], f.io)).toBe(0);
    expect(f.stored).toBe(KEY);
    expect(f.lines.join(' ')).toContain('keychain');
  });
  it('does NOT store and returns 1 on a non-pyk_ value', () => {
    const f = fakeIO();
    expect(runSetKey(['set-key', 'sk_live_nope'], f.io)).toBe(1);
    expect(f.stored).toBeNull();
  });
  it('returns 2 (usage) when no key is given', () => {
    const f = fakeIO();
    expect(runSetKey(['set-key'], f.io)).toBe(2);
  });
  it('does not print the full secret in the confirmation', () => {
    const f = fakeIO();
    runSetKey(['set-key', KEY], f.io);
    expect(f.lines.join(' ')).not.toContain(SECRET);
  });
});

describe('runShowKey', () => {
  it('reports no key when none is stored', () => {
    const f = fakeIO(null);
    expect(runShowKey(['show-key'], f.io)).toBe(0);
    expect(f.lines.join(' ')).toMatch(/No Pyramid key/i);
  });
  it('shows the masked key when one is stored (never the full secret)', () => {
    const f = fakeIO(KEY);
    runShowKey(['show-key'], f.io);
    expect(f.lines.join(' ')).toContain('pyk_ab23cd45_…cdef');
    expect(f.lines.join(' ')).not.toContain(SECRET);
  });
});

describe('runLogout', () => {
  it('clears the stored key and returns 0', () => {
    const f = fakeIO(KEY);
    expect(runLogout(['logout'], f.io)).toBe(0);
    expect(f.stored).toBeNull();
  });
});

describe('AUTH_COMMANDS', () => {
  it('routes set-key, set-api-key and set-token to the same handler', () => {
    expect(AUTH_COMMANDS['set-api-key']).toBe(AUTH_COMMANDS['set-key']);
    expect(AUTH_COMMANDS['set-token']).toBe(AUTH_COMMANDS['set-key']);
  });
  it('exposes show-key, logout and login', () => {
    expect(typeof AUTH_COMMANDS['show-key']).toBe('function');
    expect(typeof AUTH_COMMANDS['logout']).toBe('function');
    expect(typeof AUTH_COMMANDS['login']).toBe('function');
  });
});
