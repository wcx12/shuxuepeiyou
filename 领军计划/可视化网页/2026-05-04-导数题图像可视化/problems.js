function fmt(value, digits = 4) {
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function numericDerivative(fn, h = 1e-5) {
  return (x, params) => {
    const left = fn(x - h, params);
    const right = fn(x + h, params);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;
    return (right - left) / (2 * h);
  };
}

window.PROBLEMS = [
  {
    id: "topic1-ex1",
    topic: "专题一：对数与指数型导数问题",
    order: 1,
    shortTitle: "例 1  对数参数题",
    title: "例 1：$(x+1)\\ln x-a(x-1)$",
    statement: "观察参数 $a$ 改变时，原函数与导函数的图像如何变化，并结合图像理解切线与不等式恒成立的结论。",
    focus: ["对数单身狗", "参数 a", "切线与恒成立"],
    formulaLatex: "f(x)=(x+1)\\ln x-a(x-1)",
    derivativeLatex: "f'(x)=\\ln x+1+\\frac{1}{x}-a",
    domain: { min: 0.05, max: 6, samples: 900 },
    params: {
      a: { label: "参数 a", min: -1, max: 5, step: 0.1, value: 2 }
    },
    f: (x, p) => (x + 1) * Math.log(x) - p.a * (x - 1),
    df: (x, p) => Math.log(x) + 1 + 1 / x - p.a,
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p, analysis) => {
      const roots = analysis.criticalRoots.length;
      return [
        `当前参数为 a=${fmt(p.a)}。在 x=1 处有 f'(1)=2-a=${fmt(2 - p.a)}。`,
        roots === 0
          ? "当前视窗内导函数没有检测到零点，原函数在该范围内没有明显驻点。"
          : `当前视窗内检测到 ${roots} 个驻点，可直接对照 f'(x) 与 x 轴的交点理解单调区间变化。`
      ];
    }
  },
  {
    id: "topic1-ex2",
    topic: "专题一：对数与指数型导数问题",
    order: 2,
    shortTitle: "例 2  切线条件题",
    title: "例 2：$\\dfrac{a\\ln x}{x+1}+\\dfrac{b}{x}$",
    statement: "原题由切线条件先求出 $a,b$，再证明不等式。这里保留双参数滑块，主要看切线条件附近的局部结构。",
    focus: ["切线条件", "分式对数", "导函数结构"],
    formulaLatex: "f(x)=\\frac{a\\ln x}{x+1}+\\frac{b}{x}",
    derivativeLatex: "f'(x)=\\frac{a(1+x-x\\ln x)}{x(x+1)^2}-\\frac{b}{x^2}",
    domain: { min: 0.08, max: 6, samples: 900 },
    params: {
      a: { label: "参数 a", min: -1, max: 3, step: 0.1, value: 1 },
      b: { label: "参数 b", min: -1, max: 3, step: 0.1, value: 1 }
    },
    f: (x, p) => p.a * Math.log(x) / (x + 1) + p.b / x,
    df: (x, p) => p.a * (1 + x - x * Math.log(x)) / (x * (x + 1) ** 2) - p.b / (x ** 2),
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}，b=${fmt(p.b)}。若想贴近原题，可把参数调回 a=1, b=1。`,
      "这个例子适合观察 x=1 附近的切线、函数值和导函数符号如何联动。"
    ]
  },
  {
    id: "topic1-ex3",
    topic: "专题一：对数与指数型导数问题",
    order: 3,
    shortTitle: "例 3  指数零点题",
    title: "例 3：$e^x-ax^2$",
    statement: "观察参数 $a$ 变化时，函数零点个数和极值结构如何改变，特别是“只有一个零点”的临界状态。",
    focus: ["指数找基友", "零点个数", "临界参数"],
    formulaLatex: "f(x)=e^x-ax^2",
    derivativeLatex: "f'(x)=e^x-2ax",
    domain: { min: -2, max: 6, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0, max: 4, step: 0.02, value: 1.85 }
    },
    f: (x, p) => Math.exp(x) - p.a * x * x,
    df: (x, p) => Math.exp(x) - 2 * p.a * x,
    notes: (p, analysis) => [
      `当 a=${fmt(p.a)} 时，当前视窗内原函数零点约有 ${analysis.fRoots.length} 个。`,
      "把 a 调到接近 e^2/4≈1.8473，可以直观看到“恰好相切”的临界形态。"
    ]
  },
  {
    id: "topic1-ex4",
    topic: "专题一：对数与指数型导数问题",
    order: 4,
    shortTitle: "例 4  指数最值题",
    title: "例 4：$e^x+ax^2-x$",
    statement: "观察参数 $a$ 变化时，函数在 $x=0$ 附近和整个区间上的单调变化，理解题目里的参数下界。",
    focus: ["指数找基友", "单调区间", "参数下界"],
    formulaLatex: "f(x)=e^x+ax^2-x",
    derivativeLatex: "f'(x)=e^x+2ax-1",
    domain: { min: -3, max: 4, samples: 900 },
    params: {
      a: { label: "参数 a", min: -1, max: 3, step: 0.05, value: 1 }
    },
    f: (x, p) => Math.exp(x) + p.a * x * x - x,
    df: (x, p) => Math.exp(x) + 2 * p.a * x - 1,
    specialPoints: () => [{ x: 0, label: "x=0" }],
    notes: (p) => [
      `当前参数为 a=${fmt(p.a)}。当 a=1 时，x=0 是天然参考点，因为 f'(0)=0。`,
      "看导函数图像与 x 轴的交点变化，最容易理解“什么时候先降后升、什么时候一直增”。"
    ]
  },
  {
    id: "topic1-ex5",
    topic: "专题一：对数与指数型导数问题",
    order: 5,
    shortTitle: "例 5  指对分手题",
    title: "例 5：$ae^x\\ln x+\\dfrac{be^{x-1}}{x}$",
    statement: "原题先由切线条件求 $a,b$，再把指数和对数拆开比较。这里默认用原题对应参数 $a=1,b=2$。",
    focus: ["指对分手", "切线条件", "辅助函数比较"],
    formulaLatex: "f(x)=ae^x\\ln x+\\frac{be^{x-1}}{x}",
    derivativeLatex: "f'(x)=ae^x\\left(\\ln x+\\frac1x\\right)+\\frac{be^{x-1}(x-1)}{x^2}",
    domain: { min: 0.08, max: 4.5, samples: 900 },
    params: {
      a: { label: "参数 a", min: 0, max: 2, step: 0.05, value: 1 },
      b: { label: "参数 b", min: 0, max: 3, step: 0.05, value: 2 }
    },
    f: (x, p) => p.a * Math.exp(x) * Math.log(x) + p.b * Math.exp(x - 1) / x,
    df: (x, p) => p.a * Math.exp(x) * (Math.log(x) + 1 / x) + p.b * Math.exp(x - 1) * (x - 1) / (x * x),
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}，b=${fmt(p.b)}。先看 x=1 附近的局部形状，再看远离 1 时指数项怎样放大差异。`,
      "这个题适合拿来讲“指数和对数绑在一起时，先拆谁更省事”。"
    ]
  },
  {
    id: "topic1-ex6",
    topic: "专题一：对数与指数型导数问题",
    order: 6,
    shortTitle: "例 6  单调性参数题",
    title: "例 6：$\\dfrac1x+a\\ln x$",
    statement: "观察参数 $a$ 对单调性的影响。这个题很适合用网页直观看“导函数零点怎么出现、怎么移动”。",
    focus: ["指对分手", "单调性", "参数控制"],
    formulaLatex: "f(x)=\\frac1x+a\\ln x",
    derivativeLatex: "f'(x)=\\frac{ax-1}{x^2}",
    domain: { min: 0.08, max: 6, samples: 900 },
    params: {
      a: { label: "参数 a", min: -2, max: 4, step: 0.05, value: 1 }
    },
    f: (x, p) => 1 / x + p.a * Math.log(x),
    df: (x, p) => (p.a * x - 1) / (x * x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。当 a>0 时，导函数零点在 x=1/a 处；当前视窗中检测到 ${analysis.criticalRoots.length} 个驻点。`,
      "这是讲“由导函数零点决定单调区间”的标准模板。"
    ]
  },
  {
    id: "topic1-pr1",
    topic: "专题一：对数与指数型导数问题",
    order: 7,
    shortTitle: "练习 1  对数不等式",
    title: "练习 1：$x\\ln x-a(x-1)$",
    statement: "原题要求 $x\\ln x\\ge a(x-1)$ 对一切 $x\\ge1$ 成立。这里直接画差函数，看参数 $a$ 何时整段压在 $x$ 轴上方。",
    focus: ["对数单身狗", "恒成立", "差函数"],
    formulaLatex: "F(x)=x\\ln x-a(x-1)",
    derivativeLatex: "F'(x)=\\ln x+1-a",
    domain: { min: 0.5, max: 6, samples: 900 },
    params: {
      a: { label: "参数 a", min: -1, max: 3, step: 0.05, value: 1 }
    },
    f: (x, p) => x * Math.log(x) - p.a * (x - 1),
    df: (x, p) => Math.log(x) + 1 - p.a,
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}。原题结论对应的临界值是 a=1。`,
      "把 a 调到 1 上下，最容易看出差函数是否会在 x>1 的区域跌到 x 轴下方。"
    ]
  },
  {
    id: "topic1-pr2",
    topic: "专题一：对数与指数型导数问题",
    order: 8,
    shortTitle: "练习 2  唯一极大值点",
    title: "练习 2：$ax^2-ax-x\\ln x$",
    statement: "题目先由 $f(x)\\ge0$ 反推参数，再证明存在唯一极大值点。这里保留参数滑块，先看原函数与导函数的整体形状。",
    focus: ["对数单身狗", "极大值点", "参数反推"],
    formulaLatex: "f(x)=ax^2-ax-x\\ln x",
    derivativeLatex: "f'(x)=2ax-a-\\ln x-1",
    domain: { min: 0.05, max: 5, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0, max: 2, step: 0.02, value: 1 }
    },
    f: (x, p) => p.a * x * x - p.a * x - x * Math.log(x),
    df: (x, p) => 2 * p.a * x - p.a - Math.log(x) - 1,
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。原题最终会锁定某个特定参数值，这里先看导函数是否只出现一个零点。`,
      `当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点，能直接辅助判断“唯一极大值点”是否合理。`
    ]
  },
  {
    id: "topic1-pr3",
    topic: "专题一：对数与指数型导数问题",
    order: 9,
    shortTitle: "练习 3  复合对数题",
    title: "练习 3：$(2+x+ax^2)\\ln(1+x)-2x$",
    statement: "这个题定义域是 $x>-1$。图像上重点看 $x=0$ 附近的局部形状，以及参数 $a$ 对极值点出现与否的影响。",
    focus: ["对数单身狗", "定义域 x>-1", "极值点"],
    formulaLatex: "f(x)=(2+x+ax^2)\\ln(1+x)-2x",
    derivativeLatex: "f'(x)=(1+2ax)\\ln(1+x)+\\frac{2+x+ax^2}{1+x}-2",
    domain: { min: -0.95, max: 4, samples: 1200 },
    params: {
      a: { label: "参数 a", min: -1, max: 2, step: 0.02, value: 0.5 }
    },
    f: (x, p) => (2 + x + p.a * x * x) * Math.log(1 + x) - 2 * x,
    df: (x, p) => (1 + 2 * p.a * x) * Math.log(1 + x) + (2 + x + p.a * x * x) / (1 + x) - 2,
    specialPoints: () => [{ x: 0, label: "x=0" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}。原题里“x=0 是极大值点”对应的是某个临界参数，可直接看 x=0 附近的切线变化。`,
      "这一题对学生最有帮助的是看清定义域左端逼近 -1 时，图像怎样迅速拉开。"
    ]
  },
  {
    id: "topic1-pr4",
    topic: "专题一：对数与指数型导数问题",
    order: 10,
    shortTitle: "练习 4  指数非负题",
    title: "练习 4：$e^x-1-x-ax^2$",
    statement: "原题要求在 $x\\ge0$ 时 $f(x)\\ge0$ 恒成立。图像上看，关键是差函数是否会从原点右侧跌到 $x$ 轴下方。",
    focus: ["指数找基友", "恒成立", "原点右侧"],
    formulaLatex: "f(x)=e^x-1-x-ax^2",
    derivativeLatex: "f'(x)=e^x-1-2ax",
    domain: { min: 0, max: 6, samples: 1000 },
    params: {
      a: { label: "参数 a", min: -1, max: 1.5, step: 0.02, value: 0.5 }
    },
    f: (x, p) => Math.exp(x) - 1 - x - p.a * x * x,
    df: (x, p) => Math.exp(x) - 1 - 2 * p.a * x,
    specialPoints: () => [{ x: 0, label: "x=0" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}。原题结论的临界参数是 a=1/2。`,
      "把 a 调到 1/2 上下，最能看出曲线是否会在 x>0 的位置穿过 x 轴。"
    ]
  },
  {
    id: "topic1-pr5",
    topic: "专题一：对数与指数型导数问题",
    order: 11,
    shortTitle: "练习 5  指数线性题",
    title: "练习 5：$e^{-x}+ax$",
    statement: "题目讨论极值与估计不等式。网页里保留参数 $a$，重点看导函数零点何时出现，以及最小值点如何移动。",
    focus: ["指数找基友", "最值", "参数 a"],
    formulaLatex: "f(x)=e^{-x}+ax",
    derivativeLatex: "f'(x)=a-e^{-x}",
    domain: { min: -3, max: 5, samples: 900 },
    params: {
      a: { label: "参数 a", min: -1, max: 2, step: 0.02, value: 0.5 }
    },
    f: (x, p) => Math.exp(-x) + p.a * x,
    df: (x, p) => p.a - Math.exp(-x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。当 a>0 时一般会出现唯一驻点；当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点。`,
      "这个题适合拿来解释“指数和一次项拼接时，先看导函数是否单调”这条经验。"
    ]
  },
  {
    id: "topic1-pr6",
    topic: "专题一：对数与指数型导数问题",
    order: 12,
    shortTitle: "练习 6  直线与曲线相切",
    title: "练习 6：$a(x-1)-(ax-1)e^x$",
    statement: "原题比较直线 $y=a(x-1)$ 与曲线 $y=(ax-1)e^x$。这里直接画差函数 $H(x)=a(x-1)-(ax-1)e^x$，零点就是交点。",
    focus: ["指数找基友", "相切", "差函数"],
    formulaLatex: "H(x)=a(x-1)-(ax-1)e^x",
    derivativeLatex: "H'(x)=a-(ax+a-1)e^x",
    domain: { min: -2, max: 3, samples: 1100 },
    params: {
      a: { label: "参数 a", min: 0, max: 3, step: 0.02, value: 1.2 }
    },
    f: (x, p) => p.a * (x - 1) - (p.a * x - 1) * Math.exp(x),
    df: (x, p) => p.a - (p.a * x + p.a - 1) * Math.exp(x),
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。差函数零点个数就对应原题里交点个数；当前视窗内检测到 ${analysis.fRoots.length} 个交点。`,
      "把参数调到相切临界值附近，能直观看到“两个交点并成一个”的过程。"
    ]
  },
  {
    id: "topic1-pr7",
    topic: "专题一：对数与指数型导数问题",
    order: 13,
    shortTitle: "练习 7  双函数比较",
    title: "练习 7：$\\dfrac{(x+1)(\\ln x+1)}{x(e+1)}-\\dfrac{2e^{x-1}}{xe^x+1}$",
    statement: "原题不等式是通过比较两个辅助函数完成的。这里直接画差函数 $D(x)$，只看 $x>1$ 时它是否始终在 $x$ 轴上方。",
    focus: ["指对分手", "辅助函数", "差函数"],
    formulaLatex: "D(x)=\\frac{(x+1)(\\ln x+1)}{x(e+1)}-\\frac{2e^{x-1}}{xe^x+1}",
    derivativeLatex: "D'(x)\\text{ 采用数值求导显示趋势}",
    domain: { min: 1.01, max: 8, samples: 1100 },
    params: {},
    f: (x) => ((x + 1) * (Math.log(x) + 1)) / (x * (Math.E + 1)) - (2 * Math.exp(x - 1)) / (x * Math.exp(x) + 1),
    df: numericDerivative((x) => ((x + 1) * (Math.log(x) + 1)) / (x * (Math.E + 1)) - (2 * Math.exp(x - 1)) / (x * Math.exp(x) + 1)),
    notes: (_, analysis) => [
      `当前视窗内差函数零点约有 ${analysis.fRoots.length} 个；原题目标是说明在 x>1 时差函数始终为正。`,
      "这道题主要看整体趋势，不需要强行背出一个复杂导函数式子。"
    ]
  },
  {
    id: "topic1-pr8",
    topic: "专题一：对数与指数型导数问题",
    order: 14,
    shortTitle: "练习 8  指对综合题",
    title: "练习 8：$e^x-a\\ln x-a$",
    statement: "原题在 $a=e$ 时讨论极值，并据此证明一个综合不等式。这里保留参数 $a$，优先观察极小值点是否稳定落在 $x=1$ 附近。",
    focus: ["指对分手", "极值", "参数 a=e"],
    formulaLatex: "f(x)=e^x-a\\ln x-a",
    derivativeLatex: "f'(x)=e^x-\\frac{a}{x}",
    domain: { min: 0.05, max: 5, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0.5, max: 5, step: 0.05, value: Math.E }
    },
    f: (x, p) => Math.exp(x) - p.a * Math.log(x) - p.a,
    df: (x, p) => Math.exp(x) - p.a / x,
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p) => [
      `当前参数 a=${fmt(p.a, 3)}。把 a 调到 e≈${fmt(Math.E, 3)}，可以直接看到题解里最关键的临界图像。`,
      "当 a=e 时，x=1 往往会成为最方便的分析锚点。"
    ]
  },
  {
    id: "topic2-ex1",
    topic: "专题二：多极值点函数最值问题",
    order: 15,
    shortTitle: "例 1  单极值点消元",
    title: "例 1：$\\dfrac1x-x+a\\ln x$",
    statement: "观察参数 $a$ 变化时，两个极值点是否存在，以及极值点之间的乘积关系如何体现在图像上。",
    focus: ["多极值点", "韦达关系", "x₁x₂=1"],
    formulaLatex: "f(x)=\\frac1x-x+a\\ln x",
    derivativeLatex: "f'(x)=\\frac{-x^2+ax-1}{x^2}",
    domain: { min: 0.08, max: 6, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0, max: 6, step: 0.05, value: 3 }
    },
    f: (x, p) => 1 / x - x + p.a * Math.log(x),
    df: (x, p) => (-x * x + p.a * x - 1) / (x * x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。当 a>2 时，理论上会出现两个极值点；当前图像中检测到 ${analysis.criticalRoots.length} 个导函数零点。`,
      "把 a 调到 2 附近，可以看到两个驻点由分离到并合的临界过程。"
    ]
  },
  {
    id: "topic2-ex2",
    topic: "专题二：多极值点函数最值问题",
    order: 16,
    shortTitle: "例 2  参数化降元",
    title: "例 2：$ax^2+(2a-1)x+\\ln(x+1)$",
    statement: "观察当 $a$ 落在不同区间时，极值点个数如何变化，尤其是题目结论里的 $0<a<1/8$。",
    focus: ["多极值点", "参数函数", "定义域 x>-1"],
    formulaLatex: "f(x)=ax^2+(2a-1)x+\\ln(x+1)",
    derivativeLatex: "f'(x)=2ax+2a-1+\\frac1{x+1}",
    domain: { min: -0.95, max: 5, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0.01, max: 0.2, step: 0.002, value: 0.06 }
    },
    f: (x, p) => p.a * x * x + (2 * p.a - 1) * x + Math.log(x + 1),
    df: (x, p) => 2 * p.a * x + 2 * p.a - 1 + 1 / (x + 1),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a, 3)}。题解里核心区间是 0<a<1/8≈0.125。`,
      `当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点，可直接对照参数区间观察“有两个极值点”的条件。`
    ]
  },
  {
    id: "topic2-ex3",
    topic: "专题二：多极值点函数最值问题",
    order: 17,
    shortTitle: "例 3  齐次式代换",
    title: "例 3：$2x-a\\ln x-\\dfrac1x$",
    statement: "观察构造齐次式之前，原函数和导函数在参数变化下的极值点结构；题中 $a>3$ 是重要参考值。",
    focus: ["多极值点", "齐次式", "比值代换"],
    formulaLatex: "f(x)=2x-a\\ln x-\\frac1x",
    derivativeLatex: "f'(x)=2-\\frac{a}{x}+\\frac1{x^2}",
    domain: { min: 0.08, max: 6, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 2.05, max: 5, step: 0.05, value: 3 }
    },
    f: (x, p) => 2 * x - p.a * Math.log(x) - 1 / x,
    df: (x, p) => 2 - p.a / x + 1 / (x * x),
    notes: (p) => [
      `当前参数 a=${fmt(p.a)}。理论上当 a>2\\sqrt{2} 时会出现两个不同极值点，题目中的重点区间是 a>3。`,
      "图像里先确认两个驻点的位置，再去理解为什么比值代换 t=x₁/x₂ 会自然出现。"
    ]
  },
  {
    id: "topic2-ex6",
    topic: "专题二：多极值点函数最值问题",
    order: 18,
    shortTitle: "例 6  对数均值不等式",
    title: "例 6：$\\dfrac1x-x+a\\ln x$",
    statement: "这一题与例 1 是同一个函数，但证明思路换成了对数均值不等式。网页里仍旧看函数本身，方便对照两种思路为何都抓住了同一组驻点。",
    focus: ["对数均值不等式", "同函数换思路", "x₁x₂=1"],
    formulaLatex: "f(x)=\\frac1x-x+a\\ln x",
    derivativeLatex: "f'(x)=\\frac{-x^2+ax-1}{x^2}",
    domain: { min: 0.08, max: 6, samples: 1000 },
    params: {
      a: { label: "参数 a", min: 0, max: 6, step: 0.05, value: 3 }
    },
    f: (x, p) => 1 / x - x + p.a * Math.log(x),
    df: (x, p) => (-x * x + p.a * x - 1) / (x * x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。这页的重点不是新函数，而是同一个图像如何支持另一套证明。`,
      `当前视窗内导函数零点数为 ${analysis.criticalRoots.length}，仍然能直接读出是否满足“有两个极值点”。`
    ]
  },
  {
    id: "topic2-ex7",
    topic: "专题二：多极值点函数最值问题",
    order: 19,
    shortTitle: "例 7  三极值点奥秘",
    title: "例 7：$(ax+1)\\ln x-\\dfrac{x^2}{2}-ax+a+\\dfrac12$",
    statement: "题目研究恰有三个极值点时的结构。网页里重点看导函数 $a\\ln x+1/x-x$ 的三次穿轴形态如何出现。",
    focus: ["三极值点", "导函数形态", "a>2"],
    formulaLatex: "f(x)=(ax+1)\\ln x-\\frac{x^2}{2}-ax+a+\\frac12",
    derivativeLatex: "f'(x)=a\\ln x+\\frac1x-x",
    domain: { min: 0.08, max: 5, samples: 1200 },
    params: {
      a: { label: "参数 a", min: 2.01, max: 6, step: 0.02, value: 3 }
    },
    f: (x, p) => (p.a * x + 1) * Math.log(x) - 0.5 * x * x - p.a * x + p.a + 0.5,
    df: (x, p) => p.a * Math.log(x) + 1 / x - x,
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。当 a 增大时，导函数更容易形成“三次穿轴”的结构。`,
      `当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点；若要贴近题设“恰有 3 个极值点”，就看导函数是否有 3 个零点。`
    ]
  },
  {
    id: "topic2-ex8",
    topic: "专题二：多极值点函数最值问题",
    order: 20,
    shortTitle: "例 8  新定义问题",
    title: "例 8：$x-\\dfrac1x-a\\ln x$",
    statement: "原题把“极值可差比函数”作为新定义。网页里先看函数在参数变化下是否真的会出现两个极值点，再去理解可差比系数。",
    focus: ["新定义问题", "极值可差比", "参数范围"],
    formulaLatex: "f(x)=x-\\frac1x-a\\ln x",
    derivativeLatex: "f'(x)=1+\\frac1{x^2}-\\frac{a}{x}",
    domain: { min: 0.08, max: 5, samples: 1200 },
    params: {
      a: { label: "参数 a", min: 1.5, max: 5, step: 0.02, value: 2.5 }
    },
    f: (x, p) => x - 1 / x - p.a * Math.log(x),
    df: (x, p) => 1 + 1 / (x * x) - p.a / x,
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。原题第一问专门考察 a=5/2 时的图像，当前默认值也设在这个位置。`,
      `当前视窗内驻点数为 ${analysis.criticalRoots.length}；极值可差比系数的讨论前提就是先确认两个极值点真的存在。`
    ]
  },
  {
    id: "topic2-pr1",
    topic: "专题二：多极值点函数最值问题",
    order: 21,
    shortTitle: "练习 1  二模题",
    title: "练习 1：$\\ln x-a\\left(x-\\dfrac1x\\right)$",
    statement: "这道题和专题核心模型非常接近。重点看参数 $a$ 经过 $1/2$ 时，导函数判别式如何改变，从而决定有无两个极值点。",
    focus: ["多极值点", "二模题", "a=1/2 临界"],
    formulaLatex: "f(x)=\\ln x-a\\left(x-\\frac1x\\right)",
    derivativeLatex: "f'(x)=\\frac{-ax^2+x-a}{x^2}",
    domain: { min: 0.08, max: 6, samples: 1200 },
    params: {
      a: { label: "参数 a", min: 0.05, max: 1.2, step: 0.01, value: 0.4 }
    },
    f: (x, p) => Math.log(x) - p.a * (x - 1 / x),
    df: (x, p) => (-p.a * x * x + x - p.a) / (x * x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。原题的临界位置是 a=1/2。`,
      `当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点，把 a 在 0.5 附近微调时图像变化会很明显。`
    ]
  },
  {
    id: "topic2-pr2",
    topic: "专题二：多极值点函数最值问题",
    order: 22,
    shortTitle: "练习 2  三极值点构造",
    title: "练习 2：$g(x)=f(x)+f\\!\\left(\\dfrac1x\\right)$",
    statement: "其中 $f(x)=(x-a)\\ln x-x\\ln a$。网页里直接画组合函数 $g(x)$，看它何时会出现三个不同的极值点。",
    focus: ["三极值点", "函数拼接", "a>e^2"],
    formulaLatex: "g(x)=\\left(x-\\frac1x\\right)\\ln x-\\left(x+\\frac1x\\right)\\ln a",
    derivativeLatex: "g'(x)=\\left(1+\\frac1{x^2}\\right)\\ln x+(\\ln a-1)\\left(\\frac1{x^2}-1\\right)",
    domain: { min: 0.08, max: 6, samples: 1400 },
    params: {
      a: { label: "参数 a", min: 1, max: 12, step: 0.05, value: 8 }
    },
    f: (x, p) => (x - 1 / x) * Math.log(x) - (x + 1 / x) * Math.log(p.a),
    df: (x, p) => (1 + 1 / (x * x)) * Math.log(x) + (Math.log(p.a) - 1) * (1 / (x * x) - 1),
    specialPoints: () => [{ x: 1, label: "x=1" }],
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。原题里“有三个不同极值点”的参数门槛是 a>e^2≈${fmt(Math.E * Math.E, 3)}。`,
      `当前视窗内导函数零点数为 ${analysis.criticalRoots.length}，可直接辅助判断是否已进入三极值点区间。`
    ]
  },
  {
    id: "topic2-pr3",
    topic: "专题二：多极值点函数最值问题",
    order: 23,
    shortTitle: "练习 3  定义运算题",
    title: "练习 3：$h(x)=a\\ln x-x+\\dfrac1x$",
    statement: "原题先定义行列式型运算，再得到 $f(x)=a\\ln x-x+1$、$g(x)=\\dfrac{1-x}{x}$，于是可把研究对象压缩成 $h(x)=f(x)+g(x)$。",
    focus: ["定义运算", "多极值点", "化繁为简"],
    formulaLatex: "h(x)=a\\ln x-x+\\frac1x",
    derivativeLatex: "h'(x)=\\frac{-x^2+ax-1}{x^2}",
    domain: { min: 0.08, max: 6, samples: 1200 },
    params: {
      a: { label: "参数 a", min: 0, max: 6, step: 0.05, value: 2.5 }
    },
    f: (x, p) => p.a * Math.log(x) - x + 1 / x,
    df: (x, p) => (-x * x + p.a * x - 1) / (x * x),
    notes: (p, analysis) => [
      `当前参数 a=${fmt(p.a)}。这个题最终仍然回到了熟悉的二次式导函数模型。`,
      `当前视窗内检测到 ${analysis.criticalRoots.length} 个驻点；当 a>2 时，就会出现题目里需要的两个极值点。`
    ]
  }
];
