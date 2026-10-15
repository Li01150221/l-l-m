// ===== #1060 开屏公告末章「关于后台通知相关设置」（2026-10-15 开屏精简批改口）=====
// 原：断言该章同时存在于离线兜底（template.html）与在线权威源（notice.json）两处。
// 现：开屏精简批已把在线权威源 sections 整段清空 + hide:true（联网用户不再从远程源渲染公告，
//   只剩余离线兜底 template.html）。本脚本改为：离线兜底章仍在位（#1060a 哨兵仍活动）＋
//   在线源侧转删除型断言（该章不得再出现、sections 为空、hide:true、#1060b 哨兵已退役）。
// 判据静态部分不依赖浏览器；行为面（B1~B4）在无头浏览器不可用时跳过。
// 用法：node tools/verify-1060-notice-bg-notify-chapter.mjs [--root=<已构建副本目录>]
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = normalize((process.argv.find((a) => a.startsWith('--root=')) || '').split('=')[1] || (dirname(fileURLToPath(import.meta.url)) + '/..'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (f) => { try { return readFileSync(join(root, f), 'utf8'); } catch (e) { return ''; } };
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x ? ' | ' + x : '')); } };

const H = '关于后台通知相关设置（怎么开、收不到怎么办）';
const tpl = read('src/template.html');
const json = read('src/pwa/notice.json');
const prodHtml = read('index.html');
const prodJson = read('notice.json');

// ---- 离线兜底（template.html）：该章仍在位 ----
ok(tpl.includes(H + '</p>'), 'S1 离线兜底（template.html）含该章标题（#1502 起目录统一编号，判据去前导「>」＝对「N、」前缀不敏感）');
const tplBlocks = tpl.split('class="splash-sec-wrap"');
ok(tplBlocks[tplBlocks.length - 1].includes(H), 'S2 该章是公告的最后一个章节块（用户要求放最后）');
const tplChunk = tplBlocks[tplBlocks.length - 1].split('class="splash-bullet"').length - 1;
ok(tplChunk >= 6, 'S3 离线兜底 6 条要点齐（实为 ' + tplChunk + ' 条）');

let J = null;
try { J = JSON.parse(json); } catch (e) {}
// ---- 在线权威源侧：开屏精简批已整段清空，转删除型断言 ----
ok(!!J && Array.isArray(J.sections) && J.sections.length === 0, 'S4 在线源 sections 已清空（删除型：联网用户不再看远程公告）');
ok(!!J && J.hide === true, 'S5 在线源 hide:true（公告区在线隐藏）');
ok(!json.includes(H), 'S6 在线源不含该章标题（删除型：该章只存活在离线兜底）');
ok(!json.includes('<b>'), 'S7 在线源保持纯文本（渲染走 textContent，写 <b> 会显示成字面量）');

// ---- 产物 ----
ok(prodHtml.includes(H), 'P1 产物 index.html 含该章（离线兜底已构建，#1060a 哨兵仍在）');
let RJ = null; try { RJ = JSON.parse(prodJson); } catch (e) {}
ok(!!RJ && Array.isArray(RJ.sections) && RJ.sections.length === 0 && !prodJson.includes(H),
  'P2 产物根 notice.json 不含该章且 sections 已清空（删除型，与 src/pwa/notice.json 同源）');

// ---- build.mjs 哨兵状态：#1060a（离线兜底）活动；#1060b（在线源）已退役 ----
const build = read('build.mjs');
const buildLines = build.split('\n');
const aLine = buildLines.find(l => l.includes('#1060a'));
const bLine = buildLines.find(l => l.includes('#1060b'));
ok(!!aLine && !/^\s*\/\//.test(aLine), '哨兵 #1060a（离线兜底章）仍为活动登记');
ok(!!bLine && /^\s*\/\/\s*\[开屏精简批/.test(bLine), '哨兵 #1060b（在线源）已退役（开屏精简批注释前缀）');

// ---- B 行为：真实渲染（无头浏览器不可用时跳过静态结论之外的部分）----
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((req, res) => {
  try {
    let p = normalize(join(root, decodeURIComponent(req.url.split('?')[0])));
    if (!p.startsWith(normalize(root))) { res.writeHead(403); res.end(); return; }
    if (statSync(p).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'Content-Type': types[extname(p).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(p));
  } catch (e) { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + server.address().port + '/index.html';
const chromePath = [process.env.CHROME_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].filter(Boolean).find((p) => { try { return statSync(p).isFile(); } catch (e) { return false; } });
if (!chromePath) {
  console.log('（无头浏览器不可用，跳过 B1~B4 行为断言；静态断言已完成）');
  server.close();
  console.log('\n== #1060 开屏公告末章验证: ' + pass + '/' + (pass + fail) + ' ==');
  process.exit(fail === 0 ? 0 : 1);
}
const port = 11900 + Math.floor(Math.random() * 90);
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + join(tmpdir(), 'mochi-1060-' + Date.now()), '--remote-debugging-port=' + port, 'about:blank'], { stdio: 'ignore' });
let ws = null, id = 0; const pend = new Map();
for (let i = 0; i < 80; i++) { try { const l = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); const pg = l.find((t) => t.type === 'page'); if (pg) { ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } }; break; } } catch (e) {} await sleep(150); }
const cdp = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => { const r = await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r && r.exceptionDetails) return '__EXC__' + JSON.stringify(r.exceptionDetails).slice(0, 160); return r && r.result ? r.result.value : null; };

await cdp('Page.enable'); await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await cdp('Page.navigate', { url });
await sleep(3500);
for (let i = 0; i < 50; i++) { if (await ev('!!window.__mochiDataReady')) break; await sleep(300); }
await sleep(800);

const seen = await ev(`(function(){
  var seps=[].slice.call(document.querySelectorAll('#splash .splash-sec'));
  var last=seps.length?seps[seps.length-1].textContent.trim():'';
  var lastWrap=seps.length?seps[seps.length-1].closest('.splash-sec-wrap'):null;
  var bullets=lastWrap?lastWrap.querySelectorAll('.splash-bullet').length:0;
  var toc=[].slice.call(document.querySelectorAll('#splash *')).map(function(n){return (n.textContent||'')}).filter(function(t){return /^目录（\\d+ 章）$/.test(t.trim())});
  return JSON.stringify({seps:seps.length,last:last,bullets:bullets,toc:toc[0]||''});
})()`);
const S = (() => { try { return JSON.parse(seen || '{}'); } catch (e) { return {}; } })();
ok(String(S.last).replace(/^\d+、/, '') === H, 'B1 开屏渲染出的最后一个章节就是本章（#1502 起剥编号前缀再比）', 'last=' + String(S.last).slice(0, 40));
ok(Number(S.bullets) >= 6, 'B2 本章 6 条要点渲染出来（实为 ' + S.bullets + ' 条）');
const nToc = Number((String(S.toc).match(/(\d+)/) || [])[1] || 0);
ok(nToc > 0 && nToc >= Number(S.seps), 'B3 「目录（N 章）」计数包含本章（章数 ' + S.seps + ' / 目录显示 ' + nToc + '）', S.toc);
await ev("(function(){var w=document.querySelector('.splash-scroll')||document.querySelector('.splash-box');if(w)w.scrollTop=999999;return true;})()");
await sleep(300);
await ev("(function(){var b=[].slice.call(document.querySelectorAll('#splash button,#splash [role=button]')).filter(function(x){return /我已阅读/.test(x.textContent||'')})[0];if(b)b.click();return true;})()");
await sleep(500);
const entered = await ev("(function(){var m=document.getElementById('splash-mandatory');if(m&&!m.hidden){return 'mandatory-open';}var e=document.getElementById('splash-enter');return e&&!e.hidden?'enter-ok':'?';})()");
ok(entered === 'mandatory-open' || entered === 'enter-ok', 'B4 进入流程不受影响（滑到底→我已阅读→强制公告）', String(entered));
ok(Number(await ev('(window.__jsErrors||[]).length')) === 0, 'Z1 全程零 JS 异常');

try { chrome.kill(); } catch (e) {}
server.close();
console.log('\n== #1060 开屏公告末章验证: ' + pass + '/' + (pass + fail) + ' ==');
process.exit(fail === 0 ? 0 : 1);
