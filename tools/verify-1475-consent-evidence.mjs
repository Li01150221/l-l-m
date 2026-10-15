// verify-1475-consent-evidence.mjs — #1475 免责声明同意存证＋标准条款批
// —— 2026-10-15「开屏精简批」退役改口：作者直派「开屏内容大规模删减」，开屏第一页那张
//    「免责声明」卡（data-anti-scam="d" / .splash-disclaimer）整块删除。该卡的**标准条款文字并未丢**
//    ——#1453 起完整免责声明已常驻「设置 → 关于」（.gs-sub#about-disclaimer-sub，原卡即它的开屏镜像），
//    故本批把「条款在位」的 anchor 由**已删的开屏卡**平移到**存续的设置→关于同源块**（措辞有意微差，
//    needle 随落点改口），并把开屏卡本身改成**删除型断言**（不得回流）。
//    同意存证机制（clock.js 版本常量/JSON 写入/版本比对闸 + 开屏勾选闸门）与开屏卡无关，本批未动，仍全判。
// 判据面：
//   A 静态锚（构建产物 js/clock.js / index.html / README.md / js/contacts.js）：存证三件套
//     ＋免责条款在「设置 → 关于」同源块在位（re-anchor）＋四处同源同步＋开屏免责卡删除（删除型）。
//   B 行为面（可选，无头 Chromium 真跑开屏闸门；playwright 不可用则跳过，判据不影响静态结论）：
//     B0 开屏免责卡不存在（删除型）；B1 空记录＝未勾；B2 旧格式 '1'＝未勾；B3 旧版本 JSON＝未勾；
//     B4 当前版本 JSON＝自动勾上；B5 勾选动作落库存证 JSON（v＝当前版本、t＝时间戳）。
// 用法：node tools/verify-1475-consent-evidence.mjs（MOCHI_SERVE_ROOT= 指定仓外副本根）
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = normalize(dirname(fileURLToPath(import.meta.url)) + '/..');
const root = normalize(process.env.MOCHI_SERVE_ROOT || here);
const read = (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch (e) { return ''; } };
const count = (h, n) => (h && n ? h.split(n).length - 1 : 0);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const srv = createServer((req, res) => {
  try {
    const p = normalize(join(root, decodeURIComponent(req.url.split('?')[0])));
    if (!p.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const body = readFileSync(p);
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
console.log('serve root = ' + root);

let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x !== undefined ? '  [' + x + ']' : '')); } };

const AGE_KEY = 'xy-home-v2:age-confirmed';
const AGE_VER = '2026-09-30';
const build = read('build.mjs');
const bLines = build.split('\n');
const retiredPhrase = (frag) => ({
  found: bLines.some((l) => l.includes(frag) && /^\s*\/\//.test(l)),
  active: bLines.some((l) => l.includes(frag) && /^\s*\{\s*name:/.test(l))
});

console.log('\n== A 静态锚 ==');
const clk = read('js/clock.js');
ok(clk.includes("const AGE_VER = '2026-09-30';"), 'A1 clock.js 声明版本常量在位（＝免责声明「最后更新」日期）');
ok(clk.includes('JSON.stringify({ t: Date.now(), v: AGE_VER })'), 'A2 同意存证写入口（勾选时间戳＋版本，不再是裸 1）');
ok(clk.includes('ageOk = !!(obj && obj.v === AGE_VER);'), 'A3 版本比对闸（改版后旧确认自动失效）');
ok(!clk.includes("localStorage.getItem(AGE_KEY) === '1'"), 'A4 旧裸 1 判据已退役');

const idx = read('index.html');
// 免责条款落点已由「开屏免责卡」平移到「设置 → 关于」的 .gs-sub（#1453）；needle 随落点的微差措辞改口。
ok(idx.includes('id="about-disclaimer-sub"'), 'A5 免责声明完整版常驻「设置 → 关于」同源块（.gs-sub，开屏卡的存续镜像）');
ok(idx.includes('由使用者本人自行承担、自行负责'), 'A6 「后果由使用者本人自行承担、自行负责」强化措辞在位');
ok(idx.includes('无论基于何种原因（包括但不限于违约、侵权或其他事由）'), 'A7 「无论基于何种原因」最大范围免责在位');
ok(idx.includes('作者未因你的使用收取任何费用或对价'), 'A8 免费无对价情节在位');
ok(idx.includes('不作任何形式的明示或默示保证（持续可用'), 'A9 「按现状提供＋无担保」条款在位');
ok(idx.includes('因第三方托管服务（如 GitHub Pages）'), 'A10 第三方托管免责在位');
ok(idx.includes('本声明任何条款被认定全部或部分无效的，不影响其余条款的效力'), 'A11 可分割性条款在位');
ok(idx.includes('⑪ 本免责声明最后更新：2026-09-30。'), 'A12 最后更新日期推进到 2026-09-30（同源块编号形态）');
ok(!idx.includes('9. 本免责声明最后更新：2026-09-29。') && !idx.includes('11. 本免责声明最后更新：2026-09-30。'), 'A13 开屏卡的旧条号形态（9./11.）已退场（卡已删）');
ok(idx.includes('本站将在你的设备浏览器本地记录确认时间与声明版本，不上传'), 'A14 同源存证披露在位');
ok(!idx.includes('勾选确认时，本站会在你自己的设备浏览器本地记录确认时间与本声明版本'), 'A15 开屏免责卡首段的旧措辞已退场（措辞只属已删卡）');

console.log('\n== A2 删除型：开屏免责卡不得回流 ==');
ok(count(idx, 'data-anti-scam="d"') === 0, 'A16 构建产物 index.html 无开屏免责卡（data-anti-scam="d"）');
ok(count(read('src/template.html'), 'data-anti-scam="d"') === 0, 'A17 src/template.html 无开屏免责卡（删则回流＝第 3 处免责口径与设置→关于并立）');
ok(count(idx, 'class="splash-disclaimer"') === 0 && count(read('src/css/base.css'), '.splash-disclaimer') === 0, 'A18 开屏免责卡的节点类与样式均已清尽');
ok(retiredPhrase('#1475c 免责卡').found && !retiredPhrase('#1475c 免责卡').active, 'A19 哨兵 #1475c（免责卡条款）已退役');
ok(retiredPhrase('#1459b').found && !retiredPhrase('#1459b').active && retiredPhrase('#1459e').found && !retiredPhrase('#1459e').active, 'A20 哨兵 #1459b/#1459e（免责卡改九条/条款）已退役');

const rd = read('README.md');
ok(rd.includes('无论基于何种原因（包括但不限于违约、侵权或其他事由）'), 'A21 README 同源：最大范围免责在位');
ok(rd.includes('本站按「现状」与「当前可用性」提供'), 'A22 README 同源：无担保条在位');
ok(rd.includes('本免责声明最后更新：2026-09-30。'), 'A23 README 同源：最后更新日期同步');
ok(rd.includes('不影响其余条款的效力'), 'A24 README 同源：可分割性在位');

const ct = read('js/contacts.js');
ok(ct.includes("'age-confirmed']"), 'A25 同意记录根键在 migrateLegacy EXCLUDE 名单（漏登记＝每次启动被迁进 default 并删根键）');

// ===== B 行为面（可选；playwright 不可用则跳过）=====
console.log('\n== B 行为面（可选，无头真跑开屏闸门）==');
let chromium = null;
try { ({ chromium } = await import('playwright')); } catch (e) { chromium = null; }
if (!chromium) {
  console.log('  · playwright 不可用，跳过行为面（静态 A 组结论不受影响）');
} else {
  const browser = await chromium.launch();
  const mk = async (seed) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e && e.message || e)));
    // 种子必须「先落域 → evaluate 写入 → reload」：addInitScript 在 document-start 跑，
    // 该阶段 localStorage 在部分 Chromium 上不可用（静默异常＝种子丢失，B 组全变假读数）。
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    if (seed !== undefined) await page.evaluate(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} }, [AGE_KEY, seed]);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(600);
    return { ctx, page, errs };
  };
  // B0 删除型：开屏免责卡不存在
  {
    const { ctx, page, errs } = await mk();
    const n = await page.evaluate(() => document.querySelectorAll('.splash-alert[data-anti-scam="d"]').length);
    ok(n === 0, 'B0 开屏免责卡不存在（删除型；n=' + n + '）');
    ok(errs.length === 0, 'B0a 加载零 JS 异常', errs.join('|').slice(0, 120));
    // B1 空记录＝未勾
    const b1 = await page.evaluate(() => { const el = document.getElementById('splash-age-check'); return el ? el.checked : null; });
    ok(b1 === false, 'B1 空记录＝未勾选（进不去）', String(b1));
    await ctx.close();
  }
  // B2 旧格式 '1'＝未勾（改版重确认）
  {
    const { ctx, page } = await mk('1');
    const b2 = await page.evaluate(() => document.getElementById('splash-age-check').checked);
    ok(b2 === false, "B2 旧格式 '1'＝本版未勾（重新确认一次）", String(b2));
    await ctx.close();
  }
  // B3 旧版本 JSON＝未勾
  {
    const { ctx, page } = await mk(JSON.stringify({ t: 1700000000000, v: '2026-09-29' }));
    const b3 = await page.evaluate(() => document.getElementById('splash-age-check').checked);
    ok(b3 === false, 'B3 旧版本 JSON（2026-09-29）＝本版未勾', String(b3));
    await ctx.close();
  }
  // B4 当前版本 JSON＝自动勾上
  {
    const { ctx, page } = await mk(JSON.stringify({ t: 1700000000000, v: AGE_VER }));
    const b4 = await page.evaluate(() => document.getElementById('splash-age-check').checked);
    ok(b4 === true, 'B4 当前版本 JSON＝自动勾上（不重复打断）', String(b4));
    await ctx.close();
  }
  // B5 勾选动作落库存证 JSON
  {
    const { ctx, page } = await mk();
    await page.check('#splash-age-check');
    await page.waitForTimeout(200);
    const stored = await page.evaluate((k) => localStorage.getItem(k), AGE_KEY);
    let parsed = null;
    try { parsed = JSON.parse(stored); } catch (e) {}
    ok(!!parsed && parsed.v === AGE_VER && typeof parsed.t === 'number' && parsed.t > 1700000000000,
      'B5 勾选后落库存证 JSON（v＝当前版本、t＝真实时间戳）', String(stored).slice(0, 80));
    await ctx.close();
  }
  await browser.close();
}

srv.close();
console.log('\n' + (fail === 0 ? '✅' : '❌') + ' verify-1475-consent-evidence: ' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
