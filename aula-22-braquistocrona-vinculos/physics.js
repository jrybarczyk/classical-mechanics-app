/* Aula 22 — problemas variacionais e vínculos. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- braquistócrona --- */
  /** Cicloide: x = a(θ − senθ), y = a(1 − cosθ), com y medido para baixo. */
  const cycloid = (theta, a) => [a * (theta - Math.sin(theta)), a * (1 - Math.cos(theta))];
  /** Tempo de descida ao longo da cicloide até o ângulo θ: t = θ√(a/g). */
  const cycloidTime = (theta, a, g = G) => theta * Math.sqrt(a / g);

  /**
   * Tempo de descida por uma curva y(x) qualquer, partindo do repouso na origem:
   *   t = ∫√[(1 + y′²)/(2gy)] dx.
   * Perto da origem o integrando diverge como x^(−α). Para y ∝ x^p:
   *   α = 1 − p/2 se p ≤ 1 (o termo y′² domina)   e   α = p/2 se p ≥ 1 (y′ → 0).
   * A substituição x = X·s^q com q = 1/(1 − α) torna o integrando limitado em s = 0
   * (a reta tem α = 1/2, q = 2; a cicloide, y ∝ x^(2/3), também α = 2/3, q = 3).
   * Para α ≥ 1 (p ≥ 2: a curva parte na horizontal) o tempo é infinito.
   * A derivada usa passo relativo, para continuar válida em x minúsculo.
   */
  const singularExponent = (p) => (p <= 1 ? 1 - p / 2 : p / 2);
  const descentTime = (y, X, g = G, n = 2000, alpha = 0.5) => {
    if (!(alpha < 1)) return Infinity;
    const q = 1 / (1 - alpha);
    const integrando = (s) => {
      const x = X * Math.pow(s, q);
      const yy = y(x);
      if (!(yy > 0)) return 0;
      const h = 1e-6 * x;
      const yp = (y(x + h) - y(x - h)) / (2 * h);
      return Math.sqrt((1 + yp * yp) / (2 * g * yy)) * q * X * Math.pow(s, q - 1);
    };
    if (n % 2) n += 1;
    const hs = 1 / n;
    /* Em s = 0 o integrando é limitado mas só tem limite; usamos o valor em s ≈ 0⁺. */
    let soma = integrando(1e-6 * hs) + integrando(1);
    for (let i = 1; i < n; i += 1) soma += integrando(i * hs) * (i % 2 ? 4 : 2);
    return (hs / 3) * soma;
  };
  /** Tempo pela curva de teste y = Y(x/X)^p, com o expoente singular correto. */
  const powerCurveTime = (p, X, Y, g = G, n = 2000) =>
    descentTime((x) => Y * Math.pow(x / X, p), X, g, n, singularExponent(p));

  /**
   * Tempo de descida pela cicloide largando do repouso em θ₀ até o fundo (θ = π).
   * Com v = √(2ga(cosθ₀ − cosθ)) e ds = 2a·sen(θ/2)dθ, a substituição
   * u = cos(θ/2)/cos(θ₀/2) dá t = 2√(a/g)·arcsen(1) = π√(a/g) para qualquer θ₀ < π:
   * a tautócrona. Aqui a integral é feita numericamente (u = sen φ), para que o
   * resultado seja verificado, não suposto.
   */
  const cycloidTimeFromRest = (theta0, a, g = G, n = 400) => {
    const c0 = Math.cos(theta0 / 2);
    if (!(c0 > 0)) return 0;
    /* φ ∈ (0, π/2) ↦ θ = 2·arccos(c₀ sen φ) ∈ (θ₀, π); integra ds/v·(dθ/dφ) sem
       usar o cancelamento analítico. */
    const f = (phi) => {
      const u = Math.sin(phi);
      const theta = 2 * Math.acos(u * c0);
      const dthetaDphi = (2 * c0 * Math.cos(phi)) / Math.sqrt(1 - u * u * c0 * c0);
      const ds = 2 * a * Math.sin(theta / 2);
      const v = Math.sqrt(2 * g * a * (Math.cos(theta0) - Math.cos(theta)));
      return v > 0 ? (ds / v) * dthetaDphi : 0;
    };
    const h = (Math.PI / 2) / n;
    let soma = 0;
    for (let i = 0; i < n; i += 1) soma += f((i + 0.5) * h);
    return soma * h;
  };

  /** Tempo pela reta: aceleração constante g·senα ao longo do comprimento L. */
  const straightTime = (X, Y, g = G) => {
    const L = Math.hypot(X, Y);
    return L * Math.sqrt(2 / (g * Y));
  };

  /* --- Fermat e a lei de Snell --- */
  const snellAngle = (theta1, v1, v2) => {
    const s = (v2 / v1) * Math.sin(theta1);
    return Math.abs(s) > 1 ? NaN : Math.asin(s);
  };
  const criticalAngle = (v1, v2) => (v2 > v1 ? Math.asin(v1 / v2) : NaN);
  const totalReflection = (theta1, v1, v2) => Number.isNaN(snellAngle(theta1, v1, v2));
  /** Deslocamento lateral do eco ao atravessar uma camada de espessura d. */
  const lateralShift = (theta1, v1, v2, d) => {
    const t2 = snellAngle(theta1, v1, v2);
    return Number.isNaN(t2) ? NaN : d * (Math.tan(t2) - Math.tan(theta1));
  };
  /** Tempo de percurso pelo ponto de travessia x — a função que Fermat minimiza. */
  const crossingTime = (x, h1, h2, d, v1, v2) =>
    Math.hypot(h1, x) / v1 + Math.hypot(h2, d - x) / v2;

  /* --- problema isoperimétrico --- */
  /** O multiplicador é o próprio raio: λ = P/2π. */
  const isoperimetricLambda = (P_) => P_ / (2 * Math.PI);
  const circleArea = (P_) => (P_ * P_) / (4 * Math.PI);
  /** Área de um retângulo de mesmo perímetro, para comparação. */
  const rectangleArea = (P_, razao) => {
    const b = P_ / (2 * (1 + razao));
    return b * razao * b;
  };
  /** Área de um polígono regular de n lados com o mesmo perímetro. */
  const polygonArea = (P_, n) => (P_ * P_) / (4 * n * Math.tan(Math.PI / n));

  return { G, cycloid, cycloidTime, cycloidTimeFromRest, singularExponent, descentTime, powerCurveTime, straightTime, snellAngle, criticalAngle, totalReflection, lateralShift, crossingTime, isoperimetricLambda, circleArea, rectangleArea, polygonArea };
});
