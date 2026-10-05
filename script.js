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

  function buildOverview(spread) {
    const up = spread.filter(s => s.upright).length;
    const kw = spread.find(s => s.positionId === 'center').card.keywords[0];
    if (up >= 4) return `今天运势极佳——「${kw}」的能量贯穿全场，想做的事尽管放手去做，好运站在你这边。`;
    if (up === 3) return `今天运势上扬，「${kw}」是你的关键词，主动一点，机会会主动来敲门。`;
    if (up === 2) return `今天运势平稳，围绕「${kw}」徐徐展开，稳扎稳打，小惊喜就在路上。`;
    return `今天运势需要谨慎，「${kw}」提醒你先守后攻，慢一点，稳住就是赢。`;
  }

  const api = { ROMAN, POSITIONS, CARDS, shuffleCards, drawSpread, buildOverview };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Tarot = api;
})(typeof window !== 'undefined' ? window : globalThis);
