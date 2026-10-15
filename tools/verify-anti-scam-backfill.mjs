// verify-anti-scam-backfill.mjs — #148 防骗+署名禁倒卖声明「运行时回填」（防倒卖核心机制）
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，开屏顶部那张
//    「免费 · 署名 · 防倒卖」合并置顶卡（data-anti-scam="1"）连同 #976 必读卡组一并删除。
//    回填/兜底若不一起停用，就会在运行时把删掉的卡重建回必读区最顶——所以本批把三处同批停用：
//    ① 静态卡（template.html），② clock.js 的 ensureBar(BARS[0], null) 运行时回填，③ pwa.js 的 5s 看门狗。
//    按仓库惯例，本脚本由「断言回填会把卡补回来」改写为**删除型断言**：断言回填/看门狗已停用、
//    卡不得被运行时重建；同时守住未删的存续机制（设置页底部声明重建 ensureSettings、远程时效公告
//    ensureBulletin、在线源 alert/alert2 声明文案）。
// 判据全部为静态（读 src + 产物 + build.mjs），无需浏览器，任何环境都能跑。
// 用法：node tools/verify-anti-scam-backfill.mjs（需先 node build.mjs，本脚本同时核对产物）
import { readFileSync } from 'node:fs';
import { join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(dirname(fileURLToPath(import.meta.url)) + '/..');
const read = (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch (e) { return ''; } };
const count = (h, n) => (h && n ? h.split(n).length - 1 : 0);
// 只数「活动行」：过滤掉整行注释（行首可选空白后是 //）
const activeLines = (src, needle) => src.split('\n').filter((l) => l.indexOf(needle) >= 0 && !/^\s*\/\//.test(l));

let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x !== undefined ? '  [' + x + ']' : '')); } };

const tpl = read('src/template.html');
// 去注释版：墓碑注释（如 #613/#621 那条）会提到已删卡标题，标题判据须只看活 DOM
const tplNoComment = tpl.replace(/<!--[\s\S]*?-->/g, '');
const idx = read('index.html');
const clockSrc = read('src/js/clock.js');
const clockOut = read('js/clock.js');
const pwaSrc = read('src/js/pwa.js');
const build = read('build.mjs');
let notice = null, rootNotice = null;
try { notice = JSON.parse(read('src/pwa/notice.json')); } catch (e) {}
try { rootNotice = JSON.parse(read('notice.json')); } catch (e) {}

const lines = build.split('\n');
// 按「哨兵名里的独特短语」判定退役：注释行里出现过该短语、且没有活动登记行出现过该短语。
// （#613/#621 各有多条登记，只用编号会误判到仍在役的那条，故必须用短语。）
const retiredPhrase = (frag) => ({
  found: lines.some((l) => l.includes(frag) && /^\s*\/\//.test(l)),
  active: lines.some((l) => l.includes(frag) && /^\s*\{\s*name:/.test(l))
});

console.log('\n== A 删除型：防倒卖卡不得被运行时重建（三处同批停用）==');
ok(count(tplNoComment, 'data-anti-scam="1"') === 0 && count(tplNoComment, '免费 · 署名 · 防倒卖') === 0, 'A1 静态卡已删（活 DOM 无 data-anti-scam="1"、「免费 · 署名 · 防倒卖」标题；墓碑注释不算）');
ok(activeLines(clockSrc, 'ensureBar(BARS[0]').length === 0, 'A2 clock.js 不再回填（无活动的 ensureBar(BARS[0], null) 调用；仅存注释）');
ok(activeLines(clockOut, 'ensureBar(BARS[0]').length === 0, 'A3 构建产物 js/clock.js 同样无活动回填调用（改 src 未重建＝产物仍会重建卡）');
ok(count(pwaSrc, 'mkWatchBar') === 0, 'A4 pwa.js 5s 看门狗（第二锚点 mkWatchBar）已整块移除');
ok(count(idx, 'mkWatchBar') === 0, 'A5 构建产物 index.html（pwa.js 内联）同样无看门狗');
ok(retiredPhrase('防骗卡重建锚点').found && !retiredPhrase('防骗卡重建锚点').active, 'A6a 哨兵 #613（clock.js 回填锚点＝公告区最顶）已退役（注释退役、无活动登记）');
ok(retiredPhrase('pwa.js 看门狗补回合并声明卡也落到公告区最顶').found && !retiredPhrase('pwa.js 看门狗补回合并声明卡也落到公告区最顶').active, 'A6b 哨兵 #621（pwa.js 看门狗补回合并卡）已退役');

console.log('\n== B 存续机制零回归（不属开屏卡，未删，须仍在）==');
ok(count(clockSrc, 'ensureSettings();') === 1 && count(clockSrc, 'ensureBulletin();') === 1, 'B1 clock.js 仍调用 ensureSettings() 与 ensureBulletin()（设置页声明 + 远程时效公告）');
ok(count(tpl, 'class="set-alert"') >= 1, 'B2 设置页底部防骗声明块仍在 template.html');
ok(activeLines(clockSrc, "texts['alert']").length >= 1 && activeLines(clockSrc, "texts['alert2']").length >= 1, 'B3 设置页声明仍按在线源 alert/alert2 拼接（在线源改文案仍能生效）');
ok(activeLines(clockSrc, 'd.bulletin').length >= 1, 'B4 远程时效公告链路（notice.json.bulletin）仍在');
ok(!!notice && /个人出资和花费时间搭建的。开放二传二改但禁止以盈利为目的。Mochi字卡网站完全免费。/.test(notice.alert || ''), '#613 在线源 notice.json.alert 仍含免费声明句（哨兵仍活动，未被本批误伤）');
ok(!!notice && /必须标注作者署名：小红书 @言序（1842523578），禁止删除或修改。/.test(notice.alert2 || ''), '#621 在线源 notice.json.alert2 仍含署名禁倒卖句');
ok(!!rootNotice && rootNotice.sections && rootNotice.sections.length === 0 && rootNotice.hide === true, 'B5 根产物 notice.json 的远程公告已清空并 hide（与 src/pwa/notice.json 同步）');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-anti-scam-backfill: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
