// verify-976-splash-order-colors.mjs — #976 开屏「颜色太乱 / 内容也很乱」优化
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，#976 当年搬进 #splash-mustread
//    的 7 张必读卡（防倒卖/公告已精简/备份提醒/数据不互通/停更公告/使用前提/免责声明）整组删除，
//    该组现仅存「防未成年人·系统内置字卡锁」一张。按仓库惯例，本脚本由「组内 8 张齐全有序 + 四色语义」
//    改写为**删除型断言**：断言那 7 张卡及其橙/红/琥珀/灰配色不得回流，锁卡的琥珀形态保留；
//    目录各章（另两份口径的落点）与回填宿主兜底（#976e）仍守。
// 判据全部为静态（读 src + 产物 + build.mjs），无需浏览器，任何环境都能跑。
// 用法：node tools/verify-976-splash-order-colors.mjs
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
const build = read('build.mjs');

const lines = build.split('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const retired = (id) => ({
  found: lines.some((l) => l.includes("'" + id + " ") && /^\s*\/\//.test(l)),
  active: lines.some((l) => new RegExp("^\\s*\\{\\s*name:\\s*'" + esc(id) + " ").test(l))
});

// 必读卡组区间：从 #splash-mustread 开标签到品牌卡开标签之间的那段
const a = tpl.indexOf('id="splash-mustread"');
const b = tpl.indexOf('class="splash-brandcard"');
const group = (a >= 0 && b > a) ? tpl.slice(a, b) : '';
console.log('必读卡组区间长度 = ' + group.length + ' 字符');

console.log('\n== A 删除型：7 张必读卡不得回流，组内只剩锁卡 ==');
ok(count(tpl, 'class="splash-mustread"') === 1, 'A1 必读卡组容器 #splash-mustread 仍在');
ok(count(group, 'class="splash-alert ') === 1, 'A2 组内恰好 1 张卡（锁卡；回流任意一张旧必读卡都会 >1。带尾空格＝只数卡本体，不误数 .splash-alert-t 标题）', 'n=' + count(group, 'class="splash-alert '));
ok(count(group, 'id="splash-cardlock"') === 1, 'A3 组内唯一那张＝防未成年人·系统内置字卡锁 #splash-cardlock');
[
  ['data-anti-scam="1"', '防倒卖（免费 · 署名 · 防倒卖）'],
  ['data-anti-scam="w"', '使用前提'],
  ['data-anti-scam="d"', '免责声明'],
  ['data-about-tip', '公告已精简指引条'],
  ['data-backup-warn', '备份提醒'],
  ['data-store-split', '数据不互通'],
  ['data-stop-update', '停更公告'],
  ['data-browser-warn', '安卓浏览器'],
  ['data-ios-home', 'iPhone 装主屏幕'],
  ['class="splash-bigwarn"', '#973 顶卡']
].forEach(([needle, name]) => {
  ok(count(group, needle) === 0 && count(tpl, needle) === 0 && count(idx, needle) === 0, 'A4 已删卡不再出现：' + name + '（' + needle + '）');
});

console.log('\n== B 配色：四色语义收敛后只剩锁卡琥珀 ==');
ok(count(base, '.splash-alert.splash-cardlock') > 0 && count(base, '#c07f1f') > 0, 'B1 锁卡琥珀形态（需要你操作）仍在 base.css');
['.splash-alert.splash-disclaimer', '.splash-stopupdate', '.splash-abouttip', '.splash-alert.splash-backup', '.splash-alert.splash-storesplit'].forEach((sel) => {
  ok(count(base, sel) === 0, 'B2 已删卡的专属样式已清尽：' + sel);
});
ok(count(base, 'border-left:4px solid #d23430') === 0, 'B3 红卡竖条样式 #d23430 已随红卡删除（回流＝红又成为一处强调色）');

console.log('\n== C 幸存口径零回归 ==');
ok(count(tpl, '系统内置字卡已全部锁定') === 1, 'C1 锁卡的解锁提示正文仍在 template.html');
// 目录（公告第一页）是「公告已精简 / 停更公告 / 安卓 / iPhone」四口径撤卡后的另一处落点，静态兜底仍须在
['1、网站公告 · 关于转载与二次创作', '2、停更公告 · 2026年9月底后永久停更', '3、公告已精简 · 大量使用说明已移到「设置 → 关于」', '4、浏览器兼容提醒（安卓用户必读）', '5、iPhone 用户必读'].forEach((t) => {
  ok(tpl.indexOf('<p class="splash-sec">' + t) >= 0, 'C2 目录章仍在静态兜底：' + t.slice(0, 16));
});
ok(count(tpl, 'class="splash-summary"') === 0, 'C3 必读摘要块仍不存在（#1216 起整块撤除，不因本批复活）');
ok(retired('#976c').found && !retired('#976c').active, 'C4 哨兵 #976c（停更公告须知橙）已退役');
ok(retired('#976g').found && !retired('#976g').active, 'C5 哨兵 #976g（免责声明保留红）已退役');
ok(retired('#1536a').found && !retired('#1536a').active, 'C6 哨兵 #1536a（备份提醒卡）已退役');
ok(retired('#1536b').found && !retired('#1536b').active, 'C7 哨兵 #1536b（数据不互通卡）已退役');
// #976e：回填宿主兜底（splashHost 仍认 #splash-mustread 回退 #splash-notice）——留作幸存口径
const hostLine = lines.find((l) => l.includes("'#976e ") && /^\s*\{\s*name:/.test(l));
ok(!!hostLine, 'C8 哨兵 #976e（回填宿主兜底＝splashHost 认必读组/回退公告卡）仍为活动登记（bulletin 仍靠它找宿主）');
ok(count(read('src/js/clock.js'), "getElementById('splash-mustread') || document.getElementById('splash-notice')") === 1, 'C9 #976e 的 needle 在 src/js/clock.js 仍命中（宿主兜底没被删）');
ok(retired('#976f').found && !retired('#976f').active, 'C10 哨兵 #976f（5s 看门狗作用域）已退役');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-976-splash-order-colors: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
