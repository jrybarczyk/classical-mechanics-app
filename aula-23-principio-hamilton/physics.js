/* Aula 23 — princípio de Hamilton e coordenadas generalizadas. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- contagem de graus de liberdade --- */
  const degreesOfFreedom = (N, k) => 3 * N - k;
  /** Corpos rígidos livres têm 6 graus cada; cada junta remove 6 − permitidos. */
  const chainDOF = (juntas) => juntas.reduce((s, j) => s + j, 0);
  const chainByConstraints = (nCorpos, juntas) =>
    6 * nCorpos - juntas.reduce((s, j) => s + (6 - j), 0);
  /**
   * Grübler–Kutzbach plano: cada corpo móvel tem 3 graus e cada junta com f
   * graus remove 3 − f. Numa cadeia aberta (juntas = corpos) coincide com a soma
   * das permissões; num laço fechado (juntas > corpos) a soma superestima n.
   */
  const planarGrubler = (nCorpos, juntas) =>
    3 * nCorpos - juntas.reduce((s, j) => s + (3 - j), 0);

  /* --- pêndulo com suporte deslizante --- */
  /** Posições: bloco em (X,0), massa em (X + ℓsenθ, −ℓcosθ). */
  const bobPosition = (X, theta, l) => [X + l * Math.sin(theta), -l * Math.cos(theta)];
  /** |ṙ_m|² = Ẋ² + ℓ²θ̇² + 2ℓẊθ̇cosθ — o termo cruzado é a assinatura do acoplamento. */
  const bobSpeed2 = (Xd, thd, th, l) => Xd * Xd + l * l * thd * thd + 2 * l * Xd * thd * Math.cos(th);
  const kinetic = (M, m, Xd, thd, th, l) => 0.5 * M * Xd * Xd + 0.5 * m * bobSpeed2(Xd, thd, th, l);
  const potential = (m, th, l, g = G) => -m * g * l * Math.cos(th);
  const lagrangian = (M, m, X, Xd, th, thd, l, g = G) => kinetic(M, m, Xd, thd, th, l) - potential(m, th, l, g);
  /** X é cíclica: p_X = (M+m)Ẋ + mℓθ̇cosθ conserva-se. */
  const momentumX = (M, m, Xd, thd, th, l) => (M + m) * Xd + m * l * thd * Math.cos(th);

  /* --- ação do oscilador harmônico e sua estacionaridade --- */
  const truePath = (t, A, w) => A * Math.cos(w * t);
  const variation = (t, T, nos) => Math.sin((nos * Math.PI * t) / T);
  /** Ação S = ∫(½mq̇² − ½mω²q²)dt de 0 a t_f (parâmetro T), por Simpson. */
  const action = (q, T, m, w, n = 4000) => {
    const h = 1e-6;
    const L = (t) => {
      const qd = (q(t + h) - q(t - h)) / (2 * h);
      return 0.5 * m * qd * qd - 0.5 * m * w * w * q(t) * q(t);
    };
    const ht = T / n;
    let s = L(1e-9) + L(T - 1e-9);
    for (let i = 1; i < n; i += 1) s += L(i * ht) * (i % 2 ? 4 : 2);
    return (ht / 3) * s;
  };
  const variedPath = (A, w, eps, T, nos) => (t) => truePath(t, A, w) + eps * variation(t, T, nos);

  /**
   * Diferença exata de ação para a variação senoidal:
   *   ΔS = (ε²/2)(t_f/2)m[(nπ/t_f)² − ω²]   (no código, t_f = T).
   * Positiva enquanto t_f < nπ/ω: esse é o limiar do modo n. A ação só é MÍNIMA
   * se TODOS os modos a aumentam, isto é, se t_f < π/ω (modo 1, meio período);
   * além do primeiro ponto conjugado ela vira ponto de sela, e o nome
   * "mínima ação" falha.
   */
  const actionDifference = (eps, T, m, w, nos) =>
    ((eps * eps) / 2) * (T / 2) * m * ((nos * Math.PI / T) ** 2 - w * w);
  const conjugateTime = (w, nos = 1) => (nos * Math.PI) / w;
  /** Com nos = 1 (padrão) decide mínimo × sela; com nos > 1 diz só se ΔS > 0 naquele modo. */
  const isMinimum = (T, w, nos = 1) => T < conjugateTime(w, nos);

  return { G, degreesOfFreedom, chainDOF, chainByConstraints, planarGrubler, bobPosition, bobSpeed2, kinetic, potential, lagrangian, momentumX, truePath, variation, action, variedPath, actionDifference, conjugateTime, isMinimum };
});
