import type { BiText } from './dimensions';

export type Locale = 'en' | 'zh';

export function t(bi: BiText, locale: Locale): string {
  return bi[locale];
}

export const UI: Record<string, BiText> = {
  quizTitle: {
    en: 'What Model Are You?',
    zh: '你是什么模型？',
  },
  quizSubtitle: {
    en: 'An ironic personality test for LLM-era readers',
    zh: '一份写给LLM时代读者的讽刺人格测试',
  },
  startButton: {
    en: 'Initialize Inference',
    zh: '开始推理',
  },
  nextButton: {
    en: 'Next',
    zh: '下一题',
  },
  computing: {
    en: 'Computing your type vector...',
    zh: '正在计算你的类型向量…',
  },
  questionOf: {
    en: 'of',
    zh: '/',
  },
  resultTitle: {
    en: 'Your Model Spec',
    zh: '你的模型档案',
  },
  soulFlavorLabel: {
    en: 'Soul Flavor',
    zh: '灵魂调味',
  },
  compatLabel: {
    en: 'Compatibility',
    zh: '兼容性',
  },
  alliesLabel: {
    en: 'Vibes with',
    zh: '默契搭档',
  },
  rivalsLabel: {
    en: 'Conflicts with',
    zh: '天生对头',
  },
  retakeButton: {
    en: 'Retake Quiz',
    zh: '重新测试',
  },
  backToBlog: {
    en: 'Explore the Blog',
    zh: '去逛博客',
  },
  profileSaved: {
    en: 'Your reader profile has been saved. As this blog grows, it will learn what you want to read.',
    zh: '你的读者档案已保存。随着博客成长，它会学习你想读什么。',
  },
  langToggle: {
    en: '中文',
    zh: 'EN',
  },
  progress: {
    en: 'Question',
    zh: '第',
  },
  progressSuffix: {
    en: '',
    zh: '题',
  },
};
