/* Aula 19 — complemento: espalhamento e aplicações de forças centrais. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const KE_MEV_FM = 1.43996;      // e²/4πε₀ em MeV·fm
  const M_PROTON = 938.272;       // MeV
  const X0_AGUA = 36.08;          // comprimento de radiação da água, cm

  /* --- transferência entre órbitas --- */
  /** Custo energético de subir de r₁ para r₂ em órbitas circulares. */
  const transferEnergy = (r1, r2, k) => (k / 2) * (1 / r1 - 1 / r2);
  const circularSpeed = (r, k, mu) => Math.sqrt(k / (mu * r));
  /** Teorema do virial para 1/r: ⟨T⟩ = −½⟨U⟩, logo E = −⟨T⟩. */
  const virialKinetic = (E) => -E;
  /** Transferência de Hohmann: dois impulsos, elipse de semieixo (r₁+r₂)/2. */
  const hohmann = (r1, r2, k, mu) => {
    const a = (r1 + r2) / 2;
    const vis = (r) => Math.sqrt((k / mu) * (2 / r - 1 / a));
    const dv1 = vis(r1) - circularSpeed(r1, k, mu);
    const dv2 = circularSpeed(r2, k, mu) - vis(r2);
    return { a, dv1, dv2, total: Math.abs(dv1) + Math.abs(dv2) };
  };

  /* --- ângulo apsidal --- */
  const frequencyRatio = (n) => (n < 3 ? Math.sqrt(3 - n) : NaN);
  /** Φ = π/√(3 − n): ângulo entre um periélio e o afélio seguinte. */
  const apsidalAngle = (n) => Math.PI / frequencyRatio(n);
  /** Precessão por volta completa: 2Φ − 2π. */
  const precessionPerOrbit = (n) => 2 * apsidalAngle(n) - 2 * Math.PI;
  /**
   * A órbita fecha quando √(3 − n) é racional — o que acontece para infinitos
   * expoentes, e não só para n = 2 e n = −1. O que Bertrand garante é que apenas
   * esses dois fecham TODAS as órbitas ligadas, não só as quase circulares.
   */
  const closesAfter = (n, maxVoltas = 12, tol = 1e-6) => {
    const r = frequencyRatio(n);
    if (!Number.isFinite(r)) return null;
    for (let q = 1; q <= maxVoltas; q += 1) {
      const p = r * q;
      if (Math.abs(p - Math.round(p)) < tol) return { voltas: q, apsides: Math.round(p) * 2 };
    }
    return null;
  };

  /* --- espalhamento por potencial coulombiano repulsivo --- */
  const coulombK = (Z1, Z2) => Z1 * Z2 * KE_MEV_FM;
  /** b = (k/2E)·cot(θ/2), com θ medido no referencial do centro de massa. */
  const impactParameter = (theta, k, E) => (k / (2 * E)) / Math.tan(theta / 2);
  /** θ(b), a relação inversa. */
  const scatteringAngle = (b, k, E) => 2 * Math.atan(k / (2 * E * b));
  /** dσ/dΩ = (k/4E)²/sen⁴(θ/2), a fórmula de Rutherford. */
  const rutherford = (theta, k, E) => (k / (4 * E)) ** 2 / Math.sin(theta / 2) ** 4;
  /** Distância de maior aproximação em colisão frontal: d = k/E. */
  const closestApproach = (k, E) => k / E;
  /** Raio nuclear aproximado, para saber quando Coulomb puro deixa de valer. */
  const nuclearRadius = (A) => 1.2 * Math.cbrt(A);
  /** Número de massa aproximado do alvo a partir de Z (A ≈ 2Z + 0,006Z²: C → 12, Fe → 56, Au → 195). */
  const massNumber = (Z) => Math.round(2 * Z + 0.006 * Z * Z);
  /**
   * E e θ das fórmulas acima são do referencial do CM. Com o alvo em repouso,
   * E_cm = E_lab·m₂/(m₁ + m₂) (não relativístico).
   */
  const labToCM = (Elab, m1, m2) => (Elab * m2) / (m1 + m2);
  /** Ângulo no laboratório a partir do ângulo no CM (Aula 9): tan θ_lab = sen θ/(cos θ + m₁/m₂). */
  const thetaLabFromCM = (theta, m1, m2) => Math.atan2(Math.sin(theta), Math.cos(theta) + m1 / m2);
  /**
   * Trajetória relativa no potencial repulsivo k/r: ramo r = α/(ε cosφ − 1), com
   * α = 2Eb²/k e ε = 1/sen(θ/2), girado para que a assíntota de entrada seja a reta
   * horizontal y = b percorrida no sentido +x. Devolve pontos [x, y] (mesma unidade de b).
   */
  const repulsiveTrajectory = (b, k, E, n = 200, frac = 0.985) => {
    const theta = scatteringAngle(b, k, E);
    const e = 1 / Math.sin(theta / 2);
    const alpha = (2 * E * b * b) / k;
    const phiInf = Math.acos(1 / e);
    const rot = phiInf - Math.PI;          // leva a velocidade incidente (direção π − φ∞) para +x
    const c = Math.cos(rot), s = Math.sin(rot);
    const pts = [];
    for (let j = 0; j <= n; j += 1) {
      const phi = -phiInf * frac + (2 * phiInf * frac * j) / n;
      const r = alpha / (e * Math.cos(phi) - 1);
      const x = r * Math.cos(phi), y = r * Math.sin(phi);
      /* rotação e reflexão y → −y: com ℓ > 0 a entrada ficaria em y = −b. */
      pts.push([c * x - s * y, -(s * x + c * y)]);
    }
    return pts;
  };

  /**
   * Alcance CSDA aproximado de prótons em água (regra de Bragg–Kleeman,
   * R ≈ 0,0022 cm·(T/MeV)^1,77; erro de poucos % entre 50 e 250 MeV).
   */
  const protonRangeWater = (T) => 0.0022 * Math.pow(T, 1.77);

  /* --- espalhamento múltiplo em terapia com prótons --- */
  const protonBetaCP = (T) => {
    const Etot = T + M_PROTON;
    const pc = Math.sqrt(Etot * Etot - M_PROTON * M_PROTON);
    return (pc / Etot) * pc;                       // βcp, em MeV
  };
  /** Fórmula de Highland para o ângulo característico do espalhamento múltiplo. */
  const highlandAngle = (T, x, X0 = X0_AGUA, z = 1) => {
    const bcp = protonBetaCP(T);
    const razao = x / X0;
    if (razao <= 0) return 0;
    return (13.6 / bcp) * z * Math.sqrt(razao) * (1 + 0.038 * Math.log(razao));
  };
  /** Alargamento lateral acumulado: σ ≈ θ₀x/√3. */
  const lateralSpread = (T, x, X0 = X0_AGUA) => (highlandAngle(T, x, X0) * x) / Math.sqrt(3);

  return { KE_MEV_FM, M_PROTON, X0_AGUA, transferEnergy, circularSpeed, virialKinetic, hohmann, frequencyRatio, apsidalAngle, precessionPerOrbit, closesAfter, coulombK, impactParameter, scatteringAngle, rutherford, closestApproach, nuclearRadius, massNumber, labToCM, thetaLabFromCM, repulsiveTrajectory, protonRangeWater, protonBetaCP, highlandAngle, lateralSpread };
});
