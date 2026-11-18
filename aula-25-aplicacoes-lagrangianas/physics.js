/* Aula 25 — aplicações da formulação lagrangiana. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- conta em aro girante --- */
  /** L = ½mR²θ̇² + ½mR²ω²sen²θ + mgRcosθ. O segundo termo vem de T, não de U. */
  const hoopLagrangian = (th, thd, m, R, w, g = G) =>
    0.5 * m * R * R * thd * thd + 0.5 * m * R * R * w * w * Math.sin(th) ** 2 + m * g * R * Math.cos(th);
  /** V = −mgRcosθ − ½mR²ω²sen²θ. */
  const hoopVeff = (th, m, R, w, g = G) =>
    -m * g * R * Math.cos(th) - 0.5 * m * R * R * w * w * Math.sin(th) ** 2;
  /** V′ = mR senθ (g − Rω²cosθ). */
  const hoopVeffPrime = (th, m, R, w, g = G) =>
    m * R * Math.sin(th) * (g - R * w * w * Math.cos(th));
  /** V″ = mgRcosθ − mR²ω²cos2θ. */
  const hoopVeffSecond = (th, m, R, w, g = G) =>
    m * g * R * Math.cos(th) - m * R * R * w * w * Math.cos(2 * th);
  const criticalOmega = (R, g = G) => Math.sqrt(g / R);
  /** Equilíbrio novo, que só existe acima de ω_c: cosθ* = g/Rω². */
  const tiltedEquilibrium = (R, w, g = G) => {
    const c = g / (R * w * w);
    return c > 1 ? NaN : Math.acos(c);
  };
  /** Frequência de pequenas oscilações em torno de θ*: ω√(1 − (ω_c/ω)⁴). */
  const tiltedFrequency = (R, w, g = G) => {
    const wc = criticalOmega(R, g);
    return w <= wc ? NaN : w * Math.sqrt(1 - (wc / w) ** 4);
  };
  /** Frequência em torno de θ = 0, enquanto ele é estável. */
  /**
   * Em ω = ω_c a frequência vale exatamente zero — é o amolecimento que sinaliza
   * a bifurcação. Acima disso o equilíbrio é instável e não há frequência real.
   */
  const bottomFrequency = (R, w, g = G) => {
    const k = g / R - w * w;
    if (k < -1e-12 * (g / R)) return NaN;
    return Math.sqrt(Math.max(0, k));
  };

  /* --- pêndulo duplo em pequenas oscilações --- */
  /** Matrizes de massa m (campo M) e de rigidez A (campo K) da expansão quadrática. */
  const doubleMatrices = (m1, m2, l1, l2, g = G) => ({
    M: [[(m1 + m2) * l1 * l1, m2 * l1 * l2], [m2 * l1 * l2, m2 * l2 * l2]],
    K: [[(m1 + m2) * g * l1, 0], [0, m2 * g * l2]]
  });
  /** Frequências normais pelo determinante de (A − ω²m); devolve [ω₋, ω₊], lento e rápido. */
  const doubleFrequencies = (m1, m2, l1, l2, g = G) => {
    const { M, K } = doubleMatrices(m1, m2, l1, l2, g);
    const a = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    const b = -(K[0][0] * M[1][1] + K[1][1] * M[0][0]);
    const c = K[0][0] * K[1][1];
    const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c));
    return [(-b - disc) / (2 * a), (-b + disc) / (2 * a)].map(Math.sqrt);
  };

  /**
   * Razões de amplitude a₂/a₁ = θ₂/θ₁ dos dois modos, pela primeira linha de
   * (A − ω²m)a = 0: (A₁₁ − ω²m₁₁)a₁ − ω²m₁₂a₂ = 0. Devolve [lento, rápido];
   * no caso simétrico valem +√2 e −√2.
   */
  const doubleModeRatios = (m1, m2, l1, l2, g = G) => {
    const { M, K } = doubleMatrices(m1, m2, l1, l2, g);
    return doubleFrequencies(m1, m2, l1, l2, g).map((w) => (K[0][0] - w * w * M[0][0]) / (w * w * M[0][1]));
  };

  /* --- pêndulo duplo completo, sem linearizar --- */
  /**
   * Acelerações angulares exatas para duas massas puntiformes em hastes rígidas
   * sem massa. Vêm das equações de Lagrange da estação 2, mas sem a expansão
   * quadrática — é exatamente a diferença que a estação 4 investiga.
   */
  const doubleAccel = (th1, th2, w1, w2, m1, m2, l1, l2, g = G) => {
    const d = th1 - th2;
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
    const a1 =
      (-g * (2 * m1 + m2) * Math.sin(th1) - m2 * g * Math.sin(th1 - 2 * th2) -
        2 * Math.sin(d) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(d))) / (l1 * den);
    const a2 =
      (2 * Math.sin(d) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) +
        w2 * w2 * l2 * m2 * Math.cos(d))) / (l2 * den);
    return [a1, a2];
  };

  /** Energia mecânica total, com o pivô como origem do potencial. */
  const doubleEnergy = (th1, th2, w1, w2, m1, m2, l1, l2, g = G) => {
    const T =
      0.5 * (m1 + m2) * l1 * l1 * w1 * w1 + 0.5 * m2 * l2 * l2 * w2 * w2 +
      m2 * l1 * l2 * w1 * w2 * Math.cos(th1 - th2);
    const V = -(m1 + m2) * g * l1 * Math.cos(th1) - m2 * g * l2 * Math.cos(th2);
    return T + V;
  };

  /** Um passo de Runge–Kutta de 4ª ordem sobre o estado [θ₁,θ₂,ω₁,ω₂]. */
  const doubleStep = (y, dt, m1, m2, l1, l2, g = G) => {
    const f = (s) => {
      const [a1, a2] = doubleAccel(s[0], s[1], s[2], s[3], m1, m2, l1, l2, g);
      return [s[2], s[3], a1, a2];
    };
    const soma = (a, b, e) => a.map((x, i) => x + b[i] * e);
    const k1 = f(y), k2 = f(soma(y, k1, dt / 2)), k3 = f(soma(y, k2, dt / 2)), k4 = f(soma(y, k3, dt));
    return y.map((x, i) => x + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };

  /** Trajetória completa, amostrada em passos de dt. */
  const doublePath = (y0, dt, passos, m1, m2, l1, l2, g = G) => {
    const out = [y0.slice()];
    let y = y0.slice();
    for (let i = 0; i < passos; i += 1) { y = doubleStep(y, dt, m1, m2, l1, l2, g); out.push(y.slice()); }
    return out;
  };

  /** Posições cartesianas das duas massas, para desenhar o aparato. */
  const doublePositions = (th1, th2, l1, l2) => {
    const x1 = l1 * Math.sin(th1), y1 = -l1 * Math.cos(th1);
    return [[x1, y1], [x1 + l2 * Math.sin(th2), y1 - l2 * Math.cos(th2)]];
  };

  /** Distância entre dois estados no espaço de configuração, em radianos. */
  const angularSeparation = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  /* --- modelo balístico da marcha --- */
  /** Barra uniforme articulada no quadril: I = ⅓mℓ², V = −mg(ℓ/2)cosθ. */
  const rodOmega = (l, g = G) => Math.sqrt((3 * g) / (2 * l));
  const rodPeriod = (l, g = G) => (2 * Math.PI) / rodOmega(l, g);
  const swingTime = (l, g = G) => rodPeriod(l, g) / 2;
  /** Com o joelho fletido, I passa a f·I (f = I′/I) e o período τ vai com √f. */
  const reducedPeriod = (l, f, g = G) => rodPeriod(l, g) * Math.sqrt(f);
  /** Fator de redução necessário para atingir um tempo de balanço alvo. */
  const requiredFactor = (l, alvo, g = G) => (2 * alvo / rodPeriod(l, g)) ** 2;

  return { G, hoopLagrangian, hoopVeff, hoopVeffPrime, hoopVeffSecond, criticalOmega, tiltedEquilibrium, tiltedFrequency, bottomFrequency, doubleMatrices, doubleFrequencies, doubleModeRatios, doubleAccel, doubleEnergy, doubleStep, doublePath, doublePositions, angularSeparation, rodOmega, rodPeriod, swingTime, reducedPeriod, requiredFactor };
});
