/* Aula 17 — problema de dois corpos e forças centrais. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const U = 1.66053907e-27;        // unidade de massa atômica, kg
  const C_LUZ = 2.99792458e10;     // cm/s, para número de onda

  const reducedMass = (m1, m2) => (m1 * m2) / (m1 + m2);

  /** Posições reais a partir da coordenada relativa: órbitas semelhantes. */
  const bodyFromRelative = (r, m1, m2) => {
    const M = m1 + m2;
    return { r1: (m2 / M) * r, r2: -(m1 / M) * r };
  };
  /** Razão entre os tamanhos das duas órbitas: inversa às massas. */
  const orbitRatio = (m1, m2) => m2 / m1;

  /** Órbita cônica usada só para desenhar: r(θ) = p/(1 + e cosθ). */
  const conic = (theta, p, e) => p / (1 + e * Math.cos(theta));

  /** Velocidade areolar: dA/dt = ℓ/2μ, constante para QUALQUER força central. */
  const arealVelocity = (L, mu) => L / (2 * mu);
  /** Área varrida entre dois ângulos, por quadratura de ½r²dθ. */
  const sweptArea = (theta1, theta2, p, e, n = 2000) => {
    const h = (theta2 - theta1) / n;
    let s = 0.5 * conic(theta1, p, e) ** 2 + 0.5 * conic(theta2, p, e) ** 2;
    for (let i = 1; i < n; i += 1) {
      const th = theta1 + i * h;
      s += 0.5 * conic(th, p, e) ** 2 * (i % 2 ? 4 : 2);
    }
    return (h / 3) * s;
  };
  /**
   * Instante em que a partícula passa pelo ângulo θ (t = 0 no periélio), pela
   * EQUAÇÃO DE KEPLER — sem dividir área nenhuma por ℓ/2μ. A órbita
   * r = p/(1 + e cosθ) com ℓ e μ dados corresponde a k = ℓ²/μp, semieixo
   * a = p/(1 − e²) e movimento médio n = √(k/μa³). Anomalia excêntrica:
   * tan(E/2) = √((1 − e)/(1 + e)) tan(θ/2); anomalia média M = E − e sen E = n t.
   * θ fora de (−π, π] é tratado somando voltas inteiras (período 2π/n).
   */
  const keplerTime = (theta, p, e, L, mu) => {
    const k = (L * L) / (mu * p);
    const a = p / (1 - e * e);
    const nMedio = Math.sqrt(k / (mu * a ** 3));
    const voltas = Math.floor((theta + Math.PI) / (2 * Math.PI));
    const th = theta - 2 * Math.PI * voltas;              // em [−π, π)
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(th / 2), Math.sqrt(1 + e) * Math.cos(th / 2));
    const M = E - e * Math.sin(E);
    return (M + 2 * Math.PI * voltas) / nMedio;
  };
  /** Tempo para varrer o trecho θ₁ → θ₂, pela dinâmica (equação de Kepler). */
  const sweptTime = (theta1, theta2, p, e, L, mu) => keplerTime(theta2, p, e, L, mu) - keplerTime(theta1, p, e, L, mu);

  /**
   * Integração numérica (RK4) de μr̈ = f(r) r̂ no plano, para QUALQUER força
   * central f(r). Devolve amostras {t, x, y, vx, vy}. Usada nos testes para
   * conferir a lei das áreas sem supô-la.
   */
  const integrateCentral = (f, mu, estado0, dt, passos) => {
    const deriv = ([x, y, vx, vy]) => {
      const r = Math.hypot(x, y), fr = f(r) / mu;
      return [vx, vy, (fr * x) / r, (fr * y) / r];
    };
    let s = estado0.slice();
    const out = [{ t: 0, x: s[0], y: s[1], vx: s[2], vy: s[3] }];
    for (let i = 1; i <= passos; i += 1) {
      const k1 = deriv(s);
      const k2 = deriv(s.map((v, j) => v + 0.5 * dt * k1[j]));
      const k3 = deriv(s.map((v, j) => v + 0.5 * dt * k2[j]));
      const k4 = deriv(s.map((v, j) => v + dt * k3[j]));
      s = s.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      out.push({ t: i * dt, x: s[0], y: s[1], vx: s[2], vy: s[3] });
    }
    return out;
  };

  /** Equação radial reduzida: μr̈ = f(r) + ℓ²/μr³. */
  const radialAcceleration = (r, f, L, mu) => (f + L * L / (mu * r ** 3)) / mu;

  /* --- espectroscopia vibracional: a massa reduzida no lugar certo --- */
  const vibrationalOmega = (k, muU) => Math.sqrt(k / (muU * U));
  const waveNumber = (omega) => omega / (2 * Math.PI * C_LUZ);
  /** Deslocamento isotópico: ν̃′/ν̃ = √(μ/μ′), com k inalterado. */
  const isotopeShift = (muU, muLinhaU) => Math.sqrt(muU / muLinhaU);

  return { U, C_LUZ, reducedMass, bodyFromRelative, orbitRatio, conic, arealVelocity, sweptArea, keplerTime, sweptTime, integrateCentral, radialAcceleration, vibrationalOmega, waveNumber, isotopeShift };
});
