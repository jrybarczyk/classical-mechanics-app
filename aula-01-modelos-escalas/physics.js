/* Aula 1 — modelos, escalas e análise dimensional. Somente funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const C_LIGHT = 2.99792458e8;
  const H_PLANCK = 6.62607015e-34;
  const HBAR = H_PLANCK / (2 * Math.PI);
  const M_ELECTRON = 9.1093837015e-31;
  const KEV = 1.602176634e-16;                 // 1 keV em joule
  const MC2_ELECTRON_KEV = M_ELECTRON * C_LIGHT * C_LIGHT / KEV;   // ≃ 511 keV

  /** Número de Reynolds: razão entre efeitos inerciais e viscosos. */
  const reynolds = (rho, v, L, eta) => (rho * v * L) / eta;

  /** Regime de arrasto sugerido pelo valor de Re (Aula 6). */
  const dragRegime = (Re) => (Re < 1 ? "linear" : Re < 1000 ? "transicao" : "quadratico");

  /** Tamanho característico no qual Re atinge um valor-alvo, com fluido e v fixos. */
  const reynoldsLength = (target, rho, v, eta) => target * eta / (rho * v);

  /**
   * Expoentes dimensionais de t = C·h^a·g^b.
   * [h] = L e [g] = L·T⁻², logo o produto tem dimensão L^(a+b)·T^(-2b).
   * Para que o resultado seja um tempo é preciso a+b = 0 e −2b = 1.
   */
  const fallDimensions = (a, b) => ({ L: a + b, T: -2 * b });

  /** Distância, em valor absoluto, entre os expoentes obtidos e o alvo (L⁰T¹). */
  const dimensionError = (a, b) => {
    const d = fallDimensions(a, b);
    return Math.abs(d.L) + Math.abs(d.T - 1);
  };

  /** Tempo de queda livre a partir do repouso: a dinâmica fixa C = √2. */
  const fallTime = (h, g) => Math.sqrt((2 * h) / g);

  /** Fator de Lorentz, usado só para delimitar o domínio newtoniano. */
  const lorentz = (v) => {
    const beta = v / C_LIGHT;
    return beta >= 1 ? Infinity : 1 / Math.sqrt(1 - beta * beta);
  };

  /**
   * Erro relativo de ½mv² diante de (γ−1)mc².
   * A forma ingênua |½β² − (γ−1)|/(γ−1) perde toda a precisão para β pequeno,
   * porque γ−1 é a diferença de dois números quase iguais. Usando
   * γ−1 = β² / [s(1+s)] com s = √(1−β²), o fator β² cancela e sobra uma
   * expressão estável que tende a (3/4)β² no limite não relativístico.
   */
  const kineticError = (v) => {
    const beta = v / C_LIGHT;
    if (Math.abs(beta) >= 1) return Infinity;
    const s = Math.sqrt(1 - beta * beta);
    const D = 1 / (s * (1 + s));
    return Math.abs(0.5 - D) / D;
  };

  /** Velocidade cujo erro newtoniano atinge uma tolerância dada (bisseção em β). */
  const velocityForKineticError = (tolerance) => {
    if (!(tolerance > 0) || tolerance >= kineticError(0.999999999 * C_LIGHT)) return Infinity;
    let low = 0, high = 0.999999999 * C_LIGHT;
    for (let i = 0; i < 80; i += 1) {
      const mid = (low + high) / 2;
      if (kineticError(mid) < tolerance) low = mid;
      else high = mid;
    }
    return (low + high) / 2;
  };

  /* ---------------------------------------------------------------- */
  /* Transformação de Galileu: a gota de soro na maca em movimento      */
  /* ---------------------------------------------------------------- */

  /**
   * Estado da gota no instante t, nos dois referenciais.
   * S' (maca) move-se com velocidade V constante em relação a S (chão); as
   * origens coincidem em t = 0 e a gota se solta do repouso em S', à altura h.
   * Em S' a queda é vertical; em S ela tem velocidade horizontal V e a
   * trajetória é uma parábola. Em ambos a aceleração é −g e_y.
   */
  const galileoDrop = (t, V, h, g) => {
    const tFall = fallTime(h, g);
    const tau = Math.min(Math.max(t, 0), tFall);          // a gota para ao tocar a maca
    const y = h - 0.5 * g * tau * tau;
    const vy = -g * tau;
    return {
      tFall,
      t: tau,
      landed: t >= tFall,
      /* referencial da maca */
      xPrime: 0, yPrime: y, vxPrime: 0, vyPrime: vy,
      /* referencial do chão */
      x: V * tau, y, vx: V, vy,
      /* a mesma aceleração nos dois */
      ax: 0, ay: -g
    };
  };

  /** Alcance horizontal em S até tocar a maca — igual ao que a maca andou. */
  const galileoRange = (V, h, g) => V * fallTime(h, g);

  /* ---------------------------------------------------------------- */
  /* Frenagem com desaceleração constante                                */
  /* ---------------------------------------------------------------- */

  /** Tempo de parada: v(t) = v₀ − |a|t anula-se em t = v₀/|a|. */
  const stopTime = (v0, a) => v0 / Math.abs(a);

  /** Distância de parada: x_p = v₀²/(2|a|). Quadrática em v₀. */
  const stopDistance = (v0, a) => (v0 * v0) / (2 * Math.abs(a));

  /** v e x no instante t; depois de parar, a ambulância fica onde está. */
  const braking = (t, v0, a) => {
    const tp = stopTime(v0, a);
    const tau = Math.min(Math.max(t, 0), tp);
    return {
      tStop: tp, xStop: stopDistance(v0, a), stopped: t >= tp,
      v: v0 - Math.abs(a) * tau,
      x: v0 * tau - 0.5 * Math.abs(a) * tau * tau
    };
  };

  /* ---------------------------------------------------------------- */
  /* Tubo de raios X: elétron clássico × relativístico                   */
  /* ---------------------------------------------------------------- */

  /** β = v/c pela fórmula clássica T = ½mv², com T e mc² na mesma unidade. Ultrapassa 1. */
  const betaClassical = (T, mc2 = MC2_ELECTRON_KEV) => Math.sqrt((2 * T) / mc2);

  /** β = v/c pela fórmula relativística, γ = 1 + T/mc². Satura em 1. */
  const betaRelativistic = (T, mc2 = MC2_ELECTRON_KEV) => {
    const g = 1 + T / mc2;
    return Math.sqrt(1 - 1 / (g * g));
  };

  /** Erro relativo da velocidade clássica em relação à relativística. */
  const betaError = (T, mc2 = MC2_ELECTRON_KEV) => betaClassical(T, mc2) / betaRelativistic(T, mc2) - 1;

  /** Momento relativístico do elétron (kg·m/s) para energia cinética T em keV. */
  const electronMomentum = (TkeV) => {
    const g = 1 + TkeV / MC2_ELECTRON_KEV;
    return g * M_ELECTRON * betaRelativistic(TkeV) * C_LIGHT;
  };

  /** Comprimento de onda de de Broglie λ = h/p. */
  const deBroglie = (p) => H_PLANCK / p;

  /** Razão S/ħ ~ pL/ħ: clássico quando ≫ 1. */
  const actionRatio = (p, L) => (p * L) / HBAR;

  return { C_LIGHT, H_PLANCK, HBAR, M_ELECTRON, MC2_ELECTRON_KEV,
    galileoDrop, galileoRange, stopTime, stopDistance, braking,
    betaClassical, betaRelativistic, betaError, electronMomentum, deBroglie, actionRatio,
    reynolds, dragRegime, reynoldsLength, fallDimensions, dimensionError, fallTime, lorentz, kineticError, velocityForKineticError };
});
