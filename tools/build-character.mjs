// characters/<キャラ>/ の character.json と svg/*.svg を、mod が読む hooks/character.ts にまとめる。
// 使い方: node tools/build-character.mjs characters/simple-pet
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = 131072; // Claude Code の Svg 要素が受け付ける最大文字数

const dirArg = process.argv[2];
if (dirArg === undefined) {
  console.error('usage: node tools/build-character.mjs characters/<name>');
  process.exit(1);
}
const dir = resolve(dirArg);
const config = JSON.parse(readFileSync(join(dir, 'character.json'), 'utf8'));

const fail = message => {
  console.error(`${basename(dir)}: ${message}`);
  process.exit(1);
};

const svgDir = join(dir, 'svg');
if (!existsSync(svgDir)) {
  fail('svg/ folder is missing');
}
const svgs = {};
for (const file of readdirSync(svgDir).filter(f => f.endsWith('.svg')).sort()) {
  const svg = readFileSync(join(svgDir, file), 'utf8').trim();
  if (svg.length > LIMIT) {
    fail(`svg/${file} is ${svg.length} chars, over ${LIMIT}. Run tools/optimize-svg.mjs first.`);
  }
  svgs[basename(file, '.svg')] = svg;
}

const used = ['normal', config.workingMood, config.errorMood, ...config.moods.map(m => m.mood)];
for (const mood of used) {
  if (svgs[mood] === undefined) {
    fail(`svg/${mood}.svg is missing (named in character.json)`);
  }
}
for (const { tool } of config.activities) {
  new RegExp(tool); // 書き間違えた正規表現は、ここで止める
}

const character = { ...config, svgs };
const out =
  `// ${dirArg.replace(/\\/g, '/')} から tools/build-character.mjs で生成。手で編集しない\n` +
  `import type { Character } from '../types'\n\n` +
  `export const character: Character = ${JSON.stringify(character, null, 2)}\n`;

writeFileSync(join(root, 'mod/desktop-pet/hooks/character.ts'), out);
console.log(`built ${config.name} (${Object.keys(svgs).join(', ')}) into mod/desktop-pet/hooks/character.ts`);
