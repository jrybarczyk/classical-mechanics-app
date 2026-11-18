/* Aula 26 — simetrias e leis de conservação. Funções puras.
   O contraexemplo central é a conta em aro girante: o vínculo é móvel, T deixa de
   ser quadrática homogênea, e h se conserva sem ser a energia mecânica. Aqui isso
   não é afirmado — é integrado e medido. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- momento generalizado e coordenadas cíclicas --- */
  /** Força central: L = ½m(ṙ² + r²θ̇²) − U(r); θ é cíclica. */
  const centralMomenta = (m, r, rd, thd) => ({ p_r: m * rd, p_theta: m * r * r * thd });
  /** Pêndulo com suporte deslizante: X é cíclica, mas p_X envolve a outra coordenada. */
  const slidingMomentumX = (M, m, l, Xd, th, thd) => (M + m) * Xd + m * l * thd * Math.cos(th);
  /** Partícula livre em cilíndricas: φ e z são cíclicas, ρ não. */
  const cylindricalMomenta = (m, rho, rhod, phid, zd) => ({
    p_rho: m * rhod, p_phi: m * rho * rho * phid, p_z: m * zd
  });

  /* --- conta em aro girante: o contraexemplo --- */
  const hoopAccel = (th, m, R, w, g = G) => w * w * Math.sin(th) * Math.cos(th) - (g / R) * Math.sin(th);
  /** h = ½mR²θ̇² − ½mR²ω²sen²θ − mgRcosθ. */
  const hoopH = (th, thd, m, R, w, g = G) =>
    0.5 * m * R * R * thd * thd - 0.5 * m * R * R * w * w * Math.sin(th) ** 2 - m * g * R * Math.cos(th);
  /** E = T + U, com o termo de rotação somando em vez de subtrair. */
  const hoopE = (th, thd, m, R, w, g = G) =>
    0.5 * m * R * R * thd * thd + 0.5 * m * R * R * w * w * Math.sin(th) ** 2 - m * g * R * Math.cos(th);
  /** Integração Runge–Kutta de quarta ordem; devolve [t, θ, θ̇]. */
  const hoopIntegrate = (th0, thd0, m, R, w, tf, n = 4000, g = G) => {
    const dt = tf / n;
    const serie = [[0, th0, thd0]];
    let th = th0, thd = thd0;
    const f = (a, b) => [b, hoopAccel(a, m, R, w, g)];
    for (let i = 1; i <= n; i += 1) {
      const [a1, b1] = f(th, thd);
      const [a2, b2] = f(th + (dt / 2) * a1, thd + (dt / 2) * b1);
      const [a3, b3] = f(th + (dt / 2) * a2, thd + (dt / 2) * b2);
      const [a4, b4] = f(th + dt * a3, thd + dt * b3);
      th += (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
      thd += (dt / 6) * (b1 + 2 * b2 + 2 * b3 + b4);
      serie.push([i * dt, th, thd]);
    }
    return serie;
  };
  /** Amplitude relativa de variação de uma grandeza ao longo da série. */
  const spread = (serie, fn) => {
    const vals = serie.map(([, a, b]) => fn(a, b));
    const min = Math.min(...vals), max = Math.max(...vals);
    const escala = Math.max(...vals.map(Math.abs)) || 1;
    return { min, max, amplitude: max - min, relativa: (max - min) / escala };
  };

  /* --- oscilador forçado: h = E, mas nenhum dos dois se conserva --- */
  const forcedH = (x, xd, t, m, k, F0, w) => 0.5 * m * xd * xd + 0.5 * k * x * x - F0 * Math.cos(w * t) * x;
  /** ∂L/∂t para L = ½mẋ² − ½kx² + xF₀cosωt. */
  const forcedDLdt = (x, t, F0, w) => -F0 * w * Math.sin(w * t) * x;
  /** ḣ = −∂L/∂t = xF₀ω senωt; difere da potência Fẋ por −d(xF)/dt. */
  const forcedHdot = (x, t, F0, w) => -forcedDLdt(x, t, F0, w);
  /** Potência da força externa, Fẋ = dE_osc/dt. */
  const forcedPower = (xd, t, F0, w) => F0 * Math.cos(w * t) * xd;

  /* --- dicionário de Noether --- */
  const noether = [
    ["translação no espaço", "o espaço é homogêneo", "momento linear"],
    ["rotação", "o espaço é isotrópico", "momento angular"],
    ["translação no tempo", "as leis não mudam com t", "energia"]
  ];

  return { G, centralMomenta, slidingMomentumX, cylindricalMomenta, hoopAccel, hoopH, hoopE, hoopIntegrate, spread, forcedH, forcedDLdt, forcedHdot, forcedPower, noether };
});
