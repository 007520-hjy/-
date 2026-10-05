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
