/* Aula 21 — introdução ao cálculo variacional. Funções puras.
   As notas (Aula 20) deduzem Beltrami passo a passo. Aqui a identidade é
   verificada numericamente: a quantidade f − y′∂f/∂y′ é constante ao longo da
   solução verdadeira e deixa de ser nas curvas vizinhas. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const H = 1e-6;
  /* Passo da derivada externa em d/dx(∂f/∂y′): diferença finita aninhada com o
     mesmo H amplificaria o arredondamento (~ε/H² ≈ 1e-4); com 1e-4 o ruído cai a ~1e-6. */
  const H2 = 1e-4;

  /* --- integrandos usados nas três estações --- */
  const arcLength = (y, yp) => Math.sqrt(1 + yp * yp);
  const revolutionArea = (y, yp) => y * Math.sqrt(1 + yp * yp);
  const fermatTime = (y, yp, v) => Math.sqrt(1 + yp * yp) / v(y);

  /** Derivadas parciais numéricas de f(y, y′). */
  const dfdy = (f, y, yp) => (f(y + H, yp) - f(y - H, yp)) / (2 * H);
  const dfdyp = (f, y, yp) => (f(y, yp + H) - f(y, yp - H)) / (2 * H);

  /** Funcional J[y] = ∫f(y,y′)dx, por Simpson. */
  const functional = (f, y, x1, x2, n = 2000) => {
    const h = (x2 - x1) / n;
    const g = (x) => f(y(x), (y(x + H) - y(x - H)) / (2 * H));
    let s = g(x1 + 1e-9) + g(x2 - 1e-9);
    for (let i = 1; i < n; i += 1) s += g(x1 + i * h) * (i % 2 ? 4 : 2);
    return (h / 3) * s;
  };

  /** Família variada Y = y + εη, com η nulo nas extremidades. */
  const variation = (x, x1, x2, nos) => Math.sin((nos * Math.PI * (x - x1)) / (x2 - x1));
  const varied = (y, eps, x1, x2, nos) => (x) => y(x) + eps * variation(x, x1, x2, nos);

  /**
   * Resíduo de Euler–Lagrange: ∂f/∂y − d/dx(∂f/∂y′).
   * Ele se anula identicamente sobre a curva estacionária, e só sobre ela.
   */
  const eulerResidual = (f, y, x) => {
    const yp = (xx) => (y(xx + H) - y(xx - H)) / (2 * H);
    const termo = (xx) => dfdyp(f, y(xx), yp(xx));
    return dfdy(f, y(x), yp(x)) - (termo(x + H2) - termo(x - H2)) / (2 * H2);
  };

  /** Invariante de Beltrami: f − y′·∂f/∂y′, constante quando x não aparece em f. */
  const beltrami = (f, y, x) => {
    const yp = (y(x + H) - y(x - H)) / (2 * H);
    return f(y(x), yp) - yp * dfdyp(f, y(x), yp);
  };

  /** Variação do invariante ao longo do intervalo: mede o quanto a curva erra. */
  const beltramiSpread = (f, y, x1, x2, n = 120) => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i <= n; i += 1) {
      const b = beltrami(f, y, x1 + ((x2 - x1) * i) / n);
      min = Math.min(min, b); max = Math.max(max, b);
    }
    return { min, max, amplitude: max - min };
  };

  /** Catenária y = C cosh((x − x₀)/C), solução do problema da área mínima. */
  const catenary = (C, x0) => (x) => C * Math.cosh((x - x0) / C);
  /**
   * Ajusta C para que a catenária simétrica (x₀ = 0) passe por (x₂, y₂).
   * C·cosh(x₂/C) tem mínimo 1,5089·x₂ em C = x₂/1,1997: abaixo dele não há catenária
   * (devolve NaN — vale a solução de Goldschmidt); acima há duas, e devolvemos a rasa
   * (C maior), que é o mínimo local da área. A profunda é um ponto de sela.
   */
  const CATENARY_U = 1.19967864;                 // raiz de u·tanh u = 1
  const fitCatenary = (x2, y2) => {
    const Cc = x2 / CATENARY_U;
    if (y2 < Cc * Math.cosh(CATENARY_U)) return NaN;
    let lo = Cc, hi = Math.max(y2, Cc) * 2;      // ramo raso: C·cosh(x₂/C) crescente em C > Cc
    for (let i = 0; i < 200; i += 1) {
      const mid = 0.5 * (lo + hi);
      if (mid * Math.cosh(x2 / mid) < y2) lo = mid; else hi = mid;
    }
    return 0.5 * (lo + hi);
  };
  /** Menor C para o qual a catenária simétrica entre x = ±x₂ ainda está no ramo raso. */
  const shallowCatenaryMinC = (x2) => x2 / CATENARY_U;

  return { arcLength, revolutionArea, fermatTime, dfdy, dfdyp, functional, variation, varied, eulerResidual, beltrami, beltramiSpread, catenary, fitCatenary, shallowCatenaryMinC };
});
