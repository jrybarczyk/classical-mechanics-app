/* Aula 14 — osciladores acoplados e modos normais. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* Duas massas m, presas às paredes por molas k e ligadas por mola κ.
     No modo simétrico a mola central não se deforma; no antissimétrico ela
     acrescenta 2κ à restauração. */
  const omegaSym = (k, m) => Math.sqrt(k / m);
  const omegaAnti = (k, kappa, m) => Math.sqrt((k + 2 * kappa) / m);

  const meanOmega = (k, kappa, m) => (omegaSym(k, m) + omegaAnti(k, kappa, m)) / 2;
  const deltaOmega = (k, kappa, m) => omegaAnti(k, kappa, m) - omegaSym(k, m);

  /** Aproximação de acoplamento fraco: Δω ≈ κω₊/k para κ ≪ k. */
  const deltaOmegaWeak = (k, kappa, m) => (kappa * omegaSym(k, m)) / k;

  /**
   * Batimento com apenas a massa 1 deslocada e velocidades nulas.
   * x₁ = A cos(Δωt/2)cos(ω̄t)   x₂ = A sen(Δωt/2)sen(ω̄t)
   * As envoltórias estão em quadratura: a energia migra integralmente.
   */
  const beat = (t, A, k, kappa, m) => {
    const wm = meanOmega(k, kappa, m);
    const dw = deltaOmega(k, kappa, m);
    return [
      A * Math.cos((dw * t) / 2) * Math.cos(wm * t),
      A * Math.sin((dw * t) / 2) * Math.sin(wm * t)
    ];
  };

  /** Envoltórias lentas de cada massa: é sobre elas que a energia migra. */
  const envelopes = (t, A, k, kappa, m) => {
    const dw = deltaOmega(k, kappa, m);
    return [A * Math.abs(Math.cos((dw * t) / 2)), A * Math.abs(Math.sin((dw * t) / 2))];
  };

  /**
   * Tempos característicos do batimento. A transferência completa ocorre em
   * π/Δω, e o retorno à massa 1 em 2π/Δω — a envoltória cos(Δωt/2) tem período
   * 4π/Δω, mas o módulo repete a cada 2π/Δω.
   */
  const transferTime = (k, kappa, m) => Math.PI / deltaOmega(k, kappa, m);
  const returnTime = (k, kappa, m) => (2 * Math.PI) / deltaOmega(k, kappa, m);

  /** Coordenadas normais: q± = (x₁ ± x₂)/√2, que desacoplam as equações. */
  const normalCoordinates = (x1, x2) => [(x1 + x2) / Math.SQRT2, (x1 - x2) / Math.SQRT2];

  /** Energia de cada modo normal — constante durante todo o batimento. */
  const modeEnergies = (t, A, k, kappa, m) => {
    const wp = omegaSym(k, m), wn = omegaAnti(k, kappa, m);
    const qp = (A / Math.SQRT2) * Math.cos(wp * t);
    const qn = (A / Math.SQRT2) * Math.cos(wn * t);
    const dqp = -(A / Math.SQRT2) * wp * Math.sin(wp * t);
    const dqn = -(A / Math.SQRT2) * wn * Math.sin(wn * t);
    return [
      0.5 * m * dqp * dqp + 0.5 * m * wp * wp * qp * qp,
      0.5 * m * dqn * dqn + 0.5 * m * wn * wn * qn * qn
    ];
  };

  /** Energia instantânea associada a cada massa (cinética + molas próprias). */
  const massEnergies = (t, A, k, kappa, m, h = 1e-6) => {
    const [x1, x2] = beat(t, A, k, kappa, m);
    const [a1, a2] = beat(t + h, A, k, kappa, m);
    const [b1, b2] = beat(t - h, A, k, kappa, m);
    const v1 = (a1 - b1) / (2 * h), v2 = (a2 - b2) / (2 * h);
    return [0.5 * m * v1 * v1 + 0.5 * k * x1 * x1, 0.5 * m * v2 * v2 + 0.5 * k * x2 * x2];
  };

  return { omegaSym, omegaAnti, meanOmega, deltaOmega, deltaOmegaWeak, beat, envelopes, transferTime, returnTime, normalCoordinates, modeEnergies, massEnergies };
});
