/* Aula 2 — escalares, vetores e transformações de coordenadas. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const rad = (graus) => (graus * Math.PI) / 180;

  /** Rotação passiva no plano: os eixos giram de +θ, o vetor fica parado. */
  const rotatePassive = (a, theta) => [
    a[0] * Math.cos(theta) + a[1] * Math.sin(theta),
    -a[0] * Math.sin(theta) + a[1] * Math.cos(theta)
  ];

  /** Rotação ativa: os eixos ficam, o vetor gira de +θ. É a transposta da passiva. */
  const rotateActive = (a, theta) => [
    a[0] * Math.cos(theta) - a[1] * Math.sin(theta),
    a[0] * Math.sin(theta) + a[1] * Math.cos(theta)
  ];

  const dot = (a, b) => a.reduce((s, ai, i) => s + ai * b[i], 0);
  const norm = (a) => Math.sqrt(dot(a, a));

  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];

  /** Ângulo entre dois vetores, protegido contra erro de arredondamento. */
  const angleBetween = (a, b) => {
    const d = norm(a) * norm(b);
    if (d === 0) return 0;
    return Math.acos(Math.min(1, Math.max(-1, dot(a, b) / d)));
  };

  /* --- o símbolo de Levi-Civita, escrito antes de ser usado --- */
  /** Pares fora de ordem em uma tripla: a paridade da permutação. */
  const inversions = (t) => {
    let n = 0;
    for (let a = 0; a < t.length; a += 1) for (let b = a + 1; b < t.length; b += 1) if (t[a] > t[b]) n += 1;
    return n;
  };
  /** εᵢⱼₖ com índices de 1 a 3: +1 nas permutações pares, −1 nas ímpares, 0 se houver repetição. */
  const levi = (i, j, k) => (i === j || j === k || i === k ? 0 : inversions([i, j, k]) % 2 === 0 ? 1 : -1);

  /**
   * As nove parcelas de (a×b)ᵢ = εᵢⱼₖ aⱼ b_k, com j e k varridos de 1 a 3.
   * Sete são nulas; ver quais e por quê é o ponto da estação.
   */
  const crossTerms = (a, b, i) => {
    const out = [];
    for (let j = 1; j <= 3; j += 1) {
      for (let k = 1; k <= 3; k += 1) {
        const e = levi(i, j, k);
        out.push({ j, k, eps: e, term: e * a[j - 1] * b[k - 1] });
      }
    }
    return out;
  };

  /** Produto misto a·(b×c): o volume orientado do paralelepípedo. */
  const tripleProduct = (a, b, c) => dot(a, cross(b, c));

  /** Lado esquerdo da identidade "BAC menos CAB". */
  const doubleCross = (a, b, c) => cross(a, cross(b, c));

  /** Lado direito: b(a·c) − c(a·b). */
  const bacCab = (a, b, c) => {
    const ac = dot(a, c);
    const ab = dot(a, b);
    return b.map((bi, i) => bi * ac - c[i] * ab);
  };

  /** Resíduo entre os dois lados — deve ser zero a menos de arredondamento. */
  const bacCabResidual = (a, b, c) => {
    const e = doubleCross(a, b, c);
    const d = bacCab(a, b, c);
    return Math.max(...e.map((ei, i) => Math.abs(ei - d[i])));
  };

  return { rad, rotatePassive, rotateActive, dot, norm, cross, angleBetween, inversions, levi, crossTerms, tripleProduct, doubleCross, bacCab, bacCabResidual };
});
