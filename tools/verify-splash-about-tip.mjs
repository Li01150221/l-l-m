// verify-splash-about-tip.mjs — #864 开屏「公告已精简 · 使用说明请看【设置 → 关于】」指引条
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，该指引条（.splash-abouttip）
//    随必读卡组一并删除。按仓库惯例，本脚本由「断言指引条在位」改写为**删除型断言**：
//    断言指引条在「静态 src / 构建产物 / 样式（含暗色）/ build.mjs 登记表」四处都不得再出现；
//    同时守住它「指向的目标」——设置 → 关于 ·「数据与存储（重要）」5 行仍在（指引可删，被指的东西不能丢）。
// 判据全部为静态（读 src + 产物 + build.mjs），无需浏览器，任何环境都能跑。
// 用法：node tools/verify-splash-about-tip.mjs
import { readFileSync } from 'node:fs';
import { join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(dirname(fileURLToPath(import.meta.url)) + '/..');
const read = (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch (e) { return ''; } };
const count = (h, n) => (h && n ? h.split(n).length - 1 : 0);

let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x !== undefined ? '  [' + x + ']' : '')); } };

const tpl = read('src/template.html');
const idx = read('index.html');
const base = read('src/css/base.css');
const dark = read('src/css/dark.css');
const build = read('build.mjs');
let notice = null;
try { notice = JSON.parse(read('src/pwa/notice.json')); } catch (e) {}

const lines = build.split('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const retired = (id) => ({
  found: lines.some((l) => l.includes("'" + id + " ") && /^\s*\/\//.test(l)),
  active: lines.some((l) => new RegExp("^\\s*\\{\\s*name:\\s*'" + esc(id) + " ").test(l))
});

const TIP_TXT = '公告已精简：原公告里的大量使用说明已移到';

console.log('\n== A 删除型：指引条在四处均不得再出现 ==');
ok(count(tpl, 'class="splash-abouttip"') === 0 && count(tpl, 'data-about-tip') === 0, 'A1 src/template.html 不再有指引条节点（.splash-abouttip / data-about-tip）');
ok(count(tpl, TIP_TXT) === 0, 'A2 指引条定稿文案「公告已精简：原公告里的大量使用说明已移到…」已删尽（不得在开屏复述）');
ok(count(idx, 'class="splash-abouttip"') === 0 && count(idx, TIP_TXT) === 0, 'A3 构建产物 index.html 同样无指引条（改 src 未重建＝产物仍带旧条）');
ok(count(base, '.splash-abouttip') === 0 && count(dark, '.splash-abouttip') === 0, 'A4 base.css / dark.css 指引条样式（含暗色变体）已删尽');
ok(retired('#864a').found && !retired('#864a').active, 'A5 哨兵 #864a（指引条在位）已退役（登记注释、无活动登记）');
ok(retired('#864b').found && !retired('#864b').active, 'A6 哨兵 #864b（指引条样式在位）已退役');

console.log('\n== B 被测目标不能丢：设置 → 关于 ·「数据与存储（重要）」5 行仍在 ==');
ok(count(tpl, 'id="about-storage-note"') === 1, 'B1 设置 → 关于 ·「数据与存储（重要）」块仍在 template.html');
['lose', 'perm', 'incog', 'backup', 'bug'].forEach((k) => {
  ok(count(tpl, 'id="row-faq-st-' + k + '"') === 1, 'B2 该 5 行之一仍在：row-faq-st-' + k);
});

console.log('\n== C 在线/离线两份口径 ==');
// 在线权威源 notice.json：本批把远程公告 sections 清空（作者直派「把在线 notice.json 里的远程公告一起清掉」），
// 「公告已精简」章随之不再由在线源承担——离线兜底 template.html 仍保留该章（见 C3）。
ok(Array.isArray(notice && notice.summary) && notice.summary.length === 0, 'C1 在线 summary 仍为空（#1216 起整段撤除，本批未复活）', JSON.stringify((notice && notice.summary) || null).slice(0, 40));
ok(Array.isArray(notice && notice.sections) && notice.sections.every((x) => String(x.h).indexOf('公告已精简') < 0), 'C2 在线源不再有「公告已精简」章（远程公告已清空；回流＝联网用户又看到半块开屏说明）');
ok(count(tpl, '公告已精简 · 大量使用说明已移到') === 1, 'C3 离线兜底 template.html 仍保留「公告已精简」章（断网用户的可读兜底，未随在线源一起清）');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-splash-about-tip: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
