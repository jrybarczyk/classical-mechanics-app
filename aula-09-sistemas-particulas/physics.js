/* Aula 9 — dinâmica de sistemas de partículas. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  const reducedMass = (m1, m2) => (m1 * m2) / (m1 + m2);

  /** Centro de massa de uma lista [{m, x, y}]. */
  const centerOfMass = (corpos) => {
    const M = corpos.reduce((s, c) => s + c.m, 0);
    return {
      M,
      x: corpos.reduce((s, c) => s + c.m * c.x, 0) / M,
      y: corpos.reduce((s, c) => s + c.m * c.y, 0) / M
    };
  };

  /**
   * Colisão unidimensional com coeficiente de restituição e.
   * e = 1 é elástica; e = 0 deixa os corpos unidos. As duas equações são a
   * conservação do momento e a definição e = −(v2f − v1f)/(v2i − v1i).
   */
  const restitution1D = (m1, m2, v1, v2, e) => {
    const M = m1 + m2;
    const vcm = (m1 * v1 + m2 * v2) / M;
    /* No referencial do CM cada corpo simplesmente reflete a sua velocidade,
       reduzida pelo fator e. Voltar ao laboratório é somar vcm. */
    const u1 = v1 - vcm, u2 = v2 - vcm;
    const V1 = vcm - e * u1;
    const V2 = vcm - e * u2;
    const Ki = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
    const Kf = 0.5 * m1 * V1 * V1 + 0.5 * m2 * V2 * V2;
    return { v1f: V1, v2f: V2, vcm, Ki, Kf, perda: Ki - Kf };
  };

  /** Energia dissipada máxima: toda a energia interna, quando e = 0. */
  const maxLoss = (m1, m2, v1, v2) => 0.5 * reducedMass(m1, m2) * (v1 - v2) ** 2;

  /**
   * Ângulo de espalhamento no laboratório a partir do ângulo no CM.
   * tanθ_lab = senθ_cm / (cosθ_cm + m₁/m₂), válido para alvo inicialmente parado.
   */
  const labAngle = (thetaCM, ratio) =>
    Math.atan2(Math.sin(thetaCM), Math.cos(thetaCM) + ratio);

  /**
   * Se m₁ ≥ m₂ existe ângulo máximo de espalhamento no laboratório: o projétil
   * não consegue ser desviado além de arcsen(m₂/m₁) (igual a 90° em m₁ = m₂,
   * onde θ_lab = θ_cm/2). Só para m₁ < m₂ todo o intervalo até 180° é acessível.
   */
  const maxLabAngle = (ratio) => (ratio >= 1 ? Math.asin(1 / ratio) : Math.PI);

  /* --- moderação de nêutrons: a colisão elástica frontal levada a sério --- */
  /**
   * Fração da energia cinética transferida em uma colisão elástica frontal.
   * f = 4m₁m₂/(m₁+m₂)², máxima e igual a 1 quando as massas são iguais —
   * é por isso que hidrogênio modera nêutrons e chumbo não.
   */
  const energyTransferFraction = (m1, m2) => (4 * m1 * m2) / (m1 + m2) ** 2;

  /**
   * Decremento logarítmico médio de energia por colisão (letargia).
   * ξ = 1 + ((A−1)²/2A)·ln((A−1)/(A+1)), com o limite ξ = 1 em A = 1.
   */
  const lethargy = (A) => {
    if (Math.abs(A - 1) < 1e-9) return 1;
    return 1 + (((A - 1) ** 2) / (2 * A)) * Math.log((A - 1) / (A + 1));
  };

  /** Número médio de colisões para levar um nêutron de E₀ até E_térmica. */
  const collisionsToThermal = (E0, Eth, A) => Math.log(E0 / Eth) / lethargy(A);

  /**
   * Energia restante depois de n colisões frontais. É o limite inferior da energia
   * (a maior perda possível por colisão): o melhor caso para a moderação, não a
   * média, que é governada por ξ (espalhamento isotrópico no CM).
   */
  const energyAfter = (E0, m1, m2, n) => E0 * (1 - energyTransferFraction(m1, m2)) ** n;

  /**
   * Número de colisões frontais para ir de E₀ a E_th: ln(E₀/E_th)/(−ln(1−f)).
   * É o mínimo possível (0 em A = 1, onde uma colisão zera a energia; Infinity se f = 0).
   */
  const frontalCollisionsToThermal = (E0, Eth, m1, m2) =>
    Math.log(E0 / Eth) / -Math.log(1 - energyTransferFraction(m1, m2));

  /** Trajetória do CM sob força externa uniforme: uma parábola, sempre. */
  const cmTrajectory = (t, x0, y0, vx, vy, g = G) => [x0 + vx * t, y0 + vy * t - 0.5 * g * t * t];

  return { G, reducedMass, centerOfMass, restitution1D, maxLoss, labAngle, maxLabAngle, cmTrajectory, energyTransferFraction, lethargy, collisionsToThermal, energyAfter, frontalCollisionsToThermal };
});
