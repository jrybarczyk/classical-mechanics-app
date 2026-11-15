/* Aula 16 — campo e potencial gravitacionais. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 6.674e-11;
  const M_TERRA = 5.972e24;
  const R_TERRA = 6.371e6;

  /* --- casca esférica homogênea --- */
  /** Teorema da casca: campo nulo dentro, e como massa puntiforme fora. */
  const shellField = (r, R, M) => (r < R ? 0 : -(G * M) / (r * r));
  const shellPotential = (r, R, M) => -(G * M) / Math.max(r, R);

  /* --- casca espessa de raios a e b --- */
  const shellEnclosed = (r, a, b, M) => {
    if (r <= a) return 0;
    if (r >= b) return M;
    return (M * (r ** 3 - a ** 3)) / (b ** 3 - a ** 3);
  };
  const thickShellField = (r, a, b, M) => (r === 0 ? 0 : -(G * shellEnclosed(r, a, b, M)) / (r * r));

  /* --- esfera maciça uniforme --- */
  const sphereField = (r, R, M) => (r <= R ? -(G * M * r) / R ** 3 : -(G * M) / (r * r));
  const spherePotential = (r, R, M) =>
    r <= R ? -((G * M) / (2 * R ** 3)) * (3 * R * R - r * r) : -(G * M) / r;

  /** |g| é máximo exatamente na superfície, e não no centro. */
  const surfaceField = (R, M) => (G * M) / (R * R);

  /** Energia de ligação de uma esfera uniforme: U = −3GM²/5R. */
  const bindingEnergy = (M, R) => -(3 * G * M * M) / (5 * R);

  /** Túnel pelo centro: harmônico simples com ω² = GM/R³. */
  const tunnelPeriod = (R, M) => 2 * Math.PI * Math.sqrt(R ** 3 / (G * M));
  const escapeVelocity = (R, M) => Math.sqrt((2 * G * M) / R);
  /** Frequência do movimento no túnel: ω² = GM/R³, independente do ponto de partida. */
  const tunnelOmega = (R, M) => Math.sqrt((G * M) / R ** 3);
  /** Velocidade máxima, atingida no centro: v = ωR. */
  const tunnelMaxSpeed = (R, M) => tunnelOmega(R, M) * R;
  /**
   * Período de uma órbita circular rasante, deduzido de GMm/R² = mv²/R.
   * Escrito à parte de propósito: que ele coincida com tunnelPeriod é um
   * resultado a ser verificado, não uma definição a ser reaproveitada.
   */
  const lowOrbitPeriod = (R, M) => (2 * Math.PI * R) / Math.sqrt((G * M) / R);

  /* --- a mesma geometria fora da gravitação --- */
  /** Taxa de dose de fonte puntiforme sem atenuação: cai com 1/r². */
  const doseRate = (D1, r1, r2) => D1 * (r1 / r2) ** 2;
  const distanceForRate = (D1, r1, D2) => r1 * Math.sqrt(D1 / D2);

  return { G, M_TERRA, R_TERRA, shellField, shellPotential, shellEnclosed, thickShellField, sphereField, spherePotential, surfaceField, bindingEnergy, tunnelPeriod, escapeVelocity, tunnelOmega, tunnelMaxSpeed, lowOrbitPeriod, doseRate, distanceForRate };
});
