/* Aula 6 — forças dependentes da velocidade. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- arrasto linear: mv̇ = mg − bv --- */
  const tau = (m, b) => m / b;
  const terminalLinear = (m, b, g = G) => (m * g) / b;
  const vLinear = (t, vT, tauv) => vT * (1 - Math.exp(-t / tauv));
  const xLinear = (t, vT, tauv) => vT * (t - tauv * (1 - Math.exp(-t / tauv)));
  /** Tempo para atingir uma fração f da velocidade terminal: t = −τ ln(1−f). */
  const timeToFraction = (f, tauv) => (f >= 1 ? Infinity : -tauv * Math.log(1 - f));

  /* --- arrasto quadrático: mv̇ = mg − cv² --- */
  const terminalQuadratic = (m, c, g = G) => Math.sqrt((m * g) / c);
  const vQuadratic = (t, vT, g = G) => vT * Math.tanh((g * t) / vT);

  /* --- regime de Stokes --- */
  /** Coeficiente calculado pela hidrodinâmica, não ajustado: b = 6πηR. */
  const stokesB = (eta, R) => 6 * Math.PI * eta * R;
  /** v_T = 2R²(ρp − ρf)g / 9η, já com o empuxo incluído no peso aparente. */
  const stokesTerminal = (R, dRho, eta, g = G) => (2 * R * R * dRho * g) / (9 * eta);
  /** Tempo de relaxação da esfera de Stokes: τ = m/b, minúsculo nessa escala. */
  const stokesTau = (R, rhoP, eta) => ((4 / 3) * Math.PI * R ** 3 * rhoP) / stokesB(eta, R);
  const reynolds = (rho, v, L, eta) => (rho * v * L) / eta;
  const toMillimetresPerHour = (v) => v * 3.6e6;

  /**
   * Euler explícito para o arrasto quadrático, com o erro medido contra a
   * solução analítica em tanh. Devolve a série e o erro máximo relativo.
   */
  const eulerQuadratic = (dt, tFinal, m, c, g = G) => {
    const vT = terminalQuadratic(m, c, g);
    const serie = [[0, 0]];
    let v = 0;
    let erro = 0;
    const n = Math.max(1, Math.round(tFinal / dt));
    for (let i = 1; i <= n; i += 1) {
      v += (dt / m) * (m * g - c * Math.abs(v) * v);
      const t = i * dt;
      serie.push([t, v]);
      erro = Math.max(erro, Math.abs(v - vQuadratic(t, vT, g)) / vT);
    }
    return { serie, erroMaximo: erro, vT };
  };

  /* --- arrasto linear com condição inicial arbitrária (Fig. 2.6 de Thornton–Marion) --- */
  /** v(t) = v_T + (v₀ − v_T) e^{−t/τ}: a diferença para v_T decai com τ, qualquer que seja v₀. */
  const vLinearGeneral = (t, vT, tauv, v0) => vT + (v0 - vT) * Math.exp(-t / tauv);
  const xLinearGeneral = (t, vT, tauv, v0) => vT * t + (v0 - vT) * tauv * (1 - Math.exp(-t / tauv));
  /** Tempo para a diferença |v − v_T| cair a uma fração f do valor inicial: −τ ln f. */
  const timeToShrink = (f, tauv) => (f <= 0 ? Infinity : -tauv * Math.log(f));

  /* --- projétil com arrasto linear: solução exata e perturbação em k (TM, Exemplo 2.7) --- */
  const projectileLinear = (v0, thetaDeg, k, g = G) => {
    const th = (thetaDeg * Math.PI) / 180;
    const U = v0 * Math.cos(th), V = v0 * Math.sin(th);
    const T0 = (2 * V) / g, R0 = U * T0, H0 = (V * V) / (2 * g);
    const eps = (k * V) / g;
    const Tlin = T0 * (1 - eps / 3), Rlin = R0 * (1 - (4 * eps) / 3), Hlin = H0 * (1 - (2 * eps) / 3);
    if (k <= 0) return { U, V, eps, T0, R0, H0, T: T0, R: R0, H: H0, Tlin: T0, Rlin: R0, Hlin: H0 };
    const x = (t) => (U / k) * (1 - Math.exp(-k * t));
    const y = (t) => (-g / k) * t + ((k * V + g) / (k * k)) * (1 - Math.exp(-k * t));
    /* y(T) = 0 é transcendente: bissecção em (0, T0], pois o arrasto só encurta o voo. */
    let lo = 1e-9, hi = T0;
    for (let i = 0; i < 80; i += 1) { const m = 0.5 * (lo + hi); if (y(m) > 0) lo = m; else hi = m; }
    const T = 0.5 * (lo + hi);
    const tm = Math.log(1 + (k * V) / g) / k;
    const H = V / k - (g * tm) / k;
    return { U, V, eps, T0, R0, H0, T, R: x(T), H, Tlin, Rlin, Hlin, x, y };
  };

  /* --- física médica: aerossóis inalados sedimentando no ar --- */
  const ETA_AR = 1.8e-5, RHO_AR = 1.2;
  /**
   * Partícula esférica de diâmetro d (m) e densidade ρp no ar: v_T de Stokes e a fração
   * depositada por sedimentação num conduto horizontal de diâmetro D durante o tempo t,
   * no modelo mais simples P = v_T t / D (limitado a 1).
   */
  const aerosolSettling = (d, rhoP, D, t, eta = ETA_AR, rhoF = RHO_AR, g = G) => {
    const R = d / 2;
    const vT = stokesTerminal(R, rhoP - rhoF, eta, g);
    return { vT, tauP: stokesTau(R, rhoP, eta), Re: reynolds(rhoF, vT, d, eta),
      tQueda: D / vT, fracao: Math.min(1, (vT * t) / D) };
  };

  /* --- física médica: centrifugação de sangue --- */
  /** Ω em rad/s, aceleração centrífuga Ω²r e o "RCF" em múltiplos de g. */
  const centrifuge = (rpm, r, g = G) => {
    const omega = (2 * Math.PI * rpm) / 60;
    const a = omega * omega * r;
    return { omega, a, rcf: a / g };
  };
  /** Sedimentação de Stokes com g → Ω²r: tempo para percorrer L e Reynolds. */
  const centrifugeSettling = (R, dRho, eta, rpm, r, L, rhoF = 1025) => {
    const c = centrifuge(rpm, r);
    const v = stokesTerminal(R, dRho, eta, c.a);
    const vg = stokesTerminal(R, dRho, eta);
    return { ...c, v, vg, tempo: L / v, tempoG: L / vg, Re: reynolds(rhoF, v, R, eta) };
  };

  return { G, tau, terminalLinear, vLinear, xLinear, timeToFraction, terminalQuadratic, vQuadratic, stokesB, stokesTerminal, stokesTau, reynolds, toMillimetresPerHour, eulerQuadratic,
    vLinearGeneral, xLinearGeneral, timeToShrink, projectileLinear, ETA_AR, RHO_AR, aerosolSettling, centrifuge, centrifugeSettling };
});
