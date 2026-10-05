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
console.log('Task1 测试通过');
console.log('Task2 测试通过');
