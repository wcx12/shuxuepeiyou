window.CONVEX_SCENES = [
  {
    id: "chord",
    order: 1,
    shortTitle: "弦线定义",
    meta: "凸函数在弦线下方",
    kicker: "Definition",
    title: "凸函数定义：图像位于任意弦线下方",
    description: "拖动端点 a、b 和中间比例 t，观察曲线点 f(x) 与弦线点 l(x) 的高度差。凸函数的核心就是 f(x) ≤ l(x)。",
    caption: "蓝线是函数图像，金色线是连接两端点的弦线。",
    controls: [
      { type: "select", key: "fn", label: "函数", value: "quad", options: [
        ["quad", "f(x)=x²/2"],
        ["exp", "f(x)=eˣ/4"],
        ["abs", "f(x)=|x|"]
      ] },
      { type: "range", key: "a", label: "左端点 a", min: -2.6, max: -0.2, step: 0.1, value: -1.8 },
      { type: "range", key: "b", label: "右端点 b", min: 0.2, max: 2.6, step: 0.1, value: 1.8 },
      { type: "range", key: "t", label: "权重 t", min: 0.05, max: 0.95, step: 0.01, value: 0.42 }
    ]
  },
  {
    id: "secant",
    order: 2,
    shortTitle: "割线斜率",
    meta: "左段 ≤ 整段 ≤ 右段",
    kicker: "Secant Slopes",
    title: "割线斜率判别：区间右移，斜率不减",
    description: "调整 a、x、b，页面会同时显示左段、整段、右段三条割线及其斜率，帮助理解差商不等式的几何含义。",
    caption: "三条割线分别对应三个差商。",
    controls: [
      { type: "select", key: "fn", label: "函数", value: "quad", options: [
        ["quad", "f(x)=x²/2"],
        ["exp", "f(x)=eˣ/4"]
      ] },
      { type: "range", key: "a", label: "a", min: -2.8, max: -0.4, step: 0.1, value: -1.9 },
      { type: "range", key: "x", label: "x", min: -0.3, max: 0.8, step: 0.05, value: 0.1 },
      { type: "range", key: "b", label: "b", min: 1.0, max: 2.8, step: 0.1, value: 2.1 }
    ]
  },
  {
    id: "jensen",
    order: 3,
    shortTitle: "Jensen 权重",
    meta: "ta+(1-t)b",
    kicker: "Jensen",
    title: "两点 Jensen：权重决定中间点的位置",
    description: "拖动 t，观察 x=ta+(1-t)b 如何在 a 与 b 之间移动，同时比较 f(x) 与加权平均 tf(a)+(1-t)f(b)。",
    caption: "下方数轴显示权重对应的位置，上方图像显示函数值比较。",
    controls: [
      { type: "select", key: "fn", label: "函数", value: "quad", options: [
        ["quad", "f(x)=x²/2"],
        ["exp", "f(x)=eˣ/4"],
        ["abs", "f(x)=|x|"]
      ] },
      { type: "range", key: "a", label: "a", min: -2.6, max: -0.2, step: 0.1, value: -1.6 },
      { type: "range", key: "b", label: "b", min: 0.2, max: 2.6, step: 0.1, value: 2.0 },
      { type: "range", key: "t", label: "权重 t", min: 0, max: 1, step: 0.01, value: 0.35 }
    ]
  },
  {
    id: "midpoint",
    order: 4,
    shortTitle: "中点二分",
    meta: "从中点到任意比例",
    kicker: "Midpoint Convexity",
    title: "中点判别：二分点逼近任意比例",
    description: "改变二分层数 m，观察区间上的 2^m 等分点如何越来越密，从而把中点不等式推广到任意 t。",
    caption: "紫色竖线是目标比例 t，蓝色点是当前二分层数能得到的比例。",
    controls: [
      { type: "range", key: "level", label: "二分层数 m", min: 1, max: 6, step: 1, value: 3 },
      { type: "range", key: "target", label: "目标比例 t", min: 0, max: 1, step: 0.01, value: 0.37 }
    ]
  },
  {
    id: "tangent",
    order: 5,
    shortTitle: "切线支撑",
    meta: "曲线在切线上方",
    kicker: "Tangent Support",
    title: "切线支撑不等式：任意切线都托住凸函数",
    description: "拖动切点 x₀ 和观察点 x，比较 f(x) 与切线 T(x)=f(x₀)+f'(x₀)(x-x₀)。",
    caption: "红线是切线，蓝线是凸函数图像。",
    controls: [
      { type: "select", key: "fn", label: "函数", value: "quad", options: [
        ["quad", "f(x)=x²/2"],
        ["exp", "f(x)=eˣ/4"]
      ] },
      { type: "range", key: "x0", label: "切点 x₀", min: -2.2, max: 2.0, step: 0.05, value: -0.7 },
      { type: "range", key: "x", label: "观察点 x", min: -2.5, max: 2.5, step: 0.05, value: 1.4 }
    ]
  },
  {
    id: "max",
    order: 6,
    shortTitle: "最大值上包络",
    meta: "max{f,g} 仍凸",
    kicker: "Exercise 4",
    title: "两个凸函数的最大值：上包络仍然是凸函数",
    description: "拖动参数改变第二个函数的位置。粗紫线是 h(x)=max{f(x),g(x)}，它始终取两条凸曲线中更高的一段。",
    caption: "蓝线和红线是两个凸函数，紫线是它们的最大值。",
    controls: [
      { type: "range", key: "shift", label: "函数 g 的上移量", min: -0.8, max: 1.2, step: 0.05, value: 0.15 },
      { type: "range", key: "x", label: "观察点 x", min: -2.5, max: 2.5, step: 0.05, value: 0.2 }
    ]
  },
  {
    id: "extremum",
    order: 7,
    shortTitle: "极值两侧单调",
    meta: "左降右升",
    kicker: "Exercise 10",
    title: "凸函数极值点：左边递减，右边递增",
    description: "切换普通谷底和平坦谷底模式，观察凸函数只可能在谷底或平坦段上取得极值。",
    caption: "箭头标出极小点两侧的单调方向。",
    controls: [
      { type: "select", key: "mode", label: "模式", value: "point", options: [
        ["point", "普通极小点"],
        ["flat", "平坦极小段"]
      ] },
      { type: "range", key: "x", label: "观察点 x", min: -2.6, max: 2.6, step: 0.05, value: 1.3 }
    ]
  },
  {
    id: "symmetric",
    order: 8,
    shortTitle: "二阶对称差商",
    meta: "局部最大 vs 正差商",
    kicker: "Exercise 13",
    title: "二阶对称差商：局部最大与正差商的矛盾",
    description: "左图显示局部最大点处的对称差商不可能为正；右图显示加上 εx² 后，对称差商会变成 2ε。",
    caption: "拖动 h 和 ε，观察两个差商的符号。",
    controls: [
      { type: "range", key: "h", label: "步长 h", min: 0.2, max: 1.5, step: 0.05, value: 0.8 },
      { type: "range", key: "eps", label: "ε", min: 0.05, max: 0.8, step: 0.05, value: 0.25 }
    ]
  }
];
