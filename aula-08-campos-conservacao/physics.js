/* Aula 8 — campos de força, potenciais e conservação. Funções puras.
   O campo de teste é F = (2xy + λy, x² − λx). Em λ = 0 é o campo conservativo do
   exemplo resolvido da aula; λ ≠ 0 acrescenta uma parte rotacional pura, e o
   rotacional resultante vale −2λ em todo ponto — um alvo analítico simples. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const field = (x, y, lambda = 0) => [2 * x * y + lambda * y, x * x - lambda * x];

  /** ∂Fy/∂x − ∂Fx/∂y = (2x − λ) − (2x + λ) = −2λ, constante. */
  const curlZ = (x, y, lambda = 0) => -2 * lambda;

  /** Potencial da parte conservativa: F = −∇U com U = −x²y. */
  const potential = (x, y) => -x * x * y;

  /** Caminho de A a B com uma protuberância controlada por `bulge`. */
  const path = (s, A, B, bulge) => {
    const x = A[0] + (B[0] - A[0]) * s;
    const y = A[1] + (B[1] - A[1]) * s + bulge * Math.sin(Math.PI * s);
    return [x, y];
  };

  /** Trabalho ∫F·dr ao longo do caminho, por Simpson em s. */
  const work = (A, B, bulge, lambda = 0, n = 400) => {
    const integrand = (s) => {
      const h = 1e-6;
      const [x, y] = path(s, A, B, bulge);
      const [x1, y1] = path(s + h, A, B, bulge);
      const [x0, y0] = path(s - h, A, B, bulge);
      const dx = (x1 - x0) / (2 * h);
      const dy = (y1 - y0) / (2 * h);
      const [Fx, Fy] = field(x, y, lambda);
      return Fx * dx + Fy * dy;
    };
    const h = 1 / n;
    let sum = integrand(0) + integrand(1);
    for (let i = 1; i < n; i += 1) sum += integrand(i * h) * (i % 2 ? 4 : 2);
    return (h / 3) * sum;
  };

  /** Circulação no circuito fechado formado por dois caminhos entre A e B. */
  const circulation = (A, B, bulge, lambda = 0) => work(A, B, bulge, lambda) - work(A, B, 0, lambda);

  /* --- partícula carregada em campos uniformes E ŷ e B ẑ --- */
  const cyclotron = (q, B, m) => (Math.abs(q) * B) / m;
  const gyroradius = (m, v, q, B) => (m * v) / (Math.abs(q) * B);
  const driftSpeed = (E, B) => E / B;

  /** Solução exata: rotação em ω sobreposta à deriva E/B ao longo de x. */
  const lorentzPath = (t, v0x, v0y, E, B, q = 1, m = 1) => {
    const w = (q * B) / m;
    const d = E / B;
    const u0 = v0x - d;
    if (Math.abs(w) < 1e-12) return [v0x * t, v0y * t];
    return [
      d * t + (u0 * Math.sin(w * t) - v0y * (Math.cos(w * t) - 1)) / w,
      (u0 * (Math.cos(w * t) - 1) + v0y * Math.sin(w * t)) / w
    ];
  };

  /** O campo magnético não realiza trabalho: (v×B)·v = 0. */
  const magneticPower = (vx, vy, B) => (vy * B) * vx + (-vx * B) * vy;

  return { field, curlZ, potential, path, work, circulation, cyclotron, gyroradius, driftSpeed, lorentzPath, magneticPower };
});
