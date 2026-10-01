/* Aula 5 — movimento retilíneo, trabalho e energia. Funções puras.
   O potencial escolhido é o poço duplo U(x) = U₀(x²/a² − 1)², o mesmo da figura
   da aula, porque ele exibe de uma só vez mínimo, máximo, pontos de retorno e a
   separatriz retomada na Aula 15. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const U = (x, U0 = 1, a = 1) => {
    const u = (x * x) / (a * a) - 1;
    return U0 * u * u;
  };

  /** F = −dU/dx = −4U₀x(x²/a² − 1)/a² */
  const force = (x, U0 = 1, a = 1) => (-4 * U0 * x * ((x * x) / (a * a) - 1)) / (a * a);

  /** U″(x) = 4U₀(3x²/a² − 1)/a²  — positivo nos mínimos, negativo no topo. */
  const Upp = (x, U0 = 1, a = 1) => (4 * U0 * ((3 * x * x) / (a * a) - 1)) / (a * a);

  /**
   * Pontos de retorno de E = U(x): x²/a² = 1 ± √(E/U₀).
   * Para E < U₀ há quatro, e o movimento fica confinado a um poço.
   * Para E > U₀ restam dois, e a partícula percorre os dois poços.
   */
  const turningPoints = (E, U0 = 1, a = 1) => {
    if (E < 0) return [];
    const s = Math.sqrt(E / U0);
    const out = [];
    if (1 - s >= 0) {
      const inner = a * Math.sqrt(1 - s);
      out.push(-inner, inner);
    }
    const outer = a * Math.sqrt(1 + s);
    out.push(-outer, outer);
    return out.sort((p, q) => p - q);
  };

  const confined = (E, U0 = 1) => E < U0;

  /** Rapidez a partir da conservação da energia; zero fora da região permitida. */
  const speed = (x, E, U0 = 1, a = 1, m = 1) => {
    const k = E - U(x, U0, a);
    return k <= 0 ? 0 : Math.sqrt((2 * k) / m);
  };

  /** Intervalo efetivamente percorrido para a energia dada. */
  const excursion = (E, U0 = 1, a = 1) => {
    const t = turningPoints(E, U0, a);
    if (!t.length) return null;
    return confined(E, U0) ? [t[2], t[3]] : [t[0], t[t.length - 1]];
  };

  /**
   * Período por quadratura: T = 2∫dx/v entre os pontos de retorno.
   * O integrando diverge como 1/√ nas extremidades, então usa-se a substituição
   * x = c + R·sen u, que cancela exatamente essa singularidade, e Simpson em u.
   */
  const period = (E, U0 = 1, a = 1, m = 1, n = 2000) => {
    const seg = excursion(E, U0, a);
    if (!seg) return Infinity;
    const [x1, x2] = seg;
    const c = (x1 + x2) / 2;
    const R = (x2 - x1) / 2;
    if (R <= 0) return Infinity;
    const f = (u) => {
      const x = c + R * Math.sin(u);
      const v = speed(x, E, U0, a, m);
      return v <= 0 ? 0 : (R * Math.cos(u)) / v;
    };
    const A = -Math.PI / 2, B = Math.PI / 2;
    const h = (B - A) / n;
    let sum = f(A) + f(B);
    for (let i = 1; i < n; i += 1) sum += f(A + i * h) * (i % 2 ? 4 : 2);
    return 2 * ((h / 3) * sum);
  };

  /** Frequência de pequenas oscilações em torno de um mínimo: ω = √(U″/m). */
  const omegaSmall = (U0 = 1, a = 1, m = 1) => Math.sqrt(Upp(a, U0, a) / m);

  /* ---------------------------------------------------------------- */
  /* Poço duplo inclinado: U = U₀[(x²/a² − 1)² + ε x/a]. O termo linear   */
  /* desnivela os dois poços e cria um mínimo metaestável.               */
  /* ---------------------------------------------------------------- */
  const tiltedU = (x, U0 = 1, a = 1, eps = 0) => U(x, U0, a) + (U0 * eps * x) / a;
  const tiltedForce = (x, U0 = 1, a = 1, eps = 0) => force(x, U0, a) - (U0 * eps) / a;
  /** A segunda derivada não vê o termo linear. */
  const tiltedUpp = (x, U0 = 1, a = 1) => Upp(x, U0, a);

  /**
   * Equilíbrios do poço inclinado: raízes de U′ = 0 em [−2a, 2a], por varredura
   * de sinal seguida de bissecção. Cada um vem classificado pelo sinal de U″ e,
   * entre os mínimos, o mais alto é marcado como metaestável.
   */
  const equilibria = (U0 = 1, a = 1, eps = 0) => {
    const f = (x) => tiltedForce(x, U0, a, eps);
    const roots = [];
    const N = 4000, lo = -2 * a, hi = 2 * a;
    let x0 = lo, f0 = f(lo);
    for (let i = 1; i <= N; i += 1) {
      const x1 = lo + ((hi - lo) * i) / N, f1 = f(x1);
      if (f0 === 0) roots.push(x0);
      else if (f0 * f1 < 0) {
        let p = x0, q = x1, fp = f0;
        for (let k = 0; k < 60; k += 1) {
          const m = 0.5 * (p + q), fm = f(m);
          if (fp * fm <= 0) q = m; else { p = m; fp = fm; }
        }
        roots.push(0.5 * (p + q));
      }
      x0 = x1; f0 = f1;
    }
    const pts = roots.map((x) => ({ x, U: tiltedU(x, U0, a, eps), Upp: tiltedUpp(x, U0, a) }));
    const minimos = pts.filter((p) => p.Upp > 0).sort((p, q) => p.U - q.U);
    pts.forEach((p) => {
      if (p.Upp < 0) p.tipo = "instavel";
      else if (Math.abs(p.Upp) < 1e-9) p.tipo = "indiferente";
      else p.tipo = p === minimos[0] ? "estavel" : "metaestavel";
      p.omega = p.Upp > 0 ? Math.sqrt(p.Upp) : 0;   // por unidade de √m
    });
    return pts.sort((p, q) => p.x - q.x);
  };

  /** Barreira a partir de um mínimo: U no máximo vizinho menos U no mínimo. */
  const barrier = (U0 = 1, a = 1, eps = 0) => {
    const eq = equilibria(U0, a, eps);
    const max = eq.find((p) => p.tipo === "instavel");
    const meta = eq.find((p) => p.tipo === "metaestavel");
    const est = eq.find((p) => p.tipo === "estavel");
    if (!max) return { meta: NaN, estavel: NaN, diferenca: NaN };
    return {
      meta: meta ? max.U - meta.U : NaN,
      estavel: est ? max.U - est.U : NaN,
      diferenca: meta && est ? meta.U - est.U : NaN
    };
  };

  /* ---------------------------------------------------------------- */
  /* Física médica: queda e impacto no quadril                           */
  /* ---------------------------------------------------------------- */
  /**
   * Queda da altura h do centro de massa: U = mgh vira T; no impacto, a força
   * média que freia o corpo na distância d sai de F̄·d = mgh (Δ(T+U) = W_nc).
   */
  const fallImpact = (m, h, d, g = 9.8) => {
    const E = m * g * h;
    return { E, v: Math.sqrt(2 * g * h), Fmed: E / d, decel: (2 * g * h) / (2 * d) };
  };
  /** Altura a partir da qual a força média ultrapassa o limiar F_lim, para dado d. */
  const criticalHeight = (Flim, m, d, g = 9.8) => (Flim * d) / (m * g);
  /** Distância de frenagem necessária para ficar no limiar. */
  const requiredCushion = (Flim, m, h, g = 9.8) => (m * g * h) / Flim;

  /* ---------------------------------------------------------------- */
  /* Física médica: trabalho e potência do coração                       */
  /* ---------------------------------------------------------------- */
  const MMHG = 133.322;   // Pa
  /**
   * Trabalho do ventrículo esquerdo por batimento: a parte de pressão–volume,
   * W_p = p̄·ΔV, mais a energia cinética dada ao sangue ejetado, ½ρΔV v².
   */
  const cardiacWork = (pMmHg, dVmL, vEject = 0.5, rho = 1060) => {
    const dV = dVmL * 1e-6;
    const Wp = pMmHg * MMHG * dV;
    const Tk = 0.5 * rho * dV * vEject * vEject;
    return { Wp, Tk, W: Wp + Tk };
  };
  const cardiacPower = (Wbeat, bpm) => (Wbeat * bpm) / 60;

  return { U, force, Upp, turningPoints, confined, speed, excursion, period, omegaSmall,
    tiltedU, tiltedForce, tiltedUpp, equilibria, barrier,
    fallImpact, criticalHeight, requiredCushion, MMHG, cardiacWork, cardiacPower };
});
