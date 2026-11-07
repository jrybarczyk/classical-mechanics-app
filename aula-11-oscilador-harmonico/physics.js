/* Aula 11 — oscilador harmônico simples. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const omega0 = (k, m) => Math.sqrt(k / m);
  const period = (w) => (2 * Math.PI) / w;

  /** x = A cos(ωt + φ), com A e φ fixados por x(0) = x₀ e ẋ(0) = v₀. */
  const amplitude = (x0, v0, w) => Math.hypot(x0, v0 / w);
  const phase = (x0, v0, w) => Math.atan2(-v0 / w, x0);
  const position = (t, x0, v0, w) => amplitude(x0, v0, w) * Math.cos(w * t + phase(x0, v0, w));
  const velocity = (t, x0, v0, w) => -amplitude(x0, v0, w) * w * Math.sin(w * t + phase(x0, v0, w));

  const energy = (x0, v0, w, m) => 0.5 * m * (v0 * v0 + w * w * x0 * x0);
  const kinetic = (t, x0, v0, w, m) => 0.5 * m * velocity(t, x0, v0, w) ** 2;
  const potential = (t, x0, v0, w, m) => 0.5 * m * w * w * position(t, x0, v0, w) ** 2;

  /* --- composição de dois harmônicos perpendiculares: figuras de Lissajous --- */
  /** x = A_x cos(ω_x t) e y = A_y cos(ω_y t + δ). */
  const lissajous = (t, ax, ay, wx, wy, delta) => [ax * Math.cos(wx * t), ay * Math.cos(wy * t + delta)];

  /** Máximo divisor comum de inteiros, usado para reduzir a razão de frequências. */
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  /**
   * Melhor razão p/q com q ≤ qMax para aproximar r, com o erro cometido.
   * A curva só fecha quando a razão é exatamente racional; com q grande ela
   * chega perto de fechar e demora muito, que é o que se vê na tela.
   */
  const nearestRatio = (r, qMax = 12) => {
    let melhor = [1, 1, Infinity];
    for (let q = 1; q <= qMax; q += 1) {
      const p = Math.round(r * q);
      if (p < 1) continue;
      const erro = Math.abs(r - p / q);
      if (erro < melhor[2] - 1e-15) {
        const d = gcd(p, q);
        melhor = [p / d, q / d, erro];
      }
    }
    return melhor;
  };

  /** Período da figura fechada: q voltas em x para p voltas em y. */
  const lissajousPeriod = (wx, p, q) => (2 * Math.PI * q) / wx;

  /* --- analogia respiratória: I V̈ + E_l V = 0 --- */
  /** Elastância é o inverso da complacência. */
  const elastance = (compliance) => 1 / compliance;
  /** ω₀ = √(E_l/I); com valores de adulto cai em poucos hertz. */
  const respiratoryOmega = (compliance, inertance) => Math.sqrt(elastance(compliance) / inertance);
  const hertz = (w) => w / (2 * Math.PI);

  return { omega0, period, lissajous, gcd, nearestRatio, lissajousPeriod, amplitude, phase, position, velocity, energy, kinetic, potential, elastance, respiratoryOmega, hertz };
});
