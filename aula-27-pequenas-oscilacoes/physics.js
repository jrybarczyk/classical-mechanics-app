/* Aula 27 — pequenas oscilações na formulação lagrangiana. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- problema de autovalor generalizado (A − ω²m)a = 0, caso 2×2 --- */
  const solveGeneralised = (M, K) => {
    const a = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    const b = -(K[0][0] * M[1][1] + K[1][1] * M[0][0] - K[0][1] * M[1][0] - K[1][0] * M[0][1]);
    const c = K[0][0] * K[1][1] - K[0][1] * K[1][0];
    const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c));
    const lambdas = [(-b - disc) / (2 * a), (-b + disc) / (2 * a)];
    const vetores = lambdas.map((lam) => {
      /* (K − λM)a = 0: usa a primeira linha, e a segunda se a primeira degenerar. */
      let x = K[0][1] - lam * M[0][1];
      let y = -(K[0][0] - lam * M[0][0]);
      if (Math.hypot(x, y) < 1e-12) {
        x = K[1][1] - lam * M[1][1];
        y = -(K[1][0] - lam * M[1][0]);
      }
      const n = Math.hypot(x, y) || 1;
      return [x / n, y / n];
    });
    return { lambdas, omegas: lambdas.map((l) => Math.sqrt(Math.max(0, l))), vetores };
  };

  /** Produto na métrica de m: os modos são ortogonais nele, não no usual. */
  const massInner = (M, u, v) =>
    u[0] * (M[0][0] * v[0] + M[0][1] * v[1]) + u[1] * (M[1][0] * v[0] + M[1][1] * v[1]);
  const euclideanInner = (u, v) => u[0] * v[0] + u[1] * v[1];
  /** Acoplamento inercial |m₁₂|/√(m₁₁m₂₂): zero só se m for diagonal. O produto usual
   *  dos modos pode anular-se por coincidência mesmo com m cheia — não use isso como critério. */
  const massCoupling = (M) => Math.abs(M[0][1]) / Math.sqrt(M[0][0] * M[1][1]);

  /** Matrizes do pêndulo duplo, o exemplo em que M sai da diagonal. */
  const doubleMatrices = (m1, m2, l1, l2, g = G) => ({
    M: [[(m1 + m2) * l1 * l1, m2 * l1 * l2], [m2 * l1 * l2, m2 * l2 * l2]],
    K: [[(m1 + m2) * g * l1, 0], [0, m2 * g * l2]]
  });

  /* --- cadeia de N massas --- */
  /** ω(q) = 2√(κ/m)|sen(qa/2)|, limitada por ω_max = 2√(κ/m). */
  const dispersion = (q, a, kappa, m) => 2 * Math.sqrt(kappa / m) * Math.abs(Math.sin((q * a) / 2));
  const omegaMax = (kappa, m) => 2 * Math.sqrt(kappa / m);
  /** Velocidade no limite contínuo: c = a√(κ/m). */
  const soundSpeedChain = (a, kappa, m) => a * Math.sqrt(kappa / m);
  /** Velocidade de fase e de grupo, que só coincidem em qa ≪ 1. */
  const phaseVelocity = (q, a, kappa, m) => (q === 0 ? soundSpeedChain(a, kappa, m) : dispersion(q, a, kappa, m) / q);
  const groupVelocity = (q, a, kappa, m) => soundSpeedChain(a, kappa, m) * Math.cos((q * a) / 2);

  /* --- meio contínuo e ultrassom --- */
  /** c = √(B/ρ): raiz da razão entre rigidez e inércia. */
  const soundSpeed = (B, rho) => Math.sqrt(B / rho);
  /** Impedância acústica Z = ρc = √(Bρ). */
  const impedance = (B, rho) => Math.sqrt(B * rho);
  /** Profundidade reportada pelo aparelho, que assume c = 1540 m/s. */
  const reportedDepth = (real, cReal, cAssumido = 1540) => (real * cAssumido) / cReal;
  const depthError = (real, cReal, cAssumido = 1540) => reportedDepth(real, cReal, cAssumido) - real;
  /** Coeficiente de reflexão em incidência normal entre dois meios. */
  const reflectionCoefficient = (Z1, Z2) => ((Z2 - Z1) / (Z2 + Z1)) ** 2;

  return { G, solveGeneralised, massInner, euclideanInner, massCoupling, doubleMatrices, dispersion, omegaMax, soundSpeedChain, phaseVelocity, groupVelocity, soundSpeed, impedance, reportedDepth, depthError, reflectionCoefficient };
});
