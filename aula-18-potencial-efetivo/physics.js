/* Aula 18 — potencial efetivo e classificação das órbitas. Funções puras.
   Duas contas da aula aparecem abertas aqui: o cálculo de V″ para f = −k/rⁿ
   e a equação dos pontos de retorno, μEr² + μkr − ℓ²/2 = 0 (atenção ao fator μ
   no termo linear). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Potencial de uma lei de potência f = −k/rⁿ, com U = −k/[(n−1)r^{n−1}]. */
  const potential = (r, k, n) => {
    if (Math.abs(n - 1) < 1e-12) return k * Math.log(r);   // caso logarítmico
    return -k / ((n - 1) * Math.pow(r, n - 1));
  };
  const force = (r, k, n) => -k / Math.pow(r, n);

  const centrifugal = (r, L, mu) => (L * L) / (2 * mu * r * r);
  const effective = (r, k, L, mu, n) => potential(r, k, n) + centrifugal(r, L, mu);

  /**
   * Derivadas de V, abertas:
   *   V′ = k/rⁿ − ℓ²/μr³
   *   V″ = −nk/r^{n+1} + 3ℓ²/μr⁴
   * No raio circular vale ℓ² = μk r_c^{3−n}, e substituindo:
   *   V″(r_c) = k(3 − n)/r_c^{n+1}
   */
  const dEffective = (r, k, L, mu, n) => k / Math.pow(r, n) - (L * L) / (mu * r ** 3);
  const d2Effective = (r, k, L, mu, n) => -n * k / Math.pow(r, n + 1) + (3 * L * L) / (mu * r ** 4);

  /**
   * Raio da órbita circular: onde V′ = 0, isto é ℓ² = μk r^{3−n}.
   * Em n = 3 o expoente some e a condição vira ℓ² = μk, independente de r: o caso
   * é degenerado — ou nenhum raio serve, ou todos servem — e devolvemos NaN, que
   * é o sinal honesto de que a órbita circular deixa de estar definida ali.
   */
  const circularRadius = (k, L, mu, n) =>
    Math.abs(n - 3) < 1e-12 ? NaN : Math.pow((L * L) / (mu * k), 1 / (3 - n));
  const d2AtCircular = (k, L, mu, n) => {
    const rc = circularRadius(k, L, mu, n);
    return (k * (3 - n)) / Math.pow(rc, n + 1);
  };
  const isStable = (n) => n < 3;
  /** Razão entre a frequência radial e a angular: √(3 − n). */
  const frequencyRatio = (n) => (n < 3 ? Math.sqrt(3 - n) : NaN);

  /* --- caso kepleriano n = 2, U = −k/r --- */
  const circularRadiusKepler = (k, L, mu) => (L * L) / (mu * k);
  const circularEnergy = (k, L, mu) => -(mu * k * k) / (2 * L * L);

  /**
   * Pontos de retorno de E = −k/r + ℓ²/2μr².
   * Multiplicando por μr²:  μEr² + μkr − ℓ²/2 = 0.
   * O fator μ no termo linear é o erro mais comum ao abrir essa conta.
   * Em E = E_c o discriminante é zero só em aritmética exata; em ponto flutuante
   * pode sair ±1e−16. Uma tolerância relativa devolve a raiz dupla r_c.
   */
  const turningPoints = (E, k, L, mu) => {
    const disc = (mu * k) ** 2 + 2 * mu * E * L * L;
    if (Math.abs(disc) < 1e-9 * (mu * k) ** 2) return [(L * L) / (mu * k)];   // E = E_c: círculo
    if (disc < 0) return [];
    const raiz = Math.sqrt(disc);
    if (Math.abs(E) < 1e-15) return [(L * L) / (2 * mu * k)];   // parábola: só r_min
    const r1 = (-mu * k + raiz) / (2 * mu * E);
    const r2 = (-mu * k - raiz) / (2 * mu * E);
    return [r1, r2].filter((r) => r > 0).sort((a, b) => a - b);
  };

  const eccentricity = (E, k, L, mu) => Math.sqrt(Math.max(0, 1 + (2 * E * L * L) / (mu * k * k)));
  const bound = (E) => E < 0;

  /**
   * Fechamento da órbita quase circular. Se ω_r/ω_θ = p/q (fração irredutível,
   * q ≤ qMax), r(θ) tem período 2πq/p e a órbita fecha após q voltas.
   * Devolve { p, q } ou null se a razão não é racional com denominador pequeno.
   */
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const rationalRatio = (ratio, qMax = 6, tol = 1e-6) => {
    if (!Number.isFinite(ratio) || ratio <= 0) return null;
    for (let q = 1; q <= qMax; q += 1) {
      const p = Math.round(ratio * q);
      if (p > 0 && Math.abs(ratio - p / q) < tol) {
        const g = gcd(p, q);
        return { p: p / g, q: q / g };
      }
    }
    return null;
  };

  return { potential, force, centrifugal, effective, dEffective, d2Effective, circularRadius, d2AtCircular, isStable, frequencyRatio, circularRadiusKepler, circularEnergy, turningPoints, eccentricity, bound, rationalRatio };
});
