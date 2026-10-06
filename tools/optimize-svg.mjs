// Magnific の images_to_svg の出力を、Claude Code の Svg 要素の上限（131,072 文字）に収まるよう軽くする。
// 使い方: node optimize-svg.mjs <in.svg> <out.svg> [--keep-bg] [--scale=0.5]
import { readFileSync, writeFileSync } from 'node:fs';

const [, , input, output, ...flags] = process.argv;
const keepBg = flags.includes('--keep-bg');
const scaleFlag = flags.find(f => f.startsWith('--scale='));
const scale = scaleFlag ? Number(scaleFlag.split('=')[1]) : 0.5;

let svg = readFileSync(input, 'utf8');

const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
const w = Math.round(Number(vb[1]) * scale);
const h = Math.round(Number(vb[2]) * scale);

const round = s => s.replace(/-?\d+(\.\d+)?(e-?\d+)?/g, n => String(Math.round(Number(n) * scale)));
const hex = (r, g, b) => '#' + [r, g, b].map(v => Number(v).toString(16).padStart(2, '0')).join('');

// 背景の全面矩形（最初の path）を消す
if (!keepBg) {
  svg = svg.replace(/<path[^>]*d="M 0 0 L \d+ 0 L \d+ \d+ L 0 \d+ L 0 0 z"\/>/, '');
}

svg = svg
  .replace(/ transform="translate\(0,0\)"/g, '')
  .replace(/ class="stop\d+"/g, '')
  .replace(/ stop-opacity="1"/g, '')
  .replace(/rgb\((\d+),(\d+),(\d+)\)/g, (_, r, g, b) => hex(r, g, b))
  .replace(/ d="([^"]*)"/g, (_, d) => ` d="${round(d).replace(/ ?([MLCQZz]) ?/g, '$1').replace(/ -/g, '-')}"`)
  .replace(/ (x1|y1|x2|y2|cx|cy|r|fx|fy)="([^"]*)"/g, (_, k, v) => ` ${k}="${round(v)}"`)
  .replace(/ transform="translate\(([^)]*)\)"/g, (_, v) => ` transform="translate(${round(v)})"`)
  .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`)
  .replace(/>\s+</g, '><')
  .trim();

writeFileSync(output, svg);
console.log(`${input}: ${readFileSync(input, 'utf8').length} -> ${svg.length} chars (viewBox ${w}x${h})`);
