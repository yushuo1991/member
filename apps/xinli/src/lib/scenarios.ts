/**
 * 心理测评场景数据类型定义
 */

export interface Scenario {
  id: number;
  section: number;
  title: string;
  category: string;
  important?: boolean;
}

export interface ScenarioSection {
  id: number;
  name: string;
  count: number;
  description: string;
}

/**
 * 九大场景分类
 */
export const SCENARIO_SECTIONS: ScenarioSection[] = [
  { id: 1, name: '持有龙头', count: 17, description: '持有龙头股时的各种情况' },
  { id: 2, name: '持有跟风', count: 15, description: '持有跟风股时的各种情况' },
  { id: 3, name: '空仓观望', count: 10, description: '空仓时的入场时机判断' },
  { id: 4, name: '特殊情境', count: 5, description: '盘中实时决策场景' },
  { id: 5, name: '隔日表现', count: 4, description: '隔日走势的应对策略' },
  { id: 6, name: '连板高度', count: 4, description: '高度板相关决策' },
  { id: 7, name: '仓位管理', count: 5, description: '加减仓时机判断' },
  { id: 8, name: '换股决策', count: 6, description: '龙头跟风之间切换' },
  { id: 9, name: '情绪周期', count: 14, description: '板块不同阶段应对' },
];

/**
 * 所有场景数据（共80个）
 */
export const scenarios: Scenario[] = [
  // 一、持有龙头股时的场景 (1-17)
  {
    id: 1,
    section: 1,
    title: '我持有龙头，龙头上涨5%+，跟风同步上涨5%+',
    category: '持有龙头-同向变化',
  },
  {
    id: 2,
    section: 1,
    title: '我持有龙头，龙头涨停，跟风也涨停',
    category: '持有龙头-同向变化',
  },
  {
    id: 3,
    section: 1,
    title: '我持有龙头，龙头涨停，跟风上涨但未涨停(5-9%)',
    category: '持有龙头-同向变化',
  },
  {
    id: 4,
    section: 1,
    title: '我持有龙头，龙头下跌3%+，跟风也下跌3%+',
    category: '持有龙头-同向变化',
  },
  {
    id: 5,
    section: 1,
    title: '我持有龙头，龙头跌停，跟风也跌停',
    category: '持有龙头-同向变化',
  },
  {
    id: 6,
    section: 1,
    title: '我持有龙头，龙头跌停，跟风大跌但未跌停(-5%至-9%)',
    category: '持有龙头-同向变化',
  },
  {
    id: 7,
    section: 1,
    title: '我持有龙头，龙头震荡(±2%以内)，跟风也震荡',
    category: '持有龙头-同向变化',
  },
  {
    id: 8,
    section: 1,
    title: '我持有龙头，龙头上涨5%+，跟风却下跌',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 9,
    section: 1,
    title: '我持有龙头，龙头涨停，跟风却下跌',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 10,
    section: 1,
    title: '我持有龙头，龙头涨停，跟风却跌停',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 11,
    section: 1,
    title: '我持有龙头，龙头下跌，跟风却上涨',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 12,
    section: 1,
    title: '我持有龙头，龙头跌停，跟风却上涨',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 13,
    section: 1,
    title: '我持有龙头，龙头跌停，跟风却涨停',
    category: '持有龙头-反向变化',
    important: true,
  },
  {
    id: 14,
    section: 1,
    title: '我持有龙头，龙头上涨3%，跟风仅上涨1%（跟风明显弱于龙头）',
    category: '持有龙头-分化',
  },
  {
    id: 15,
    section: 1,
    title: '我持有龙头，龙头上涨1%，跟风上涨5%（跟风明显强于龙头）',
    category: '持有龙头-分化',
  },
  {
    id: 16,
    section: 1,
    title: '我持有龙头，龙头下跌5%，跟风仅下跌1%（跟风明显抗跌）',
    category: '持有龙头-分化',
  },
  {
    id: 17,
    section: 1,
    title: '我持有龙头，龙头下跌1%，跟风下跌5%（跟风明显弱于龙头）',
    category: '持有龙头-分化',
  },

  // 二、持有跟风股时的场景 (18-32)
  {
    id: 18,
    section: 2,
    title: '我持有跟风，龙头上涨5%+，跟风同步上涨5%+',
    category: '持有跟风-同向变化',
  },
  {
    id: 19,
    section: 2,
    title: '我持有跟风，龙头涨停，跟风也涨停',
    category: '持有跟风-同向变化',
  },
  {
    id: 20,
    section: 2,
    title: '我持有跟风，龙头涨停，跟风上涨但未涨停',
    category: '持有跟风-同向变化',
  },
  {
    id: 21,
    section: 2,
    title: '我持有跟风，龙头下跌3%+，跟风也下跌3%+',
    category: '持有跟风-同向变化',
  },
  {
    id: 22,
    section: 2,
    title: '我持有跟风，龙头跌停，跟风也跌停',
    category: '持有跟风-同向变化',
  },
  {
    id: 23,
    section: 2,
    title: '我持有跟风，龙头震荡，跟风也震荡',
    category: '持有跟风-同向变化',
  },
  {
    id: 24,
    section: 2,
    title: '我持有跟风，龙头上涨5%+，跟风却下跌',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 25,
    section: 2,
    title: '我持有跟风，龙头涨停，跟风却下跌',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 26,
    section: 2,
    title: '我持有跟风，龙头涨停，跟风却跌停',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 27,
    section: 2,
    title: '我持有跟风，龙头下跌，跟风却上涨（跟风独立走强）',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 28,
    section: 2,
    title: '我持有跟风，龙头跌停，跟风却上涨',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 29,
    section: 2,
    title: '我持有跟风，龙头跌停，跟风却涨停',
    category: '持有跟风-反向变化',
    important: true,
  },
  {
    id: 30,
    section: 2,
    title: '我持有跟风，龙头上涨5%，跟风仅上涨1%（跟风明显弱于龙头）',
    category: '持有跟风-分化',
  },
  {
    id: 31,
    section: 2,
    title: '我持有跟风，龙头上涨1%，跟风上涨5%（跟风明显强于龙头）',
    category: '持有跟风-分化',
  },
  {
    id: 32,
    section: 2,
    title: '我持有跟风，龙头下跌1%，跟风下跌5%（跟风明显弱于龙头）',
    category: '持有跟风-分化',
  },

  // 三、空仓观望时的场景 (33-42)
  {
    id: 33,
    section: 3,
    title: '我空仓，龙头涨停，跟风也涨停',
    category: '空仓观望-同向变化',
  },
  {
    id: 34,
    section: 3,
    title: '我空仓，龙头上涨5%+，跟风也上涨5%+',
    category: '空仓观望-同向变化',
  },
  {
    id: 35,
    section: 3,
    title: '我空仓，龙头下跌，跟风也下跌',
    category: '空仓观望-同向变化',
  },
  {
    id: 36,
    section: 3,
    title: '我空仓，龙头跌停，跟风也跌停',
    category: '空仓观望-同向变化',
  },
  {
    id: 37,
    section: 3,
    title: '我空仓，龙头涨停，跟风却下跌',
    category: '空仓观望-反向变化',
    important: true,
  },
  {
    id: 38,
    section: 3,
    title: '我空仓，龙头涨停，跟风却跌停',
    category: '空仓观望-反向变化',
    important: true,
  },
  {
    id: 39,
    section: 3,
    title: '我空仓，龙头下跌，跟风却上涨',
    category: '空仓观望-反向变化',
  },
  {
    id: 40,
    section: 3,
    title: '我空仓，龙头跌停，跟风却涨停',
    category: '空仓观望-反向变化',
    important: true,
  },
  {
    id: 41,
    section: 3,
    title: '我空仓，龙头上涨5%，跟风仅上涨1%',
    category: '空仓观望-分化',
  },
  {
    id: 42,
    section: 3,
    title: '我空仓，龙头上涨1%，跟风上涨5%',
    category: '空仓观望-分化',
  },

  // 四、特殊情境场景-盘中实时决策 (43-47)
  {
    id: 43,
    section: 4,
    title: '盘中，我持有龙头获利10%+，突然跟风开始集体跌停',
    category: '盘中实时决策',
  },
  {
    id: 44,
    section: 4,
    title: '盘中，我持有龙头，龙头突然炸板(从涨停打开)，跟风却继续涨停',
    category: '盘中实时决策',
  },
  {
    id: 45,
    section: 4,
    title: '盘中，我持有龙头，龙头二次封板，跟风全部跌停',
    category: '盘中实时决策',
  },
  {
    id: 46,
    section: 4,
    title: '盘中，我空仓，龙头一字板，跟风低开后快速拉升涨停',
    category: '盘中实时决策',
  },
  {
    id: 47,
    section: 4,
    title: '盘中，我持有跟风，龙头涨停，跟风冲高回落转跌',
    category: '盘中实时决策',
  },

  // 五、隔日表现 (48-51)
  {
    id: 48,
    section: 5,
    title: '昨日龙头涨停我持有，今日龙头一字板，跟风全部大跌',
    category: '隔日表现',
  },
  {
    id: 49,
    section: 5,
    title: '昨日龙头涨停我持有，今日龙头低开下跌，跟风却集体高开上涨',
    category: '隔日表现',
  },
  {
    id: 50,
    section: 5,
    title: '昨日龙头涨停我空仓，今日龙头高开继续上涨，跟风分化严重',
    category: '隔日表现',
  },
  {
    id: 51,
    section: 5,
    title: '昨日我持有跟风，今日龙头高开秒板，我的跟风低开下跌',
    category: '隔日表现',
  },

  // 六、连板高度相关场景 (52-55)
  {
    id: 52,
    section: 6,
    title: '我持有龙头(已3连板)，今日龙头4连板，跟风2连板',
    category: '连板高度',
  },
  {
    id: 53,
    section: 6,
    title: '我持有龙头(已5连板)，今日龙头炸板失败，跟风却纷纷涨停',
    category: '连板高度',
  },
  {
    id: 54,
    section: 6,
    title: '我空仓，龙头7连板，跟风最高3连板',
    category: '连板高度',
  },
  {
    id: 55,
    section: 6,
    title: '我持有跟风(2连板)，龙头今日断板，跟风继续涨停3连板',
    category: '连板高度',
  },

  // 七、仓位管理相关场景 (56-60)
  {
    id: 56,
    section: 7,
    title: '我半仓持有龙头，龙头涨停，跟风全部涨停(板块情绪高潮)',
    category: '仓位管理',
  },
  {
    id: 57,
    section: 7,
    title: '我半仓持有龙头，龙头涨停，跟风全部下跌(龙头独立走强)',
    category: '仓位管理',
  },
  {
    id: 58,
    section: 7,
    title: '我满仓持有龙头，龙头跌停，跟风集体跌停',
    category: '仓位管理',
  },
  {
    id: 59,
    section: 7,
    title: '我半仓持有跟风，龙头涨停，跟风上涨3%',
    category: '仓位管理',
  },
  {
    id: 60,
    section: 7,
    title: '我满仓持有跟风，龙头跌停，跟风下跌5%',
    category: '仓位管理',
  },

  // 八、换股决策场景 (61-66)
  {
    id: 61,
    section: 8,
    title: '我持有龙头获利15%，跟风今日集体涨停，龙头仅上涨3%',
    category: '换股决策',
  },
  {
    id: 62,
    section: 8,
    title: '我持有跟风获利5%，龙头今日涨停，跟风上涨2%',
    category: '换股决策',
  },
  {
    id: 63,
    section: 8,
    title: '我持有龙头亏损5%，跟风今日全部涨停，龙头下跌3%',
    category: '换股决策',
  },
  {
    id: 64,
    section: 8,
    title: '我持有跟风亏损8%，龙头今日涨停，跟风继续下跌',
    category: '换股决策',
  },
  {
    id: 65,
    section: 8,
    title: '我持有跟风A，龙头涨停，跟风A上涨3%，跟风B涨停',
    category: '换股决策',
  },
  {
    id: 66,
    section: 8,
    title: '我持有跟风A亏损，龙头涨停，跟风A下跌，跟风B涨停',
    category: '换股决策',
  },

  // 九、情绪周期相关场景 (67-80)
  {
    id: 67,
    section: 9,
    title: '板块首日启动，龙头首板涨停，跟风大部分上涨3-5%，我空仓',
    category: '情绪周期-启动期',
  },
  {
    id: 68,
    section: 9,
    title: '板块第二日，龙头2连板，跟风部分首板，部分上涨，我持有龙头',
    category: '情绪周期-启动期',
  },
  {
    id: 69,
    section: 9,
    title: '板块高潮，龙头5连板，跟风集体涨停，我空仓',
    category: '情绪周期-高潮期',
  },
  {
    id: 70,
    section: 9,
    title: '板块高潮，龙头6连板，跟风集体涨停，我持有龙头',
    category: '情绪周期-高潮期',
  },
  {
    id: 71,
    section: 9,
    title: '板块高潮，龙头7连板，跟风出现分化(部分涨停部分下跌)，我持有龙头',
    category: '情绪周期-高潮期',
  },
  {
    id: 72,
    section: 9,
    title: '龙头断板(从5连板断板)，跟风集体跌停，我持有龙头',
    category: '情绪周期-退潮期',
  },
  {
    id: 73,
    section: 9,
    title: '龙头断板后反抽，跟风继续跌停，我空仓',
    category: '情绪周期-退潮期',
  },
  {
    id: 74,
    section: 9,
    title: '龙头跌停，跟风集体跌停，板块彻底退潮，我持有跟风',
    category: '情绪周期-退潮期',
  },
  {
    id: 75,
    section: 9,
    title: '我空仓观望多日，龙头已经5连板，跟风今日集体涨停',
    category: '心理压力-踏空',
  },
  {
    id: 76,
    section: 9,
    title: '我昨日刚卖出龙头，今日龙头涨停，跟风集体涨停',
    category: '心理压力-踏空',
  },
  {
    id: 77,
    section: 9,
    title: '我持有龙头亏损15%，今日龙头继续跌停，跟风集体跌停',
    category: '心理压力-亏损',
  },
  {
    id: 78,
    section: 9,
    title: '我持有跟风亏损20%，龙头今日涨停，跟风继续下跌',
    category: '心理压力-亏损',
  },
  {
    id: 79,
    section: 9,
    title: '我持有龙头浮盈30%，今日龙头跌停，跟风集体跌停',
    category: '心理压力-获利回吐',
  },
  {
    id: 80,
    section: 9,
    title: '我持有龙头浮盈50%，今日龙头炸板，跟风集体跌停',
    category: '心理压力-获利回吐',
  },
];

/**
 * 根据section获取场景列表
 */
export function getScenariosBySection(sectionId: number): Scenario[] {
  return scenarios.filter(s => s.section === sectionId);
}

/**
 * 根据ID获取场景
 */
export function getScenarioById(id: number): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}

/**
 * 获取重要场景列表
 */
export function getImportantScenarios(): Scenario[] {
  return scenarios.filter(s => s.important);
}

/**
 * 计算场景填写进度
 */
export function calculateProgress(answeredIds: number[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = scenarios.length;
  const completed = answeredIds.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}
