/* Aula 12 — oscilações amortecidas. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GAMMA_PROTON_MHZ_T = 42.577;   // frequência de Larmor por tesla

  const beta = (b, m) => b / (2 * m);
  const omega0 = (k, m) => Math.sqrt(k / m);
  const criticalDamping = (m, w0) => 2 * m * w0;

  const regime = (g, w0) => (g < w0 ? "sub" : g > w0 ? "super" : "critico");
  const omega1 = (w0, g) => Math.sqrt(Math.max(0, w0 * w0 - g * g));

  /**
   * Solução geral com x(0) = x₀ e ẋ(0) = v₀, unificando os três regimes.
   * Sub e supercrítico têm a mesma forma, trocando cos/sen por cosh/senh; o caso
   * crítico é o limite em que a raiz é dupla.
   */
  const position = (t, x0, v0, w0, g) => {
    const disc = g * g - w0 * w0;
    const env = Math.exp(-g * t);
    const c = v0 + g * x0;
    if (Math.abs(disc) < 1e-12) return env * (x0 + c * t);
    if (disc < 0) {
      const w1 = Math.sqrt(-disc);
      return env * (x0 * Math.cos(w1 * t) + (c / w1) * Math.sin(w1 * t));
    }
    const beta = Math.sqrt(disc);
    return env * (x0 * Math.cosh(beta * t) + (c / beta) * Math.sinh(beta * t));
  };

  const velocity = (t, x0, v0, w0, g, h = 1e-6) =>
    (position(t + h, x0, v0, w0, g) - position(t - h, x0, v0, w0, g)) / (2 * h);

  const energy = (t, x0, v0, w0, g, m = 1) => {
    const x = position(t, x0, v0, w0, g);
    const v = velocity(t, x0, v0, w0, g);
    return 0.5 * m * v * v + 0.5 * m * w0 * w0 * x * x;
  };

  /** Fator de qualidade, válido como "número de ciclos" só para amortecimento fraco. */
  const quality = (w0, g) => w0 / (2 * g);
  /** Queda de amplitude por ciclo: e^{−βT} ≈ e^{−π/Q}. */
  const decayPerCycle = (w0, g) => Math.exp(-Math.PI / quality(w0, g));
  /** Amplitude após N ciclos. */
  const amplitudeAfter = (N, w0, g) => Math.exp((-Math.PI * N) / quality(w0, g));

  /* --- analogias de Física Médica --- */
  /** Em ressonância magnética, T₂ faz o papel de 1/β. */
  const larmorMHz = (B0) => GAMMA_PROTON_MHZ_T * B0;
  const precessionsIn = (T2, B0) => larmorMHz(B0) * 1e6 * T2;
  /** Transdutor: pulso curto exige Q baixo. Duração ≈ Q/f. */
  const pulseDuration = (Q, fHz) => Q / fHz;
  /** Resolução axial = metade do comprimento espacial do pulso. */
  const axialResolution = (Q, fHz, c = 1540) => (c * pulseDuration(Q, fHz)) / 2;

  return { GAMMA_PROTON_MHZ_T, beta, omega0, criticalDamping, regime, omega1, position, velocity, energy, quality, decayPerCycle, amplitudeAfter, larmorMHz, precessionsIn, pulseDuration, axialResolution };
});
