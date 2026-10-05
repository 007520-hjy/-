# 塔罗 · 今日运势网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做一个神秘占星风的塔罗五牌十字阵今日运势单页网站（AI 生成 22 张大阿尔克纳牌面图）。

**Architecture:** 单 HTML 文件（yinshi.html，含全部 CSS）+ script.js（浏览器/node 双兼容，逻辑与 DOM 分离）+ images/（23 张 AI 图）+ node 直跑的核心逻辑测试。无框架、无网络依赖，file:// 双击即可打开。

**Tech Stack:** 原生 HTML/CSS/JS、node（测试用 node:assert，无框架）、SiliconFlow 图像生成 MCP。

**Spec:** [docs/superpowers/specs/2026-10-05-tarot-fortune-design.md](../specs/2026-10-05-tarot-fortune-design.md)

## Global Constraints

- 目录不是 git 仓库：Task 1 第一步 `git init`；每个任务末尾提交，提交信息结尾加 `Co-Authored-By: Claude Code <noreply@anthropic.com>`（用户若拒绝 git 则跳过全部提交步骤）
- 牌面图命名：`images/card-XX.png`（XX = 牌 id 补零两位，00-21）+ `images/card-back.png`
- 牌面图比例 2:3，画面内不得出现任何文字/字母/数字（牌名由 HTML 叠加）
- 22 张大阿尔克纳 id 0-21：愚者→世界；每张 `{ id, nameZh, nameEn, keywords: string[], upright: string, reversed: string }`
- 五牌十字阵位置固定顺序：center(现状)、top(障碍)、bottom(潜在)、left(目标)、right(建议)
- 解读文案语言：简体中文，面向「今日运势」语境
- 总览文案规则：正位 ≥4 → 大吉；=3 → 吉；=2 → 平；≤1 → 谨慎；均嵌入 center 牌 keywords[0]
- 移动端 <700px：十字阵转竖向（center→top→bottom→left→right）
- 测试命令：`node test/spread.test.js`，Windows Git Bash 环境

---

### Task 1: 塔罗牌数据 CARDS + 测试骨架

**Files:**
- Create: `E:\hjy\script.js`
- Create: `E:\hjy\test\spread.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `CARDS: Card[]`（`Card = { id: number, nameZh: string, nameEn: string, keywords: string[], upright: string, reversed: string }`）、`ROMAN: string[]`（下标=牌 id）、`POSITIONS: {id: 'center'|'top'|'bottom'|'left'|'right', label: string}[]`

- [ ] **Step 1: git init（可跳过，若用户拒绝）**

```bash
cd /e/hjy && git init
```

- [ ] **Step 2: 写失败测试 test/spread.test.js**

```js
'use strict';
const assert = require('node:assert');
const { CARDS, ROMAN, POSITIONS } = require('../script.js');

// Task 1: 数据完整性
assert.strictEqual(CARDS.length, 22, '应有 22 张大阿尔克纳');
CARDS.forEach((c, i) => {
  assert.strictEqual(c.id, i, `第 ${i} 张牌 id 应为 ${i}`);
  assert.ok(c.nameZh.length > 0, `牌 ${i} 缺 nameZh`);
  assert.ok(c.nameEn.length > 0, `牌 ${i} 缺 nameEn`);
  assert.ok(c.keywords.length >= 2, `牌 ${i} 关键词至少 2 个`);
  assert.ok(c.upright.length > 0, `牌 ${i} 缺正位解读`);
  assert.ok(c.reversed.length > 0, `牌 ${i} 缺逆位解读`);
  assert.notStrictEqual(c.upright, c.reversed, `牌 ${i} 正逆位解读不能相同`);
});
assert.strictEqual(ROMAN.length, 22, '罗马数字表应有 22 项');
assert.strictEqual(ROMAN[0], '0');
assert.strictEqual(ROMAN[13], 'XIII');
assert.strictEqual(ROMAN[21], 'XXI');
assert.deepStrictEqual(POSITIONS.map(p => p.id), ['center', 'top', 'bottom', 'left', 'right']);
assert.deepStrictEqual(POSITIONS.map(p => p.label), ['现状', '障碍', '潜在', '目标', '建议']);
console.log('Task1 测试通过');
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: FAIL，`Cannot find module '../script.js'`

- [ ] **Step 4: 写最小实现 script.js（含完整 22 张牌数据）**

```js
(function (global) {
  'use strict';

  const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
    'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

  const POSITIONS = [
    { id: 'center', label: '现状' },
    { id: 'top', label: '障碍' },
    { id: 'bottom', label: '潜在' },
    { id: 'left', label: '目标' },
    { id: 'right', label: '建议' },
  ];

  const CARDS = [
    { id: 0, nameZh: '愚者', nameEn: 'The Fool', keywords: ['新开始', '冒险', '自由'],
      upright: '今天适合迈出新的一步，别怕看起来不成熟，直觉会带你走向意外的惊喜。',
      reversed: '今天容易冲动行事或遗漏细节，重要决定前多看一眼，别急着跳进未知。' },
    { id: 1, nameZh: '魔术师', nameEn: 'The Magician', keywords: ['行动力', '创造', '资源'],
      upright: '今天你手里什么都有，主动出击就能把想法变成现实，是展现能力的好日子。',
      reversed: '今天小心眼高手低或沟通含糊，做之前先确认工具和意图是否一致。' },
    { id: 2, nameZh: '女祭司', nameEn: 'The High Priestess', keywords: ['直觉', '内省', '秘密'],
      upright: '今天答案在心里而不在嘴上，静下来倾听直觉，会发现被忽略的线索。',
      reversed: '今天可能忽略内心的声音或信息混乱，别急着下结论，先观察再行动。' },
    { id: 3, nameZh: '皇后', nameEn: 'The Empress', keywords: ['丰盛', '滋养', '创造力'],
      upright: '今天适合照顾自己、享受生活，财运与好感度都在上升，慷慨会加倍回流。',
      reversed: '今天当心过度付出或自我忽视，先照顾好自己，再谈照顾别人。' },
    { id: 4, nameZh: '皇帝', nameEn: 'The Emperor', keywords: ['秩序', '掌控', '稳固'],
      upright: '今天适合定规则、扛责任，你的沉稳会赢得信任，按计划推进就能成事。',
      reversed: '今天可能遇到强势的人或控制欲作祟，硬碰硬最伤，弹性一点反而稳。' },
    { id: 5, nameZh: '教皇', nameEn: 'The Hierophant', keywords: ['传统', '学习', '贵人'],
      upright: '今天适合请教前辈或遵循既有方法，一条稳妥的路正在眼前展开。',
      reversed: '今天别被教条框住，质疑一下"一直如此"的事，可能会有新解法。' },
    { id: 6, nameZh: '恋人', nameEn: 'The Lovers', keywords: ['关系', '选择', '共鸣'],
      upright: '今天人际与爱情都顺风，重要的选择请跟随内心真正的价值观。',
      reversed: '今天容易摇摆或关系出现小摩擦，先和自己对齐，再回应他人。' },
    { id: 7, nameZh: '战车', nameEn: 'The Chariot', keywords: ['胜利', '意志力', '前进'],
      upright: '今天冲劲十足，目标清晰，只要稳住方向盘，阻碍都会被碾过去。',
      reversed: '今天容易用力过猛或方向漂移，慢一点，确认目标再踩油门。' },
    { id: 8, nameZh: '力量', nameEn: 'Strength', keywords: ['勇气', '耐心', '温柔'],
      upright: '今天用温柔而非强硬解决难题，你的耐心会驯服最大的不安。',
      reversed: '今天可能自我怀疑或情绪内耗，先给自己打气，你不是没力气，只是累了。' },
    { id: 9, nameZh: '隐者', nameEn: 'The Hermit', keywords: ['独处', '智慧', '探索'],
      upright: '今天适合退一步独处思考，答案在安静处发光，晚些时候再分享。',
      reversed: '今天别把自己关太久，你需要的不是更多独处，而是一句对话。' },
    { id: 10, nameZh: '命运之轮', nameEn: 'Wheel of Fortune', keywords: ['转机', '周期', '运气'],
      upright: '今天运势在上升通道，抓住突然出现的机会，顺风时别犹豫。',
      reversed: '今天小有波动，计划可能有变，接受变化反而会转祸为福。' },
    { id: 11, nameZh: '正义', nameEn: 'Justice', keywords: ['平衡', '公正', '因果'],
      upright: '今天种瓜得瓜，诚实与负责会得到应得的回报，适合处理合约与决定。',
      reversed: '今天当心不公平的对待或自欺，重要承诺要白纸黑字说清楚。' },
    { id: 12, nameZh: '倒吊人', nameEn: 'The Hanged Man', keywords: ['换视角', '暂停', '牺牲'],
      upright: '今天换个角度看问题，主动停一停，看似吃亏的等待会有回报。',
      reversed: '今天别再无谓拖延或牺牲，该止损就止损，行动好过干等。' },
    { id: 13, nameZh: '死神', nameEn: 'Death', keywords: ['结束', '蜕变', '重生'],
      upright: '今天适合断舍离，结束旧章节，新空间马上会被更好的东西填满。',
      reversed: '今天对"放下"有抗拒，抱着不放的旧事正在拖慢你，试着松一根手指。' },
    { id: 14, nameZh: '节制', nameEn: 'Temperance', keywords: ['平衡', '调和', '耐心'],
      upright: '今天适合中庸之道，节奏不紧不慢，耐心调和会让事情水到渠成。',
      reversed: '今天容易走极端或节奏失衡，别熬夜也别硬撑，找回中间态。' },
    { id: 15, nameZh: '恶魔', nameEn: 'The Devil', keywords: ['诱惑', '束缚', '欲望'],
      upright: '今天看清什么在"绑住"你，承认欲望的存在，就能夺回主动权。',
      reversed: '今天有挣脱束缚的契机，一次小的拒绝，就能剪断那根线。' },
    { id: 16, nameZh: '高塔', nameEn: 'The Tower', keywords: ['突变', '觉醒', '释放'],
      upright: '今天可能有突发变化，别慌，崩塌的只是旧结构，你人是安全的。',
      reversed: '今天有种"风暴将至"的不安，主动做点小改变，能卸掉大部分压力。' },
    { id: 17, nameZh: '星星', nameEn: 'The Star', keywords: ['希望', '疗愈', '灵感'],
      upright: '今天是被祝福的一天，愿望可以许，灵感会来，保持相信与平静。',
      reversed: '今天信心略低，但希望没走远，做一件小事找回自己的光。' },
    { id: 18, nameZh: '月亮', nameEn: 'The Moon', keywords: ['迷雾', '情绪', '潜意识'],
      upright: '今天信息不透明，情绪如潮，别在雾中做重大决定，先照亮自己。',
      reversed: '今天迷雾渐散，误解有望澄清，之前看不清的事会露出轮廓。' },
    { id: 19, nameZh: '太阳', nameEn: 'The Sun', keywords: ['成功', '快乐', '活力'],
      upright: '今天是高光日，做什么都顺，大方分享快乐，好运还会翻倍。',
      reversed: '今天别太苛求完美，快乐被乌云遮了一点，出去走走就回来了。' },
    { id: 20, nameZh: '审判', nameEn: 'Judgement', keywords: ['觉醒', '召唤', '复盘'],
      upright: '今天适合复盘与回应内心召唤，一次真诚的面对会带来全新开始。',
      reversed: '今天可能自我批评过重，原谅自己，才能听见真正的声音。' },
    { id: 21, nameZh: '世界', nameEn: 'The World', keywords: ['完成', '圆满', '整合'],
      upright: '今天事情圆满收尾，成果落地，适合庆祝与感恩，画一个漂亮的句号。',
      reversed: '今天差最后一公里，别急着收工，补上缺口就是满分。' },
  ];

  const api = { ROMAN, POSITIONS, CARDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Tarot = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: 输出 `Task1 测试通过`

- [ ] **Step 6: 提交**

```bash
cd /e/hjy && git add script.js test/spread.test.js docs/ && git commit -m "feat: 添加 22 张大阿尔克纳牌数据与测试骨架

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2: 抽牌逻辑（洗牌、十字阵、正逆位）

**Files:**
- Modify: `E:\hjy\script.js`（api 中追加三个函数）
- Modify: `E:\hjy\test\spread.test.js`（追加测试）

**Interfaces:**
- Consumes: `CARDS`, `POSITIONS`（Task 1）
- Produces:
  - `shuffleCards(deck: any[], rng?: () => number): any[]` — 返回新数组（Fisher-Yates），不修改原数组
  - `drawSpread(rng?: () => number): { card: Card, positionId: string, upright: boolean }[]` — 长度 5，按 POSITIONS 顺序，牌不重复，每张 50% 正位
  - Spread 元素类型别名 `SpreadCard`

- [ ] **Step 1: 追加失败测试**

在 `test/spread.test.js` 末尾追加（放在 `console.log` 之前）：

```js
// Task 2: 抽牌逻辑
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const { shuffleCards, drawSpread } = require('../script.js');

const spread = drawSpread(mulberry32(1));
assert.strictEqual(spread.length, 5, '十字阵应有 5 张牌');
const ids = spread.map(s => s.card.id);
assert.strictEqual(new Set(ids).size, 5, '5 张牌不得重复');
assert.deepStrictEqual(spread.map(s => s.positionId), ['center', 'top', 'bottom', 'left', 'right'], '位置顺序固定');
spread.forEach(s => assert.strictEqual(typeof s.upright, 'boolean', 'upright 应为布尔'));

// 正逆位比例：2000 次抽牌共 10000 次翻转，正位比例应在 40%-60%
let up = 0, n = 0;
for (let i = 0; i < 2000; i++) for (const s of drawSpread(mulberry32(100 + i))) { if (s.upright) up++; n++; }
assert.ok(up / n > 0.4 && up / n < 0.6, `正位比例偏离 50%：${up / n}`);

// 同种子结果可复现
assert.deepStrictEqual(drawSpread(mulberry32(7)).map(s => s.card.id), drawSpread(mulberry32(7)).map(s => s.card.id), '同种子结果应一致');

// shuffleCards 不修改原数组、保留全部元素
const deck = CARDS.slice();
const shuffled = shuffleCards(deck, mulberry32(2));
assert.strictEqual(deck[0].id, 0, '原数组不应被修改');
assert.strictEqual(shuffled.length, 22);
assert.deepStrictEqual(shuffled.map(c => c.id).sort((a, b) => a - b), CARDS.map(c => c.id), '洗牌后元素集合不变');
console.log('Task2 测试通过');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: FAIL，`shuffleCards is not a function` 或 require 解构为 undefined

- [ ] **Step 3: 实现（script.js 中 `const api =` 之前插入）**

```js
  function shuffleCards(deck, rng) {
    rng = rng || Math.random;
    const arr = deck.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function drawSpread(rng) {
    rng = rng || Math.random;
    const picked = shuffleCards(CARDS, rng).slice(0, POSITIONS.length);
    return POSITIONS.map((pos, i) => ({
      card: picked[i],
      positionId: pos.id,
      upright: rng() < 0.5,
    }));
  }
```

并修改 `const api = { ROMAN, POSITIONS, CARDS };` 为 `const api = { ROMAN, POSITIONS, CARDS, shuffleCards, drawSpread };`

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: 输出 `Task1 测试通过` 和 `Task2 测试通过`

- [ ] **Step 5: 提交**

```bash
cd /e/hjy && git add script.js test/spread.test.js && git commit -m "feat: 实现洗牌与五牌十字阵抽牌逻辑

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 3: 今日运势总览文案生成

**Files:**
- Modify: `E:\hjy\script.js`（追加 `buildOverview`）
- Modify: `E:\hjy\test\spread.test.js`（追加测试）

**Interfaces:**
- Consumes: `drawSpread`（Task 2）、`CARDS`
- Produces: `buildOverview(spread: SpreadCard[]): string` — 规则：正位 ≥4 → 大吉；=3 → 吉；=2 → 平；≤1 → 谨慎；文案必须包含 center 牌的 `keywords[0]`（以「」包裹）

- [ ] **Step 1: 追加失败测试**

```js
// Task 3: 总览文案
const { buildOverview } = require('../script.js');
const centerCard = CARDS[19]; // 太阳
function mkSpread(ups) { // ups: 5 个布尔
  return POSITIONS.map((pos, i) => ({ card: i === 0 ? centerCard : CARDS[i], positionId: pos.id, upright: ups[i] }));
}
assert.ok(buildOverview(mkSpread([true, true, true, true, true])).startsWith('今天运势极佳'), '全正位 → 大吉');
assert.ok(buildOverview(mkSpread([true, true, true, false, false])).startsWith('今天运势上扬'), '3 正 → 吉');
assert.ok(buildOverview(mkSpread([true, true, false, false, false])).startsWith('今天运势平稳'), '2 正 → 平');
assert.ok(buildOverview(mkSpread([true, false, false, false, false])).startsWith('今天运势需要谨慎'), '1 正 → 谨慎');
assert.ok(buildOverview(mkSpread([false, false, false, false, false])).startsWith('今天运势需要谨慎'), '0 正 → 谨慎');
const text = buildOverview(mkSpread([true, false, false, false, false]));
assert.ok(text.includes('「' + centerCard.keywords[0] + '」'), '总览应嵌入中心牌第一个关键词');
console.log('Task3 测试通过');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: FAIL，`buildOverview is not a function`

- [ ] **Step 3: 实现（追加在 drawSpread 之后）**

```js
  function buildOverview(spread) {
    const up = spread.filter(s => s.upright).length;
    const kw = spread.find(s => s.positionId === 'center').card.keywords[0];
    if (up >= 4) return `今天运势极佳——「${kw}」的能量贯穿全场，想做的事尽管放手去做，好运站在你这边。`;
    if (up === 3) return `今天运势上扬，「${kw}」是你的关键词，主动一点，机会会主动来敲门。`;
    if (up === 2) return `今天运势平稳，围绕「${kw}」徐徐展开，稳扎稳打，小惊喜就在路上。`;
    return `今天运势需要谨慎，「${kw}」提醒你先守后攻，慢一点，稳住就是赢。`;
  }
```

并修改 api 为 `const api = { ROMAN, POSITIONS, CARDS, shuffleCards, drawSpread, buildOverview };`

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: 输出 `Task1 测试通过` `Task2 测试通过` `Task3 测试通过`

- [ ] **Step 5: 提交**

```bash
cd /e/hjy && git add script.js test/spread.test.js && git commit -m "feat: 生成今日运势总览文案

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 4: 页面 UI（yinshi.html 静态结构 + 全部 CSS）

**Files:**
- Create: `E:\hjy\yinshi.html`（覆盖空文件）

**Interfaces:**
- Consumes: `script.js`（`<script src="script.js">` 加载，暴露 `Tarot` 与 Task 5 的 `Tarot.initPage()`）
- Produces: 以下 id/class 契约，Task 5 的 DOM 代码依赖：
  - `#today`（日期显示）、`#deck-area`（牌堆区）、`#start-btn`、`#spread`、`#summary`、`#detail-list`、`#redraw`
  - 每个阵位：`<article class="card-slot" data-pos="center|top|bottom|left|right">`，内部结构（照抄下方 HTML）
  - `.stars` 容器（JS 注入星点）、`.card-img`（牌面图，onerror 加 `failed` 类）、`.card-name`、`.card-tag`、`.card-read`、`.card-fallback`（图挂了显示罗马数字）

- [ ] **Step 1: 写完整 yinshi.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>今日运势 · 塔罗五牌阵</title>
<style>
  :root {
    --bg-1: #0a0e1f; --bg-2: #161d3c; --gold: #d4af37; --gold-lt: #f0d98c;
    --ink: #e8e2d0; --ink-dim: #9a94b8; --card-w: 240px; --card-h: 360px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh; color: var(--ink);
    font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    background: radial-gradient(ellipse at 50% -10%, #2a3566 0%, var(--bg-2) 45%, var(--bg-1) 100%);
    overflow-x: hidden;
  }
  .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .stars span { position: absolute; background: var(--gold-lt); border-radius: 50%; opacity: .2; animation: twinkle ease-in-out infinite alternate; }
  @keyframes twinkle { from { opacity: .12; } to { opacity: .9; } }
  .wrap { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 48px 24px 80px; }

  header { text-align: center; margin-bottom: 40px; }
  h1 {
    font-family: Georgia, "Noto Serif SC", "STSong", serif; font-size: 42px; letter-spacing: 6px;
    background: linear-gradient(180deg, var(--gold-lt), var(--gold));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .subtitle { margin-top: 10px; color: var(--ink-dim); letter-spacing: 4px; font-size: 14px; }
  #today { margin-top: 6px; color: var(--gold); font-size: 13px; letter-spacing: 2px; }

  /* 牌堆 */
  #deck-area { display: flex; flex-direction: column; align-items: center; gap: 24px; margin: 24px 0 48px; }
  #deck { position: relative; width: 180px; height: 270px; cursor: pointer; transition: transform .2s; }
  #deck:hover { transform: translateY(-6px); }
  #deck .pile {
    position: absolute; inset: 0; border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(212, 175, 55, .6); box-shadow: 0 6px 24px rgba(0, 0, 0, .5);
  }
  #deck .pile img { width: 100%; height: 100%; object-fit: cover; display: block; }
  #deck .pile:nth-child(1) { transform: translate(-7px, -7px) rotate(-2deg); }
  #deck .pile:nth-child(2) { transform: translate(0, 0); }
  #deck .pile:nth-child(3) { transform: translate(7px, 7px) rotate(2deg); }
  #deck.shuffling .pile { animation: shuffle .5s ease-in-out infinite alternate; }
  #deck.shuffling .pile:nth-child(2) { animation-delay: .12s; }
  #deck.shuffling .pile:nth-child(3) { animation-delay: .24s; }
  @keyframes shuffle {
    from { transform: translateX(-10px) rotate(-4deg); }
    to { transform: translateX(10px) rotate(4deg); }
  }
  .btn {
    padding: 14px 40px; font-size: 16px; letter-spacing: 6px; color: var(--bg-1);
    background: linear-gradient(135deg, var(--gold-lt), var(--gold));
    border: none; border-radius: 999px; cursor: pointer; font-weight: 700;
    box-shadow: 0 4px 20px rgba(212, 175, 55, .35); transition: transform .15s, box-shadow .15s;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(212, 175, 55, .5); }
  #redraw { display: none; margin: 32px auto 0; }

  /* 十字阵 */
  #spread {
    display: none; margin: 0 auto; max-width: 900px;
    grid-template-rows: repeat(3, minmax(var(--card-h), auto));
    grid-template-columns: repeat(3, minmax(var(--card-w), 1fr));
    gap: 20px 24px; align-items: center; justify-items: center;
  }
  #spread.on { display: grid; }
  .card-slot { perspective: 1400px; width: var(--card-w); }
  .card-slot[data-pos="center"] { grid-area: 2 / 2; }
  .card-slot[data-pos="top"] { grid-area: 1 / 2; }
  .card-slot[data-pos="bottom"] { grid-area: 3 / 2; }
  .card-slot[data-pos="left"] { grid-area: 2 / 1; }
  .card-slot[data-pos="right"] { grid-area: 2 / 3; }
  .pos-label {
    text-align: center; color: var(--gold); letter-spacing: 4px; font-size: 13px; margin-bottom: 8px;
  }
  .card-inner { position: relative; width: var(--card-w); height: var(--card-h); transform-style: preserve-3d; transition: transform .9s cubic-bezier(.4, .1, .2, 1); }
  .card-slot.flipped .card-inner { transform: rotateY(180deg); }
  .card-face {
    position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; overflow: hidden;
    border: 2px solid var(--gold); box-shadow: 0 10px 32px rgba(0, 0, 0, .55);
  }
  .card-back-face { transform: rotateY(180deg); background: #12162e; }
  .card-back-face img, .card-front-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .card-front-face img.reversed { transform: rotate(180deg); }
  .card-front-face img.failed { display: none; }
  .card-fallback {
    display: none; position: absolute; inset: 0; align-items: center; justify-content: center;
    font-family: Georgia, serif; font-size: 64px; color: var(--gold-lt); background: radial-gradient(circle at 50% 40%, #232c58, #10142c);
  }
  .card-front-face img.failed ~ .card-fallback { display: flex; }
  .card-info { margin-top: 10px; text-align: center; min-height: 92px; }
  .card-name { font-size: 17px; letter-spacing: 2px; color: var(--gold-lt); }
  .card-tag {
    display: inline-block; margin-top: 6px; padding: 2px 12px; font-size: 12px; letter-spacing: 3px;
    border: 1px solid var(--gold); border-radius: 999px; color: var(--gold);
  }
  .card-tag.rev { border-color: #8b7fd6; color: #a99ff0; }
  .card-read { margin-top: 8px; font-size: 13px; line-height: 1.7; color: var(--ink-dim); }

  /* 总览与详解 */
  #summary {
    display: none; margin: 48px auto 0; max-width: 640px; padding: 24px 32px; text-align: center;
    font-size: 17px; line-height: 1.9; color: var(--ink);
    background: rgba(22, 29, 60, .75); border: 1px solid rgba(212, 175, 55, .45); border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, .4);
  }
  #detail-list { margin: 40px auto 0; max-width: 720px; display: flex; flex-direction: column; gap: 16px; }
  .detail-item {
    display: flex; gap: 20px; align-items: flex-start; padding: 18px 22px;
    background: rgba(22, 29, 60, .55); border: 1px solid rgba(212, 175, 55, .25); border-radius: 14px;
  }
  .detail-item img { width: 96px; height: 144px; object-fit: cover; border-radius: 8px; border: 1px solid var(--gold); flex-shrink: 0; }
  .detail-item img.reversed { transform: rotate(180deg); }
  .detail-item h3 { font-size: 15px; letter-spacing: 2px; color: var(--gold-lt); }
  .detail-item h3 small { color: var(--ink-dim); letter-spacing: 1px; margin-left: 8px; font-weight: 400; }
  .detail-item p { margin-top: 6px; font-size: 14px; line-height: 1.8; color: var(--ink); }

  footer { text-align: center; margin-top: 56px; color: var(--ink-dim); font-size: 12px; letter-spacing: 3px; }

  @media (max-width: 700px) {
    h1 { font-size: 30px; letter-spacing: 4px; }
    #spread.on { display: flex; flex-direction: column; gap: 28px; }
    .detail-item { flex-direction: column; }
  }
</style>
</head>
<body>
<div class="stars" aria-hidden="true"></div>
<div class="wrap">
  <header>
    <h1>今日运势 · 塔罗五牌阵</h1>
    <p class="subtitle">— 静心 · 抽牌 · 听一听今天的答案 —</p>
    <p id="today"></p>
  </header>

  <section id="deck-area">
    <div id="deck" title="开始抽牌" role="button" tabindex="0">
      <div class="pile"><img src="images/card-back.png" alt=""></div>
      <div class="pile"><img src="images/card-back.png" alt=""></div>
      <div class="pile"><img src="images/card-back.png" alt=""></div>
    </div>
    <button id="start-btn" class="btn">开始抽牌</button>
  </section>

  <section id="spread" aria-label="五牌十字阵">
    <article class="card-slot" data-pos="center">
      <p class="pos-label">现状</p>
      <div class="card-inner">
        <figure class="card-face card-front-face">
          <img class="card-img" alt="牌面" onerror="this.classList.add('failed')">
          <span class="card-fallback"></span>
        </figure>
        <figure class="card-face card-back-face"><img src="images/card-back.png" alt=""></figure>
      </div>
      <div class="card-info"><p class="card-name"></p><span class="card-tag"></span><p class="card-read"></p></div>
    </article>
    <article class="card-slot" data-pos="top">
      <p class="pos-label">障碍</p>
      <div class="card-inner">
        <figure class="card-face card-front-face">
          <img class="card-img" alt="牌面" onerror="this.classList.add('failed')">
          <span class="card-fallback"></span>
        </figure>
        <figure class="card-face card-back-face"><img src="images/card-back.png" alt=""></figure>
      </div>
      <div class="card-info"><p class="card-name"></p><span class="card-tag"></span><p class="card-read"></p></div>
    </article>
    <article class="card-slot" data-pos="bottom">
      <p class="pos-label">潜在</p>
      <div class="card-inner">
        <figure class="card-face card-front-face">
          <img class="card-img" alt="牌面" onerror="this.classList.add('failed')">
          <span class="card-fallback"></span>
        </figure>
        <figure class="card-face card-back-face"><img src="images/card-back.png" alt=""></figure>
      </div>
      <div class="card-info"><p class="card-name"></p><span class="card-tag"></span><p class="card-read"></p></div>
    </article>
    <article class="card-slot" data-pos="left">
      <p class="pos-label">目标</p>
      <div class="card-inner">
        <figure class="card-face card-front-face">
          <img class="card-img" alt="牌面" onerror="this.classList.add('failed')">
          <span class="card-fallback"></span>
        </figure>
        <figure class="card-face card-back-face"><img src="images/card-back.png" alt=""></figure>
      </div>
      <div class="card-info"><p class="card-name"></p><span class="card-tag"></span><p class="card-read"></p></div>
    </article>
    <article class="card-slot" data-pos="right">
      <p class="pos-label">建议</p>
      <div class="card-inner">
        <figure class="card-face card-front-face">
          <img class="card-img" alt="牌面" onerror="this.classList.add('failed')">
          <span class="card-fallback"></span>
        </figure>
        <figure class="card-face card-back-face"><img src="images/card-back.png" alt=""></figure>
      </div>
      <div class="card-info"><p class="card-name"></p><span class="card-tag"></span><p class="card-read"></p></div>
    </article>
  </section>

  <section id="summary" aria-live="polite"></section>
  <div id="detail-list"></div>
  <button id="redraw" class="btn">再测一次</button>

  <footer>✦ 塔罗只是镜子，答案始终在你心里 ✦</footer>
</div>
<script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: 验证**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: 测试仍全通过（未改动 script.js）

- [ ] **Step 3: 提交**

```bash
cd /e/hjy && git add yinshi.html && git commit -m "feat: 添加页面结构与神秘占星风样式

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 5: 交互接线（script.js DOM 部分）

**Files:**
- Modify: `E:\hjy\script.js`（追加 DOM 逻辑，api 追加 `initPage`）
- Modify: `E:\hjy\test\spread.test.js`（追加 initPage 存在性冒烟测试）

**Interfaces:**
- Consumes: Task 4 的 HTML 契约（#deck、#start-btn、#spread、.card-slot[data-pos]、.card-img、.card-name、.card-tag、.card-read、.card-fallback、#summary、#detail-list、#redraw、#today、.stars）、Task 2/3 的 `drawSpread`/`buildOverview`/`ROMAN`/`POSITIONS`
- Produces: `initPage(): void` — 页面初始化（日期、星点、事件绑定、发牌流程）。发牌时序：洗牌动画 1.2s → 按 POSITIONS 顺序每 900ms 翻一张 → 全部翻开后 600ms 显示总览与详解列表

- [ ] **Step 1: 追加冒烟测试**

```js
// Task 5: initPage 存在性（DOM 行为由 Task 7 浏览器人工验证）
const { initPage } = require('../script.js');
assert.strictEqual(typeof initPage, 'function', 'initPage 应为函数');
console.log('Task5 测试通过');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: FAIL，`initPage is not a function`

- [ ] **Step 3: 实现（script.js 中 `const api =` 之前插入，并在 api 中加入 `initPage`）**

```js
  function initPage() {
    const $ = id => document.getElementById(id);
    const deck = $('deck'), startBtn = $('start-btn'), spreadEl = $('spread');
    const summaryEl = $('summary'), detailList = $('detail-list'), redrawBtn = $('redraw');
    const todayEl = $('today');

    todayEl.textContent = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });

    const stars = document.querySelector('.stars');
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('span');
      const size = Math.random() * 2 + 1;
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `width:${size}px;height:${size}px;animation-delay:${Math.random() * 4}s;` +
        `animation-duration:${2 + Math.random() * 3}s`;
      stars.appendChild(s);
    }

    const imgSrc = c => `images/card-${String(c.id).padStart(2, '0')}.png`;
    const FLIP_BASE = 1200, FLIP_STEP = 900;

    function deal() {
      const spread = drawSpread();
      spreadEl.classList.add('on');
      deck.closest('#deck-area').style.display = 'none';
      summaryEl.style.display = 'none';
      detailList.innerHTML = '';

      spreadEl.querySelectorAll('.card-slot').forEach(slot => {
        slot.classList.remove('flipped');
        slot.querySelector('.card-img').className = 'card-img';
        slot.querySelector('.card-img').removeAttribute('src');
        slot.querySelector('.card-name').textContent = '';
        slot.querySelector('.card-tag').textContent = '';
        slot.querySelector('.card-tag').classList.remove('rev');
        slot.querySelector('.card-read').textContent = '';
        slot.querySelector('.card-fallback').textContent = '';
      });

      POSITIONS.forEach((pos, i) => {
        const entry = spread[i];
        const slot = spreadEl.querySelector(`[data-pos="${pos.id}"]`);
        const img = slot.querySelector('.card-img');
        img.src = imgSrc(entry.card);
        if (!entry.upright) img.classList.add('reversed');
        slot.querySelector('.card-fallback').textContent = ROMAN[entry.card.id];
        slot.querySelector('.card-name').textContent = `${ROMAN[entry.card.id]} ${entry.card.nameZh}`;
        const tag = slot.querySelector('.card-tag');
        tag.textContent = entry.upright ? '正位' : '逆位';
        if (!entry.upright) tag.classList.add('rev');
        slot.querySelector('.card-read').textContent = entry.upright ? entry.card.upright : entry.card.reversed;
        setTimeout(() => slot.classList.add('flipped'), FLIP_BASE + i * FLIP_STEP);
      });

      const item = (entry, pos) => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        const img = document.createElement('img');
        img.src = imgSrc(entry.card);
        img.alt = entry.card.nameZh;
        if (!entry.upright) img.classList.add('reversed');
        const body = document.createElement('div');
        const h = document.createElement('h3');
        h.textContent = `${pos.label} · ${entry.card.nameZh}（${entry.upright ? '正位' : '逆位'}）`;
        h.appendChild(Object.assign(document.createElement('small'), { textContent: entry.card.nameEn }));
        const p = document.createElement('p');
        p.textContent = entry.upright ? entry.card.upright : entry.card.reversed;
        body.append(h, p);
        div.append(img, body);
        return div;
      };
      setTimeout(() => {
        spread.forEach((entry, i) => detailList.appendChild(item(entry, POSITIONS[i])));
        summaryEl.textContent = buildOverview(spread);
        summaryEl.style.display = 'block';
        redrawBtn.style.display = 'block';
      }, FLIP_BASE + POSITIONS.length * FLIP_STEP + 600);
    }

    function start() {
      deck.classList.add('shuffling');
      deck.style.pointerEvents = 'none';
      setTimeout(() => {
        deck.classList.remove('shuffling');
        deck.style.pointerEvents = '';
        deal();
      }, 1200);
    }

    deck.addEventListener('click', start);
    deck.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });
    startBtn.addEventListener('click', start);
    redrawBtn.addEventListener('click', () => {
      spreadEl.classList.remove('on');
      deck.closest('#deck-area').style.display = '';
      redrawBtn.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (typeof document !== 'undefined' && document.readyState !== 'loading') initPage();
  else if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initPage);
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: 输出 Task1-Task5 全部通过（node 环境无 document，不触发 initPage 自调用）

- [ ] **Step 5: 提交**

```bash
cd /e/hjy && git add script.js test/spread.test.js && git commit -m "feat: 发牌交互、动画时序与详解列表

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 6: AI 生成 23 张牌面图

**Files:**
- Create: `E:\hjy\images\card-00.png` … `card-21.png`、`E:\hjy\images\card-back.png`

**Interfaces:**
- Consumes: 无（可与 Task 1-5 并行，用后台 agent 执行）
- Produces: 图片文件，被 yinshi.html 的 `<img src="images/card-XX.png">` 引用

**执行方式：** 由后台 general-purpose agent 完成（MCP 工具 mcp__siliconflow__generate_image 可用）。主会话执行 Task 1-5 时并行启动本任务。

- [ ] **Step 1: 生成 22 张牌面 + 1 张牌背**

所有生成调用参数：`aspectRatio: "2:3"`、`imageSize: "1K"`、`model: "black-forest-labs/FLUX.1-dev"`、`seed: 42`（统一种子保风格一致）。

每条 prompt = 风格基座 + 主题描述。**风格基座（每条 prompt 开头原样拼接）：**

```
Ornate Art Nouveau tarot card illustration, dark indigo starry night background, elaborate golden filigree border frame, celestial constellations and tiny stars, rich gold accents, deep purple and navy palette, elegant mystical atmosphere, fine linework flat illustration, centered composition, portrait card orientation, NO text, NO letters, NO numbers, NO writing
```

主题描述（逐张）：

- card-00：`a carefree young traveler with a small white dog standing at the edge of a cliff, looking up at the sky, holding a white rose, a small bundle on a stick over his shoulder, large sun in the distance`
- card-01：`a magician in a red robe at an altar table, one hand raising a wand to the sky, four elemental symbols on the table: cup, sword, pentacle, wand, lemniscate infinity symbol glowing above his head`
- card-02：`a serene priestess in a blue robe seated between two tall pillars, one black and one white, holding a scroll, a crescent moon at her feet, pomegranate patterned veil behind her`
- card-03：`a regal queen seated on a throne in a golden wheat field, crown of twelve stars, heart-shaped shield with venus symbol, flowing golden robe, forest and waterfall behind`
- card-04：`a stern king seated on a stone throne decorated with ram heads, holding a golden scepter, wearing red robe and armor, barren mountain peaks behind`
- card-05：`a robed high priest with a triple crown, one hand raised in blessing, two crossed golden keys at his feet, twin pillars behind him, a scroll and disciples before him`
- card-06：`a man and a woman standing in a garden beneath a radiant sun, a winged angel with purple wings above them, a tree with a serpent behind them, distant mountains`
- card-07：`a warrior in silver armor driving a golden chariot pulled by two sphinxes, one black and one white, a canopy of stars above, crescent moon symbols on his armor, a castle behind`
- card-08：`a gentle woman in a white robe calmly closing the jaws of a lion, lemniscate infinity symbol above her head, golden light around them`
- card-09：`an old wise man in a grey robe holding a glowing lantern with a six-pointed star inside, a wooden staff in his other hand, standing on a snowy mountain peak at night`
- card-10：`a large golden wheel decorated with mystical symbols, a sphinx seated on top, surrounded by clouds, four winged creatures in the corners, starry sky`
- card-11：`a seated woman in a red robe holding golden balance scales in one hand and an upright sword in the other, poised and balanced, between two pillars`
- card-12：`a man hanging upside down by one foot from a tree branch, serene peaceful expression, a golden halo around his head, other leg crossed behind, leaves of the tree`
- card-13：`a skeletal knight in black armor riding a white horse, holding a black banner with a white rose emblem, sunrise over a river, distant towers, small figures in a field`
- card-14：`a winged angel pouring water between two golden cups, one foot in a stream, a glowing halo, a path winding to a distant crown on a hill, irises blooming`
- card-15：`a horned devil creature with bat wings above two small chained human figures, an inverted pentagram, a burning torch, dark stone cave`
- card-16：`a tall stone tower struck by golden lightning from a dark stormy sky, a crown toppling from the top, flames at the top windows, two tiny figures falling`
- card-17：`a kneeling woman by a pond pouring water from two jugs onto land and water, one large eight-pointed star above with seven smaller stars around it, an ibis bird in a tree, serene night`
- card-18：`a full moon with a serene face glowing between two towers, a winding path through a field, a dog and a wolf howling at the moon, a crayfish crawling from a pond`
- card-19：`a radiant sun with a smiling face, large sunflowers, a child riding a white horse holding a red banner, a garden wall behind`
- card-20：`an angel blowing a golden trumpet with a white flag bearing a red cross, figures rising from open coffins below, sea and mountains, golden rays of light`
- card-21：`a dancing figure inside a large green laurel wreath tied with purple ribbons, four figures in the corners: an angel, an eagle, a lion and a bull, starry sky`
- card-back：`symmetrical ornate card back design, golden filigree pattern on deep indigo, a central glowing eight-pointed star motif, corner flourishes, mirrored decorative border, NO text`

- [ ] **Step 2: 保存图片到 images/**

每次生成返回临时路径，立即复制：

```bash
mkdir -p /e/hjy/images && cp "<返回的临时路径>" /e/hjy/images/card-XX.png
```

- [ ] **Step 3: 质量检查**

- 用 Read 工具逐一查看 22 张牌面图：风格是否统一（深蓝星空+金色边框）、画面是否出现乱码文字（出现则换 seed（如 4242）重新生成该张）
- `ls /e/hjy/images` 确认 23 个文件均非 0 字节
- 牌背图：仅图案无文字、适合平铺

- [ ] **Step 4: 提交**

```bash
cd /e/hjy && git add images/ && git commit -m "feat: 添加 22 张大阿尔克纳 AI 牌面图与牌背

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 7: 端到端验证与收尾

**Files:**
- 无新文件（如发现问题则修复对应文件）

- [ ] **Step 1: 运行全部逻辑测试**

Run: `cd /e/hjy && node test/spread.test.js`
Expected: Task1-Task5 全部通过

- [ ] **Step 2: 打开页面人工验证清单**

Run: `cmd.exe /c start "" "E:\hjy\yinshi.html"`（默认浏览器打开）

逐项检查：
1. 星空背景粒子闪烁、标题金色渐变、日期为今天
2. 牌堆 3 层牌背图显示正常（若牌背缺失→检查 images/card-back.png）
3. 点击「开始抽牌」→ 洗牌动画 1.2s → 五张牌按 现状→障碍→潜在→目标→建议 顺序每 900ms 翻一张
4. 每张牌：牌面图、`罗马数字+牌名`、正位/逆位标签（金色/紫色）、今日解读
5. 同一次占卜 5 张牌互不重复；逆位牌图旋转 180°
6. 全部翻开后出现「今日运势总览」，含中心牌关键词，档位与正位数量一致
7. 下方详解列表 5 项齐全（缩略图+位置+解读）
8. 「再测一次」→ 回到牌堆，重抽结果与上次不同（多测几次）
9. 窗口缩到 <700px：十字阵变竖排，无横向滚动
10. 断网/图片失败降级：临时改坏一张图片路径 → 牌面显示罗马数字而非裂图（验证后改回）

- [ ] **Step 3: 修复验证中发现的问题**

按 superpowers:systematic-debugging 处理任何 bug；修复后重跑 Step 1 与相关检查项。

- [ ] **Step 4: 最终提交**

```bash
cd /e/hjy && git add -A && git commit -m "fix: 端到端验证修复

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

- [ ] **Step 5: 向用户汇报**

汇报：文件结构、使用方式（双击 yinshi.html）、验证结果（测试输出 + 浏览器检查结论）。
