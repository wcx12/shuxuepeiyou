const V = (x, y, z) => new THREE.Vector3(x, y, z);

const presets = {
  regular: {
    name: "正四面体",
    points: [
      V(1, 1, 1),
      V(1, -1, -1),
      V(-1, 1, -1),
      V(-1, -1, 1),
    ],
  },
  tilt: {
    name: "倾斜四面体",
    points: [
      V(1.35, 0.25, 0.05),
      V(-0.9, 1.15, -0.12),
      V(-0.7, -1.05, 0.12),
      V(0.15, -0.1, 1.95),
    ],
  },
  flat: {
    name: "接近扁平",
    points: [
      V(1.35, 0.1, 0),
      V(-1.15, 0.95, 0.06),
      V(-0.65, -1.2, -0.04),
      V(0.08, -0.05, 0.78),
    ],
  },
};

const faceVertexIds = [
  [1, 2, 3],
  [0, 3, 2],
  [0, 1, 3],
  [0, 2, 1],
];

const edgePairs = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

const els = {
  scene: document.querySelector("#scene"),
  shapeName: document.querySelector("#shapeName"),
  regularBtn: document.querySelector("#regularBtn"),
  tiltBtn: document.querySelector("#tiltBtn"),
  flatBtn: document.querySelector("#flatBtn"),
  scanBtn: document.querySelector("#scanBtn"),
  aGap: document.querySelector("#aGap"),
  bGap: document.querySelector("#bGap"),
  cGap: document.querySelector("#cGap"),
  dValue: document.querySelector("#dValue"),
  aHint: document.querySelector("#aHint"),
  bHint: document.querySelector("#bHint"),
  cHint: document.querySelector("#cHint"),
  dHint: document.querySelector("#dHint"),
  acuteState: document.querySelector("#acuteState"),
  volumeState: document.querySelector("#volumeState"),
  angleState: document.querySelector("#angleState"),
  scanSummary: document.querySelector("#scanSummary"),
  scanBars: document.querySelector("#scanBars"),
  inputs: ["x1", "x2", "x3", "x4", "px", "py", "pz"].map((id) => document.querySelector(`#${id}`)),
};

let current = presets.regular.points.map((p) => p.clone());
let renderer;
let scene;
let camera;
let objectGroup;
let frameId;
let cameraDistance = 10.2;
const drag = {
  active: false,
  x: 0,
  y: 0,
};

function initScene() {
  if (!window.THREE) {
    els.scene.innerHTML = "<p class=\"load-error\">Three.js 没有加载成功，请检查网络后刷新。</p>";
    return;
  }

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  els.scene.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(4.6, 4.3, 4.2).setLength(cameraDistance);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const light = new THREE.DirectionalLight(0xffffff, 2.5);
  light.position.set(4, 5, 6);
  scene.add(light);

  objectGroup = new THREE.Group();
  objectGroup.rotation.set(-0.18, 0.42, 0);
  objectGroup.position.x = -3.65;
  scene.add(objectGroup);
  bindScenePointer();
  window.addEventListener("resize", resize);
  resize();
  animate();
}

function bindScenePointer() {
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (event) => {
    drag.active = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag.active) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    objectGroup.rotation.y += dx * 0.008;
    objectGroup.rotation.x += dy * 0.008;
  });
  canvas.addEventListener("pointerup", (event) => {
    drag.active = false;
    canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    cameraDistance = Math.max(4.2, Math.min(13, cameraDistance + event.deltaY * 0.006));
    camera.position.setLength(cameraDistance);
    camera.lookAt(0, 0, 0);
  }, { passive: false });
}

function resize() {
  if (!renderer) return;
  const rect = els.scene.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  frameId = requestAnimationFrame(animate);
  if (!drag.active && objectGroup) objectGroup.rotation.y += 0.002;
  renderer.render(scene, camera);
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }
}

function orientedNormal(points, ids, oppositeId) {
  const [a, b, c] = ids.map((id) => points[id]);
  const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
  const toOpposite = points[oppositeId].clone().sub(a);
  if (normal.dot(toOpposite) > 0) normal.multiplyScalar(-1);
  return normal;
}

function getFaceData(points) {
  return faceVertexIds.map((ids, i) => {
    const centroid = ids.reduce((acc, id) => acc.add(points[id]), V(0, 0, 0)).multiplyScalar(1 / 3);
    return {
      ids,
      centroid,
      normal: orientedNormal(points, ids, i),
    };
  });
}

function volume(points) {
  return Math.abs(
    points[1].clone().sub(points[0]).dot(
      points[2].clone().sub(points[0]).cross(points[3].clone().sub(points[0]))
    )
  ) / 6;
}

function edgeLengths(points) {
  return edgePairs.map(([i, j]) => points[i].distanceTo(points[j]));
}

function dihedralData(points) {
  const faces = getFaceData(points);
  const angles = [];
  const cosines = [];
  for (let i = 0; i < 4; i += 1) {
    for (let j = i + 1; j < 4; j += 1) {
      const cosine = Math.max(-1, Math.min(1, -faces[i].normal.dot(faces[j].normal)));
      cosines.push(cosine);
      angles.push(Math.acos(cosine) * 180 / Math.PI);
    }
  }
  return { faces, angles, cosines };
}

function values() {
  const [x1, x2, x3, x4, px, py, pz] = els.inputs.map((input) => Number(input.value));
  return { xs: [x1, x2, x3, x4], p: V(px, py, pz) };
}

function fmt(n, digits = 5) {
  if (!Number.isFinite(n)) return "无法计算";
  if (Math.abs(n) < 1e-9) return "0";
  return n.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

function makeTextLabel(text, position, color = "#182022") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 28px Microsoft YaHei, Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(0.34, 0.17, 1);
  return sprite;
}

function drawScene(metrics) {
  if (!objectGroup) return;
  clearGroup(objectGroup);

  const faceColors = [0x0f766e, 0x2563eb, 0xb42318, 0xa15c07];
  for (let i = 0; i < faceVertexIds.length; i += 1) {
    const ids = faceVertexIds[i];
    const geometry = new THREE.BufferGeometry().setFromPoints(ids.map((id) => current[id]));
    geometry.setIndex([0, 1, 2]);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: faceColors[i],
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      roughness: 0.55,
    });
    objectGroup.add(new THREE.Mesh(geometry, material));
  }

  edgePairs.forEach(([i, j]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([current[i], current[j]]);
    objectGroup.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x182022, linewidth: 2 })));
  });

  current.forEach((point, i) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    dot.position.copy(point);
    objectGroup.add(dot);
    objectGroup.add(makeTextLabel(`A${i + 1}`, point.clone().multiplyScalar(1.08)));
  });

  const { xs, p } = values();
  const weightedNormal = metrics.faces.reduce(
    (acc, face, i) => acc.add(face.normal.clone().multiplyScalar(xs[i])),
    V(0, 0, 0)
  );
  metrics.faces.forEach((face, i) => {
    objectGroup.add(new THREE.ArrowHelper(face.normal, face.centroid, 0.5 + xs[i] * 0.1, faceColors[i], 0.12, 0.07));
  });
  objectGroup.add(new THREE.ArrowHelper(weightedNormal.clone().normalize(), V(0, 0, 0), Math.max(0.15, weightedNormal.length()), 0x111827, 0.18, 0.1));

  const w = xs.reduce((sum, x) => sum + x, 0);
  const g = current.reduce((acc, point, i) => acc.add(point.clone().multiplyScalar(xs[i])), V(0, 0, 0)).multiplyScalar(1 / w);
  const pDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20), new THREE.MeshStandardMaterial({ color: 0xb42318 }));
  pDot.position.copy(p);
  objectGroup.add(pDot);
  objectGroup.add(makeTextLabel("P", p.clone().add(V(0.08, 0.08, 0.08)), "#b42318"));

  const gDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20), new THREE.MeshStandardMaterial({ color: 0x0f766e }));
  gDot.position.copy(g);
  objectGroup.add(gDot);
  objectGroup.add(makeTextLabel("G", g.clone().add(V(0.08, 0.08, 0.08)), "#0f766e"));

  objectGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([p, g]),
    new THREE.LineDashedMaterial({ color: 0xb42318, dashSize: 0.08, gapSize: 0.05 })
  ));
}

function compute() {
  const { xs, p } = values();
  const w = xs.reduce((sum, x) => sum + x, 0);
  const { faces, angles, cosines } = dihedralData(current);
  const lengths = edgeLengths(current);
  const vol = volume(current);

  let aRight = 0;
  let pairIndex = 0;
  for (let i = 0; i < 4; i += 1) {
    for (let j = i + 1; j < 4; j += 1) {
      aRight += xs[i] * xs[j] * cosines[pairIndex];
      pairIndex += 1;
    }
  }
  const aGap = xs.reduce((sum, x) => sum + x * x, 0) - 2 * aRight;

  const weightedDistance = current.reduce((sum, point, i) => sum + xs[i] * p.distanceToSquared(point), 0);
  const pairDistance = edgePairs.reduce((sum, [i, j]) => sum + xs[i] * xs[j] * current[i].distanceToSquared(current[j]), 0);
  const bGap = w * weightedDistance - pairDistance;

  const edgeSquares = lengths.map((a) => a * a);
  let cLeft = 0;
  for (let i = 0; i < 6; i += 1) {
    for (let j = i + 1; j < 6; j += 1) cLeft += edgeSquares[i] * edgeSquares[j];
  }
  cLeft -= edgeSquares.reduce((sum, s) => sum + s * s, 0);
  const cRight = 108 * Math.cbrt(3 * Math.pow(vol, 4));
  const cGap = cLeft - cRight;

  const dValue = cosines.reduce((product, cosine) => product * cosine, 1);
  const minAngle = Math.min(...angles);
  const maxAngle = Math.max(...angles);
  const acute = angles.every((angle) => angle < 90 - 1e-7);

  return { faces, angles, cosines, vol, aGap, bGap, cGap, dValue, minAngle, maxAngle, acute };
}

function update() {
  const metrics = compute();
  els.aGap.textContent = fmt(metrics.aGap);
  els.bGap.textContent = fmt(metrics.bGap);
  els.cGap.textContent = fmt(metrics.cGap);
  els.dValue.textContent = fmt(metrics.dValue, 8);
  els.acuteState.textContent = `二面角状态：${metrics.acute ? "全部为锐角" : "不是全部为锐角"}`;
  els.volumeState.textContent = `体积：${fmt(metrics.vol, 6)}`;
  els.angleState.textContent = `最小二面角：${fmt(metrics.minAngle, 3)}°，最大二面角：${fmt(metrics.maxAngle, 3)}°`;
  els.cHint.textContent = Math.abs(metrics.cGap) < 1e-7 ? "这里取到等号。" : "差值越接近 0，越像等号模型。";
  els.dHint.textContent = Math.abs(metrics.dValue - 1 / 729) < 1e-7
    ? "正四面体等于 1/729，严格大于被它否掉。"
    : `与 1/729 的差：${fmt(metrics.dValue - 1 / 729, 8)}`;
  drawScene(metrics);
}

function setPreset(key) {
  const preset = presets[key];
  current = preset.points.map((p) => p.clone());
  els.shapeName.textContent = preset.name;
  update();
}

function randomPoint(scale = 2) {
  return V(
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale
  );
}

function scan() {
  const original = current.map((p) => p.clone());
  const products = [];
  let best = Infinity;
  let bestPoints = null;
  let tried = 0;
  while (products.length < 800 && tried < 12000) {
    tried += 1;
    const candidate = [randomPoint(), randomPoint(), randomPoint(), randomPoint()];
    if (volume(candidate) < 0.05) continue;
    const { angles, cosines } = dihedralData(candidate);
    if (!angles.every((angle) => angle > 0 && angle < 90)) continue;
    const product = cosines.reduce((acc, c) => acc * c, 1);
    products.push(product);
    if (product < best) {
      best = product;
      bestPoints = candidate;
    }
  }

  current = original;
  if (!products.length) {
    els.scanSummary.textContent = "这轮没有找到合适的锐角四面体，可以再点一次。";
    return;
  }

  products.sort((a, b) => a - b);
  els.scanSummary.textContent = `找到 ${products.length} 个锐角四面体。最小 Πcosθ ≈ ${fmt(best, 8)}，1/729 ≈ ${fmt(1 / 729, 8)}。`;
  els.scanBars.innerHTML = "";
  const sample = products.filter((_, i) => i % Math.max(1, Math.floor(products.length / 20)) === 0).slice(0, 20);
  const max = Math.max(...sample);
  sample.forEach((value) => {
    const bar = document.createElement("div");
    bar.className = `bar ${value <= 1 / 729 + 1e-5 ? "low" : ""}`;
    bar.style.height = `${Math.max(4, 110 * value / max)}px`;
    bar.title = fmt(value, 8);
    els.scanBars.appendChild(bar);
  });

  if (bestPoints) {
    current = bestPoints.map((p) => p.clone());
    els.shapeName.textContent = "随机锐角样本";
  }
  update();
}

els.regularBtn.addEventListener("click", () => setPreset("regular"));
els.tiltBtn.addEventListener("click", () => setPreset("tilt"));
els.flatBtn.addEventListener("click", () => setPreset("flat"));
els.scanBtn.addEventListener("click", scan);
els.inputs.forEach((input) => input.addEventListener("input", update));

initScene();
update();
