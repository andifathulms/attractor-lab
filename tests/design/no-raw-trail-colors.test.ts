import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Canvas 2D fillStyle/strokeStyle can't read Tailwind tokens, which is
// exactly how five components ended up with their own copies of the same
// rgba trail colours (lib/render/trail-colors.ts). This asserts no
// component reintroduces a raw rgba()/rgb() literal instead of importing
// TRAIL_COLORS.
const COMPONENTS_DIR = join(__dirname, '..', '..', 'components');
const RGB_LITERAL = /\brgba?\(/;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...listSourceFiles(path));
    } else if (extname(path) === '.ts' || extname(path) === '.tsx') {
      files.push(path);
    }
  }
  return files;
}

describe('no raw rgba()/rgb() literals in components/', () => {
  const files = listSourceFiles(COMPONENTS_DIR);

  it('found at least one component file to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has no rgba()/rgb() literal', (file) => {
    const source = readFileSync(file, 'utf8');
    expect(RGB_LITERAL.test(source)).toBe(false);
  });
});
