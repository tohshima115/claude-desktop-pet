// assets/svg/<表情>.svg を、mod が読む hooks/chibi.ts にまとめる。
// 使い方: node tools/build-chibi.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const moods = ['normal', 'happy', 'worried', 'troubled', 'serious'];
const LIMIT = 131072; // Claude Code の Svg 要素が受け付ける最大文字数

let out = '// assets/svg/<表情>.svg から tools/build-chibi.mjs で生成。手で編集しない\n';
out += 'export const chibiSvgs = {\n';
for (const mood of moods) {
  const svg = readFileSync(join(root, 'assets/svg', `${mood}.svg`), 'utf8');
  if (svg.length > LIMIT) {
    throw new Error(`${mood}.svg is ${svg.length} chars, over ${LIMIT}. Run tools/optimize-svg.mjs first.`);
  }
  out += `  ${mood}: ${JSON.stringify(svg)},\n`;
}
out += '} as const\n\nexport type ChibiMood = keyof typeof chibiSvgs\n';

writeFileSync(join(root, 'mod/kurato-ai/hooks/chibi.ts'), out);
console.log(`wrote mod/kurato-ai/hooks/chibi.ts (${out.length} chars)`);
