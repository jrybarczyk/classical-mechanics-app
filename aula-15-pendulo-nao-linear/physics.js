/* Aula 14 (complemento) — oscilações não lineares. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /**
   * Integral elíptica completa de primeira espécie K(k), pela média
   * aritmético-geométrica. Converge quadraticamente e é estável até k → 1,
   * onde a divergência logarítmica aparece naturalmente.
   */
  const ellipticK = (k) => {
    if (Math.abs(k) >= 1) return Infinity;
    let a = 1, b = Math.sqrt(1 - k * k);
    for (let i = 0; i < 80; i += 1) {
      const na = (a + b) / 2;
      const nb = Math.sqrt(a * b);
      if (Math.abs(na - nb) < 1e-17) { a = na; break; }
      a = na; b = nb;
    }
    return Math.PI / (2 * a);
  };

  const omega0 = (l, g = G) => Math.sqrt(g / l);
  const periodSmall = (l, g = G) => (2 * Math.PI) / omega0(l, g);

  /** Período exato: τ = 4√(ℓ/g)·K(sen(θ₀/2)). */
  const periodExact = (theta0, l, g = G) => 4 * Math.sqrt(l / g) * ellipticK(Math.sin(theta0 / 2));

  /** Primeira correção da expansão: τ ≈ τ₀(1 + θ₀²/16). */
  const periodFirstOrder = (theta0, l, g = G) => periodSmall(l, g) * (1 + (theta0 * theta0) / 16);

  const energy = (theta, thetaDot, m, l, g = G) =>
    0.5 * m * l * l * thetaDot * thetaDot + m * g * l * (1 - Math.cos(theta));
  /** Energia da separatriz: exatamente o necessário para alcançar o topo. */
  const separatrixEnergy = (m, l, g = G) => 2 * m * g * l;

  const isRotation = (E, m, l, g = G) => E > separatrixEnergy(m, l, g);

  /**
   * Período de uma volta completa no regime de rotação (E > 2mgℓ):
   *   τ_rot = ∫ dθ/θ̇ sobre −π…π = (2k/ω₀)·K(k),   k² = E_sep/E = 2mgℓ/E.
   * Finito acima da separatriz; diverge (∞) exatamente nela.
   */
  const rotationPeriod = (E, m, l, g = G) => {
    const Es = separatrixEnergy(m, l, g);
    if (E < Es) return NaN;
    const k = Math.sqrt(Es / E);
    return (2 * k * ellipticK(k)) / omega0(l, g);
  };

  /** θ̇ na curva de nível de energia E, ou NaN na região proibida. */
  const thetaDotAt = (theta, E, m, l, g = G) => {
    const k = E - m * g * l * (1 - Math.cos(theta));
    return k < 0 ? NaN : Math.sqrt((2 * k) / (m * l * l));
  };

  /** Ramo superior da separatriz: θ̇ = 2ω₀cos(θ/2). */
  const separatrixBranch = (theta, l, g = G) => 2 * omega0(l, g) * Math.cos(theta / 2);

  /** Erro relativo da aproximação sen θ ≈ θ. */
  const linearisationError = (theta) => (theta === 0 ? 0 : Math.abs(Math.sin(theta) - theta) / Math.abs(Math.sin(theta)));

  return { G, ellipticK, omega0, periodSmall, periodExact, periodFirstOrder, energy, separatrixEnergy, isRotation, rotationPeriod, thetaDotAt, separatrixBranch, linearisationError };
});
