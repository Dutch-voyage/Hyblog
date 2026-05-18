import type { BiText, DimensionId } from './dimensions';

export interface QuizOption {
  id: string;
  text: BiText;
  scores: Partial<Record<DimensionId, number>>;
}

export type QuestionKind = 'scenario' | 'preference' | 'binary' | 'reflection';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  text: BiText;
  options: QuizOption[];
}

// ---------------------------------------------------------------------------
// 30 easy-to-read LLM culture questions.
// The scope stays practical, but the voice is intentionally roast-y: real
// industry memes, benchmark drama, agent demos, AI slop, and GPU-bill comedy.
// ---------------------------------------------------------------------------

export const QUESTIONS: QuizQuestion[] = [
  // ==================== LLM MOMENTS (1-10) ====================
  {
    id: 'q1',
    kind: 'scenario',
    text: {
      en: 'A new model gets a "ChatGPT moment": your group chat, your boss, and three LinkedIn gurus all discover it on the same morning. You:',
      zh: '一个新模型迎来了“ChatGPT时刻”：你的群聊、老板和三个 LinkedIn 大师同一天早上都发现了它。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Run the weird-failure tests before everyone tattoos "AGI" on their forehead',
          zh: '先跑诡异失败测试，别让大家把“AGI”纹在额头上',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'Ship a tiny product before the thinkpieces achieve sentience',
          zh: '趁思想文章还没觉醒，先上线一个小产品',
        },
        scores: { riskOrientation: 6, alignmentPriority: 5, stackLayer: 1, knowledgeMode: 7, shippingSpeed: 7 },
      },
      {
        id: 'c',
        text: {
          en: 'Plot the curve before the hype thread uses your skull as a data center',
          zh: '先画曲线，别让 hype 长文把你的头骨当数据中心',
        },
        scores: { riskOrientation: 4, alignmentPriority: 4, knowledgeMode: 2, evaluationStyle: 1, scope: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Prepare the launch plan, the policy memo, and the "we take this seriously" paragraph',
          zh: '准备发布计划、政策备忘录，以及“我们非常重视此事”段落',
        },
        scores: { riskOrientation: 5, governanceStance: 6, alignmentPriority: 4, collaborationStyle: 6 },
      },
    ],
  },
  {
    id: 'q2',
    kind: 'scenario',
    text: {
      en: 'A miracle budget appears. Finance says "please do not buy another GPU-shaped bonfire." You spend it on:',
      zh: '一笔奇迹预算出现了。财务说“求你别再买 GPU 形状的篝火了”。你会花在：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Red teams and safety evals, because "oops" is not a governance strategy',
          zh: '红队和安全评测，因为“哎呀”不是治理策略',
        },
        scores: { riskOrientation: 2, governanceStance: 5, alignmentPriority: 1, shippingSpeed: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'A polished app normal people can use without reading a Discord prophecy',
          zh: '一个普通人不用读 Discord 预言也能用的精致应用',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 6, shippingSpeed: 7, aestheticSense: 7 },
      },
      {
        id: 'c',
        text: {
          en: 'More compute, cleaner data, and a spreadsheet that whispers "the bitter lesson"',
          zh: '更多算力、更干净的数据，以及一张低语“苦涩教训”的表格',
        },
        scores: { riskOrientation: 5, alignmentPriority: 6, stackLayer: 4, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'd',
        text: {
          en: 'Kernels and inference cost, so the GPU bill stops looking like modern art',
          zh: '内核和推理成本，让 GPU 账单别再像当代艺术',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, aestheticSense: 1 },
      },
    ],
  },
  {
    id: 'q3',
    kind: 'scenario',
    text: {
      en: 'DeepSeek, Llama, or Qwen drops open weights and suddenly every closed-model moat looks like wet cardboard. You:',
      zh: 'DeepSeek、Llama 或 Qwen 发布开放权重，闭源护城河突然都像湿纸板。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Download it, run it locally, and whisper "the moat was a PowerPoint"',
          zh: '下载本地跑起来，然后低声说“护城河原来是 PPT”',
        },
        scores: { governanceStance: 1, stackLayer: 4, evaluationStyle: 7, shippingSpeed: 6, collaborationStyle: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Compare Arena, MMLU, and the sacred private eval: "does it annoy me in 90 seconds?"',
          zh: '对比 Arena、MMLU，以及神圣私人评测：“90 秒内它烦不烦我？”',
        },
        scores: { riskOrientation: 4, knowledgeMode: 2, evaluationStyle: 2, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'Ask who can safely use it, not just who can paste the magnet link fastest',
          zh: '先问谁能安全使用它，而不是谁复制磁力链接最快',
        },
        scores: { riskOrientation: 2, governanceStance: 5, alignmentPriority: 1, collaborationStyle: 3 },
      },
      {
        id: 'd',
        text: {
          en: 'Read the report for MoE, MLA, tokenizer dark arts, and whatever made Twitter panic',
          zh: '读报告里的 MoE、MLA、tokenizer 黑魔法，以及让推特惊慌的东西',
        },
        scores: { stackLayer: 6, knowledgeMode: 2, contentFormat: 1, scope: 7 },
      },
    ],
  },
  {
    id: 'q4',
    kind: 'scenario',
    text: {
      en: 'A startup says its agent can browse, code, file expenses, and "basically replace interns." You:',
      zh: '一家创业公司说它的 agent 会浏览器、写代码、报销，并且“基本能替代实习生”。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Ask for the failure logs; every agent demo has a small graveyard behind the curtain',
          zh: '要求看失败日志；每个 agent demo 幕布后面都有一片小墓地',
        },
        scores: { riskOrientation: 2, alignmentPriority: 2, evaluationStyle: 1, shippingSpeed: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'Give it a real task and watch the exact second it becomes a raccoon with sudo',
          zh: '给它一个真实任务，看它在哪一秒变成有 sudo 权限的浣熊',
        },
        scores: { riskOrientation: 4, knowledgeMode: 7, evaluationStyle: 5, shippingSpeed: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Wrap it in permissions, logs, and enough approval buttons to make compliance purr',
          zh: '给它包上权限、日志和一堆确认按钮，让合规部门舒服到打呼',
        },
        scores: { riskOrientation: 4, governanceStance: 6, alignmentPriority: 3, shippingSpeed: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Keep it in a sandbox until it stops booking meetings with imaginary VPs',
          zh: '关在沙盒里，直到它不再和虚构 VP 预约会议',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, stackLayer: 5, knowledgeMode: 3 },
      },
    ],
  },
  {
    id: 'q5',
    kind: 'scenario',
    text: {
      en: 'FlashAttention makes the GPU go brrr without immediately melting your budget. Emotionally, you are:',
      zh: 'FlashAttention 让 GPU 跑得飞快，而且预算没有立刻融化。你的情绪是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Crying respectfully at the memory layout like it is a Renaissance painting',
          zh: '对着显存布局肃然落泪，仿佛在看文艺复兴名画',
        },
        scores: { stackLayer: 7, knowledgeMode: 2, scope: 7, aestheticSense: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Great, bigger models arrive faster and my safety backlog now has a smoke alarm',
          zh: '很好，更大的模型来得更快，我的安全 backlog 已经装烟雾报警器了',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, stackLayer: 3, shippingSpeed: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'Can this make my inference bill stop cosplaying as a Series A?',
          zh: '这能不能让我的推理账单别再 cosplay A 轮融资？',
        },
        scores: { stackLayer: 3, knowledgeMode: 7, shippingSpeed: 7, evaluationStyle: 4 },
      },
      {
        id: 'd',
        text: {
          en: 'Show the throughput plot first; religious conversion requires benchmarks',
          zh: '先给吞吐量图；宗教皈依需要 benchmark',
        },
        scores: { stackLayer: 6, knowledgeMode: 2, evaluationStyle: 1, contentFormat: 1 },
      },
    ],
  },
  {
    id: 'q6',
    kind: 'scenario',
    text: {
      en: 'Your RAG chatbot cites a PDF that does not exist, with the confidence of a keynote speaker. You:',
      zh: '你的 RAG 聊天机器人引用了一篇不存在的 PDF，而且自信得像主会场演讲嘉宾。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Add citation checks and a shame counter that increments in public',
          zh: '加引用检查，以及一个公开增加的羞耻计数器',
        },
        scores: { riskOrientation: 3, alignmentPriority: 2, evaluationStyle: 1, shippingSpeed: 3 },
      },
      {
        id: 'b',
        text: {
          en: 'Fix chunking and embeddings before throwing the base model under the bus',
          zh: '先修 chunk 和 embedding，再把基础模型推到车轮下',
        },
        scores: { stackLayer: 5, knowledgeMode: 6, scope: 6, evaluationStyle: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'Add "AI may be wrong" in 11px gray text and pray legal accepts the offering',
          zh: '用 11px 灰字写上“AI 可能会错”，祈祷法务接受祭品',
        },
        scores: { riskOrientation: 6, alignmentPriority: 5, knowledgeMode: 7, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'Make uncertainty visible instead of hiding it under a magic-sparkle button',
          zh: '让不确定性可见，而不是藏在魔法闪光按钮下面',
        },
        scores: { stackLayer: 1, alignmentPriority: 3, aestheticSense: 7, knowledgeMode: 7 },
      },
    ],
  },
  {
    id: 'q7',
    kind: 'scenario',
    text: {
      en: 'A model wins a benchmark by 3 points and the launch tweet uses six rocket emojis. You ask:',
      zh: '一个模型 benchmark 高了 3 分，发布推文用了六个火箭表情。你会问：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Was the test set invited to the training data party?',
          zh: '测试集是不是也受邀参加训练数据派对了？',
        },
        scores: { riskOrientation: 3, alignmentPriority: 2, evaluationStyle: 1, discoveryMode: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Does it win in Chatbot Arena, or only in the holy spreadsheet monastery?',
          zh: '它在 Chatbot Arena 也赢，还是只赢在神圣表格修道院？',
        },
        scores: { knowledgeMode: 6, evaluationStyle: 6, contentFormat: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'Does this bend the scaling curve, or just bend the marketing deck?',
          zh: '这改变了规模曲线，还是只改变了市场材料？',
        },
        scores: { riskOrientation: 5, knowledgeMode: 2, evaluationStyle: 1, scope: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Can users feel it, or do I need to explain MMLU like a tax form?',
          zh: '用户能感觉到吗，还是我要像解释税表一样解释 MMLU？',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 5, shippingSpeed: 6 },
      },
    ],
  },
  {
    id: 'q8',
    kind: 'scenario',
    text: {
      en: 'A linear-attention paper declares "Transformer is dead" for the 47th time. What convinces you?',
      zh: '一篇线性注意力论文第 47 次宣布“Transformer 死了”。什么能说服你？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A serious-size scaling curve, not a vibes chart wearing a lab coat',
          zh: '严肃规模下的扩展曲线，而不是穿实验服的玄学图',
        },
        scores: { riskOrientation: 4, stackLayer: 5, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'A kernel that runs fast on real GPUs, not just in the abstract section',
          zh: '一个在真实 GPU 上跑得快的内核，不只是摘要里快',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, evaluationStyle: 2 },
      },
      {
        id: 'c',
        text: {
          en: 'A long-context app that remembers chapter one without gaslighting me',
          zh: '一个长上下文应用，能记住第一章而不是煤气灯我',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 6, shippingSpeed: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'Nothing yet. The Transformer has attended more funerals than Dracula.',
          zh: '暂时没有。Transformer 参加自己的葬礼比德古拉还多。',
        },
        scores: { riskOrientation: 3, knowledgeMode: 1, evaluationStyle: 2, shippingSpeed: 2 },
      },
    ],
  },
  {
    id: 'q9',
    kind: 'scenario',
    text: {
      en: 'Your team can only pick one "AI roadmap miracle" this month:',
      zh: '你的团队这个月只能选择一个“AI 路线图奇迹”：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Post-training so the model stops acting like a genius raccoon in a suit',
          zh: '后训练，让模型别再像穿西装的天才浣熊',
        },
        scores: { alignmentPriority: 2, knowledgeMode: 6, stackLayer: 2, shippingSpeed: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'More pretraining data and compute; the bitter lesson has not filed retirement papers',
          zh: '更多预训练数据和算力；苦涩教训还没提交退休申请',
        },
        scores: { riskOrientation: 6, alignmentPriority: 6, knowledgeMode: 2, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'MoE routing and inference tricks, because dense models eat money like kaiju',
          zh: 'MoE 路由和推理优化，因为 dense 模型吃钱像怪兽',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, aestheticSense: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'A clearer UX so users know when the model is guessing, bluffing, or doing jazz',
          zh: '更清楚的 UX，让用户知道模型是在猜、虚张声势，还是即兴爵士',
        },
        scores: { stackLayer: 1, alignmentPriority: 3, aestheticSense: 7, knowledgeMode: 7 },
      },
    ],
  },
  {
    id: 'q10',
    kind: 'scenario',
    text: {
      en: 'A reasoning model solves a puzzle and the internet schedules AGI for next Tuesday, 3 PM Pacific. You:',
      zh: '一个推理模型解出谜题，全网把 AGI 安排在下周二太平洋时间下午 3 点。你会：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Make the prompt ugly and adversarial, because real users do not write haiku',
          zh: '把提示词变丑、变对抗，因为真实用户不会写俳句',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'Compare it to the scaling forecast and update beliefs without becoming a prophet',
          zh: '对照规模预测，更新信念，但不要当场成为先知',
        },
        scores: { riskOrientation: 4, alignmentPriority: 4, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'Turn it into a product feature before X finishes arguing about the name',
          zh: '趁 X 还没吵完名字，先把它做成产品功能',
        },
        scores: { riskOrientation: 6, alignmentPriority: 5, knowledgeMode: 7, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'Write the governance note, because even "next Tuesday" needs an incident plan',
          zh: '写治理备忘录，因为就算是“下周二”也需要事故预案',
        },
        scores: { governanceStance: 7, riskOrientation: 3, alignmentPriority: 2, collaborationStyle: 6 },
      },
    ],
  },

  // ==================== TASTE CHECKS (11-18) ====================
  {
    id: 'q11',
    kind: 'preference',
    text: {
      en: 'Which cursed-but-clickable headline defeats your self-respect?',
      zh: '哪个又诅咒又想点的标题会击败你的自尊？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: '"Scaling Laws Still Explain Everything, and This Is Why Your GPU Is Crying"',
          zh: '《规模律依然解释一切，这就是你的 GPU 为什么在哭》',
        },
        scores: { riskOrientation: 5, alignmentPriority: 6, contentFormat: 1, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: '"FlashAttention, or: How I Learned to Stop Worrying and Love SRAM"',
          zh: '《FlashAttention，或者我如何停止焦虑并爱上 SRAM》',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, contentFormat: 5 },
      },
      {
        id: 'c',
        text: {
          en: '"Sleeper Agents: Your Helpful Assistant Has a Side Quest Called Betrayal"',
          zh: '《潜伏 Agent：你的热心助手有个支线任务叫背刺》',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, contentFormat: 1 },
      },
      {
        id: 'd',
        text: {
          en: '"From Demo to Default: How a Toy Became the Button Nobody Can Remove"',
          zh: '《从 Demo 到默认选项：一个玩具如何变成没人敢删的按钮》',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 7, aestheticSense: 6 },
      },
    ],
  },
  {
    id: 'q12',
    kind: 'preference',
    text: {
      en: 'Your favorite model release note format is:',
      zh: '你最喜欢哪种模型发布说明格式？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A safety card honest enough to make PR ask "do we have to publish this?"',
          zh: '一张诚实到让公关问“这个一定要发吗？”的安全卡',
        },
        scores: { riskOrientation: 2, governanceStance: 5, alignmentPriority: 1, contentFormat: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'A benchmark table with enough footnotes to require a priest and a lawyer',
          zh: '一张脚注多到需要神父和律师的跑分表',
        },
        scores: { knowledgeMode: 2, evaluationStyle: 1, contentFormat: 1, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A cookbook: prompts, APIs, examples, and "paste this before your PM changes scope"',
          zh: '一本菜谱：提示词、API、示例，以及“趁 PM 改需求前复制这个”',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, contentFormat: 5, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'A technical report with diagrams, ablations, and no lifestyle branding',
          zh: '一份有架构图、有消融实验、没有生活方式品牌感的技术报告',
        },
        scores: { stackLayer: 6, knowledgeMode: 2, contentFormat: 1, evaluationStyle: 1 },
      },
    ],
  },
  {
    id: 'q13',
    kind: 'preference',
    text: {
      en: 'Which workspace makes your nervous system say "ah yes, home"?',
      zh: '哪个工作环境会让你的神经系统说“啊，对，回家了”？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A notebook full of charts, dead cells, and one cursed variable named temp2_final',
          zh: '一个装满图表、死亡单元格，以及名为 temp2_final 的诅咒变量的 notebook',
        },
        scores: { knowledgeMode: 2, evaluationStyle: 1, discoveryMode: 2, scope: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'A clean CLI where local models run without turning your laptop into a panini press',
          zh: '一个干净 CLI，本地模型运行时不会把电脑变成三明治机',
        },
        scores: { stackLayer: 6, knowledgeMode: 6, aestheticSense: 1, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A beautiful web app where the prompt duct tape is hidden like family secrets',
          zh: '一个漂亮网页应用，提示词胶带像家族秘密一样被藏好',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, aestheticSense: 7, shippingSpeed: 6 },
      },
      {
        id: 'd',
        text: {
          en: 'A policy dashboard proving that yes, model access can become a workplace drama',
          zh: '一个策略面板，证明模型权限确实能变成职场剧',
        },
        scores: { governanceStance: 7, alignmentPriority: 2, collaborationStyle: 6, shippingSpeed: 4 },
      },
    ],
  },
  {
    id: 'q14',
    kind: 'preference',
    text: {
      en: 'When someone says "this model has vibes," your internal translator says:',
      zh: '当有人说“这个模型有感觉”时，你的内置翻译器会说：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Useful user signal. Still illegal as a paper title, spiritually speaking.',
          zh: '有用的用户信号。但从精神上说，不能当论文标题。',
        },
        scores: { evaluationStyle: 5, knowledgeMode: 6, aestheticSense: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'The benchmark missed something, and now the vibes people are unfortunately employed',
          zh: 'benchmark 漏测了东西，现在氛围党不幸地有工作了',
        },
        scores: { riskOrientation: 4, knowledgeMode: 2, evaluationStyle: 3, scope: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A product truth: users do not buy your loss curve, no matter how emotionally available it is',
          zh: '一个产品真理：用户不会购买你的 loss 曲线，不管它多么情绪稳定',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 7, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'A red flag. "Vibes" is how unsafe systems get pastel branding.',
          zh: '一个红旗。“有感觉”就是危险系统获得粉彩品牌包装的方式。',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, evaluationStyle: 2, shippingSpeed: 2 },
      },
    ],
  },
  {
    id: 'q15',
    kind: 'preference',
    text: {
      en: 'The AI blog post you actually finish reading is:',
      zh: '你真的会读完的 AI 博客文章是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A deep dive explaining why KV cache is the villain in your inference invoice',
          zh: '一篇深度文，解释为什么 KV cache 是你推理账单里的反派',
        },
        scores: { stackLayer: 7, knowledgeMode: 2, contentFormat: 1, scope: 7 },
      },
      {
        id: 'b',
        text: {
          en: 'A field guide: which model to use today, and what will betray you tomorrow',
          zh: '一份野外指南：今天该用哪个模型，明天谁会背刺你',
        },
        scores: { stackLayer: 2, knowledgeMode: 7, contentFormat: 4, shippingSpeed: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A safety horror story where the monster is technically following instructions',
          zh: '一个安全恐怖故事，怪物在技术上确实遵守了指令',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, contentFormat: 1, aestheticSense: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'A strategy essay explaining why the next platform war will be fought inside a settings menu',
          zh: '一篇战略文章，解释为什么下个平台战争会发生在设置菜单里',
        },
        scores: { governanceStance: 6, stackLayer: 1, knowledgeMode: 6, contentFormat: 2 },
      },
    ],
  },
  {
    id: 'q16',
    kind: 'preference',
    text: {
      en: 'Which "AI progress" does not feel like a press-release perfume cloud?',
      zh: '哪种“AI 进步”不像新闻稿香水云？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'The model behaves under pressure, not just during the five blessed demo prompts',
          zh: '模型在压力下也靠谱，而不只是五个受祝福的 demo prompt 里友好',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'The same money buys more intelligence and fewer CFO panic attacks',
          zh: '同样的钱买到更多智能，以及更少 CFO 惊恐发作',
        },
        scores: { riskOrientation: 6, alignmentPriority: 6, stackLayer: 6, evaluationStyle: 1 },
      },
      {
        id: 'c',
        text: {
          en: 'A normal person finishes a real workflow without becoming a prompt engineer',
          zh: '普通人完成真实工作流，而且不用进化成提示词工程师',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 6, shippingSpeed: 7 },
      },
      {
        id: 'd',
        text: {
          en: 'People outside the original lab can reproduce it without summoning a cluster demon',
          zh: '原实验室之外的人也能复现，而且不用召唤集群恶魔',
        },
        scores: { governanceStance: 2, knowledgeMode: 2, collaborationStyle: 6, evaluationStyle: 1 },
      },
    ],
  },
  {
    id: 'q17',
    kind: 'preference',
    text: {
      en: 'Pick the tiny victory that gives you unreasonable joy:',
      zh: '选择一个会给你不合理快乐的小胜利：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'A tiny eval catches a catastrophic failure wearing a fake mustache',
          zh: '一个小评测抓到了戴假胡子的灾难级失败',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, evaluationStyle: 1, discoveryMode: 1 },
      },
      {
        id: 'b',
        text: {
          en: 'A quantized model runs on a laptop and feels like smuggling intelligence through customs',
          zh: '一个量化模型在笔记本上跑起来，像把智能偷渡过海关',
        },
        scores: { governanceStance: 1, stackLayer: 6, knowledgeMode: 6, shippingSpeed: 6 },
      },
      {
        id: 'c',
        text: {
          en: 'A messy research argument collapses into one chart that bullies everyone into silence',
          zh: '一个混乱研究争论变成一张图，霸凌全场安静',
        },
        scores: { knowledgeMode: 2, evaluationStyle: 1, contentFormat: 1, aestheticSense: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'A beta user says "wait, this accidentally became my job now"',
          zh: '一个测试用户说：“等等，这不小心变成我的工作了”',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, evaluationStyle: 7, shippingSpeed: 7 },
      },
    ],
  },
  {
    id: 'q18',
    kind: 'preference',
    text: {
      en: 'Which sentence makes your scam detector levitate?',
      zh: '哪句话会让你的诈骗探测器直接升空？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: '"We skipped safety evals, but the demo smiled warmly."',
          zh: '“我们跳过了安全评测，但 demo 笑得很温暖。”',
        },
        scores: { riskOrientation: 1, alignmentPriority: 1, evaluationStyle: 1, shippingSpeed: 1 },
      },
      {
        id: 'b',
        text: {
          en: '"Our benchmark is private, proprietary, and emotionally unavailable."',
          zh: '“我们的 benchmark 是私有、专有，并且情绪上不可接近的。”',
        },
        scores: { governanceStance: 2, knowledgeMode: 2, evaluationStyle: 1, collaborationStyle: 2 },
      },
      {
        id: 'c',
        text: {
          en: '"The model is worse, but the landing page has glassmorphism."',
          zh: '“模型差一点，但落地页有玻璃拟态。”',
        },
        scores: { stackLayer: 1, evaluationStyle: 3, aestheticSense: 7, alignmentPriority: 5 },
      },
      {
        id: 'd',
        text: {
          en: '"CUDA details are implementation details," said someone about to meet physics.',
          zh: '“CUDA 细节只是实现细节，”一个即将遇见物理学的人说。',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, aestheticSense: 1 },
      },
    ],
  },

  // ==================== FORCED CHOICES (19-25) ====================
  {
    id: 'q19',
    kind: 'binary',
    text: {
      en: 'Forced choice: scaling law or goblin engineering?',
      zh: '二选一：规模律还是哥布林工程？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Scaling law. The universe likes brute force with invoices.', zh: '规模律。宇宙喜欢带发票的暴力。' },
        scores: { riskOrientation: 6, alignmentPriority: 6, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'b',
        text: { en: 'Goblin engineering. One good kernel can financially shame a data center.', zh: '哥布林工程。一个好内核能让数据中心在财务上羞愧。' },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, aestheticSense: 2 },
      },
    ],
  },
  {
    id: 'q20',
    kind: 'binary',
    text: {
      en: 'Forced choice: open weights or velvet-rope API?',
      zh: '二选一：开放权重还是红绳贵宾 API？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Open weights. Let the people download the dragon.', zh: '开放权重。让人民下载这条龙。' },
        scores: { governanceStance: 1, stackLayer: 5, collaborationStyle: 6 },
      },
      {
        id: 'b',
        text: { en: 'Closed API. Most users need reliability before ideology cosplay.', zh: '闭源 API。多数用户先需要可靠性，再谈意识形态 cosplay。' },
        scores: { governanceStance: 7, stackLayer: 1, alignmentPriority: 3 },
      },
    ],
  },
  {
    id: 'q21',
    kind: 'binary',
    text: {
      en: 'Forced choice: MMLU score or Chatbot Arena popularity cage match?',
      zh: '二选一：MMLU 分数还是 Chatbot Arena 人气铁笼赛？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'MMLU. A leaderboard should not be won by good bedside manner.', zh: 'MMLU。排行榜不该靠床边礼仪获胜。' },
        scores: { knowledgeMode: 2, evaluationStyle: 1, contentFormat: 1 },
      },
      {
        id: 'b',
        text: { en: 'Arena. If humans hate using it, the score is spreadsheet jewelry.', zh: 'Arena。如果人类讨厌用它，分数就是表格首饰。' },
        scores: { knowledgeMode: 6, evaluationStyle: 7, contentFormat: 5 },
      },
    ],
  },
  {
    id: 'q22',
    kind: 'binary',
    text: {
      en: 'Forced choice: pause for science, or ship into the user volcano?',
      zh: '二选一：为科学暂停，还是上线跳进用户火山？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Pause. "Powerful and mysterious" is not a responsible product spec.', zh: '暂停。“强大且神秘”不是负责任的产品需求。' },
        scores: { riskOrientation: 2, alignmentPriority: 1, knowledgeMode: 1, shippingSpeed: 1 },
      },
      {
        id: 'b',
        text: { en: 'Ship. Reality is the only QA team with teeth.', zh: '上线。现实是唯一有牙齿的 QA 团队。' },
        scores: { riskOrientation: 6, alignmentPriority: 5, knowledgeMode: 7, shippingSpeed: 7 },
      },
    ],
  },
  {
    id: 'q23',
    kind: 'binary',
    text: {
      en: 'Forced choice: prompt wizardry or systems plumbing?',
      zh: '二选一：提示词巫术还是系统管道工？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Prompt wizardry. The interface is where intelligence learns customer service.', zh: '提示词巫术。接口是智能学习客服礼仪的地方。' },
        scores: { stackLayer: 1, knowledgeMode: 7, aestheticSense: 4, shippingSpeed: 6 },
      },
      {
        id: 'b',
        text: { en: 'Systems plumbing. The magic dies when the queue, cache, and GPU unionize.', zh: '系统管道工。队列、缓存、GPU 一罢工，魔法就死了。' },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, aestheticSense: 1 },
      },
    ],
  },
  {
    id: 'q24',
    kind: 'binary',
    text: {
      en: 'Forced choice: RLHF manners school or raw pretraining gym?',
      zh: '二选一：RLHF 礼仪学校还是原始预训练健身房？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'RLHF. A genius goblin still needs table manners.', zh: 'RLHF。天才哥布林也需要餐桌礼仪。' },
        scores: { alignmentPriority: 2, knowledgeMode: 6, stackLayer: 2, shippingSpeed: 3 },
      },
      {
        id: 'b',
        text: { en: 'Pretraining scale. Politeness cannot hallucinate missing physics into existence.', zh: '预训练规模。礼貌不能把缺失的物理学幻觉成真。' },
        scores: { riskOrientation: 6, alignmentPriority: 6, stackLayer: 4, knowledgeMode: 2 },
      },
    ],
  },
  {
    id: 'q25',
    kind: 'binary',
    text: {
      en: 'Forced choice: 80-page technical report or spicy launch tweet with a demo GIF?',
      zh: '二选一：80 页技术报告，还是带 demo GIF 的辛辣发布推文？',
    },
    options: [
      {
        id: 'a',
        text: { en: 'Technical report. I want ablations, not fireworks and vibes.', zh: '技术报告。我要消融实验，不要烟花和氛围。' },
        scores: { contentFormat: 1, knowledgeMode: 2, evaluationStyle: 1, discoveryMode: 1 },
      },
      {
        id: 'b',
        text: { en: 'Launch tweet. If it matters, the memes will breach containment.', zh: '发布推文。如果重要，梗会突破收容。' },
        scores: { contentFormat: 7, knowledgeMode: 6, evaluationStyle: 6, discoveryMode: 7 },
      },
    ],
  },

  // ==================== DESSERT SIGNALS (26-30) ====================
  {
    id: 'q26',
    kind: 'preference',
    text: {
      en: 'If LLM progress were an anime season, which arc are you bingeing?',
      zh: '如果 LLM 进展是一季动画，你会追哪条篇章？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'The tournament arc where every lab reveals a secret model form and a benchmark nobody asked for',
          zh: '锦标赛篇：每个实验室都亮出隐藏模型形态，以及没人问过的 benchmark',
        },
        scores: { otakuAlignment: 7 },
      },
      {
        id: 'b',
        text: {
          en: 'The training arc: one GPU, one dream, 700 CUDA errors, zero sleep',
          zh: '修行篇：一块 GPU，一个梦想，700 个 CUDA 错误，零睡眠',
        },
        scores: { otakuAlignment: 6, lifeRhythm: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'The council arc where one model card causes twelve committees and a snack shortage',
          zh: '委员会篇：一张模型卡引发十二个委员会和零食短缺',
        },
        scores: { otakuAlignment: 4 },
      },
      {
        id: 'd',
        text: {
          en: 'Skip the anime metaphor; hand me the technical report before the fandom finds it',
          zh: '跳过动画比喻；在同人圈发现它之前把技术报告给我',
        },
        scores: { otakuAlignment: 2 },
      },
    ],
  },
  {
    id: 'q27',
    kind: 'preference',
    text: {
      en: 'Your gaming metaphor for model training is:',
      zh: '你会用哪个游戏比喻模型训练？',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Speedrun: reduce loss, skip cutscenes, pray the leaderboard does not patch the route',
          zh: '速通：降低 loss，跳过剧情，祈祷排行榜别修掉路线',
        },
        scores: { gamerType: 7, lifeRhythm: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Roguelike: every failed run gives one useful curse and one unread Slack thread',
          zh: '肉鸽：每次失败给一个有用诅咒，以及一条未读 Slack 长线',
        },
        scores: { gamerType: 6, lifeRhythm: 5 },
      },
      {
        id: 'c',
        text: {
          en: 'City builder: infrastructure first, chaos after the autoscaler lies',
          zh: '城市建造：基础设施先行，等自动扩缩容撒谎后再混沌',
        },
        scores: { gamerType: 4, lifeRhythm: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'I refuse to gamify the GPU bill; it already has boss music',
          zh: '我拒绝把 GPU 账单游戏化；它已经自带 Boss 音乐',
        },
        scores: { gamerType: 2, lifeRhythm: 3 },
      },
    ],
  },
  {
    id: 'q28',
    kind: 'preference',
    text: {
      en: 'Your ideal hack night looks like:',
      zh: '你理想中的 hack night 是：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'Midnight, cold pizza, one cursed bug, and the model finally stops gaslighting you',
          zh: '午夜、冷披萨、一个诅咒 bug，以及模型终于停止煤气灯你',
        },
        scores: { lifeRhythm: 7, gamerType: 5 },
      },
      {
        id: 'b',
        text: {
          en: 'A planned session with notes, checkpoints, and the radical technology called sleep',
          zh: '有计划的 session，有笔记、有 checkpoint，以及名为睡眠的激进技术',
        },
        scores: { lifeRhythm: 1, gamerType: 3 },
      },
      {
        id: 'c',
        text: {
          en: 'A group call where everyone shares cursed model screenshots like trading cards',
          zh: '一个群语音，所有人像交换卡牌一样分享模型发疯截图',
        },
        scores: { lifeRhythm: 5, gamerType: 4, otakuAlignment: 4 },
      },
      {
        id: 'd',
        text: {
          en: 'No hack night. Morning brain is the only accelerator with sane thermals.',
          zh: '不要 hack night。早晨大脑是唯一散热正常的加速器。',
        },
        scores: { lifeRhythm: 1 },
      },
    ],
  },
  {
    id: 'q29',
    kind: 'preference',
    text: {
      en: 'Choose one badge for your AI soul:',
      zh: '给你的 AI 灵魂选一个徽章：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'GPU Goblin With Procurement Trauma',
          zh: '带采购创伤的 GPU 哥布林',
        },
        scores: { gamerType: 6, lifeRhythm: 6 },
      },
      {
        id: 'b',
        text: {
          en: 'Alignment Shrine Keeper, Keeper of the Red-Team Candles',
          zh: '对齐神社守门人，红队蜡烛保管员',
        },
        scores: { otakuAlignment: 6, lifeRhythm: 3 },
      },
      {
        id: 'c',
        text: {
          en: 'Benchmark Accountant With Footnote PTSD',
          zh: '患有脚注 PTSD 的 Benchmark 会计',
        },
        scores: { gamerType: 2, lifeRhythm: 2 },
      },
      {
        id: 'd',
        text: {
          en: 'Product Wizard With 83 Tabs and One Working Demo',
          zh: '开了 83 个标签页且只有一个 demo 能跑的产品巫师',
        },
        scores: { gamerType: 4, lifeRhythm: 5, otakuAlignment: 3 },
      },
    ],
  },
  {
    id: 'q30',
    kind: 'reflection',
    text: {
      en: 'One sentence for your LLM-era tombstone:',
      zh: '给你的 LLM 时代墓碑刻一句话：',
    },
    options: [
      {
        id: 'a',
        text: {
          en: 'I asked for one more eval and became the villain of launch week.',
          zh: '我要求再跑一次评测，然后成了发布周的反派。',
        },
        scores: { riskOrientation: 2, alignmentPriority: 1, evaluationStyle: 1, lifeRhythm: 2 },
      },
      {
        id: 'b',
        text: {
          en: 'I made the model useful enough that people started calling it "just software."',
          zh: '我把模型做得足够有用，以至于人们开始说它“只是软件”。',
        },
        scores: { stackLayer: 1, knowledgeMode: 7, shippingSpeed: 7, lifeRhythm: 4 },
      },
      {
        id: 'c',
        text: {
          en: 'I trusted the curve; the curve replied with a GPU invoice.',
          zh: '我相信曲线；曲线回了我一张 GPU 账单。',
        },
        scores: { riskOrientation: 5, alignmentPriority: 5, knowledgeMode: 2, evaluationStyle: 1 },
      },
      {
        id: 'd',
        text: {
          en: 'I optimized the kernel and vanished into the profiler, as foretold.',
          zh: '我优化了内核，然后按预言消失在 profiler 里。',
        },
        scores: { stackLayer: 7, knowledgeMode: 6, scope: 7, gamerType: 4 },
      },
    ],
  },
];
