(function () {
  const svgNS = "http://www.w3.org/2000/svg";
  const functions = {
    quad: {
      label: "f(x)=x²/2",
      f: (x) => 0.5 * x * x,
      df: (x) => x,
      view: { xMin: -3, xMax: 3, yMin: -0.4, yMax: 4.2 }
    },
    exp: {
      label: "f(x)=eˣ/4",
      f: (x) => Math.exp(x) / 4,
      df: (x) => Math.exp(x) / 4,
      view: { xMin: -3, xMax: 3, yMin: -0.2, yMax: 5.2 }
    },
    abs: {
      label: "f(x)=|x|",
      f: (x) => Math.abs(x),
      df: (x) => (x < 0 ? -1 : 1),
      view: { xMin: -3, xMax: 3, yMin: -0.4, yMax: 3.4 }
    }
  };

  const state = {
    sceneId: window.CONVEX_SCENES[0].id,
    values: {}
  };

  const navRoot = document.getElementById("scene-nav");
  const kicker = document.getElementById("scene-kicker");
  const title = document.getElementById("scene-title");
  const description = document.getElementById("scene-description");
  const caption = document.getElementById("visual-caption");
  const controlsRoot = document.getElementById("controls");
  const metricsRoot = document.getElementById("metrics");
  const notesRoot = document.getElementById("notes");
  const svg = document.getElementById("visual");
  const resetButton = document.getElementById("reset-button");

  function fmt(value, digits = 3) {
    if (!Number.isFinite(value)) return "—";
    const text = Number(value).toFixed(digits);
    return text.replace(/\.?0+$/, "");
  }

  function getScene() {
    return window.CONVEX_SCENES.find((scene) => scene.id === state.sceneId);
  }

  function defaults(scene) {
    const values = {};
    scene.controls.forEach((control) => {
      values[control.key] = control.value;
    });
    return values;
  }

  function sceneValues(scene) {
    if (!state.values[scene.id]) {
      state.values[scene.id] = defaults(scene);
    }
    return state.values[scene.id];
  }

  function resetScene() {
    const scene = getScene();
    state.values[scene.id] = defaults(scene);
    render();
  }

  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, value);
    });
    children.forEach((child) => node.appendChild(child));
    return node;
  }

  function textNode(x, y, content, className = "small-label", anchor = "middle") {
    const node = el("text", { x, y, class: className, "text-anchor": anchor });
    node.textContent = content;
    return node;
  }

  function drawLine(x1, y1, x2, y2, className = "helper-line") {
    svg.appendChild(el("line", { x1, y1, x2, y2, class: className }));
  }

  function drawCircle(x, y, r = 7, className = "point") {
    svg.appendChild(el("circle", { cx: x, cy: y, r, class: className }));
  }

  function drawPolyline(points, className = "curve") {
    svg.appendChild(el("polyline", {
      points: points.map((p) => `${fmt(p[0], 2)},${fmt(p[1], 2)}`).join(" "),
      class: className
    }));
  }

  function makePlot(view, rect = { left: 70, top: 34, width: 760, height: 430 }) {
    const xScale = rect.width / (view.xMax - view.xMin);
    const yScale = rect.height / (view.yMax - view.yMin);
    const px = (x) => rect.left + (x - view.xMin) * xScale;
    const py = (y) => rect.top + rect.height - (y - view.yMin) * yScale;

    for (let i = Math.ceil(view.xMin); i <= Math.floor(view.xMax); i += 1) {
      svg.appendChild(el("line", { x1: px(i), y1: rect.top, x2: px(i), y2: rect.top + rect.height, class: "grid-line" }));
      svg.appendChild(textNode(px(i), rect.top + rect.height + 24, String(i), "small-label"));
    }

    for (let j = Math.ceil(view.yMin); j <= Math.floor(view.yMax); j += 1) {
      svg.appendChild(el("line", { x1: rect.left, y1: py(j), x2: rect.left + rect.width, y2: py(j), class: "grid-line" }));
      if (j !== 0) svg.appendChild(textNode(rect.left - 14, py(j) + 5, String(j), "small-label", "end"));
    }

    drawLine(rect.left, py(0), rect.left + rect.width, py(0), "axis");
    drawLine(px(0), rect.top, px(0), rect.top + rect.height, "axis");
    svg.appendChild(textNode(rect.left + rect.width + 22, py(0) + 5, "x", "label"));
    svg.appendChild(textNode(px(0) + 14, rect.top - 10, "y", "label"));

    return { ...rect, px, py };
  }

  function sample(fn, plot, domain) {
    const points = [];
    const steps = 320;
    for (let i = 0; i <= steps; i += 1) {
      const x = domain.xMin + (domain.xMax - domain.xMin) * i / steps;
      const y = fn(x);
      if (Number.isFinite(y)) points.push([plot.px(x), plot.py(y)]);
    }
    return points;
  }

  function chordValue(fn, a, b, x) {
    const fa = fn(a);
    const fb = fn(b);
    return fa + (fb - fa) * (x - a) / (b - a);
  }

  function slope(fn, left, right) {
    return (fn(right) - fn(left)) / (right - left);
  }

  function renderNav() {
    navRoot.innerHTML = "";
    window.CONVEX_SCENES.forEach((scene) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `nav-button${scene.id === state.sceneId ? " active" : ""}`;
      button.innerHTML = `<span class="nav-title">${scene.order}. ${scene.shortTitle}</span><span class="nav-meta">${scene.meta}</span>`;
      button.addEventListener("click", () => {
        state.sceneId = scene.id;
        render();
      });
      navRoot.appendChild(button);
    });
  }

  function renderControls(scene, values) {
    controlsRoot.innerHTML = "";
    scene.controls.forEach((control) => {
      const wrap = document.createElement("div");
      wrap.className = "control";
      const label = document.createElement("div");
      label.className = "label-row";
      const valueText = document.createElement("span");
      valueText.className = "value";
      valueText.textContent = control.type === "select"
        ? control.options.find((option) => option[0] === values[control.key])?.[1] || values[control.key]
        : fmt(Number(values[control.key]), 2);
      label.innerHTML = `<span>${control.label}</span>`;
      label.appendChild(valueText);
      wrap.appendChild(label);

      if (control.type === "select") {
        const select = document.createElement("select");
        control.options.forEach(([value, optionLabel]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = optionLabel;
          select.appendChild(option);
        });
        select.value = values[control.key];
        select.addEventListener("change", () => {
          values[control.key] = select.value;
          render();
        });
        wrap.appendChild(select);
      } else {
        const input = document.createElement("input");
        input.type = "range";
        input.min = control.min;
        input.max = control.max;
        input.step = control.step;
        input.value = values[control.key];
        input.addEventListener("input", () => {
          values[control.key] = Number(input.value);
          render();
        });
        wrap.appendChild(input);
      }

      controlsRoot.appendChild(wrap);
    });
  }

  function renderMetrics(items) {
    metricsRoot.innerHTML = "";
    items.forEach((item) => {
      const metric = document.createElement("div");
      metric.className = "metric";
      metric.innerHTML = `<span class="metric-name">${item.name}</span><span class="metric-value">${item.value}</span>`;
      metricsRoot.appendChild(metric);
    });
  }

  function renderNotes(items) {
    notesRoot.innerHTML = "";
    items.forEach((item, index) => {
      const p = document.createElement("p");
      p.innerHTML = index === 0 ? `<span class="note-strong">${item}</span>` : item;
      notesRoot.appendChild(p);
    });
  }

  function renderChord(scene, values) {
    const fnInfo = functions[values.fn];
    const fn = fnInfo.f;
    const plot = makePlot(fnInfo.view);
    drawPolyline(sample(fn, plot, fnInfo.view), "curve");
    const a = Number(values.a);
    const b = Number(values.b);
    const t = Number(values.t);
    const x = t * a + (1 - t) * b;
    const fa = fn(a);
    const fb = fn(b);
    const fx = fn(x);
    const lx = chordValue(fn, a, b, x);

    drawLine(plot.px(a), plot.py(fa), plot.px(b), plot.py(fb), "chord");
    drawLine(plot.px(x), plot.py(fx), plot.px(x), plot.py(lx), "gap");
    drawCircle(plot.px(a), plot.py(fa), 7, "point point-gold");
    drawCircle(plot.px(b), plot.py(fb), 7, "point point-gold");
    drawCircle(plot.px(x), plot.py(fx), 7, "point");
    drawCircle(plot.px(x), plot.py(lx), 6, "point point-gold");

    svg.appendChild(textNode(plot.px(a), plot.py(fa) - 14, "A", "label"));
    svg.appendChild(textNode(plot.px(b), plot.py(fb) - 14, "B", "label"));
    svg.appendChild(textNode(plot.px(x) + 22, plot.py(fx) + 5, "f(x)", "small-label", "start"));
    svg.appendChild(textNode(plot.px(x) + 22, plot.py(lx) - 8, "l(x)", "small-label", "start"));

    renderMetrics([
      { name: "x=ta+(1-t)b", value: fmt(x) },
      { name: "f(x)", value: fmt(fx) },
      { name: "l(x)", value: fmt(lx) },
      { name: "l(x)-f(x)", value: fmt(lx - fx) }
    ]);
    renderNotes([
      "凸函数的检验不是只看一条弦线，而是任意两点连成的弦线都要在图像上方。",
      `当前 ${fnInfo.label} 下，l(x)-f(x)=${fmt(lx - fx)}，非负表示图像点没有超过弦线。`
    ]);
  }

  function renderSecant(scene, values) {
    const fnInfo = functions[values.fn];
    const fn = fnInfo.f;
    const plot = makePlot(fnInfo.view);
    drawPolyline(sample(fn, plot, fnInfo.view), "curve");
    const a = Number(values.a);
    const x = Number(values.x);
    const b = Number(values.b);

    const points = [
      { name: "a", x: a, y: fn(a), cls: "point point-gold" },
      { name: "x", x, y: fn(x), cls: "point" },
      { name: "b", x: b, y: fn(b), cls: "point point-red" }
    ];
    drawLine(plot.px(a), plot.py(fn(a)), plot.px(x), plot.py(fn(x)), "chord");
    drawLine(plot.px(a), plot.py(fn(a)), plot.px(b), plot.py(fn(b)), "helper-line");
    drawLine(plot.px(x), plot.py(fn(x)), plot.px(b), plot.py(fn(b)), "tangent");
    points.forEach((p) => {
      drawCircle(plot.px(p.x), plot.py(p.y), 7, p.cls);
      svg.appendChild(textNode(plot.px(p.x), plot.py(p.y) - 16, p.name, "label"));
    });

    const left = slope(fn, a, x);
    const whole = slope(fn, a, b);
    const right = slope(fn, x, b);
    renderMetrics([
      { name: "左段斜率", value: fmt(left) },
      { name: "整段斜率", value: fmt(whole) },
      { name: "右段斜率", value: fmt(right) },
      { name: "关系", value: left <= whole && whole <= right ? "成立" : "检查" }
    ]);
    renderNotes([
      "割线斜率判别的读法是：左段斜率 ≤ 整段斜率 ≤ 右段斜率。",
      "这比记忆公式更重要。图上看，就是连接点越往右，割线越来越陡。"
    ]);
  }

  function renderJensen(scene, values) {
    renderChord(scene, values);
    const a = Number(values.a);
    const b = Number(values.b);
    const t = Number(values.t);
    const x = t * a + (1 - t) * b;
    const y = 505;
    const x0 = 160;
    const x1 = 760;
    svg.appendChild(el("line", { x1: x0, y1: y, x2: x1, y2: y, class: "axis" }));
    const map = (v) => x0 + (v - a) / (b - a) * (x1 - x0);
    drawCircle(map(a), y, 6, "point point-gold");
    drawCircle(map(b), y, 6, "point point-gold");
    drawCircle(map(x), y, 8, "point point-red");
    svg.appendChild(textNode(map(a), y + 28, "a", "label"));
    svg.appendChild(textNode(map(b), y + 28, "b", "label"));
    svg.appendChild(textNode(map(x), y - 14, "x=ta+(1-t)b", "small-label"));
  }

  function renderMidpoint(scene, values) {
    const level = Number(values.level);
    const target = Number(values.target);
    const left = 90;
    const right = 810;
    const y = 270;
    svg.appendChild(textNode(450, 82, "二分越多，能得到的比例越密", "label"));
    svg.appendChild(el("line", { x1: left, y1: y, x2: right, y2: y, class: "axis" }));
    svg.appendChild(textNode(left, y + 35, "a", "label"));
    svg.appendChild(textNode(right, y + 35, "b", "label"));
    const n = 2 ** level;
    for (let k = 0; k <= n; k += 1) {
      const ratio = k / n;
      const px = left + ratio * (right - left);
      const height = k === 0 || k === n ? 34 : 22;
      svg.appendChild(el("line", { x1: px, y1: y - height, x2: px, y2: y + height, class: "helper-line" }));
      drawCircle(px, y, k === 0 || k === n ? 7 : 5, "point");
      if (k > 0 && k < n && n <= 16) {
        svg.appendChild(textNode(px, y + 50, `${k}/${n}`, "small-label"));
      }
    }
    const targetX = left + target * (right - left);
    drawLine(targetX, 130, targetX, 405, "gap");
    drawCircle(targetX, y, 8, "point point-red");
    const nearestK = Math.round(target * n);
    const nearest = nearestK / n;
    const nearestX = left + nearest * (right - left);
    drawCircle(nearestX, y - 70, 8, "point point-gold");
    drawLine(nearestX, y - 70, targetX, y, "chord");
    svg.appendChild(textNode(targetX, 120, `目标 t=${fmt(target, 2)}`, "formula-label"));
    svg.appendChild(textNode(nearestX, y - 92, `最近二分点 ${nearestK}/${n}`, "small-label"));

    renderMetrics([
      { name: "二分层数 m", value: String(level) },
      { name: "等分数 2^m", value: String(n) },
      { name: "目标 t", value: fmt(target, 2) },
      { name: "最近比例", value: `${nearestK}/${n}` }
    ]);
    renderNotes([
      "中点凸性只能直接给出 1/2，但反复使用中点，就能得到 1/4、3/4、1/8 等二分比例。",
      "连续性负责最后一步：二分比例可以逼近任意 t，函数值也随之取极限。"
    ]);
  }

  function renderTangent(scene, values) {
    const fnInfo = functions[values.fn];
    const fn = fnInfo.f;
    const df = fnInfo.df;
    const plot = makePlot(fnInfo.view);
    drawPolyline(sample(fn, plot, fnInfo.view), "curve");
    const x0 = Number(values.x0);
    const x = Number(values.x);
    const y0 = fn(x0);
    const m = df(x0);
    const tangent = (u) => y0 + m * (u - x0);
    drawLine(plot.px(fnInfo.view.xMin), plot.py(tangent(fnInfo.view.xMin)), plot.px(fnInfo.view.xMax), plot.py(tangent(fnInfo.view.xMax)), "tangent");
    drawCircle(plot.px(x0), plot.py(y0), 8, "point point-red");
    drawCircle(plot.px(x), plot.py(fn(x)), 7, "point");
    drawCircle(plot.px(x), plot.py(tangent(x)), 6, "point point-red");
    drawLine(plot.px(x), plot.py(fn(x)), plot.px(x), plot.py(tangent(x)), "gap");
    svg.appendChild(textNode(plot.px(x0), plot.py(y0) - 18, "x₀", "label"));
    svg.appendChild(textNode(plot.px(x) + 18, plot.py(fn(x)) + 5, "f(x)", "small-label", "start"));
    svg.appendChild(textNode(plot.px(x) + 18, plot.py(tangent(x)) - 8, "T(x)", "small-label", "start"));

    const diff = fn(x) - tangent(x);
    renderMetrics([
      { name: "切点 x₀", value: fmt(x0) },
      { name: "观察点 x", value: fmt(x) },
      { name: "f'(x₀)", value: fmt(m) },
      { name: "f(x)-T(x)", value: fmt(diff) }
    ]);
    renderNotes([
      "可微凸函数的图像位于任意切线的上方。",
      "这就是切线支撑不等式：f(x) ≥ f(x₀)+f'(x₀)(x-x₀)。"
    ]);
  }

  function renderMax(scene, values) {
    const view = { xMin: -3, xMax: 3, yMin: -0.3, yMax: 4.2 };
    const plot = makePlot(view);
    const shift = Number(values.shift);
    const f = (x) => 0.38 * (x + 1.1) ** 2 + 0.15;
    const g = (x) => 0.44 * (x - 1.0) ** 2 + 0.3 + shift;
    const h = (x) => Math.max(f(x), g(x));
    drawPolyline(sample(f, plot, view), "curve");
    drawPolyline(sample(g, plot, view), "curve curve-alt");
    drawPolyline(sample(h, plot, view), "curve curve-purple");
    const x = Number(values.x);
    drawLine(plot.px(x), plot.py(view.yMin), plot.px(x), plot.py(h(x)), "helper-line");
    drawCircle(plot.px(x), plot.py(f(x)), 6, "point");
    drawCircle(plot.px(x), plot.py(g(x)), 6, "point point-red");
    drawCircle(plot.px(x), plot.py(h(x)), 8, "point point-gold");
    svg.appendChild(textNode(165, 72, "f", "label"));
    svg.appendChild(textNode(725, 92, "g", "label"));
    svg.appendChild(textNode(450, 55, "h=max{f,g}", "formula-label"));

    renderMetrics([
      { name: "f(x)", value: fmt(f(x)) },
      { name: "g(x)", value: fmt(g(x)) },
      { name: "h(x)", value: fmt(h(x)) },
      { name: "当前取值", value: f(x) >= g(x) ? "f" : "g" }
    ]);
    renderNotes([
      "最大值函数 h 只取两条曲线中更高的一段，因此叫上包络。",
      "证明时不需要找交点，只要用 f(x),g(x)≤h(x) 把 Jensen 右边统一估计到 h 上。"
    ]);
  }

  function flatValue(x) {
    const a = Math.abs(x);
    return a <= 0.75 ? 0 : 0.6 * (a - 0.75) ** 2;
  }

  function renderExtremum(scene, values) {
    const view = { xMin: -3, xMax: 3, yMin: -0.35, yMax: 3.6 };
    const plot = makePlot(view);
    const mode = values.mode;
    const fn = mode === "flat" ? flatValue : (x) => 0.45 * x * x;
    drawPolyline(sample(fn, plot, view), "curve");
    const x = Number(values.x);
    drawCircle(plot.px(x), plot.py(fn(x)), 8, "point point-gold");
    if (mode === "flat") {
      drawLine(plot.px(-0.75), plot.py(0), plot.px(0.75), plot.py(0), "tangent");
      svg.appendChild(textNode(450, plot.py(0) - 18, "平坦极小段", "formula-label"));
    } else {
      drawCircle(plot.px(0), plot.py(0), 8, "point point-red");
      svg.appendChild(textNode(plot.px(0), plot.py(0) - 18, "极小点", "formula-label"));
    }
    drawLine(plot.px(-2.4), plot.py(fn(-2.4)), plot.px(-1.2), plot.py(fn(-1.2)), "chord");
    drawLine(plot.px(1.2), plot.py(fn(1.2)), plot.px(2.4), plot.py(fn(2.4)), "chord");
    svg.appendChild(textNode(plot.px(-1.85), plot.py(fn(-1.85)) - 35, "左侧递减", "label"));
    svg.appendChild(textNode(plot.px(1.85), plot.py(fn(1.85)) - 35, "右侧递增", "label"));

    renderMetrics([
      { name: "模式", value: mode === "flat" ? "平坦段" : "普通谷底" },
      { name: "观察点 x", value: fmt(x) },
      { name: "f(x)", value: fmt(fn(x)) },
      { name: "极小值", value: "0" }
    ]);
    renderNotes([
      "凸函数如果在内点有极值，本质上是谷底；左边不会上上下下，右边也不会反复回落。",
      "所谓内点局部极大，只能发生在平坦段上，否则会违反弦线在图像上方。"
    ]);
  }

  function renderSymmetric(scene, values) {
    const h = Number(values.h);
    const eps = Number(values.eps);
    const leftRect = { left: 60, top: 70, width: 360, height: 360 };
    const rightRect = { left: 500, top: 70, width: 340, height: 360 };
    const leftView = { xMin: -2, xMax: 2, yMin: -0.2, yMax: 1.2 };
    const rightView = { xMin: -2, xMax: 2, yMin: -0.2, yMax: 1.2 };

    const oldSvg = svg.innerHTML;
    const p1 = makePlot(leftView, leftRect);
    const g = (x) => 1 - 0.45 * x * x;
    drawPolyline(sample(g, p1, leftView), "curve curve-alt");
    [-h, 0, h].forEach((x) => drawCircle(p1.px(x), p1.py(g(x)), x === 0 ? 8 : 7, x === 0 ? "point point-red" : "point"));
    drawLine(p1.px(-h), p1.py(g(-h)), p1.px(h), p1.py(g(h)), "chord");
    svg.appendChild(textNode(leftRect.left + leftRect.width / 2, 42, "局部最大：差商 ≤ 0", "label"));

    const p2 = makePlot(rightView, rightRect);
    const q = (x) => eps * x * x;
    drawPolyline(sample(q, p2, rightView), "curve curve-green");
    [-h, 0, h].forEach((x) => drawCircle(p2.px(x), p2.py(q(x)), x === 0 ? 8 : 7, x === 0 ? "point point-red" : "point"));
    drawLine(p2.px(-h), p2.py(q(-h)), p2.px(h), p2.py(q(h)), "chord");
    svg.appendChild(textNode(rightRect.left + rightRect.width / 2, 42, "加 εx²：差商 = 2ε", "label"));

    const leftQuotient = (g(h) + g(-h) - 2 * g(0)) / (h * h);
    const rightQuotient = (q(h) + q(-h) - 2 * q(0)) / (h * h);
    renderMetrics([
      { name: "h", value: fmt(h) },
      { name: "ε", value: fmt(eps) },
      { name: "局部最大差商", value: fmt(leftQuotient) },
      { name: "εx² 差商", value: fmt(rightQuotient) }
    ]);
    renderNotes([
      "如果某函数在 x₀ 附近取最大值，那么左右两点都不超过中点，二阶对称差商不可能为正。",
      "练习 13 的证明就是把 f 加上 εx²，使差商变成正数，从而排除“不凸”的可能。"
    ]);
  }

  const renderers = {
    chord: renderChord,
    secant: renderSecant,
    jensen: renderJensen,
    midpoint: renderMidpoint,
    tangent: renderTangent,
    max: renderMax,
    extremum: renderExtremum,
    symmetric: renderSymmetric
  };

  function render() {
    const scene = getScene();
    const values = sceneValues(scene);
    renderNav();
    kicker.textContent = scene.kicker;
    title.textContent = scene.title;
    description.textContent = scene.description;
    caption.textContent = scene.caption;
    renderControls(scene, values);
    metricsRoot.innerHTML = "";
    notesRoot.innerHTML = "";
    svg.innerHTML = "";
    renderers[scene.id](scene, values);
  }

  resetButton.addEventListener("click", resetScene);
  render();
})();
