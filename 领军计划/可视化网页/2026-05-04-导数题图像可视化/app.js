(function () {
  const state = {
    problemId: window.PROBLEMS[0].id,
    params: {}
  };

  const navRoot = document.getElementById("problem-nav");
  const topicLabel = document.getElementById("topic-label");
  const problemTitle = document.getElementById("problem-title");
  const formulaBox = document.getElementById("formula-box");
  const statementBox = document.getElementById("problem-statement");
  const focusPoints = document.getElementById("focus-points");
  const controlsRoot = document.getElementById("controls");
  const metricsRoot = document.getElementById("metrics");
  const notesRoot = document.getElementById("analysis-notes");
  const functionInline = document.getElementById("function-inline");
  const derivativeInline = document.getElementById("derivative-inline");
  const plotModal = document.getElementById("plot-modal");
  const plotModalTopic = document.getElementById("plot-modal-topic");
  const plotModalTitle = document.getElementById("plot-modal-title");
  const plotModalMath = document.getElementById("plot-modal-math");
  const plotModalCanvas = document.getElementById("plot-modal-canvas");
  const modalCloseButton = document.getElementById("plot-modal-close");
  const expandButtons = document.querySelectorAll(".expand-button");
  let latestPlots = null;

  function getProblem() {
    return window.PROBLEMS.find((item) => item.id === state.problemId);
  }

  function initParams(problem) {
    const current = state.params[problem.id];
    if (current) return current;
    const values = {};
    Object.entries(problem.params || {}).forEach(([key, config]) => {
      values[key] = config.value;
    });
    state.params[problem.id] = values;
    return values;
  }

  function safeEval(fn, x, params) {
    try {
      const value = fn(x, params);
      return Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  }

  function sampleFunction(fn, domain, params) {
    const xs = [];
    const ys = [];
    const samples = domain.samples || 800;
    const step = (domain.max - domain.min) / samples;
    for (let i = 0; i <= samples; i += 1) {
      const x = domain.min + step * i;
      const y = safeEval(fn, x, params);
      xs.push(x);
      ys.push(y);
    }
    return { xs, ys };
  }

  function bisect(fn, left, right, params) {
    let a = left;
    let b = right;
    let fa = safeEval(fn, a, params);
    let fb = safeEval(fn, b, params);
    if (fa == null || fb == null) return null;
    for (let i = 0; i < 60; i += 1) {
      const mid = (a + b) / 2;
      const fm = safeEval(fn, mid, params);
      if (fm == null) return null;
      if (Math.abs(fm) < 1e-8) return mid;
      if (fa * fm <= 0) {
        b = mid;
        fb = fm;
      } else {
        a = mid;
        fa = fm;
      }
    }
    return (a + b) / 2;
  }

  function dedupe(values, tolerance = 1e-3) {
    return values
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b)
      .filter((value, index, array) => index === 0 || Math.abs(value - array[index - 1]) > tolerance);
  }

  function findSignChangeRoots(fn, domain, params, options = {}) {
    const { includeNearZero = false, tolerance = 1e-6 } = options;
    const roots = [];
    const samples = domain.samples || 900;
    const step = (domain.max - domain.min) / samples;
    let previousX = domain.min;
    let previousY = safeEval(fn, previousX, params);

    for (let i = 1; i <= samples; i += 1) {
      const x = domain.min + step * i;
      const y = safeEval(fn, x, params);

      if (y == null) {
        previousX = x;
        previousY = y;
        continue;
      }

      if (includeNearZero && Math.abs(y) < tolerance) {
        roots.push(x);
      }

      if (previousY != null && previousY * y < 0) {
        const root = bisect(fn, previousX, x, params);
        if (root != null) roots.push(root);
      }

      previousX = x;
      previousY = y;
    }

    return dedupe(roots);
  }

  function findTouchRoots(fn, candidates, params, tolerance = 1e-4) {
    const roots = candidates.filter((x) => {
      const y = safeEval(fn, x, params);
      return y != null && Math.abs(y) < tolerance;
    });
    return dedupe(roots, 1e-2);
  }

  function findSampleTouchRoots(fn, domain, params, tolerance = 1e-4) {
    const roots = [];
    const samples = domain.samples || 900;
    const step = (domain.max - domain.min) / samples;
    const points = [];

    for (let i = 0; i <= samples; i += 1) {
      const x = domain.min + step * i;
      const y = safeEval(fn, x, params);
      points.push({ x, y });
    }

    for (let i = 1; i < points.length - 1; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      if (prev.y == null || curr.y == null || next.y == null) continue;

      const aPrev = Math.abs(prev.y);
      const aCurr = Math.abs(curr.y);
      const aNext = Math.abs(next.y);

      if (aCurr < tolerance && aCurr <= aPrev && aCurr <= aNext && (aCurr < aPrev || aCurr < aNext)) {
        roots.push(curr.x);
      }
    }

    return dedupe(roots, 1e-2);
  }

  function intervalSigns(problem, params, criticalRoots) {
    const bounds = [problem.domain.min, ...criticalRoots, problem.domain.max];
    const intervals = [];

    for (let i = 0; i < bounds.length - 1; i += 1) {
      const left = bounds[i];
      const right = bounds[i + 1];
      if (!Number.isFinite(left) || !Number.isFinite(right) || right - left < 1e-4) continue;
      const mid = (left + right) / 2;
      const value = safeEval(problem.df, mid, params);
      let sign = "未知";
      if (value != null) {
        sign = value > 0 ? "增" : value < 0 ? "减" : "平";
      }
      intervals.push({ left, right, sign });
    }

    return intervals;
  }

  function analyze(problem, params) {
    const criticalRoots = dedupe([
      ...findSignChangeRoots(problem.df, problem.domain, params, { includeNearZero: true }),
      ...findSampleTouchRoots(problem.df, problem.domain, params)
    ], 1e-2);
    const signChangeRoots = findSignChangeRoots(problem.f, problem.domain, params);
    const touchRoots = findTouchRoots(problem.f, criticalRoots, params);
    const fRoots = dedupe([...signChangeRoots, ...touchRoots], 1e-2);
    const extrema = criticalRoots
      .map((x) => ({ x, y: safeEval(problem.f, x, params) }))
      .filter((point) => point.y != null);
    const monotonicity = intervalSigns(problem, params, criticalRoots);
    const specials = (problem.specialPoints || (() => []))(params)
      .map((point) => ({ ...point, y: safeEval(problem.f, point.x, params) }))
      .filter((point) => point.y != null);
    return { fRoots, criticalRoots, extrema, monotonicity, specials };
  }

  function formatNumber(value, digits = 4) {
    if (!Number.isFinite(value)) return "无";
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function intervalText(interval) {
    return `(${formatNumber(interval.left, 3)}, ${formatNumber(interval.right, 3)})：${interval.sign}`;
  }

  function renderMath(element, latex, displayMode = true) {
    if (!window.katex) return;
    window.katex.render(latex, element, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderRichText(element, text, className = "") {
    const source = String(text || "");
    const blocks = source.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    const html = blocks.map((block) => {
      let fragment = escapeHtml(block);
      fragment = fragment.replace(/\n/g, "<br>");
      fragment = fragment.replace(/\$(.+?)\$/g, (_, latex) => {
        return `<span class="math-inline" data-latex="${encodeURIComponent(latex)}"></span>`;
      });
      return `<p>${fragment}</p>`;
    }).join("");
    element.className = className;
    element.innerHTML = html || "<p></p>";
    element.querySelectorAll("[data-latex]").forEach((node) => {
      renderMath(node, decodeURIComponent(node.getAttribute("data-latex")), false);
      node.removeAttribute("data-latex");
    });
  }

  function renderSidebar() {
    const grouped = new Map();
    window.PROBLEMS.forEach((problem) => {
      if (!grouped.has(problem.topic)) grouped.set(problem.topic, []);
      grouped.get(problem.topic).push(problem);
    });

    navRoot.innerHTML = "";
    grouped.forEach((problems, topic) => {
      const section = document.createElement("section");
      section.className = "nav-topic";

      const title = document.createElement("h2");
      title.className = "nav-topic-title";
      title.textContent = topic;
      section.appendChild(title);

      const list = document.createElement("div");
      list.className = "nav-list";

      problems.forEach((problem) => {
        const button = document.createElement("button");
        button.className = `nav-button${problem.id === state.problemId ? " active" : ""}`;
        button.type = "button";
        button.innerHTML = `
          <span class="nav-button-title">${problem.shortTitle || problem.title.replace(/\$/g, "")}</span>
          <span class="nav-button-meta">顺序 ${problem.order}</span>
        `;
        button.addEventListener("click", () => {
          state.problemId = problem.id;
          renderApp();
        });
        list.appendChild(button);
      });

      section.appendChild(list);
      navRoot.appendChild(section);
    });
  }

  function renderControls(problem, params) {
    controlsRoot.innerHTML = "";
    const entries = Object.entries(problem.params || {});

    if (!entries.length) {
      const fixed = document.createElement("div");
      fixed.className = "fixed-param";
      fixed.textContent = "本题没有可调参数。";
      controlsRoot.appendChild(fixed);
      return;
    }

    entries.forEach(([key, config]) => {
      const row = document.createElement("div");
      row.className = "control-row";
      row.innerHTML = `
        <label>
          <span class="control-name">${config.label}</span>
          <span class="control-value">${formatNumber(params[key], 4)}</span>
        </label>
      `;

      const input = document.createElement("input");
      input.type = "range";
      input.min = config.min;
      input.max = config.max;
      input.step = config.step;
      input.value = params[key];
      input.addEventListener("input", (event) => {
        state.params[problem.id][key] = Number(event.target.value);
        renderApp(false);
      });

      row.appendChild(input);
      controlsRoot.appendChild(row);
    });
  }

  function renderSummary(problem, params, analysis) {
    metricsRoot.innerHTML = "";
    const metricCards = [
      {
        label: "原函数零点",
        value: analysis.fRoots.length ? analysis.fRoots.map((x) => formatNumber(x, 3)).join("，") : "当前视窗内未检测到"
      },
      {
        label: "导函数零点 / 驻点",
        value: analysis.criticalRoots.length ? analysis.criticalRoots.map((x) => formatNumber(x, 3)).join("，") : "当前视窗内未检测到"
      },
      {
        label: "单调区间",
        value: analysis.monotonicity.length ? analysis.monotonicity.map(intervalText).join("；") : "暂无"
      }
    ];

    metricCards.forEach((metric) => {
      const card = document.createElement("article");
      card.className = "metric-card";
      card.innerHTML = `
        <p class="metric-label">${metric.label}</p>
        <p class="metric-value">${metric.value}</p>
      `;
      metricsRoot.appendChild(card);
    });

    notesRoot.innerHTML = "";
    const notes = (problem.notes || (() => []))(params, analysis);
    notes.forEach((text) => {
      const note = document.createElement("div");
      renderRichText(note, text, "note rendered-richtext");
      notesRoot.appendChild(note);
    });
  }

  function renderProblemMeta(problem, params) {
    topicLabel.textContent = problem.topic;
    renderRichText(problemTitle, problem.title, "problem-title rendered-richtext");
    renderRichText(statementBox, problem.statement, "statement rendered-richtext");

    formulaBox.innerHTML = "";
    renderMath(formulaBox, `${problem.formulaLatex}\\\\${problem.derivativeLatex}`, true);

    functionInline.innerHTML = "";
    derivativeInline.innerHTML = "";
    renderMath(functionInline, problem.formulaLatex, false);
    renderMath(derivativeInline, problem.derivativeLatex, false);

    focusPoints.innerHTML = "";
    problem.focus.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      focusPoints.appendChild(chip);
    });

    renderControls(problem, params);
  }

  function markerTrace(points, name, color) {
    return {
      x: points.map((point) => point.x),
      y: points.map((point) => point.y),
      mode: "markers+text",
      type: "scatter",
      text: points.map((point) => point.label || `x=${formatNumber(point.x, 2)}`),
      textposition: "top center",
      marker: {
        size: 10,
        color,
        line: { color: "#fff", width: 1.5 }
      },
      name,
      hovertemplate: "x=%{x:.4f}<br>y=%{y:.4f}<extra>" + name + "</extra>"
    };
  }

  function buildPlotSpec(problem, params, analysis) {
    const sampledF = sampleFunction(problem.f, problem.domain, params);
    const sampledDf = sampleFunction(problem.df, problem.domain, params);
    const extremaPoints = analysis.extrema.map((point, index) => ({
      ...point,
      label: `极值点 ${index + 1}`
    }));
    const zeroPoints = analysis.fRoots.map((x, index) => ({
      x,
      y: 0,
      label: `零点 ${index + 1}`
    }));
    const criticalPoints = analysis.criticalRoots.map((x, index) => ({
      x,
      y: 0,
      label: `驻点 ${index + 1}`
    }));

    const layoutBase = {
      margin: { l: 56, r: 22, t: 14, b: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(255,255,255,0)",
      xaxis: {
        title: "x",
        gridcolor: "rgba(20,33,50,0.08)",
        zerolinecolor: "rgba(20,33,50,0.18)"
      },
      yaxis: {
        title: "y",
        gridcolor: "rgba(20,33,50,0.08)",
        zerolinecolor: "rgba(20,33,50,0.18)"
      },
      showlegend: true,
      legend: {
        orientation: "h",
        x: 0,
        y: 1.12
      }
    };

    return {
      function: {
        data: [
          {
            x: sampledF.xs,
            y: sampledF.ys,
            mode: "lines",
            type: "scatter",
            line: { color: "#143f7b", width: 3 },
            name: "f(x)",
            hovertemplate: "x=%{x:.4f}<br>f(x)=%{y:.4f}<extra></extra>"
          },
          markerTrace(extremaPoints, "极值点", "#c08a2a"),
          markerTrace(zeroPoints, "零点", "#1f7a6e"),
          markerTrace(analysis.specials, "特殊点", "#a3382d")
        ],
        layout: { ...layoutBase }
      },
      derivative: {
        data: [
          {
            x: sampledDf.xs,
            y: sampledDf.ys,
            mode: "lines",
            type: "scatter",
            line: { color: "#a3382d", width: 3 },
            name: "f'(x)",
            hovertemplate: "x=%{x:.4f}<br>f'(x)=%{y:.4f}<extra></extra>"
          },
          markerTrace(criticalPoints, "导函数零点", "#c08a2a")
        ],
        layout: { ...layoutBase }
      }
    };
  }

  function plotProblem(problem, params, analysis) {
    latestPlots = buildPlotSpec(problem, params, analysis);

    Plotly.newPlot("function-plot", latestPlots.function.data, latestPlots.function.layout, {
      responsive: true,
      displaylogo: false
    });

    Plotly.newPlot("derivative-plot", latestPlots.derivative.data, latestPlots.derivative.layout, {
      responsive: true,
      displaylogo: false
    });
  }

  function openPlotModal(kind) {
    if (!latestPlots) return;
    const problem = getProblem();
    const titleMap = {
      function: "原函数全屏图像",
      derivative: "导函数全屏图像"
    };
    const latexMap = {
      function: problem.formulaLatex,
      derivative: problem.derivativeLatex
    };
    const plot = latestPlots[kind];

    plotModalTopic.textContent = problem.topic;
    plotModalTitle.textContent = `${problem.shortTitle || problem.title} · ${titleMap[kind]}`;
    plotModalMath.innerHTML = "";
    renderMath(plotModalMath, latexMap[kind], true);
    plotModalCanvas.innerHTML = '<div id="plot-modal-plot" class="plot"></div>';
    plotModal.classList.remove("hidden");
    plotModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    Plotly.newPlot(
      "plot-modal-plot",
      plot.data,
      {
        ...plot.layout,
        margin: { l: 72, r: 30, t: 24, b: 64 },
        legend: { orientation: "h", x: 0, y: 1.08 }
      },
      { responsive: true, displaylogo: false }
    );
  }

  function closePlotModal() {
    plotModal.classList.add("hidden");
    plotModal.setAttribute("aria-hidden", "true");
    plotModalCanvas.innerHTML = "";
    document.body.style.overflow = "";
  }

  function renderApp(updateSidebar = true) {
    const problem = getProblem();
    const params = initParams(problem);
    const analysis = analyze(problem, params);

    if (updateSidebar) {
      renderSidebar();
    } else {
      document.querySelectorAll(".nav-button").forEach((button) => {
        const title = button.querySelector(".nav-button-title")?.textContent || "";
        const active = title === (problem.shortTitle || problem.title.replace(/\$/g, ""));
        button.classList.toggle("active", active);
      });
    }

    renderProblemMeta(problem, params);
    renderSummary(problem, params, analysis);
    plotProblem(problem, params, analysis);
  }

  expandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openPlotModal(button.dataset.plotKind);
    });
  });

  modalCloseButton.addEventListener("click", closePlotModal);

  plotModal.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
      closePlotModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !plotModal.classList.contains("hidden")) {
      closePlotModal();
    }
  });

  renderApp();
})();
