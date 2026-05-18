export const DIMENSION_IDS = [
  'riskOrientation',
  'governanceStance',
  'alignmentPriority',
  'stackLayer',
  'knowledgeMode',
  'scope',
  'contentFormat',
  'evaluationStyle',
  'discoveryMode',
  'shippingSpeed',
  'collaborationStyle',
  'aestheticSense',
  'otakuAlignment',
  'gamerType',
  'lifeRhythm',
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export interface BiText {
  en: string;
  zh: string;
}

export interface Dimension {
  id: DimensionId;
  model: 1 | 2 | 3 | 4 | 5;
  label: BiText;
  low: BiText;
  high: BiText;
}

/** Core type-determining dimensions (Models 1-4, indices 0-11) */
export const CORE_DIMENSION_COUNT = 12;

/** All 15 dimensions grouped into 5 models */
export const DIMENSIONS: Dimension[] = [
  // --- Model 1: AI Worldview (AI哲学) ---
  {
    id: 'riskOrientation',
    model: 1,
    label: { en: 'Risk Orientation', zh: '风险取向' },
    low: { en: 'Doomer', zh: '末日派' },
    high: { en: 'Accelerationist', zh: '加速派' },
  },
  {
    id: 'governanceStance',
    model: 1,
    label: { en: 'Governance Stance', zh: '治理立场' },
    low: { en: 'Open Source', zh: '开源至上' },
    high: { en: 'Centralized Control', zh: '中心管控' },
  },
  {
    id: 'alignmentPriority',
    model: 1,
    label: { en: 'Alignment Priority', zh: '对齐优先级' },
    low: { en: 'Safety-First', zh: '安全优先' },
    high: { en: 'Capability-First', zh: '能力优先' },
  },
  // --- Model 2: Technical Identity (技术人格) ---
  {
    id: 'stackLayer',
    model: 2,
    label: { en: 'Stack Layer', zh: '技术栈层级' },
    low: { en: 'Application', zh: '应用层' },
    high: { en: 'Infrastructure', zh: '基础设施' },
  },
  {
    id: 'knowledgeMode',
    model: 2,
    label: { en: 'Knowledge Mode', zh: '知识模式' },
    low: { en: 'Theory', zh: '理论派' },
    high: { en: 'Practice', zh: '实践派' },
  },
  {
    id: 'scope',
    model: 2,
    label: { en: 'Scope', zh: '视野范围' },
    low: { en: 'Generalist', zh: '全栈通才' },
    high: { en: 'Specialist', zh: '深耕专家' },
  },
  // --- Model 3: Information Diet (信息食性) ---
  {
    id: 'contentFormat',
    model: 3,
    label: { en: 'Content Format', zh: '内容偏好' },
    low: { en: 'Long-form', zh: '长文深读' },
    high: { en: 'Short-form', zh: '短平快' },
  },
  {
    id: 'evaluationStyle',
    model: 3,
    label: { en: 'Evaluation Style', zh: '评估风格' },
    low: { en: 'Benchmark-Driven', zh: '跑分驱动' },
    high: { en: 'Vibes-Based', zh: '直觉驱动' },
  },
  {
    id: 'discoveryMode',
    model: 3,
    label: { en: 'Discovery Mode', zh: '发现方式' },
    low: { en: 'Systematic', zh: '系统检索' },
    high: { en: 'Serendipitous', zh: '随缘发现' },
  },
  // --- Model 4: Builder Orientation (造物倾向) ---
  {
    id: 'shippingSpeed',
    model: 4,
    label: { en: 'Shipping Speed', zh: '交付速度' },
    low: { en: 'Perfect-First', zh: '完美主义' },
    high: { en: 'Move-Fast', zh: '快速迭代' },
  },
  {
    id: 'collaborationStyle',
    model: 4,
    label: { en: 'Collaboration Style', zh: '协作风格' },
    low: { en: 'Solo', zh: '独行侠' },
    high: { en: 'Community', zh: '社区驱动' },
  },
  {
    id: 'aestheticSense',
    model: 4,
    label: { en: 'Aesthetic Sense', zh: '审美倾向' },
    low: { en: 'Minimalist', zh: '极简主义' },
    high: { en: 'Maximalist', zh: '极繁主义' },
  },
  // --- Model 5: Soul Flavor (灵魂调味) ---
  {
    id: 'otakuAlignment',
    model: 5,
    label: { en: 'Otaku Alignment', zh: '二次元浓度' },
    low: { en: 'Casual Viewer', zh: '路人观众' },
    high: { en: 'Deep Otaku', zh: '资深宅' },
  },
  {
    id: 'gamerType',
    model: 5,
    label: { en: 'Gamer Type', zh: '游戏类型' },
    low: { en: 'Casual', zh: '休闲玩家' },
    high: { en: 'Hardcore', zh: '硬核玩家' },
  },
  {
    id: 'lifeRhythm',
    model: 5,
    label: { en: 'Life Rhythm', zh: '生活节奏' },
    low: { en: 'Structured', zh: '规律作息' },
    high: { en: 'Chaotic', zh: '混沌自由' },
  },
];

export const MODEL_LABELS: Record<number, BiText> = {
  1: { en: 'AI Worldview', zh: 'AI哲学' },
  2: { en: 'Technical Identity', zh: '技术人格' },
  3: { en: 'Information Diet', zh: '信息食性' },
  4: { en: 'Builder Orientation', zh: '造物倾向' },
  5: { en: 'Soul Flavor', zh: '灵魂调味' },
};
