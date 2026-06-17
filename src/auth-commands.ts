// FILE-AUTH-COMMANDS — local credential commands for the `pyramid` bin
// (DOC-CREDENTIAL-STORAGE). These manage the keychain-stored API key and make NO
// network call, so bin/pyramid.ts dispatches to them BEFORE config load (you can
// store a key without already having one). config.ts later READS the key.
//
//   pyramid set-key <pyk_...>   store a pasted key   (aliases: set-api-key, set-token)
//   pyramid show-key            show the stored key, masked
//   pyramid logout              clear the stored key
//   pyramid login               reserved for the future browser flow (FLOW-CLI-BROWSER-LOGIN)
//
// Each handler returns a process exit code; bin owns process.exit. Output goes to
// the injected `out` (stderr in production). The full secret is NEVER printed.

import { deleteKey, getKey, setKey } from './keychain.js';

/** Injected side effects, so handlers are unit-testable without the keychain. */
export interface AuthIO {
  out: (line: string) => void;
  getKey: () => string | null;
  setKey: (key: string) => void;
  deleteKey: () => void;
}

const realIO: AuthIO = {
  out: (line) => process.stderr.write(`${line}\n`),
  getKey,
  setKey,
  deleteKey,
};

/**
 * Mask a `pyk_<prefix>_<secret>` key for display: keep the non-secret prefix,
 * hide the secret (show only its last 4). Never reveals the full secret.
 */
export function maskKey(key: string): string {
  const m = /^pyk_([^_]+)_(.+)$/.exec(key);
  if (!m) return 'pyk_…';
  return `pyk_${m[1]}_…${m[2].slice(-4)}`;
}

/** `pyramid set-key <pyk_...>` — store a pasted key in the OS keychain. */
export function runSetKey(argv: string[], io: AuthIO = realIO): number {
  const key = argv[1]?.trim();
  if (!key) {
    io.out('usage: pyramid set-key <pyk_...>');
    return 2;
  }
  if (!key.startsWith('pyk_')) {
    io.out(
      'That does not look like a Pyramid key (it must start with "pyk_"). ' +
        'Generate one in Pyramid → Settings → API Keys.',
    );
    return 1;
  }
  io.setKey(key);
  io.out(
    `Saved ${maskKey(key)} to the OS keychain — the MCP and CLI will use it automatically.`,
  );
  return 0;
}

/** `pyramid show-key` — print the stored key, masked (or that none is stored). */
export function runShowKey(_argv: string[], io: AuthIO = realIO): number {
  const key = io.getKey();
  if (!key) {
    io.out('No Pyramid key stored. Run `pyramid set-key <pyk_...>` to save one.');
    return 0;
  }
  io.out(`Stored Pyramid key: ${maskKey(key)} (OS keychain).`);
  return 0;
}

/** `pyramid logout` — clear the stored key. Idempotent. */
export function runLogout(_argv: string[], io: AuthIO = realIO): number {
  io.deleteKey();
  io.out('Cleared the stored Pyramid key from the OS keychain.');
  return 0;
}

/** `pyramid login` — reserved for the future browser flow (FLOW-CLI-BROWSER-LOGIN). */
export function runLogin(_argv: string[], io: AuthIO = realIO): number {
  io.out(
    'Browser login is coming soon. For now: generate a key in Pyramid → ' +
      'Settings → API Keys, then run `pyramid set-key <pyk_...>`.',
  );
  return 0;
}

/** Command name -> handler, including aliases. Consumed by bin/pyramid.ts. */
export const AUTH_COMMANDS: Record<string, (argv: string[]) => number> = {
  'set-key': runSetKey,
  'set-api-key': runSetKey,
  'set-token': runSetKey,
  'show-key': runShowKey,
  logout: runLogout,
  login: runLogin,
};
