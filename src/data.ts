import { HugoConfig, Post, Comment } from './types';

export const defaultHugoConfig: HugoConfig = {
  title: "半日闲 (Half-Day Idle)",
  subtitle: "禅意简约博客 · 一期一会 · 见素抱朴",
  languageCode: "zh-cn",
  defaultContentLanguage: "zh",
  theme: "hugo-zen-minimalist",
  author: {
    name: "林闲 (Lin Xian)",
    bio: "行至水穷处，坐看云起时。专注于内心的静谧与极简主义生活方式。",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop"
  },
  params: {
    zenQuote: "茶字拆开，是人在草木间。汲水煮茶，即是洗心之道。",
    enableComments: true,
    enableSearch: true,
    footerText: "© 2026 半日闲. Powered by Hugo & Zen Minimalist. 一物不随，静行大地。"
  }
};

export const defaultPosts: Post[] = [
  {
    id: "1",
    title: "以一盏温茶，安放浮躁的心神",
    slug: "tea-mindfulness",
    summary: "茶道即是洗心之道。在煮水、备茶、注水、出汤的片刻停顿中，体会日常中被忽略的寂静与本真状态。",
    content: `# 以一盏温茶，安放浮躁的心神

在这喧闹而多变的时代，我们的目光总是投向远方，内心鲜有片刻停顿。浮躁的气息包裹着日常，以至于我们常常忘记了呼吸本身的生命律动。

然而，每当我走进茶室，汲一瓢清水，燃一缕沉香，一切喧嚣便开始悄然退去。

**茶字拆开，是人在草木间。** 汲水煮茶，并不仅仅是一场饮品的调配，而是一次微缩的自我观照。

### 煮一壶时光
在等待水沸的时刻里，你可以听到壶中传来的「松风」之声。由微澜至沸腾，这声音起伏变化，犹如人生的运命周期。此时不需要看手机，不需要思考冗长的工作计划，只需静坐，观呼吸。

> “闲是闲非都不管，一壶冷暖任平生。”

### 注入杯盏的静谧
当热水倾注而下，干瘪的茶叶在水中缓缓舒展、沉浮。香气随着热雾蒸腾，那是草木自山野中带来的广袤与清甜。你细品其味：
- **第一泡：** 鲜爽而略带微苦，如同初涉世事的试探。
- **第二泡：** 醇厚丰满，山野之气尽显，犹如生命的盛年。
- **第三泡：** 渐趋平淡，却有一股绵长的回甘，仿佛历经千帆后的释然。

### 禅意的觉知
喝茶不求名器，亦不拘泥于繁琐的仪式。最重要的，是那一刻的**心在当下（Mindfulness）**。手指触碰到粗陶杯的温热，喉头滑过甘洌的茶汤，胸腹中升起融融的暖意。

你在此刻，茶在此刻。世间并无其他杂音。

这也是极简生活的核心所在：**剥离冗杂的感官诱惑，专注于单一而深刻的体验。** 愿你在这个浮泛的世界上，能始终保留一张茶桌的宽度，用以安置自己无家可归的心神。`,
    date: "2026-06-01",
    categories: ["禅修 (Zen)", "茶道 (Tea Way)"],
    tags: ["茶", "静心", "极简生活"],
    language: "zh",
    readTime: "4 min read",
    author: "林闲"
  },
  {
    id: "2",
    title: "极简主义：舍弃多余，留下真实",
    slug: "minimalism-living",
    summary: "极简主义并非冰冷无情，亦非刻意自我克制。它是一种慈悲的决断力：通过主动舍弃生命的冗赘，将心力与时间留给最重要的事物理念。",
    content: `# 极简主义：舍弃多余，留下真实

人们常常误以为极简主义（Minimalism）就是“扔东西”，或者将房间漆成一成不变的惨白，过着苦行僧般清汤寡水的生活。

其实，这恰恰是对极简最大的误读。

极简，不是冰冷的自我克制，而是一种**饱含温度的决断力**。它的本质在于：**主动厘清界限，拿掉无谓的杂音，让真正的乐章得以浮现。**

### 一、 视觉上的减法，心灵上的加法
我们生活在一个信息与物质“超级过载”的纪元。当环绕四周的都是漫无边际的促销广告、落满灰尘的闲置物品、以及无孔不入的通知弹窗时，我们的心灵正在被一点点霸占和分割。

试着清理一下你的桌面，或者退订那些从未打开的营销邮件：
- **留白：** 在禅宗美学中，留白（Yūgen）不是空无，而是可能性的开端。一个干净的角落，往往能生发出最安顿的书写和思索。
- **精选：** “只留下十件让你心跳不已的随身物品。”当你被少而精的事物拥抱时，对物的依赖反而会被对生活的感激所取代。

\`\`\`
[ 喧乱的世界 ] ---- 减去多余欲望 ----> [ 丰盈的自足 ]
\`\`\`

### 二、 关系极简：不迎合，不纠缠
生命极其短暂，我们无法成为所有人眼中的“完美配角”。朋友圈里成百上千个点赞之交，也抵不过风雨夜里一杯热茶的对谈。

关系极简的主张是：
1. **接纳孤独：** 孤独是灵魂的留白，是与自己和解的练习场地。
2. **深度连接：** 减少低效和敷衍的社交。把珍贵的情感与时间注入到真正理解你、滋养你的人身上。

### 三、 见素抱朴
《道德经》中说：“见素抱朴，少私寡欲。”

去剥离那些外在的社会标签和攀比欲。你会发现，生活所需的最低保障其实极为简单。当身心不再为维持庞大的“多余”而疲于奔命时，你才能真正拥有时间，走向真正的自由。`,
    date: "2026-05-24",
    categories: ["极简主义 (Minimalism)", "生活美学 (Aesthetics)"],
    tags: ["舍离", "生活方式", "内心自由"],
    language: "zh",
    readTime: "5 min read",
    author: "林闲"
  },
  {
    id: "3",
    title: "日常中的“留白”艺术：无之以为用",
    slug: "art-of-blank",
    summary: "三十辐共一毂，当其无，有车之用。在紧凑到窒息的日程表中，主动裁切出一些毫无目的的空白时间，是现代人最温柔的救赎。",
    content: `# 日常中的“留白”艺术：无之以为用

老子在《道德经》中写过一段极富禅思的话：
> “埏埴以为器，当其无，有器之用。凿户牖以为室，当其无，有室之用。故有之以为利，无之以为用。”

揉捏陶泥做成器皿，正因为器皿中间是空无的，才有了容纳物品的功用。开凿门窗建造房屋，正因为房屋中间有空灵的区域，才有了居住的功能。

我们凡事追求“有用”，追求把每一秒日程、每一寸空间都塞满，却常常忽略了，正是那些**“无”的空白，才赋予了“有”真正的价值。**

### 日程表里的留白
你或许也拥有这样一个日历：密密麻麻的色块、一个接一个的会议、永无止境的待办清单。

试着在其中画一道“白”。比如，下午三点抽离十分钟，关闭所有电子设备，到窗边站立，仅仅是看着一片叶子在微风中摇曳。这没有任何世俗意义上的“收获”，但它是一次针对神经系统的「重设」。

### 空间的留白
在日本美学中，有一个词叫 **“间”（Ma）**。它指的是事物与事物之间的距离感。
- 书架不需要塞满，留出一格放一朵枯花；
- 墙壁不需要挂满画作，一整片白墙在午后落下一道斜斜的阳光，便是最好的画卷。

正是因为有了这些距离，目光才有了歇脚的所在，器物才拥有了独特的尊严。

### 让我们开始：切下一片空白
今天开始，尝试一件事：在生活中做一个“留白练习”。
1. **晨起五分钟：** 起床后不立刻拿手机，只是静坐呼吸。
2. **拒绝无意义的补充：** 坐地铁或等待时，按捺住掏出手机滑阅短视频的冲动，单纯观赏周围的人群、光影的变迁、呼吸空气的冷暖。

你会发现，这些无用的、空洞的瞬间，才是生命河流底色里最温柔而恒久的金沙。`,
    date: "2026-05-10",
    categories: ["生活美学 (Aesthetics)", "禅修 (Zen)"],
    tags: ["空白", "老子", "生活艺术"],
    language: "zh",
    readTime: "3 min read",
    author: "林闲"
  },
  // English version duplicates, simulating Hugo's multi-lingual markdown pages
  {
    id: "4",
    title: "Soothe Your Spirit with a Warm Cup of Tea",
    slug: "tea-mindfulness",
    summary: "The Way of Tea is the way of cleansing the mind. In the pauses of boiling water, preparing leaves, pouring, and steeping, find the overlooked silence and authenticity.",
    content: `# Soothe Your Spirit with a Warm Cup of Tea

In this fast-paced and ever-changing modern age, our eyes are constantly fixed on the distant future, leaving few moments of pause for our inner selves. A restless atmosphere envelopes our daily existence, such that we often forget to appreciate the simple lifeforces of our own breath.

Yet, whenever I step into my tea room, draw a ladle of cold water, and light a stick of agarwood incense, the hubbub of the outside world slowly begins to dissolve.

**The Chinese character for Tea (茶) decomposes into 'Man between grass and wood.'** Brewing tea is more than mixing a beverage; it is a microscopic exercise in self-awareness and mindfulness.

### Boiling the Piles of Time
In the quiet anticipation of waiting for water to boil, you will hear a sound like wind whispering through high pines (Japanese: *Matsukaze*). From gentle ripples to bubbling heat, this sound rises and falls, echoing the vast cycles of human fortune. In these minutes, put down your phone. Turn away from projects. Simply sit, and breathe.

> "Disregard all worldly praises, a warm kettle is enough to weather through life’s cold."

### Serenity Poured into Ceramic
As the hot water enters the clay teapot, the shriveled dry leaves unfurl gracefully, dancing in the thermal currents. The steam rises, conveying the wild, woody sweetness of remote mountains. Observe the evolving profile:
- **First Steep:** Fresh and slightly vegetal with a whisper of bitterness; the cautious greeting of youth.
- **Second Steep:** Broad-bodied and full-flavored, revealing the mature landscape of the mountain garden.
- **Third Steep:** Slowly fading to calm simplicity, leaving a long, profound sweetness at the back of the palate.

### Zen-like Awareness
Tea does not ask for expensive porcelain or overly complex ritual. What matters is **Mindfulness (being fully in the present)**. Feel the warmth of the unglazed clay against your fingers, the clean swallow, and the gentle heat settling deep into your core.

You are here. The tea is here. No other sounds exist.

This lies at the hearth of minimalism: **stripping away redundant sensory distractions to fully digest one deep, raw experience.** May you carve out a small sanctuary—even if only the width of a tea tray—to anchor your wandering spirit in this fluid world.`,
    date: "2026-06-01",
    categories: ["Zen", "Tea Way"],
    tags: ["Tea", "Mindfulness", "Minimalism"],
    language: "en",
    readTime: "4 min read",
    author: "Lin Xian"
  },
  {
    id: "5",
    title: "Minimalist Living: Discard Excess, Embrace Truth",
    slug: "minimalism-living",
    summary: "Minimalism is not cold aesthetic austerity, nor is it self-punishment. It is a compassionate execution: shedding the redundant weights to dedicate time to what truly matters.",
    content: `# Minimalist Living: Discard Excess, Embrace Truth

People often mistake minimalism for "throwing things away," painting every room stark clinical white, and enforcing some form of joyless monastic deprivation. 

In truth, this represents a fundamental misunderstanding.

Minimalism is not an icy act of self-denial; it is a **warm, intentional focus**. Its heart is simple: **drawing firm boundaries, eliminating the background noise, and letting the true symphony of life play out.**

### 1. Visual Subtraction, Spiritual Addition
We live in an era of unprecedented cargo and cognitive overload. Surrounded by relentless advertisements, dusty unused possessions, and notifications screaming for attention, our mental capacity is being sliced and leased away.

Try clearing your workspace, or unsubscribed from mailing lists you never read:
- **Empty Space:** In Zen, negative space is not the absence of content, but the birth of possibilities. A clean desk invites clean prose and untethered thoughts.
- **Strict Curations:** Surround yourself with a select few items that spark real joy. When we rely on less, our material dependencies transform into a genuine gratitude for daily life.

\`\`\`
[ Chaos of Pleasures ] ---- Subtract Redundancy ----> [ Richness of Sufficiency ]
\`\`\`

### 2. Relationship Minimalism: Depth Over Breadth
Life is short. We cannot play the standard accommodating side-character in everyone's timeline. Hundreds of fleeting likes on social media cannot match the warmth of a deep conversation over hot soup on a rainy evening.

Relationship minimalism advises:
1. **Embracing Solitude:** Solitude is the negative space of the soul. It is the training ground to be at peace with oneself.
2. **Deep Connections:** Cut out superficial obligations. Direct your precious emotional energy towards the very few who truly see and nurture you.

### 3. Embrace Simple Integrity
Laozi remarked in the *Daodejing*: "Manifest plainness, embrace simplicity, reduce selfishness, have few desires."

Peel back the layers of societal competition and material display. You will find that the base requirements for a meaningful life are astonishingly humble. Once you stop spending vital energy to sustain "more", you gain the ultimate luxury: time.`,
    date: "2026-05-24",
    categories: ["Minimalism", "Aesthetics"],
    tags: ["Letting Go", "Lifestyle", "Inner Freedom"],
    language: "en",
    readTime: "5 min read",
    author: "Lin Xian"
  },
  {
    id: "6",
    title: "The Art of 'Ma': Living with Negative Space",
    slug: "art-of-blank",
    summary: "We shape clay into a pot, but it is the emptiness inside that holds the water. Intentionally carving deliberate gaps into our hyper-scheduled days is a gentle, modern salvation.",
    content: `# The Art of 'Ma': Living with Negative Space

In the *Daodejing*, Laozi observes:
> "Thirty spokes meet in the hub, but it is the empty center that makes the wheel useful. We mold clay into a vessel, but it is the empty space within that holds the contents. Therefore, we profit from what is there; we find utility in what is empty."

We are constantly driven to seek the "useful," cramming every single pixel of our screens, every inch of our rooms, and every calendar slot with action. Yet we forget that it is **emptiness—the negative space—that yields utility.**

### Finding Wiggle Room in Your Calendar
Look at your calendar: a mosaic of colorful time blocks, sequential video calls, and endless targets.

Try painting some white over it. Block out 15 minutes in the mid-afternoon. Shut down your laptop, lock your phone, step to the window, and simply watch a leaf bend in the wind. There is no measurable "productivity" in this. Yet, it serves as a crucial neural reset.

### Aesthetics of the Space Around Us
In Japanese aesthetics, this is described as **"Ma" (间)**—the intentional pause or distance between things.
- A bookshelf does not need to be stuffed; leave a shelf barren save for a single dry blossom.
- A wall does not need to be covered in frames; let a clean wall catch the slow, turning rectangle of afternoon sunlight.

This space gives our gaze a place to rest, granting objects their unique dignity.

### Practice Ma Today
Start with a tiny habit of breathing space:
1. **The First Five Minutes:** Upon waking, resist the absolute urge to pull up messages. Just sit on the edge of the bed and breathe.
2. **Resist the Fill:** When waiting in line or on public transit, avoid loading short-form videos. Simply observe the light reflections, the murmuring crowds, and the relative warmth of the air.

You will find these empty, quiet intervals are the very pockets where peace of mind is quietly stored.`,
    date: "2026-05-10",
    categories: ["Aesthetics", "Zen"],
    tags: ["Space", "Laozi", "Art of Life"],
    language: "en",
    readTime: "3 min read",
    author: "Lin Xian"
  }
];

export const defaultComments: Comment[] = [
  {
    id: "c1",
    postSlug: "tea-mindfulness",
    author: "空山 (Empty Mountain)",
    content: "读罢此文，顿觉心胸空旷不少。正巧手边有一杯明前龙井，原来热气蒸腾之间，真能寻得片刻清净自在。",
    date: "2026-06-02 09:15",
    avatarColor: "bg-emerald-100 text-emerald-800"
  },
  {
    id: "c2",
    postSlug: "tea-mindfulness",
    author: "Elena Wood",
    content: "This essay captures beautifully what tea ceremonies teach us. It reminds me to slow down and stay in the single present moment rather than rushing into future anxieties.",
    date: "2026-06-03 14:22",
    avatarColor: "bg-amber-100 text-amber-800"
  },
  {
    id: "c3",
    postSlug: "minimalism-living",
    author: "抱朴子 (Embracer of Simplicity)",
    content: "减去多余，留下真实。现代生活诱惑过多，常常买回一堆并不真正需要的东西，还要耗费精力打理。不如见素抱朴，心神泰然。",
    date: "2026-05-26 18:30",
    avatarColor: "bg-stone-200 text-stone-800"
  }
];
