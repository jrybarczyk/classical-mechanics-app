/* Aula 13 — oscilações forçadas e ressonância. Funções puras.
 *
 * Esta aula distingue duas coisas que costumam ser chamadas pelo mesmo nome:
 *
 *   ressonância de AMPLITUDE   — máximo de D(ω), em ω_R = √(ω₀² − 2β²);
 *                                 só existe se β < ω₀/√2.
 *   ressonância de REATÂNCIA   — zero de X(ω) = ωI − E_l/ω, em ω = √(E_l/I);
 *                                 existe sempre, e não depende da resistência.
 *
 * É a segunda que a técnica de oscilações forçadas usa em prova de função
 * pulmonar. Confundi-las leva a concluir que um sistema fortemente amortecido
 * "não tem ressonância", o que é falso no sentido que interessa à clínica.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const amplitude = (w, f0, w0, g) => f0 / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * g * g * w * w);
  const phase = (w, w0, g) => Math.atan2(2 * g * w, w0 * w0 - w * w);

  /** Frequência de amplitude máxima. Devolve NaN quando o pico não existe. */
  const omegaAmplitude = (w0, g) => {
    const s = w0 * w0 - 2 * g * g;
    return s > 0 ? Math.sqrt(s) : NaN;
  };
  const hasAmplitudePeak = (w0, g) => w0 * w0 - 2 * g * g > 0;

  /** Potência média absorvida no regime estacionário. */
  const meanPower = (w, F0, m, w0, g) =>
    ((F0 * F0) / m) * ((g * w * w) / ((w0 * w0 - w * w) ** 2 + 4 * g * g * w * w));

  /** A potência é sempre máxima em ω₀, mesmo quando a amplitude não é. */
  const omegaPower = (w0) => w0;

  /** Pontos de meia potência: |ω₀² − ω²| = 2βω. Largura → 2β para Q ≫ 1. */
  const halfPowerPoints = (w0, g) => {
    const lo = Math.sqrt(w0 * w0 + g * g) - g;
    const hi = Math.sqrt(w0 * w0 + g * g) + g;
    return [lo, hi];
  };
  const bandwidth = (w0, g) => { const [lo, hi] = halfPowerPoints(w0, g); return hi - lo; };
  const quality = (w0, g) => w0 / (2 * g);

  /* --- impedância do sistema respiratório: Z(ω) = R + i(ωI − E_l/ω) --- */
  const elastance = (C) => 1 / C;
  const resistance = (R) => R;
  const reactance = (w, I, C) => w * I - elastance(C) / w;
  const impedanceMagnitude = (w, R, I, C) => Math.hypot(R, reactance(w, I, C));
  /** Zero da reatância: independe de R. É a "frequência de ressonância" clínica. */
  const resonanceReactance = (I, C) => Math.sqrt(elastance(C) / I);
  const dampingFromR = (R, I) => R / (2 * I);
  const hertz = (w) => w / (2 * Math.PI);

  return { amplitude, phase, omegaAmplitude, hasAmplitudePeak, meanPower, omegaPower, halfPowerPoints, bandwidth, quality, elastance, resistance, reactance, impedanceMagnitude, resonanceReactance, dampingFromR, hertz };
});
