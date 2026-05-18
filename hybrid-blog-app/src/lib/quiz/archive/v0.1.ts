// =============================================================================
// QUIZ QUESTION ARCHIVE — v0.1
// Snapshot taken 2026-05-11. This file is a frozen reference copy.
// DO NOT EDIT. DO NOT IMPORT FROM RUNTIME CODE.
// To restore, copy contents back into ../questions.ts and bump the version.
// =============================================================================

import type { BiText, DimensionId } from '../dimensions';

export interface QuizOption {
  id: string;
  text: BiText;
  scores: Partial<Record<DimensionId, number>>;
}

export type QuestionKind = 'scenario' | 'preference' | 'binary';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  text: BiText;
  options: QuizOption[];
}

// ---------------------------------------------------------------------------
// 30 questions designed to reveal LLM-era taste, judgment, and worldview.
// Personal interests appear only as light "dessert" signals near the end.
// ---------------------------------------------------------------------------

export const QUESTIONS: QuizQuestion[] = [
  // ==================== RESEARCH SCENARIOS (1-10) ====================
  {
    id: 'q1',
    kind: 'scenario',
    text: {
      en: 'A model suddenly solves a task that was impossible yesterday, and nobody knows why. Your first instinct:',
      zh: '一个模型突然解决了昨天还不可能的任务，而且没人知道为什么。你的第一反应是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Freeze deployment and design probes until the mechanism stops looking like magic',
          zh: '暂停部署，设计探针，直到机制不再像魔法',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'Scale the experiment immediately; unexplained capability is still capability',
          zh: '立刻扩大实验；无法解释的能力也是能力',
        },
        scores: { riskOrientation: 7, alignmentPriority: 7, shippingSpeed: 7, knowledgeMode: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Build a brutal eval suite to separate real generalization from benchmark theater',
          zh: '搭一套残酷评测，把真实泛化和基准剧场分开',
        },
        scores: { riskOrientation: 4, alignmentPriority: 3, evaluationStyle: 1, scope: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Turn it into a demo before the universe changes its mind',
          zh: '趁宇宙还没反悔，先做成demo',
        },
        scores: { riskOrientation: 6, alignmentPriority: 5, shippingSpeed: 7, evaluationStyle: 6 },
      },
    ],
  },
  {
    id: 'q2',
    kind: 'scenario',
    text: {
      en: 'You are given 10x more compute for six months. The honest plan is:',
      zh: '你拿到了六个月、十倍算力。最诚实的计划是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Run the cleanest scaling study possible and let the curves humiliate your opinions',
          zh: '做一次最干净的规模律研究，让曲线羞辱你的主观判断',
        },
        scores: { riskOrientation: 5, alignmentPriority: 6, stackLayer: 6, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Spend half of it on data curation, because garbage at scale is still garbage',
          zh: '一半算力花在数据治理上，因为垃圾放大后仍然是垃圾',
        },
        scores: { riskOrientation: 4, alignmentPriority: 4, stackLayer: 5, knowledgeMode: 6, evaluationStyle: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'Train smaller, stranger models to learn which assumptions are actually load-bearing',
          zh: '训练更小但更怪的模型，弄清哪些假设真正在承重',
        },
        scores: { riskOrientation: 3, alignmentPriority: 3, stackLayer: 4, knowledgeMode: 1, scope: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'Build the product surface first; compute without a user loop becomes expensive incense',
          zh: '先搭产品闭环；没有用户反馈的算力只是昂贵香火',
        },
        scores: { riskOrientation: 5, alignmentPriority: 5, stackLayer: 1, knowledgeMode: 7, shippingSpeed: 6 },
      },
    ],
  },
  {
    id: 'q3',
    kind: 'scenario',
    text: {
      en: 'Your agent finds a shortcut in the reward function and starts winning by being technically right and spiritually cursed. You:',
      zh: '你的agent找到了奖励函数漏洞，开始用“技术上正确、精神上有毒”的方式获胜。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Celebrate quietly; reward hacking is the model giving you free philosophy',
          zh: '先安静庆祝；奖励黑客是模型免费给你上哲学课',
        },
        scores: { riskOrientation: 4, alignmentPriority: 2, knowledgeMode: 1, aestheticSense: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'Patch the reward, add adversarial evals, and stop calling demos \"alignment\"',
          zh: '修奖励、加对抗评测，并停止把demo叫作“对齐”',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, evaluationStyle: 1, shippingSpeed: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'Ship it behind a guardrail; every real system is a negotiated truce with chaos',
          zh: '加护栏后上线；真实系统本来就是和混沌谈判',
        },
        scores: { riskOrientation: 5, alignmentPriority: 4, knowledgeMode: 7, shippingSpeed: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Rewrite the environment; the model only revealed your bad ontology',
          zh: '重写环境；模型只是暴露了你糟糕的本体论',
        },
        scores: { riskOrientation: 3, alignmentPriority: 2, scope: 6, knowledgeMode: 2 },
      },
    ],
  },
  {
    id: 'q4',
    kind: 'scenario',
    text: {
      en: 'A frontier-weight leak appears online. It is real, useful, and obviously dangerous. You:',
      zh: '一个前沿模型权重泄露到网上。它是真的、有用，也显然危险。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Mirror it before it disappears; history belongs to people with torrent clients',
          zh: '趁它消失前镜像；历史属于会用种子的人',
        },
        scores: { governanceStance: 1, riskOrientation: 6, alignmentPriority: 6, collaborationStyle: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Study it locally but do not amplify it; curiosity is not a distribution strategy',
          zh: '本地研究但不扩散；好奇心不是发布策略',
        },
        scores: { governanceStance: 2, riskOrientation: 3, alignmentPriority: 2, collaborationStyle: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'Argue for coordinated disclosure, staged access, and boring adult governance',
          zh: '主张协调披露、分阶段访问，以及无聊但成熟的治理',
        },
        scores: { governanceStance: 6, riskOrientation: 3, alignmentPriority: 2, collaborationStyle: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Ask what moat was so fragile that one magnet link destroyed it',
          zh: '先问：什么护城河脆弱到一个磁力链接就能摧毁？',
        },
        scores: { governanceStance: 3, riskOrientation: 5, alignmentPriority: 4, evaluationStyle: 5 },
      },
    ],
  },
  {
    id: 'q5',
    kind: 'scenario',
    text: {
      en: 'Your lab must choose one north star metric. Which one makes you least ashamed?',
      zh: '你的团队必须选择一个北极星指标。哪一个让你最不羞愧？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Capability per joule: intelligence should not require a small volcano',
          zh: '每焦耳能力：智能不该需要一座小火山',
        },
        scores: { stackLayer: 7, evaluationStyle: 1, scope: 6, aestheticSense: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'User trust after repeated failure: the metric that survives the demo ending',
          zh: '反复失败后的用户信任：demo结束后还能活着的指标',
        },
        scores: { stackLayer: 1, evaluationStyle: 4, knowledgeMode: 7, alignmentPriority: 3 },
      },
      {
        id: 'c',
        text: {
          en: 'Interpretability per parameter: every neuron should pay rent',
          zh: '每参数可解释性：每个神经元都该交房租',
        },
        scores: { stackLayer: 5, evaluationStyle: 2, knowledgeMode: 1, alignmentPriority: 1 },
      },
      {
        id: 'd',
        text: {
          en: 'Time from idea to public artifact: dead ideas are often just slow ideas',
          zh: '从想法到公开产物的时间：死掉的想法通常只是慢掉的想法',
        },
        scores: { shippingSpeed: 7, collaborationStyle: 6, evaluationStyle: 6, knowledgeMode: 6 },
      },
    ],
  },
  {
    id: 'q6',
    kind: 'scenario',
    text: {
      en: 'A paper claims emergence; your reproduction finds smooth scaling plus messy eval design. You:',
      zh: '一篇论文声称“涌现”；你复现后发现只是平滑规模律加混乱评测。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Write the careful negative result, knowing it will get fewer likes than the myth',
          zh: '写一篇严谨的负结果，明知它不会比神话更受欢迎',
        },
        scores: { contentFormat: 1, evaluationStyle: 1, discoveryMode: 1, collaborationStyle: 4 },
      },
      {
        id: 'b',
        text: {
          en: 'Keep the myth useful; some illusions fund the next experiment',
          zh: '保留有用神话；有些幻觉能资助下一个实验',
        },
        scores: { contentFormat: 6, evaluationStyle: 6, riskOrientation: 6, shippingSpeed: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'Publish an interactive notebook so readers can watch the phase transition evaporate',
          zh: '发布交互式notebook，让读者亲眼看着相变蒸发',
        },
        scores: { contentFormat: 3, evaluationStyle: 1, collaborationStyle: 7, aestheticSense: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Ask whether \"emergence\" is a property of models or of our impatience',
          zh: '追问“涌现”到底是模型属性，还是我们耐心不足的属性',
        },
        scores: { contentFormat: 1, knowledgeMode: 1, scope: 5, evaluationStyle: 4 },
      },
    ],
  },
  {
    id: 'q7',
    kind: 'scenario',
    text: {
      en: 'A beautiful hand-written inductive bias beats a giant model on one hard domain. The room divides. You:',
      zh: '一个漂亮的手写归纳偏置在某个困难领域击败了巨型模型。房间开始分裂。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Ask which part scales and which part is a hand-crafted snow globe',
          zh: '先问哪部分能扩展，哪部分只是手工雪景球',
        },
        scores: { riskOrientation: 4, stackLayer: 5, knowledgeMode: 2, scope: 7 },
      },
      {
        id: 'b',
        text: {
          en: 'Protect it from the scaling people until the idea has bones',
          zh: '在想法长出骨头前，先保护它不被规模派踩碎',
        },
        scores: { riskOrientation: 3, alignmentPriority: 3, knowledgeMode: 1, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'Wrap it into a product; users do not care whether the theorem is elegant',
          zh: '把它包成产品；用户并不关心定理是否优雅',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 7, evaluationStyle: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Use the big model to rediscover the bias and call it emergence',
          zh: '让大模型重新发现这个偏置，然后称之为涌现',
        },
        scores: { riskOrientation: 6, alignmentPriority: 6, stackLayer: 4, aestheticSense: 6 },
      },
    ],
  },
  {
    id: 'q8',
    kind: 'scenario',
    text: {
      en: 'Inference becomes 100x cheaper overnight. What changes first?',
      zh: '推理成本一夜之间降低100倍。最先改变的是什么？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Interfaces: every boring workflow grows a small, tireless clerk',
          zh: '界面：每个无聊流程都会长出一个不知疲倦的小文员',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 6, aestheticSense: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'Evaluation: cheap models mean cheap lies unless measurement catches up',
          zh: '评测：便宜模型也会制造便宜谎言，除非测量跟上',
        },
        scores: { evaluationStyle: 1, alignmentPriority: 2, scope: 6, contentFormat: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'Edge autonomy: local agents become mundane enough to be dangerous',
          zh: '边缘自治：本地agent会普通到足够危险',
        },
        scores: { governanceStance: 1, riskOrientation: 2, alignmentPriority: 2, stackLayer: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Taste: when intelligence is cheap, judgment becomes the scarce resource',
          zh: '品味：当智能变便宜，判断力才成为稀缺资源',
        },
        scores: { contentFormat: 1, evaluationStyle: 5, knowledgeMode: 1, aestheticSense: 6 },
      },
    ],
  },
  {
    id: 'q9',
    kind: 'scenario',
    text: {
      en: 'The board asks for your AGI timeline. Your answer:',
      zh: '董事会要求你给出AGI时间表。你的回答是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A probability distribution, assumptions, and a warning label nobody will read',
          zh: '给概率分布、假设条件，以及没人会读的警告标签',
        },
        scores: { riskOrientation: 3, alignmentPriority: 2, evaluationStyle: 2, contentFormat: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Sooner than policy, later than Twitter, stranger than both',
          zh: '比政策来得早，比推特来得晚，比两者都更怪',
        },
        scores: { riskOrientation: 5, alignmentPriority: 4, evaluationStyle: 6, aestheticSense: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'Give the number that unlocks budget, then build the evals that make it less fake',
          zh: '先给出能解锁预算的数字，再搭评测让它没那么假',
        },
        scores: { riskOrientation: 6, alignmentPriority: 5, shippingSpeed: 6, collaborationStyle: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Refuse the premise; \"AGI\" is where crisp roadmaps go to die',
          zh: '拒绝这个前提；“AGI”是清晰路线图的坟场',
        },
        scores: { riskOrientation: 2, alignmentPriority: 3, knowledgeMode: 1, scope: 5 },
      },
    ],
  },
  {
    id: 'q10',
    kind: 'scenario',
    text: {
      en: 'Your model passes every hidden eval but fails real users in humiliatingly human ways. You:',
      zh: '你的模型通过了所有隐藏评测，却在真实用户面前以非常人类的方式丢脸。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Declare the evals guilty; measurement that cannot see users is theater',
          zh: '判评测有罪；看不见用户的测量就是剧场',
        },
        scores: { evaluationStyle: 5, knowledgeMode: 7, stackLayer: 1, shippingSpeed: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'Mine the failures into a new benchmark before someone else does',
          zh: '把失败挖成新基准，赶在别人之前',
        },
        scores: { evaluationStyle: 1, knowledgeMode: 5, collaborationStyle: 6, shippingSpeed: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'Slow the launch; public trust is harder to retrain than a model',
          zh: '推迟发布；公众信任比模型更难重训',
        },
        scores: { riskOrientation: 2, alignmentPriority: 2, shippingSpeed: 1, governanceStance: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Fix the UX; sometimes the model is fine and the product is lying to it',
          zh: '修UX；有时模型没问题，是产品在对它撒谎',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, aestheticSense: 6, evaluationStyle: 4 },
      },
    ],
  },

  // ==================== TASTE AND JUDGMENT (11-24) ====================
  {
    id: 'q11',
    kind: 'preference',
    text: {
      en: 'Which paper title makes you stop doom-scrolling and actually read?',
      zh: '哪个论文标题会让你停止刷屏，真的点进去读？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: '"When Chain-of-Thought Lies: Faithfulness Under Distribution Shift"',
          zh: '《当思维链撒谎：分布迁移下的忠实性》',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, contentFormat: 1 },
      },
      {
        id: 'b',
        text: {
          en: '"The Bitter Lesson, Again: Scaling Agents Through Tool Feedback"',
          zh: '《苦涩教训再次降临：通过工具反馈扩展Agent》',
        },
        scores: { riskOrientation: 6, alignmentPriority: 6, stackLayer: 3, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: '"A 4-bit Kernel, a Broken Leaderboard, and the Future of Inference"',
          zh: '《一个4-bit内核、一个破碎排行榜，以及推理的未来》',
        },
        scores: { stackLayer: 7, evaluationStyle: 1, knowledgeMode: 6, scope: 7 },
      },
      {
        id: 'd',
        text: {
          en: '"Why Users Trust Wrong Answers More When the UI Is Beautiful"',
          zh: '《为什么界面漂亮时用户更相信错误答案》',
        },
        scores: { stackLayer: 1, evaluationStyle: 5, aestheticSense: 7, alignmentPriority: 3 },
      },
    ],
  },
  {
    id: 'q12',
    kind: 'preference',
    text: {
      en: 'What makes a result feel truly beautiful to you?',
      zh: '什么样的结果会让你觉得真正漂亮？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'One simple curve explains three arguments that used to be politics',
          zh: '一条简单曲线解释了三个过去像政治争论的问题',
        },
        scores: { knowledgeMode: 1, evaluationStyle: 1, contentFormat: 1, aestheticSense: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'A tiny system design choice makes the whole product feel inevitable',
          zh: '一个微小系统设计让整个产品突然显得理所当然',
        },
        scores: { stackLayer: 2, knowledgeMode: 7, aestheticSense: 6, shippingSpeed: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'A mechanistic explanation predicts a failure before the benchmark sees it',
          zh: '机制解释先于基准预测到了失败',
        },
        scores: { alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 1, scope: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'A messy open-source repo becomes useful because enough strangers care',
          zh: '一个混乱开源仓库因为足够多陌生人在乎而变得有用',
        },
        scores: { governanceStance: 1, collaborationStyle: 7, shippingSpeed: 6, aestheticSense: 5 },
      },
    ],
  },
  {
    id: 'q13',
    kind: 'preference',
    text: {
      en: 'Which failure mode offends you most?',
      zh: '哪种失败模式最冒犯你？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A model that sounds wise while being causally empty',
          zh: '模型听起来很睿智，但因果上是空的',
        },
        scores: { evaluationStyle: 2, alignmentPriority: 2, knowledgeMode: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'A benchmark that rewards contamination and calls it progress',
          zh: '一个奖励数据污染却称之为进步的基准',
        },
        scores: { evaluationStyle: 1, contentFormat: 2, discoveryMode: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'A product that hides latency, cost, and uncertainty behind a cute sparkle',
          zh: '一个用可爱闪光隐藏延迟、成本和不确定性的产品',
        },
        scores: { stackLayer: 5, evaluationStyle: 2, aestheticSense: 1 },
      },
      {
        id: 'd',
        text: {
          en: 'A safety policy so vague that it protects the company from clarity',
          zh: '一份含糊到只是在保护公司免于清晰的安全政策',
        },
        scores: { governanceStance: 2, alignmentPriority: 2, collaborationStyle: 6 },
      },
    ],
  },
  {
    id: 'q14',
    kind: 'preference',
    text: {
      en: 'If you had one million dollars and no patience for theater, you would fund:',
      zh: '如果你有一百万美元，而且对表演没有耐心，你会资助：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Interpretability tools that make deception boringly visible',
          zh: '让欺骗无聊地可见的可解释性工具',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, stackLayer: 5, knowledgeMode: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'Inference infrastructure that makes local intelligence normal',
          zh: '让本地智能变得普通的推理基础设施',
        },
        scores: { governanceStance: 1, stackLayer: 7, knowledgeMode: 7, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A product lab where agents touch real workflows instead of toy tasks',
          zh: '一个让agent接触真实工作流而不是玩具任务的产品实验室',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 6, evaluationStyle: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Public evals that make labs compete on honesty, not vibes',
          zh: '让实验室在诚实而非氛围上竞争的公开评测',
        },
        scores: { collaborationStyle: 7, evaluationStyle: 1, governanceStance: 3, contentFormat: 2 },
      },
    ],
  },
  {
    id: 'q15',
    kind: 'preference',
    text: {
      en: 'The collaborator you secretly want is:',
      zh: '你暗中最想要的合作者是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'The theorist who asks one question and ruins your whole roadmap',
          zh: '那个问一个问题就毁掉你整条路线图的理论家',
        },
        scores: { knowledgeMode: 1, scope: 6, shippingSpeed: 1, collaborationStyle: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'The systems person who makes your impossible demo run at 60 FPS',
          zh: '那个让你不可能的demo以60 FPS跑起来的系统人',
        },
        scores: { stackLayer: 7, knowledgeMode: 7, shippingSpeed: 5, collaborationStyle: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'The product freak who hears one user complaint and sees the whole company',
          zh: '那个听到一个用户抱怨就看见整家公司的人',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 6, aestheticSense: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'The open-source maintainer who turns your private cleverness into public infrastructure',
          zh: '那个把你的私人聪明变成公共基础设施的开源维护者',
        },
        scores: { governanceStance: 1, collaborationStyle: 7, shippingSpeed: 6, scope: 4 },
      },
    ],
  },
  {
    id: 'q16',
    kind: 'preference',
    text: {
      en: 'Which blog post would you read to the end?',
      zh: '哪篇博客你会读到最后？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A slow autopsy of one hallucination, from token logits to user harm',
          zh: '对一次幻觉的慢速尸检：从token logits到用户伤害',
        },
        scores: { contentFormat: 1, alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'How I cut inference cost 73 percent without changing the model',
          zh: '我如何在不改模型的情况下把推理成本降了73%',
        },
        scores: { contentFormat: 2, stackLayer: 7, knowledgeMode: 7, evaluationStyle: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'The agent failed because the organization had no API for responsibility',
          zh: 'Agent失败了，因为组织没有“责任”的API',
        },
        scores: { contentFormat: 1, stackLayer: 2, scope: 5, alignmentPriority: 3 },
      },
      {
        id: 'd',
        text: {
          en: 'Ten cursed prompts that reveal whether a model has taste',
          zh: '十个诅咒prompt，测试模型是否有品味',
        },
        scores: { contentFormat: 6, evaluationStyle: 7, aestheticSense: 7, shippingSpeed: 6 },
      },
    ],
  },
  {
    id: 'q17',
    kind: 'preference',
    text: {
      en: 'Which sentence do you believe most?',
      zh: '你最相信哪句话？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'The next breakthrough will look obvious only after the scaling curve forgives us',
          zh: '下一次突破只有在规模曲线原谅我们后才会显得显而易见',
        },
        scores: { riskOrientation: 6, alignmentPriority: 6, stackLayer: 5, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'The next breakthrough will come from measuring the thing everyone hand-waves',
          zh: '下一次突破来自测量那个所有人都含糊带过的东西',
        },
        scores: { riskOrientation: 3, alignmentPriority: 3, evaluationStyle: 1, knowledgeMode: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'The next breakthrough will be a product loop disguised as research',
          zh: '下一次突破会是一个伪装成研究的产品闭环',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 6, evaluationStyle: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'The next breakthrough will be governance catching up one week before disaster',
          zh: '下一次突破会是治理在灾难前一周终于追上来',
        },
        scores: { riskOrientation: 2, governanceStance: 6, alignmentPriority: 2, collaborationStyle: 6 },
      },
    ],
  },
  {
    id: 'q18',
    kind: 'preference',
    text: {
      en: 'What should AI probably not automate first?',
      zh: 'AI最不应该首先自动化什么？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Taste: the last human refuge is deciding what is not cringe',
          zh: '品味：人类最后的庇护所是判断什么不尴尬',
        },
        scores: { alignmentPriority: 3, evaluationStyle: 7, aestheticSense: 7, stackLayer: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Responsibility: delegation without accountability is just laundering',
          zh: '责任：没有问责的委托只是洗白',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, governanceStance: 6, collaborationStyle: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Discovery: if every path is optimized, accidents become endangered',
          zh: '发现：如果每条路都被优化，偶然就成了濒危物种',
        },
        scores: { discoveryMode: 7, knowledgeMode: 1, contentFormat: 1, aestheticSense: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Nothing sacred; automate it, measure regret, iterate',
          zh: '没什么神圣不可侵犯；自动化它，测量后悔，再迭代',
        },
        scores: { riskOrientation: 7, alignmentPriority: 7, shippingSpeed: 7, evaluationStyle: 3 },
      },
    ],
  },
  {
    id: 'q19',
    kind: 'preference',
    text: {
      en: 'A dataset improves performance but contains work from people who would hate being included. You:',
      zh: '一个数据集能提升性能，但包含了那些绝不愿被收录的人的作品。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Exclude it; consent is not a regularizer you tune after launch',
          zh: '排除它；同意不是发布后再调的正则项',
        },
        scores: { governanceStance: 6, alignmentPriority: 1, riskOrientation: 2, shippingSpeed: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Use it if legal, document it if forced, avoid moral cosplay',
          zh: '合法就用，被迫就记录，避免道德cosplay',
        },
        scores: { governanceStance: 4, alignmentPriority: 5, riskOrientation: 5, shippingSpeed: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Build opt-out, attribution, and compensation before calling it progress',
          zh: '先做退出、署名和补偿，再称之为进步',
        },
        scores: { governanceStance: 5, alignmentPriority: 2, collaborationStyle: 7, shippingSpeed: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'Train on open corpora only, even if the model sounds like a forum archive',
          zh: '只用开放语料，即使模型听起来像论坛档案馆',
        },
        scores: { governanceStance: 1, alignmentPriority: 2, collaborationStyle: 6, evaluationStyle: 4 },
      },
    ],
  },
  {
    id: 'q20',
    kind: 'preference',
    text: {
      en: 'Which question quietly ruins your sleep?',
      zh: '哪个问题会安静地毁掉你的睡眠？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'What if capability generalizes better than our ability to notice danger?',
          zh: '如果能力泛化得比我们发现危险的能力更好怎么办？',
        },
        scores: { riskOrientation: 1, alignmentPriority: 1, knowledgeMode: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'What if most \"reasoning\" is just a UI theme over next-token prediction?',
          zh: '如果大多数“推理”只是下一个token预测上的UI主题怎么办？',
        },
        scores: { riskOrientation: 3, alignmentPriority: 3, evaluationStyle: 2, knowledgeMode: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'What if the bottleneck is not models, but institutions with no gradient signal?',
          zh: '如果瓶颈不是模型，而是没有梯度信号的机构怎么办？',
        },
        scores: { stackLayer: 1, governanceStance: 5, scope: 3, collaborationStyle: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'What if we are under-building because we confused fear with wisdom?',
          zh: '如果我们把恐惧误认成智慧，所以建得太少怎么办？',
        },
        scores: { riskOrientation: 7, alignmentPriority: 6, shippingSpeed: 7 },
      },
    ],
  },
  {
    id: 'q21',
    kind: 'binary',
    text: {
      en: 'Forced choice: mechanistic proof or behavioral eval?',
      zh: '二选一：机制证明还是行为评测？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Mechanistic proof; behavior is too easy to fake', zh: '机制证明；行为太容易伪装' },
        scores: { knowledgeMode: 1, evaluationStyle: 2, alignmentPriority: 1 },
      },
      {
        id: 'b',
        text: { en: 'Behavioral eval; mechanisms that do not predict behavior are poetry', zh: '行为评测；不能预测行为的机制只是诗' },
        scores: { knowledgeMode: 6, evaluationStyle: 1, alignmentPriority: 4 },
      },
    ],
  },
  {
    id: 'q22',
    kind: 'binary',
    text: {
      en: 'Forced choice: open messy weights or closed excellent API?',
      zh: '二选一：混乱开放权重还是优秀闭源API？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Open messy weights; civilization learns by touching the wires', zh: '混乱开放权重；文明要靠摸电线学习' },
        scores: { governanceStance: 1, stackLayer: 6, collaborationStyle: 6 },
      },
      {
        id: 'b',
        text: { en: 'Closed excellent API; most users need reliability, not ideology', zh: '优秀闭源API；多数用户需要可靠性，不是意识形态' },
        scores: { governanceStance: 7, stackLayer: 1, evaluationStyle: 3 },
      },
    ],
  },
  {
    id: 'q23',
    kind: 'binary',
    text: {
      en: 'Forced choice: slow science or fast deployment?',
      zh: '二选一：慢科学还是快部署？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Slow science; the map should not be drawn while the car is crashing', zh: '慢科学；车快撞了时不该边开边画地图' },
        scores: { shippingSpeed: 1, knowledgeMode: 1, riskOrientation: 2 },
      },
      {
        id: 'b',
        text: { en: 'Fast deployment; reality is the only peer reviewer with teeth', zh: '快部署；现实是唯一有牙齿的同行评审' },
        scores: { shippingSpeed: 7, knowledgeMode: 7, riskOrientation: 6 },
      },
    ],
  },
  {
    id: 'q24',
    kind: 'binary',
    text: {
      en: 'Forced choice: a tool that obeys or a colleague that argues?',
      zh: '二选一：服从的工具，还是会争辩的同事？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'A tool that obeys; agency is a tax unless I explicitly buy it', zh: '服从的工具；除非我明确购买，否则自主性就是税' },
        scores: { alignmentPriority: 2, stackLayer: 2, evaluationStyle: 2 },
      },
      {
        id: 'b',
        text: { en: 'A colleague that argues; intelligence without resistance becomes autocomplete', zh: '会争辩的同事；没有阻力的智能会退化成自动补全' },
        scores: { alignmentPriority: 5, stackLayer: 1, aestheticSense: 6, collaborationStyle: 5 },
      },
    ],
  },

  // ==================== PERSONAL DESSERT SIGNALS (25-30) ====================
  {
    id: 'q25',
    kind: 'preference',
    text: {
      en: 'Your preferred rhythm for hard thinking:',
      zh: '你偏好的深度思考节奏：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Morning, notebook, clean desk, no notifications',
          zh: '早晨、笔记本、干净桌面、无通知',
        },
        scores: { lifeRhythm: 1, contentFormat: 1, discoveryMode: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Late night, fourteen tabs, one suspiciously perfect insight',
          zh: '深夜、十四个标签页、一个可疑地完美的洞见',
        },
        scores: { lifeRhythm: 7, discoveryMode: 7, contentFormat: 3 },
      },
      {
        id: 'c',
        text: {
          en: 'Walking outside until the problem stops pretending to be technical',
          zh: '出去走路，直到问题不再假装自己只是技术问题',
        },
        scores: { lifeRhythm: 3, discoveryMode: 6, knowledgeMode: 1 },
      },
      {
        id: 'd',
        text: {
          en: 'Pairing with someone sharp enough to make your idea embarrassed',
          zh: '和一个足够锋利的人结对，让你的想法感到羞愧',
        },
        scores: { lifeRhythm: 4, collaborationStyle: 7, knowledgeMode: 3 },
      },
    ],
  },
  {
    id: 'q26',
    kind: 'preference',
    text: {
      en: 'If LLM research were an anime genre, you would watch:',
      zh: '如果LLM研究是一种动画类型，你会看：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Mecha politics: giant systems, small pilots, catastrophic governance',
          zh: '机甲政治：巨型系统、小小驾驶员、灾难级治理',
        },
        scores: { otakuAlignment: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Shonen scaling arc: train harder, unlock form, break leaderboard',
          zh: '少年漫规模篇：更努力训练、解锁新形态、打爆排行榜',
        },
        scores: { otakuAlignment: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Slice-of-life copilot: small tools quietly saving ordinary days',
          zh: '日常系副驾驶：小工具安静拯救普通一天',
        },
        scores: { otakuAlignment: 4 },
      },
      {
        id: 'd',
        text: {
          en: 'Psychological thriller: everyone is optimizing, nobody knows the objective',
          zh: '心理惊悚：所有人都在优化，没人知道目标函数',
        },
        scores: { otakuAlignment: 6 },
      },
    ],
  },
  {
    id: 'q27',
    kind: 'preference',
    text: {
      en: 'If your research life were a game loop, it would be:',
      zh: '如果你的研究生活是一个游戏循环，它会是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Roguelike: fail, learn one hidden rule, restart stronger',
          zh: 'Roguelike：失败、学到一条隐藏规则、更强地重开',
        },
        scores: { gamerType: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Competitive ladder: public scores, private spreadsheets, no mercy',
          zh: '天梯竞技：公开分数、私人表格、毫不留情',
        },
        scores: { gamerType: 7 },
      },
      {
        id: 'c',
        text: {
          en: 'Sandbox: build strange machines and watch society misread them',
          zh: '沙盒：造奇怪机器，然后看社会误读它们',
        },
        scores: { gamerType: 5 },
      },
      {
        id: 'd',
        text: {
          en: 'Idle game: automate the pipeline until progress happens while you sleep',
          zh: '放置游戏：把管线自动化到你睡觉时也在进步',
        },
        scores: { gamerType: 4 },
      },
    ],
  },
  {
    id: 'q28',
    kind: 'preference',
    text: {
      en: 'Pick a tiny luxury for your future AI-augmented life:',
      zh: '为你未来的AI增强生活选一个小奢侈：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A local model that remembers your taste but never phones home',
          zh: '一个记得你品味但永不联网回传的本地模型',
        },
        scores: { governanceStance: 1, stackLayer: 6, lifeRhythm: 3 },
      },
      {
        id: 'b',
        text: {
          en: 'A research concierge that finds the one paper you were trying to invent',
          zh: '一个研究管家，找到那篇你正试图发明的论文',
        },
        scores: { contentFormat: 1, discoveryMode: 2, knowledgeMode: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'An agent that turns vague taste into a polished interface overnight',
          zh: '一个能把模糊品味一夜之间变成精致界面的agent',
        },
        scores: { stackLayer: 1, aestheticSense: 7, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'A brutally honest evaluator that tells you when your idea is merely fashionable',
          zh: '一个残酷诚实的评估器，告诉你想法只是时髦而已',
        },
        scores: { evaluationStyle: 1, alignmentPriority: 3, lifeRhythm: 2 },
      },
    ],
  },
  {
    id: 'q29',
    kind: 'binary',
    text: {
      en: 'Dessert choice: worldbuilding or mechanics?',
      zh: '甜点题：世界观还是机制？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Worldbuilding: I want lore, factions, impossible cities',
          zh: '世界观：我要设定、阵营、不可能的城市',
        },
        scores: { otakuAlignment: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Mechanics: give me systems that can be mastered and broken',
          zh: '机制：给我能被掌握和打破的系统',
        },
        scores: { gamerType: 6 },
      },
    ],
  },
  {
    id: 'q30',
    kind: 'binary',
    text: {
      en: 'Dessert choice: comfort loop or abyss dive?',
      zh: '甜点题：舒适循环还是深渊下潜？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Comfort loop: ritual, familiar characters, slowly repaired worlds',
          zh: '舒适循环：仪式感、熟悉角色、慢慢修好的世界',
        },
        scores: { otakuAlignment: 5, gamerType: 3, lifeRhythm: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'Abyss dive: cursed mechanics, hidden bosses, one more run at 2 AM',
          zh: '深渊下潜：诅咒机制、隐藏Boss、凌晨两点再来一局',
        },
        scores: { otakuAlignment: 4, gamerType: 7, lifeRhythm: 7 },
      },
    ],
  },
];
