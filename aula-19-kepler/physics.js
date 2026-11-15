/* Aula 19 — o problema de Kepler. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 6.674e-11;
  const M_TERRA = 5.972e24;
  const R_TERRA = 6.371e6;
  const GM_TERRA = 3.986e14;
  const UA = 1.495978707e11;
  const ANO = 3.15576e7;

  /** Cônica com foco na origem: r(θ) = α/(1 + ε cosθ). */
  const conic = (theta, p, e) => p / (1 + e * Math.cos(theta));
  /** Ângulo da assíntota, para e > 1. */
  const asymptoteAngle = (e) => (e > 1 ? Math.acos(-1 / e) : Math.PI);

  const semilatus = (L, mu, k) => (L * L) / (mu * k);
  /** ε = √(1 + 2Eℓ²/μk²) — fixada por E e ℓ, não é dado independente. */
  const eccentricity = (E, L, mu, k) => Math.sqrt(Math.max(0, 1 + (2 * E * L * L) / (mu * k * k)));
  /** a = −k/2E: a energia depende só do semieixo maior. */
  const semiMajor = (E, k) => -k / (2 * E);
  const energyFromA = (a, k) => -k / (2 * a);

  const perihelion = (a, e) => a * (1 - e);
  const aphelion = (a, e) => a * (1 + e);

  /** τ² = 4π²μa³/k. Para Sol–planeta com μ ≈ m, vira T² = 4π²a³/GM. */
  const period = (a, mu, k) => 2 * Math.PI * Math.sqrt((mu * a ** 3) / k);
  const periodGM = (a, GM) => 2 * Math.PI * Math.sqrt(a ** 3 / GM);

  /** Equação vis-viva: v² = GM(2/r − 1/a). */
  const visViva = (r, a, GM) => Math.sqrt(Math.max(0, GM * (2 / r - 1 / a)));
  const circularSpeed = (r, GM) => Math.sqrt(GM / r);
  const escapeSpeed = (r, GM) => Math.sqrt((2 * GM) / r);

  /** Terceira lei em unidades solares: a em UA e T em anos dão a³ = T². */
  const semiMajorFromYears = (T) => Math.cbrt(T * T);

  return { G, M_TERRA, R_TERRA, GM_TERRA, UA, ANO, conic, asymptoteAngle, semilatus, eccentricity, semiMajor, energyFromA, perihelion, aphelion, period, periodGM, visViva, circularSpeed, escapeSpeed, semiMajorFromYears };
});
