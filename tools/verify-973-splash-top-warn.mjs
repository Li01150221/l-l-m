// verify-973-splash-top-warn.mjs — #973 开屏最顶端「使用前必看」标红提醒卡
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，该红卡（.splash-bigwarn）与
//    #976 必读卡组里的 7 张卡一并删除。按仓库惯例，本脚本由「断言红卡在位」改写为**删除型断言**：
//    断言红卡在「静态 src / 构建产物 / 样式 / build.mjs 登记表」四处都不得再出现（回流＝精简被架空），
//    同时守住剩下的开屏骨架（防未成年锁卡 / 品牌卡 / 公告目录 / 底部固定区 / 进入门控）零回归——
//    防线不退役，只换判据方向。
// 判据全部为静态（读 src + 产物 + build.mjs），无需浏览器，任何环境都能跑。
// 用法：node tools/verify-973-splash-top-warn.mjs
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

// 哨兵登记：退役＝该编号的登记行被注释（前缀 // [开屏精简批 2026-10-15 退役]），且不存在活动登记行
// （活动行形态＝行首可选空白后紧跟 `{ name: '…'`，被注释的行以 `//` 开头，两者可区分）。
const lines = build.split('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const retired = (id) => ({
  found: lines.some((l) => l.includes("'" + id + " ") && /^\s*\/\//.test(l)),
  active: lines.some((l) => new RegExp("^\\s*\\{\\s*name:\\s*'" + esc(id) + " ").test(l))
});

console.log('\n== A 删除型：红卡在四处均不得再出现 ==');
ok(count(tpl, 'class="splash-bigwarn"') === 0, 'A1 src/template.html 不再有红卡节点（class="splash-bigwarn"）');
ok(count(tpl, 'data-content-warn') === 0, 'A2 src/template.html 不再有红卡标记（data-content-warn）');
ok(count(tpl, '使用前必看') === 0, 'A3 红卡定稿标题「使用前必看 · 本站内容非常多」已删尽（不得在卡/摘要/注释外复述）');
ok(count(idx, 'class="splash-bigwarn"') === 0 && count(idx, '使用前必看') === 0, 'A4 构建产物 index.html 同样无红卡（改 src 未重建＝产物仍带旧卡）');
ok(count(base, '.splash-bigwarn') === 0 && count(dark, '.splash-bigwarn') === 0, 'A5 base.css / dark.css 红卡样式（含暗色变体）已删尽（残留＝徒增死样式）');
ok(retired('#973a').found && !retired('#973a').active, 'A6 哨兵 #973a（红卡挂在 .splash-box 首个子节点）已退役（登记注释、无活动登记）');
ok(retired('#973b').found && !retired('#973b').active, 'A7 哨兵 #973b（红卡红色形态）已退役');
ok(retired('#973c').found && !retired('#973c').active, 'A8 哨兵 #973c（红卡暗色主题）已退役');

console.log('\n== B 幸存骨架零回归（删卡不许碰坏剩下的开屏）==');
ok(count(tpl, 'class="splash-mustread"') === 1 && count(idx, 'class="splash-mustread"') === 1, 'B1 必读卡组容器 #splash-mustread 仍在');
ok(count(tpl, 'id="splash-cardlock"') === 1 && count(idx, 'id="splash-cardlock"') === 1, 'B2 防未成年人·系统内置字卡锁卡仍在（精简后必读组仅存这一张）');
ok(count(tpl, 'class="splash-brandcard"') === 1 && count(tpl, 'id="splash-notice"') === 1, 'B3 品牌卡与公告目录仍在');
ok(count(tpl, 'class="splash-footcard"') === 1, 'B4 底部固定区（含进入按钮）仍在');
ok(count(tpl, 'id="splash-enter"') === 1 && count(idx, 'id="splash-enter"') === 1, 'B5 进入按钮 #splash-enter 仍在（「滑到底才能进入」门控的物质基础）');
ok(count(tpl, 'id="splash-age-check"') === 1 && count(idx, 'id="splash-age-check"') === 1, 'B6 年龄确认勾选 #splash-age-check 仍在（#315 的 18 周岁红线落点）');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-973-splash-top-warn: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
