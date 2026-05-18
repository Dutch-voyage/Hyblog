import type { BiText } from './dimensions';

export interface PersonalityType {
  id: string;
  label: BiText;
  oneLiner: BiText;
  description: BiText;
  /** 12-element vector for core dimensions (Models 1-4), scored 1-7. */
  vector: number[];
  allies: string[];
  rivals: string[];
  hidden?: boolean;
}

export interface SoulFlavor {
  id: string;
  label: BiText;
  badge: BiText;
}

// ---------------------------------------------------------------------------
// Soul Flavors (derived from Model 5 dimensions)
// ---------------------------------------------------------------------------

export const SOUL_FLAVORS: Record<string, SoulFlavor> = {
  otaku: {
    id: 'otaku',
    label: { en: 'Otaku Variant', zh: '二次元变体' },
    badge: { en: '🌸 Otaku Variant', zh: '🌸 二次元变体' },
  },
  gamer: {
    id: 'gamer',
    label: { en: 'Gamer Variant', zh: '电竞变体' },
    badge: { en: '🎮 Gamer Variant', zh: '🎮 电竞变体' },
  },
  weebGamer: {
    id: 'weebGamer',
    label: { en: 'Weeb-Gamer Ascended', zh: '二次元电竞双修' },
    badge: { en: '⚔️ Weeb-Gamer Ascended', zh: '⚔️ 二次元电竞双修' },
  },
  nightGamer: {
    id: 'nightGamer',
    label: { en: 'Night Gamer', zh: '深夜电竞人' },
    badge: { en: '🌙 Night Gamer', zh: '🌙 深夜电竞人' },
  },
  structured: {
    id: 'structured',
    label: { en: 'Structured Life DLC', zh: '规律生活DLC' },
    badge: { en: '📐 Structured Life DLC', zh: '📐 规律生活DLC' },
  },
  nightOwl: {
    id: 'nightOwl',
    label: { en: 'Night Owl Mode', zh: '夜猫子模式' },
    badge: { en: '🦉 Night Owl Mode', zh: '🦉 夜猫子模式' },
  },
  pureTech: {
    id: 'pureTech',
    label: { en: 'Pure Tech', zh: '纯粹技术流' },
    badge: { en: '⚡ Pure Tech', zh: '⚡ 纯粹技术流' },
  },
  balanced: {
    id: 'balanced',
    label: { en: 'Balanced Soul', zh: '均衡灵魂' },
    badge: { en: '☯ Balanced Soul', zh: '☯ 均衡灵魂' },
  },
};

// ---------------------------------------------------------------------------
// Vector order: [riskOri, govStance, alignPri, stackLayer, knowMode,
//                scope, contentFmt, evalStyle, discovMode, shipSpeed,
//                collabStyle, aesthetic]
// All values 1-7.
// ---------------------------------------------------------------------------

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: 'arxiv_ghost',
    label: { en: 'The Arxiv Ghost', zh: 'Arxiv 幽灵' },
    oneLiner: {
      en: 'You\'ve read 200 papers this year and shipped none of the ideas.',
      zh: '你今年读了200篇论文，一个想法都没落地。',
    },
    description: {
      en: 'Your browser has a "Read Later" folder with 3,000 items. You believe alignment is probably unsolvable but you keep reading anyway, because what else would you do at 1 AM? You can recite the abstract of "Attention Is All You Need" from memory but have never actually trained a transformer from scratch.',
      zh: '你的浏览器有一个3000项的「稍后阅读」文件夹。你觉得对齐问题大概无解，但还是继续读，因为凌晨一点你还能干什么呢？你能背诵"Attention Is All You Need"的摘要，但从没自己从零训练过一个transformer。',
    },
    vector: [2, 3, 2, 3, 1, 6, 1, 4, 2, 2, 1, 2],
    allies: ['alignment_monk', 'philosophy_major'],
    rivals: ['vibe_checker', 'acc_chad'],
  },
  {
    id: 'gpu_whisperer',
    label: { en: 'The GPU Whisperer', zh: 'GPU 低语者' },
    oneLiner: {
      en: 'You measure everything in FLOPS and think prompt engineering is astrology.',
      zh: '你用FLOPS衡量一切，觉得提示词工程是占星术。',
    },
    description: {
      en: 'Your dotfiles repo has more stars than most people\'s projects. You can diagnose a NCCL timeout by the sound of the server room fan. People come to you when their training runs are slow, and you fix it by changing one CUDA flag nobody knew existed. You haven\'t written a user-facing feature in years, and you\'re proud of that.',
      zh: '你的 dotfiles 仓库比大多数人的项目还多星标。你能通过机房风扇的声音诊断 NCCL 超时。人们训练跑得慢就来找你，你改一个没人知道的 CUDA flag 就搞定了。你已经好几年没写过面向用户的功能了，而且你为此骄傲。',
    },
    vector: [5, 3, 6, 7, 5, 7, 2, 1, 2, 4, 2, 1],
    allies: ['infra_hermit', 'local_llama'],
    rivals: ['prompt_poet', 'meme_lord'],
  },
  {
    id: 'weeb_alchemist',
    label: { en: 'The Weeb Alchemist', zh: '二次元炼丹师' },
    oneLiner: {
      en: 'You fine-tuned a model on light novel dialogue and it unironically improved.',
      zh: '你用轻小说对话微调模型，效果竟然真的好了。',
    },
    description: {
      en: 'Your training runs are named after Evangelion angels. Your dataset includes both arXiv papers and visual novel scripts, and you see no contradiction. You believe the best way to understand emergent behavior is to push models into absurd domains. Your colleagues don\'t understand your methods, but they can\'t argue with your loss curves.',
      zh: '你的训练任务以EVA使徒命名。你的数据集同时包含arXiv论文和视觉小说脚本，而你觉得毫无矛盾。你相信理解涌现行为的最好方式是把模型推入荒诞领域。同事们不理解你的方法，但他们无法反驳你的loss曲线。',
    },
    vector: [6, 1, 6, 4, 7, 5, 5, 6, 6, 7, 3, 7],
    allies: ['multimodal_artist', 'night_owl_debugger'],
    rivals: ['alignment_monk', 'corporate_oracle'],
  },
  {
    id: 'alignment_monk',
    label: { en: 'The Alignment Monk', zh: '对齐僧侣' },
    oneLiner: {
      en: 'You can explain RLHF in your sleep and you have a Notion database of doom scenarios.',
      zh: '你梦里都能讲RLHF，还有一个末日场景的Notion数据库。',
    },
    description: {
      en: 'Your bookshelf has "Superintelligence" and "The Precipice" side by side. You attend alignment forums like others attend church. You genuinely believe interpretability research might save humanity, and you\'re slightly annoyed that most people in AI don\'t take this as seriously as you do. You meditate, and yes, you think it\'s relevant to alignment.',
      zh: '你的书架上《超级智能》和《悬崖》并排放着。你去对齐论坛就像别人去教堂。你真心相信可解释性研究也许能拯救人类，对大多数AI人不够认真这件事你有点恼火。你冥想，而且你觉得这和对齐有关。',
    },
    vector: [1, 4, 1, 2, 1, 6, 1, 3, 1, 1, 4, 2],
    allies: ['arxiv_ghost', 'safety_shepherd'],
    rivals: ['acc_chad', 'weeb_alchemist'],
  },
  {
    id: 'vibe_checker',
    label: { en: 'The Vibe Checker', zh: '氛围鉴定师' },
    oneLiner: {
      en: 'Never read a paper past the abstract but you can rate any model in 3 prompts.',
      zh: '从没读完过摘要后面的部分，但三个prompt就能给任何模型定级。',
    },
    description: {
      en: 'Your hot takes get more engagement than most research threads. You evaluate models the way a sommelier tastes wine — swirl, sniff, sip, verdict. Benchmarks are for people who can\'t feel the difference. You\'ve been right about model quality more often than you\'ve been wrong, and it haunts the benchmark people.',
      zh: '你的锐评比大多数研究帖子都火。你评估模型就像品酒师品酒——摇一摇、闻一闻、抿一口、下结论。跑分是给感觉不到差别的人用的。你对模型质量的直觉判断比错的时候多，这让跑分党很烦。',
    },
    vector: [4, 3, 5, 1, 5, 2, 7, 7, 7, 7, 5, 5],
    allies: ['meme_lord', 'weekend_hacker'],
    rivals: ['arxiv_ghost', 'benchmark_sniper'],
  },
  {
    id: 'prompt_poet',
    label: { en: 'The Prompt Poet', zh: '提示词诗人' },
    oneLiner: {
      en: 'Your system prompts are longer than most people\'s blog posts.',
      zh: '你的系统提示词比大多数人的博文还长。',
    },
    description: {
      en: 'You believe the gap between a good and great LLM response is 90% prompt craft. You\'ve written essays on the philosophy of instruction-following. Your prompt library is version-controlled. People mock "prompt engineering" as a discipline, but they keep DMing you when their agent breaks.',
      zh: '你相信好和优秀的LLM回复之间90%的差距在于prompt技巧。你写过关于指令遵循哲学的长文。你的prompt库有版本控制。人们嘲笑「提示词工程」这个学科，但agent出问题时他们都来私聊你。',
    },
    vector: [3, 2, 3, 1, 4, 4, 2, 7, 3, 3, 2, 5],
    allies: ['agent_architect', 'multimodal_artist'],
    rivals: ['gpu_whisperer', 'infra_hermit'],
  },
  {
    id: 'open_source_ronin',
    label: { en: 'Open-Source Ronin', zh: '开源浪人' },
    oneLiner: {
      en: 'Your GitHub contribution graph is greener than a rainforest.',
      zh: '你的GitHub贡献图比热带雨林还绿。',
    },
    description: {
      en: 'You believe the best code is code everyone can see. You\'ve rage-forked at least one project because the maintainer wouldn\'t merge your PR. "Release the weights" isn\'t a request, it\'s a moral imperative. You move fast because the community is watching, and you\'d rather ship a rough feature than let someone else ship it first.',
      zh: '你相信最好的代码是所有人都能看到的代码。你至少因为维护者不合你的PR而愤怒fork过一个项目。「开放权重」不是请求，是道德义务。你快速迭代因为社区在看，宁可发一个粗糙功能也不让别人抢先。',
    },
    vector: [5, 1, 5, 5, 7, 3, 3, 4, 5, 7, 7, 3],
    allies: ['local_llama', 'toolsmith'],
    rivals: ['corporate_oracle', 'enterprise_whisperer'],
  },
  {
    id: 'corporate_oracle',
    label: { en: 'The Corporate Oracle', zh: '企业神谕' },
    oneLiner: {
      en: 'You\'ve seen three "AI strategy pivots" this quarter and survived them all.',
      zh: '这个季度你已经经历了三次「AI战略转型」，而且全都活下来了。',
    },
    description: {
      en: 'You navigate the politics of AI deployment like a diplomat navigates treaties. You know which VP to CC on the model evaluation report. You believe frontier models are too dangerous for public release — not because you\'re a doomer, but because you\'ve seen what happens when the sales team gets hold of an unrestricted endpoint.',
      zh: '你在AI部署的政治中游刃有余。你知道模型评估报告该抄送哪位VP。你觉得前沿模型对公众来说太危险了——不是因为你是末日派，而是因为你见过销售团队拿到不受限端点后会发生什么。',
    },
    vector: [4, 7, 4, 2, 3, 5, 2, 2, 1, 2, 4, 4],
    allies: ['enterprise_whisperer', 'benchmark_sniper'],
    rivals: ['open_source_ronin', 'acc_chad'],
  },
  {
    id: 'frontier_steward',
    label: { en: 'The Frontier Steward', zh: '前沿守门人' },
    oneLiner: {
      en: 'You turn impossible technology into defaults society can survive using.',
      zh: '你把不可能的技术变成社会勉强能承受的默认值。',
    },
    description: {
      en: 'You live between research taste, product pressure, public trust, and institutional consequence. You are not exactly a pure scientist, not exactly a product manager, and not exactly a regulator; annoyingly, you need all three instincts at once. You believe deployment is a learning loop, but you also know a frontier model is not just software — it is a temporary constitution with an API.',
      zh: '你活在研究品味、产品压力、公众信任和制度后果之间。你既不是纯科学家，也不是纯产品经理，更不是纯监管者；恼人的是，你必须同时具备这三种直觉。你相信部署是一种学习闭环，但你也知道前沿模型不只是软件——它是一部带API的临时宪法。',
    },
    vector: [5, 6, 4, 1, 7, 4, 3, 4, 3, 6, 6, 6],
    allies: ['enterprise_whisperer', 'agent_architect'],
    rivals: ['open_source_ronin', 'doomer_prophet'],
  },
  {
    id: 'scaling_scientist',
    label: { en: 'The Scaling Scientist', zh: '规模科学家' },
    oneLiner: {
      en: 'You trust curves, games, and controlled worlds more than anyone\'s manifesto.',
      zh: '相比任何宣言，你更相信曲线、游戏和可控世界。',
    },
    description: {
      en: 'You are interested in intelligence as a natural phenomenon: something to probe, scale, benchmark, and sometimes trap inside a game until it reveals structure. You have executive patience but experimental instincts. Your favorite answer to a culture-war question is an ablation table. People mistake your calm for caution; really, you just want the experiment to be clean enough that the result has nowhere to hide.',
      zh: '你把智能当作一种自然现象来研究：探测它、扩展它、评测它，有时把它关进游戏里，直到它暴露结构。你有管理者的耐心，也有实验者的直觉。面对文化战争问题，你最喜欢的回答是一张消融实验表。人们把你的冷静误认为保守；其实你只是想让实验干净到结果无处可藏。',
    },
    vector: [4, 5, 4, 4, 2, 7, 1, 1, 3, 3, 5, 4],
    allies: ['benchmark_sniper', 'rl_gamer'],
    rivals: ['vibe_checker', 'meme_lord'],
  },
  {
    id: 'doomer_prophet',
    label: { en: 'The Doomer Prophet', zh: '末日预言家' },
    oneLiner: {
      en: 'You think we\'re all going to die and you have a 47-page document explaining why.',
      zh: '你觉得人类必死无疑，还有一份47页的文档解释原因。',
    },
    description: {
      en: 'You\'ve read "AGI Ruin: A List of Lethalities" three times. Your Twitter bio contains the word "alignment" and your DMs are full of people telling you to touch grass. You genuinely believe most AI researchers are sleepwalking into catastrophe. The worst part? You might be right.',
      zh: '你读过三遍《AGI毁灭：致命性列表》。你的推特简介里有「对齐」二字，私信全是叫你出去摸摸草的人。你真心相信大多数AI研究者在梦游般走向灾难。最糟糕的是？你可能是对的。',
    },
    vector: [1, 5, 1, 2, 1, 5, 1, 5, 3, 1, 1, 2],
    allies: ['alignment_monk', 'philosophy_major'],
    rivals: ['acc_chad', 'scaling_zealot'],
  },
  {
    id: 'acc_chad',
    label: { en: 'The e/acc Chad', zh: 'e/acc 勇者' },
    oneLiner: {
      en: 'Your bio says "e/acc" and you\'ve never mass-produced a regret.',
      zh: '你的简介写着e/acc，你从不批量生产遗憾。',
    },
    description: {
      en: 'Regulation is deceleration. Safety is a distraction. You believe intelligence is a force of nature that reduces entropy, and trying to stop it is like trying to stop gravity. You ship fast, tweet faster, and your threads get ratio\'d by doomers — which you consider a badge of honor. Your most controversial take has more engagement than most people\'s careers.',
      zh: '监管就是减速。安全就是分心。你相信智能是减少熵的自然力量，试图阻止它就像试图阻止重力。你发布快，发推更快，你的帖子被末日派怼——你以此为荣。你最具争议的观点比大多数人的职业生涯还有影响力。',
    },
    vector: [7, 2, 7, 3, 6, 2, 7, 6, 7, 7, 7, 6],
    allies: ['meme_lord', 'scaling_zealot'],
    rivals: ['doomer_prophet', 'alignment_monk'],
  },
  {
    id: 'data_goblin',
    label: { en: 'The Data Goblin', zh: '数据哥布林' },
    oneLiner: {
      en: 'You\'ve scraped things that would make a lawyer cry.',
      zh: '你爬过的东西会让律师流泪。',
    },
    description: {
      en: 'Your hard drives contain terabytes of curated datasets that nobody else knows about. You believe data quality is 80% of model quality and compute is overrated. You\'ve written more data cleaning scripts than model training scripts. When someone brags about their 70B parameter model, you ask about the training data — and they change the subject.',
      zh: '你的硬盘里有TB级别的精选数据集，没人知道。你相信数据质量占模型质量的80%，算力被高估了。你写的数据清洗脚本比训练脚本多。当有人吹嘘他们的700亿参数模型时，你问训练数据——他们就转移话题了。',
    },
    vector: [4, 2, 5, 4, 7, 3, 4, 1, 6, 6, 3, 3],
    allies: ['local_llama', 'benchmark_sniper'],
    rivals: ['vibe_checker', 'conference_nomad'],
  },
  {
    id: 'infra_hermit',
    label: { en: 'The Infra Hermit', zh: '基建隐士' },
    oneLiner: {
      en: 'You haven\'t spoken to a human in 3 days but your cluster uptime is 99.99%.',
      zh: '你三天没和人说话了，但你的集群可用性是99.99%。',
    },
    description: {
      en: 'You live in the layer below the layer everyone else thinks is the bottom. While others debate prompt templates, you\'re optimizing memory allocation patterns. You communicate in config files and monitoring dashboards. Your idea of a good weekend is zero alerts. People forget you exist until something breaks — then you\'re suddenly the most important person in the building.',
      zh: '你活在别人以为的最底层的再下一层。当其他人讨论prompt模板时，你在优化内存分配模式。你用配置文件和监控面板交流。你理想的周末是零告警。人们忘了你的存在，直到什么东西坏了——然后你突然成了大楼里最重要的人。',
    },
    vector: [3, 1, 4, 7, 6, 7, 2, 2, 3, 3, 1, 1],
    allies: ['gpu_whisperer', 'local_llama'],
    rivals: ['conference_nomad', 'meme_lord'],
  },
  {
    id: 'agent_architect',
    label: { en: 'The Agent Architect', zh: 'Agent 架构师' },
    oneLiner: {
      en: 'You\'ve built 12 agent frameworks and abandoned 11.',
      zh: '你搭了12个agent框架，放弃了11个。',
    },
    description: {
      en: 'You see the world as a graph of tool calls. Every problem is an agent orchestration problem. You\'ve read every paper on ReAct, Toolformer, and chain-of-thought, and you have opinions on all of them. Your GitHub is full of repos named things like "agent-core" and "orchestration-v3." You believe the real product isn\'t the model — it\'s the system around it.',
      zh: '你把世界看作一个工具调用图。每个问题都是agent编排问题。你读过所有关于ReAct、Toolformer和思维链的论文，对每一篇都有看法。你的GitHub满是叫"agent-core"和"orchestration-v3"的仓库。你相信真正的产品不是模型——而是围绕它的系统。',
    },
    vector: [5, 3, 4, 2, 4, 5, 3, 4, 2, 4, 5, 5],
    allies: ['prompt_poet', 'toolsmith'],
    rivals: ['infra_hermit', 'doomer_prophet'],
  },
  {
    id: 'meme_lord',
    label: { en: 'The Meme Lord', zh: '梗王' },
    oneLiner: {
      en: 'Your shitposts accidentally become the best AI education material.',
      zh: '你的烂梗意外成了最好的AI科普素材。',
    },
    description: {
      en: 'You explain attention mechanisms through memes and get more views than actual research talks. Your timeline is an art form — equal parts insight and chaos. You\'ve never written a paper, but your threads have been cited in papers. You believe if you can\'t explain it in a meme, you don\'t really understand it.',
      zh: '你用梗图解释注意力机制，播放量比正经研究报告还高。你的时间线是一种艺术形式——一半洞见，一半混沌。你从没写过论文，但你的帖子被论文引用过。你相信如果不能用梗图解释，那就是还没真正理解。',
    },
    vector: [5, 2, 5, 1, 6, 1, 7, 7, 7, 7, 7, 7],
    allies: ['vibe_checker', 'acc_chad'],
    rivals: ['arxiv_ghost', 'infra_hermit'],
  },
  {
    id: 'paper_mill',
    label: { en: 'The Paper Mill', zh: '论文机器' },
    oneLiner: {
      en: 'Your h-index grows faster than your models\' parameter count.',
      zh: '你的h-index增长速度比你模型的参数量还快。',
    },
    description: {
      en: 'You have a system. Identify trend, run experiments, write paper, submit, repeat. Your co-author list looks like a UN delegation. You know exactly which conferences have the softest reviewers. You believe in capability research — not because of ideology, but because capability papers get accepted. You haven\'t deployed a model in production in years, and you don\'t plan to start.',
      zh: '你有一套系统。发现趋势，跑实验，写论文，投稿，循环。你的共同作者列表像联合国代表团。你知道哪些会议的审稿人最好过。你做能力研究——不是因为意识形态，而是因为能力论文更容易被接收。你已经好几年没在生产环境部署过模型了，也不打算开始。',
    },
    vector: [5, 5, 6, 3, 2, 6, 2, 1, 2, 7, 4, 3],
    allies: ['scaling_zealot', 'benchmark_sniper'],
    rivals: ['weekend_hacker', 'toolsmith'],
  },
  {
    id: 'safety_shepherd',
    label: { en: 'The Safety Shepherd', zh: '安全牧羊人' },
    oneLiner: {
      en: 'You\'re the reason the model won\'t tell you how to make napalm.',
      zh: '模型不告诉你怎么做凝固汽油弹，就是因为你。',
    },
    description: {
      en: 'You write red-team reports, design guardrails, and run adversarial evals while everyone else is chasing benchmarks. You believe safety and openness aren\'t contradictions — you can build in public AND be responsible. Your PR reviews focus on edge cases nobody else thought of. You\'re the person who asks "but what if someone uses this for harm?" and you\'re usually right to ask.',
      zh: '你写红队报告、设计护栏、跑对抗性评估，而别人都在追求跑分。你相信安全和开放不矛盾——可以公开构建的同时保持负责。你的代码审查关注别人没想到的边界情况。你是那个问「但如果有人用这个作恶怎么办？」的人，而且你通常问得对。',
    },
    vector: [2, 1, 1, 2, 3, 3, 2, 4, 2, 3, 7, 4],
    allies: ['alignment_monk', 'open_source_ronin'],
    rivals: ['acc_chad', 'paper_mill'],
  },
  {
    id: 'local_llama',
    label: { en: 'The Local Llama', zh: '本地羊驼' },
    oneLiner: {
      en: 'You run everything locally and think the cloud is a psyop.',
      zh: '你什么都在本地跑，觉得云计算是一场心理战。',
    },
    description: {
      en: 'You have 17 quantized models on your laptop. You\'ve memorized the GGUF format spec. Your electricity bill is a research expense. You believe running inference on your own hardware is a fundamental right, and you\'ll fight anyone who disagrees. When friends ask for AI recommendations, you hand them a USB drive.',
      zh: '你的笔记本上有17个量化模型。你背得出GGUF格式规范。你的电费是研究开支。你认为在自己硬件上跑推理是一项基本权利，谁不同意你就和谁吵。朋友问你推荐AI产品，你递给他们一个U盘。',
    },
    vector: [3, 1, 4, 6, 7, 5, 3, 3, 4, 5, 1, 1],
    allies: ['infra_hermit', 'open_source_ronin'],
    rivals: ['corporate_oracle', 'enterprise_whisperer'],
  },
  {
    id: 'scaling_zealot',
    label: { en: 'The Scaling Zealot', zh: '扩展信徒' },
    oneLiner: {
      en: '"Scaling is all you need" is not a meme to you, it\'s a religion.',
      zh: '「规模就是一切」对你来说不是梗图，是信仰。',
    },
    description: {
      en: 'You\'ve read the Chinchilla paper 14 times. You believe most problems in AI will be solved by making models bigger, training them longer, and throwing more compute at them. You have a spreadsheet predicting when we\'ll hit AGI based on compute trends. When someone mentions "emergent abilities," your eyes light up like it\'s Christmas morning.',
      zh: '你读了14遍Chinchilla论文。你相信AI中的大多数问题都可以通过把模型做大、训练更久、堆更多算力来解决。你有一个根据算力趋势预测AGI到来时间的表格。当有人提到「涌现能力」时，你的眼睛亮得像圣诞早晨。',
    },
    vector: [6, 5, 7, 5, 2, 7, 2, 1, 1, 5, 3, 2],
    allies: ['acc_chad', 'paper_mill'],
    rivals: ['doomer_prophet', 'local_llama'],
  },
  {
    id: 'toolsmith',
    label: { en: 'The Toolsmith', zh: '工具锻造师' },
    oneLiner: {
      en: 'You build developer tools and your users love you more than they love their own code.',
      zh: '你造开发者工具，用户爱你胜过爱自己的代码。',
    },
    description: {
      en: 'You see a pain point and immediately think "I should build a tool for that." Your GitHub is full of utilities, CLIs, and libraries that solve problems you had once and never want to have again. You evaluate tech by developer experience, not by benchmarks. You believe the best models are useless without good tooling, and you\'re right.',
      zh: '你看到一个痛点就立刻想「我应该为此造个工具」。你的GitHub满是解决你曾经遇到过、再也不想遇到的问题的工具、CLI和库。你用开发者体验而不是跑分来评估技术。你相信没有好的工具链，最好的模型也没用——而且你是对的。',
    },
    vector: [4, 1, 4, 2, 7, 2, 4, 5, 4, 6, 7, 5],
    allies: ['open_source_ronin', 'agent_architect'],
    rivals: ['paper_mill', 'scaling_zealot'],
  },
  {
    id: 'night_owl_debugger',
    label: { en: 'Night Owl Debugger', zh: '深夜调试侠' },
    oneLiner: {
      en: 'Your best commits happen between midnight and 4 AM.',
      zh: '你最好的commit都发生在午夜到凌晨四点之间。',
    },
    description: {
      en: 'Something about the silence of 3 AM unlocks your ability to find bugs nobody else can see. You\'ve traced a segfault through 7 layers of abstraction at hours when sane people sleep. Your git log is a timeline of insomnia. You don\'t plan your discoveries — they find you, usually when you should be in bed.',
      zh: '凌晨三点的寂静不知为何激活了你发现别人看不到的bug的能力。你在正常人都睡着的时候追踪过穿越七层抽象的段错误。你的git log是一部失眠编年史。你不计划你的发现——它们找到你，通常是在你该上床的时候。',
    },
    vector: [3, 2, 4, 5, 6, 7, 3, 4, 7, 4, 1, 2],
    allies: ['infra_hermit', 'weeb_alchemist'],
    rivals: ['conference_nomad', 'corporate_oracle'],
  },
  {
    id: 'conference_nomad',
    label: { en: 'The Conference Nomad', zh: '会议游牧人' },
    oneLiner: {
      en: 'You\'ve been to more NeurIPS after-parties than NeurIPS sessions.',
      zh: '你参加的NeurIPS after-party比NeurIPS session还多。',
    },
    description: {
      en: 'Your LinkedIn says "connecting the AI ecosystem" and you actually mean it. You know everyone at every lab, and they know you. You absorb knowledge through hallway conversations and dinner chats, not papers. Your suitcase is always half-packed. You believe the real value of research is in the network, not the notebook.',
      zh: '你的领英写着「连接AI生态系统」，而且你是认真的。你认识每个实验室的每个人，他们也认识你。你通过走廊对话和饭局吸收知识，不是论文。你的行李箱永远半收拾着。你相信研究的真正价值在于人脉，不在于笔记本。',
    },
    vector: [4, 4, 4, 2, 4, 1, 6, 6, 5, 5, 7, 7],
    allies: ['meme_lord', 'enterprise_whisperer'],
    rivals: ['infra_hermit', 'night_owl_debugger'],
  },
  {
    id: 'benchmark_sniper',
    label: { en: 'The Benchmark Sniper', zh: '跑分狙击手' },
    oneLiner: {
      en: 'You optimized for MMLU so hard your model forgot how to have a conversation.',
      zh: '你把MMLU优化得太狠了，你的模型忘了怎么聊天。',
    },
    description: {
      en: 'You live and die by the leaderboard. Every decimal point matters. You know the contamination rate of every benchmark and which ones are actually meaningful. You\'ve written scripts that run evaluations while you sleep. When someone claims SOTA, you check their eval harness before you check their paper. Trust, but verify.',
      zh: '你为排行榜而生。每一个小数点都重要。你知道每个基准的数据污染率以及哪些真正有意义。你写过你睡觉时自动跑评估的脚本。当有人声称SOTA时，你先检查他们的评估框架再看论文。信任，但要验证。',
    },
    vector: [4, 4, 6, 4, 5, 7, 3, 1, 1, 2, 3, 1],
    allies: ['data_goblin', 'paper_mill'],
    rivals: ['vibe_checker', 'meme_lord'],
  },
  {
    id: 'philosophy_major',
    label: { en: 'The Philosophy Major', zh: '哲学系旁听生' },
    oneLiner: {
      en: 'You think about AI consciousness more than you think about AI capabilities.',
      zh: '你想AI意识比想AI能力还多。',
    },
    description: {
      en: 'Your reading list includes Hofstadter, Dennett, and Chalmers alongside Vaswani and Sutskever. You believe the hard problem of consciousness is relevant to AI alignment and you\'re tired of explaining why. You write long-form essays that start with a technical observation and end in existential territory. Your friends in philosophy think you\'re too technical; your friends in AI think you\'re too philosophical.',
      zh: '你的书单里侯世达、丹尼特和查尔默斯和Vaswani、Sutskever并排。你认为意识的困难问题与AI对齐相关，而且你厌倦了解释为什么。你写的长文从一个技术观察开始，以存在主义问题结尾。哲学系朋友觉得你太技术了；AI朋友觉得你太哲学了。',
    },
    vector: [2, 4, 1, 1, 1, 4, 1, 5, 2, 1, 4, 4],
    allies: ['arxiv_ghost', 'doomer_prophet'],
    rivals: ['acc_chad', 'benchmark_sniper'],
  },
  {
    id: 'weekend_hacker',
    label: { en: 'The Weekend Hacker', zh: '周末黑客' },
    oneLiner: {
      en: 'You built a working AI app in 48 hours and forgot about it by Monday.',
      zh: '你48小时撸了一个能用的AI应用，周一就忘了。',
    },
    description: {
      en: 'Your side projects outnumber your completed projects 10 to 1. You learn by building, ship by vibes, and move on to the next shiny thing before the paint dries. Your GitHub is a graveyard of brilliant starts. But occasionally, one of your weekend experiments becomes something real — and that\'s why you keep doing it.',
      zh: '你的副项目和完成的项目比是10:1。你通过构建来学习，凭直觉发布，油漆没干就去追下一个亮闪闪的东西了。你的GitHub是辉煌开端的坟场。但偶尔，某个周末实验会变成真正的东西——这就是你继续做下去的原因。',
    },
    vector: [5, 2, 5, 3, 6, 1, 5, 6, 7, 7, 3, 4],
    allies: ['vibe_checker', 'toolsmith'],
    rivals: ['benchmark_sniper', 'alignment_monk'],
  },
  {
    id: 'enterprise_whisperer',
    label: { en: 'The Enterprise Whisperer', zh: '企业耳语者' },
    oneLiner: {
      en: 'You\'ve turned "AI-powered" into a revenue line item.',
      zh: '你把「AI赋能」变成了一项营收。',
    },
    description: {
      en: 'You know that the gap between a demo and a production deployment is where most AI dreams go to die. You speak both "engineer" and "executive" fluently. Your presentations have ROI projections. You\'ve deployed more models behind enterprise firewalls than most researchers have trained. You believe AI\'s real impact is in boring industries, and you\'re getting rich proving it.',
      zh: '你知道从demo到生产部署之间的鸿沟是大多数AI梦想死去的地方。你流利地说「工程师语」和「高管语」。你的演示文稿有ROI预测。你在企业防火墙后面部署的模型比大多数研究者训练的都多。你相信AI的真正影响力在无聊的行业里，而且你正在靠证明这一点发财。',
    },
    vector: [4, 6, 4, 2, 5, 4, 3, 2, 1, 2, 5, 4],
    allies: ['corporate_oracle', 'conference_nomad'],
    rivals: ['open_source_ronin', 'local_llama'],
  },
  {
    id: 'rl_gamer',
    label: { en: 'The RL Gamer', zh: 'RL 玩家' },
    oneLiner: {
      en: 'You treat reinforcement learning like a competitive ranked game and you\'re grinding for SOTA.',
      zh: '你把强化学习当天梯竞技打，正在冲SOTA段位。',
    },
    description: {
      en: 'Your reward functions are more carefully designed than your meals. You see the world through the lens of agents, environments, and reward signals. You played competitive games before you did ML, and honestly the mindset transfer was seamless. You min-max hyperparameters the way you min-maxed character builds. Your Elo in research might be higher than your Elo in games. Might.',
      zh: '你的奖励函数比你的饭菜设计得更精心。你通过智能体、环境和奖励信号的视角看世界。你在做ML之前就打竞技游戏了，说实话心态迁移毫无障碍。你调超参的方式和你配角色build的方式一模一样。你在研究上的Elo可能比游戏里的高。可能。',
    },
    vector: [5, 3, 5, 4, 3, 7, 3, 1, 3, 4, 3, 3],
    allies: ['benchmark_sniper', 'scaling_zealot'],
    rivals: ['prompt_poet', 'philosophy_major'],
  },
  {
    id: 'multimodal_artist',
    label: { en: 'The Multimodal Artist', zh: '多模态艺术家' },
    oneLiner: {
      en: 'You believe the best AI work happens at the intersection of everything.',
      zh: '你相信最好的AI工作发生在所有领域的交叉点。',
    },
    description: {
      en: 'Text, images, audio, video — you refuse to pick one modality. Your projects combine diffusion models with language models with audio synthesis and somehow it works. You see beauty in cross-modal representations. Your demos are always the most visually impressive at the meetup, even if the code behind them is held together with duct tape and dreams.',
      zh: '文本、图像、音频、视频——你拒绝只选一种模态。你的项目把扩散模型、语言模型和音频合成结合在一起，而且居然能跑。你在跨模态表征中看到美。你的demo在聚会上总是视觉效果最惊艳的，即使背后的代码是用胶带和梦想粘在一起的。',
    },
    vector: [5, 2, 5, 2, 5, 3, 4, 7, 5, 6, 4, 7],
    allies: ['weeb_alchemist', 'prompt_poet'],
    rivals: ['benchmark_sniper', 'infra_hermit'],
  },
  {
    id: 'ctrl_c_ctrl_v',
    label: { en: 'CTRL+C CTRL+V', zh: '复制粘贴侠' },
    oneLiner: {
      en: 'Your greatest skill is knowing exactly which tutorial to copy from.',
      zh: '你最大的技能是精确知道该从哪个教程复制。',
    },
    description: {
      en: 'Stack Overflow and ChatGPT are your co-authors. You\'ve shipped more products than most "real engineers" by combining other people\'s solutions in creative ways. You don\'t understand transformers at a mathematical level, but you\'ve deployed more of them than the people who do. Your code works. Nobody knows why. Including you.',
      zh: 'Stack Overflow 和 ChatGPT 是你的共同作者。你通过创造性地组合别人的方案发布了比大多数「真正的工程师」更多的产品。你不在数学层面理解transformer，但你部署了比理解它的人更多的transformer。你的代码能跑。没人知道为什么。包括你。',
    },
    vector: [4, 2, 4, 1, 7, 1, 7, 7, 7, 7, 5, 4],
    allies: ['weekend_hacker', 'vibe_checker'],
    rivals: ['arxiv_ghost', 'gpu_whisperer'],
    hidden: true,
  },
];
