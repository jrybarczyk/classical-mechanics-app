/* Aula 29 — equações de Hamilton e espaço de fase. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* --- fluxos exatos, para não confundir erro numérico com física --- */
  /** Oscilador: rotação rígida no plano reduzido. */
  const oscillatorFlow = (q0, p0, t, m, w) => [
    q0 * Math.cos(w * t) + (p0 / (m * w)) * Math.sin(w * t),
    p0 * Math.cos(w * t) - m * w * q0 * Math.sin(w * t)
  ];
  /** Partícula livre: cisalhamento puro, p constante. */
  const freeFlow = (q0, p0, t, m) => [q0 + (p0 * t) / m, p0];
  /** Oscilador amortecido: NÃO é hamiltoniano, e a área contrai como e^{−bt/m}. */
  const dampedFlow = (q0, p0, t, m, w, b) => {
    const g = b / (2 * m);
    const wd = Math.sqrt(Math.max(1e-12, w * w - g * g));
    const e = Math.exp(-g * t);
    const q = e * (q0 * Math.cos(wd * t) + ((p0 / m + g * q0) / wd) * Math.sin(wd * t));
    const h = 1e-6;
    const qh = Math.exp(-g * (t + h)) * (q0 * Math.cos(wd * (t + h)) + ((p0 / m + g * q0) / wd) * Math.sin(wd * (t + h)));
    return [q, m * (qh - q) / h];
  };

  /** Campo hamiltoniano w = (∂H/∂p, −∂H/∂q) para H = p²/2m + U(q). */
  const flowField = (q, p, m, dV) => [p / m, -dV(q)];
  /** w é perpendicular a ∇H: o produto escalar se anula identicamente. */
  const flowDotGradH = (q, p, m, dV) => {
    const w = flowField(q, p, m, dV);
    const grad = [dV(q), p / m];
    return w[0] * grad[0] + w[1] * grad[1];
  };
  /** Divergência do campo: nula pelo teorema de Schwarz. */
  const divergence = (q, p, m, dV, h = 1e-5) =>
    (flowField(q + h, p, m, dV)[0] - flowField(q - h, p, m, dV)[0]) / (2 * h) +
    (flowField(q, p + h, m, dV)[1] - flowField(q, p - h, m, dV)[1]) / (2 * h);

  /** Área de um polígono pela fórmula do cadarço. */
  const polygonArea = (pts) => {
    let s = 0;
    for (let i = 0; i < pts.length; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      s += x1 * y2 - x2 * y1;
    }
    return Math.abs(s) / 2;
  };
  /** Célula retangular no espaço de fase, amostrada ao longo do contorno. */
  const cell = (q0, p0, dq, dp, n = 20) => {
    const pts = [];
    for (let i = 0; i < n; i += 1) pts.push([q0 + (dq * i) / n, p0]);
    for (let i = 0; i < n; i += 1) pts.push([q0 + dq, p0 + (dp * i) / n]);
    for (let i = 0; i < n; i += 1) pts.push([q0 + dq - (dq * i) / n, p0 + dp]);
    for (let i = 0; i < n; i += 1) pts.push([q0, p0 + dp - (dp * i) / n]);
    return pts;
  };
  const advect = (pts, fluxo) => pts.map(([q, p]) => fluxo(q, p));

  /** Período medido na própria trajetória: intervalo entre dois cruzamentos
      ascendentes sucessivos de q por zero (interpolados), sem usar 2π/ω. */
  const measuredPeriod = (fluxo, tmax, dt = 1e-3) => {
    const cruz = [];
    let qa = fluxo(0)[0];
    for (let t = dt; t <= tmax && cruz.length < 2; t += dt) {
      const qb = fluxo(t)[0];
      if (qa < 0 && qb >= 0) cruz.push(t - dt + (dt * -qa) / (qb - qa));
      qa = qb;
    }
    return cruz.length === 2 ? cruz[1] - cruz[0] : NaN;
  };

  /* --- emitância de feixe --- */
  /** Elipse de fase do feixe, com larguras TOTAIS σ e θ: semieixos σ/2 e θ/2. */
  const beamEllipse = (largura, divergencia, n = 200) =>
    Array.from({ length: n }, (_, i) => {
      const a = (2 * Math.PI * i) / n;
      return [(largura / 2) * Math.cos(a), (divergencia / 2) * Math.sin(a)];
    });
  /** ε = área/π = π(σ/2)(θ/2)/π = σθ/4. Liouville impede que a emitância normalizada
      seja reduzida por uma dinâmica hamiltoniana (campos elétricos e magnéticos). */
  const emittance = (largura, divergencia) => (largura * divergencia) / 4;
  /** Focalização ideal: apertar o tamanho aumenta a divergência na mesma razão. */
  const focusedDivergence = (largura0, divergencia0, largura1) => (largura0 * divergencia0) / largura1;

  return { oscillatorFlow, freeFlow, dampedFlow, flowField, flowDotGradH, divergence, polygonArea, cell, advect, measuredPeriod, beamEllipse, emittance, focusedDivergence };
});
