// verify-1024-transfer-reuse-notice.mjs — #1024 开屏第一页「网站公告 · 关于转载与二次创作」章
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，并把「在线 notice.json 里的
//    远程公告一起清掉」。转载章原先有两份落点（在线权威源 sections[0] ＋ 离线兜底 template.html §1），
//    本批两处同批变化：①在线源 sections 整段清空（＋summary 已空、hide:true＝clock.js 见 sections 空
//    即整块隐藏公告区，联网用户不再看到开屏说明）；②离线兜底保留 §1 目录章标题（#1500c 活动哨兵守着），
//    但该章「首句完整版 + 四条要求 + 侵权声明」正文已不在（首句仅剩「开放二传二改」那一截）。
//    按仓库惯例，本脚本由「断言首章七段原文在位」改写为**删除型断言**：断言四条要求与侵权声明在两份源
//    都不得再出现（回流＝开屏精简被架空），断言在线公告区已整体清空/隐藏；同时守住幸存口径零回归——
//    §1 目录章仍在、其余目录章仍在、防未成年锁卡与 18 周岁红线仍在、品牌卡许可块仍在。
// 判据全部为静态（读 src + 产物 + build.mjs），无需浏览器（原 playwright 段随判据面收窄一并撤除，
// 本环境无 playwright 也能跑），任何环境都能跑。
// 用法：node tools/verify-1024-transfer-reuse-notice.mjs（需先 node build.mjs，本脚本同时核对产物 index.html + notice.json）
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
const build = read('build.mjs');
let notice = null, rootNotice = null;
try { notice = JSON.parse(read('src/pwa/notice.json')); } catch (e) {}
try { rootNotice = JSON.parse(read('notice.json')); } catch (e) {}

const lines = build.split('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const retired = (id) => ({
  found: lines.some((l) => l.includes("'" + id + " ") && /^\s*\/\//.test(l)),
  active: lines.some((l) => new RegExp("^\\s*\\{\\s*name:\\s*'" + esc(id) + " ").test(l))
});
const reg = (id) => lines.find((l) => l.includes("'" + id + " ") && /^\s*\{\s*name:/.test(l));

// #1024 原文（逐字；原本只落在线源 sections[0]，离线兜底已先行精简到只剩首句前半段）
const TITLE = '1、网站公告 · 关于转载与二次创作';
const LEAD_FULL = '本网站所有字卡内容遵循「开放二传二改」原则，欢迎分享与再创作。但请遵守以下要求：';
const RULES = [
  '转载或二传链接，必须保留作者署名（言序）；',
  '二次创作作品请注明「基于言序作品修改」；',
  '禁止抹除署名、伪装原创、或将内容用于恶意引流；',
  '仅分享网站聊天记录、不涉及搬运字卡的，只需标注 mochi 字卡 tag 即可。',
];
const TAIL = '未经署名转载视为侵权，作者保留追究权利。';

console.log('\n== A 删除型：转载章正文（四条要求 + 侵权声明）两份源都不得再出现 ==');
const online = notice ? JSON.stringify(notice) : '';
ok(!!notice && Array.isArray(notice.sections) && notice.sections.length === 0, 'A1 在线源 sections 已整段清空（0 章）', ((notice && notice.sections) || []).length + ' 章');
ok(!!notice && Array.isArray(notice.summary) && notice.summary.length === 0, 'A2 在线源 summary 仍为空（#1216 起整段撤除，本批未复活）', JSON.stringify((notice && notice.summary) || null).slice(0, 40));
ok(!!notice && notice.hide === true, 'A3 在线源 hide:true（clock.js 见 sections 空/hide 即整块隐藏公告区＝联网用户不再看到开屏说明）');
ok(online.indexOf('关于转载与二次创作') < 0 && online.indexOf('但请遵守以下要求') < 0 && RULES.every((r) => online.indexOf(r) < 0) && online.indexOf(TAIL) < 0, 'A4 在线源不得含转载章任何文案（标题/首句/四条/侵权声明，回流＝远程公告清空被架空）');
ok(!!rootNotice && Array.isArray(rootNotice.sections) && rootNotice.sections.length === 0 && JSON.stringify(rootNotice).indexOf(TAIL) < 0, 'A5 产物根 notice.json 同口径（sections 空且无侵权声明，改 src 未重建＝产物仍带旧章）');
ok(count(tpl, LEAD_FULL) === 0, 'A6 离线兜底不再有完整首句（「…欢迎分享与再创作。但请遵守以下要求：」）');
RULES.forEach((r, i) => ok(count(tpl, '<p class="splash-bullet">' + r + '</p>') === 0 && count(tpl, r) === 0, 'A7.' + (i + 1) + ' 离线兜底不再有转载要求第 ' + (i + 1) + ' 条'));
ok(count(tpl, '<p class="splash-item splash-hl">' + TAIL + '</p>') === 0 && count(tpl, TAIL) === 0, 'A8 离线兜底不再有侵权声明（未经署名转载视为侵权）');
ok(count(idx, LEAD_FULL) === 0 && RULES.every((r) => count(idx, r) === 0) && count(idx, TAIL) === 0, 'A9 构建产物 index.html 同样无转载章正文（改 src 未重建＝产物仍带旧章）');
ok(retired('#1500a').found && !retired('#1500a').active, 'A10 哨兵 #1500a（在线源首章＝1、网站公告 · 关于转载与二次创作）已退役（登记注释、无活动登记）');
ok(retired('#1449b').found && !retired('#1449b').active, 'A11 哨兵 #1449b（二传二改说明升为四点·在线权威源）已退役');

console.log('\n== B 幸存口径零回归（删转载章正文不许碰坏剩下的开屏）==');
ok(count(tpl, '<p class="splash-sec">' + TITLE + '</p>') === 1, 'B1 §1 目录章标题仍在离线兜底且恰好一处（目录仍可逐章翻＝#1500c 活动哨兵守卫）');
ok(count(idx, '<p class="splash-sec">' + TITLE + '</p>') === 1, 'B2 构建产物 index.html 的 §1 目录章标题同样在位');
['2、停更公告 · 2026年9月底后永久停更', '3、公告已精简 · 大量使用说明已移到「设置 → 关于」', '4、浏览器兼容提醒（安卓用户必读）', '5、iPhone 用户必读：把本站「添加到主屏幕」再用（数据会一直被清）', '14、关于后台通知相关设置（怎么开、收不到怎么办）'].forEach((t) => {
  ok(tpl.indexOf(t + '</p>') >= 0, 'B3 目录章仍在静态兜底：' + t.slice(0, 20));
});
ok(count(tpl, 'id="splash-cardlock"') === 1 && count(idx, 'id="splash-cardlock"') === 1, 'B4 防未成年人·系统内置字卡锁卡仍在（「保留防未成年人以及下面的部分」的口径落点）');
ok(count(tpl, 'id="splash-age-check"') === 1 && count(tpl, '本站禁止未满 18 周岁的未成年人使用') > 0, 'B5 18 周岁红线仍在（年龄勾选行 + 进入前公告副标题）');
ok(count(tpl, 'Mochi字卡为原创独立作品（即原版）') === 1, 'B6 #1503 起「原创独立作品（即原版）」口径仍在品牌卡许可块');
ok(count(tpl, 'class="splash-summary"') === 0 && count(idx, 'class="splash-summary"') === 0, 'B7 必读摘要块仍不存在（#1216 起整块撤除，不因本批复活）');
ok(count(tpl, '互助群公告') === 0, 'B8 #1498 起「互助群公告」章保持删除（回流＝把整章带回开屏）');
const o = count(tpl, '<!--'), c = count(tpl, '-->');
ok(o === c, 'B9 HTML 注释配平（未闭合注释会连锁打碎 .phone 结构，#301）', o + '/' + c);
ok(!!reg('#1500c'), 'B10 哨兵 #1500c（离线兜底 §1 目录章标题）仍为活动登记（未随精简退役）');
ok(!!reg('#1500d'), 'B11 哨兵 #1500d（删除型：离线兜底不得再有中文序号章标题）仍为活动登记');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-1024-transfer-reuse-notice: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
