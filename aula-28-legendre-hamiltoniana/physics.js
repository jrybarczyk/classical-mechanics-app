/* Aula 28 — da lagrangiana à hamiltoniana. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* --- transformação de Legendre, no caso escalar --- */
  /** Família convexa de teste: f(v) = ½av² + cv⁴, com a, c > 0. */
  const f = (v, a, c) => 0.5 * a * v * v + c * v ** 4;
  const df = (v, a, c) => a * v + 4 * c * v ** 3;
  /** Inversão p = f′(v) por bisseção; a convexidade garante raiz única. */
  const vFromP = (p, a, c) => {
    let lo = -50, hi = 50;
    for (let i = 0; i < 200; i += 1) {
      const mid = (lo + hi) / 2;
      if (df(mid, a, c) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  /** g(p) = p·v(p) − f(v(p)): a transformada. */
  const legendre = (p, a, c) => {
    const v = vFromP(p, a, c);
    return p * v - f(v, a, c);
  };
  /** dg/dp deve devolver v: é a simetria que torna a transformação involutiva. */
  const dLegendre = (p, a, c, h = 1e-5) => (legendre(p + h, a, c) - legendre(p - h, a, c)) / (2 * h);
  /** Aplicar Legendre duas vezes recupera f. */
  const doubleLegendre = (v, a, c, h = 1e-5) => {
    const p = df(v, a, c);
    const g = (pp) => legendre(pp, a, c);
    const vv = (g(p + h) - g(p - h)) / (2 * h);
    return vv * p - g(p);
  };
  /** Intercepto vertical da tangente de inclinação p: vale −g(p). */
  const tangentIntercept = (p, a, c) => -legendre(p, a, c);

  /* --- construção de H --- */
  /** Força central: H = p_r²/2m + p_θ²/2mr² + U(r). */
  const centralH = (pr, pth, r, m, U) => (pr * pr) / (2 * m) + (pth * pth) / (2 * m * r * r) + U;
  /** A barreira centrífuga da Aula 18 aparece sozinha. */
  const centrifugalTerm = (pth, r, m) => (pth * pth) / (2 * m * r * r);
  /** Momentos a partir das velocidades, e a inversão. */
  const centralMomenta = (m, r, rd, thd) => [m * rd, m * r * r * thd];
  const centralVelocities = (m, r, pr, pth) => [pr / m, pth / (m * r * r)];

  /* --- partícula carregada: o caso em que H ≠ p²/2m --- */
  /** p = mv + qA (q é a carga, como nas notas), logo v = (p − qA)/m. */
  const emMomentum = (m, v, q, A) => m * v + q * A;
  const emH = (p, q, A, m, phi) => (p - q * A) ** 2 / (2 * m) + q * phi;
  /** O valor de H continua sendo a energia, escrito em p e não em v. */
  const emEnergy = (m, v, q, phi) => 0.5 * m * v * v + q * phi;

  /* --- a mesma operação em termodinâmica --- */
  /** U(S) de um sistema simples de teste, com T = dU/dS. */
  const U = (S, alpha) => alpha * S * S;
  const temperature = (S, alpha) => 2 * alpha * S;
  /** F = U − TS: Legendre de U trocando S por T, com o sinal da termodinâmica.
   *  Na convenção mecânica (g = pv − f) seria TS − U = −F. */
  const helmholtz = (T, alpha) => {
    const S = T / (2 * alpha);
    return U(S, alpha) - T * S;
  };

  /** U(S) − TS para um S qualquer: é ≥ F(T), com igualdade só em S(T) (F é o mínimo). */
  const freeEnergyAt = (S, T, alpha) => U(S, alpha) - T * S;

  return { freeEnergyAt, f, df, vFromP, legendre, dLegendre, doubleLegendre, tangentIntercept, centralH, centrifugalTerm, centralMomenta, centralVelocities, emMomentum, emH, emEnergy, U, temperature, helmholtz };
});
