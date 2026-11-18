/* Aula 24 — equações de Lagrange. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* --- coordenadas polares: a Aula 3 em duas linhas --- */
  /** ∂L/∂ṙ = mṙ e ∂L/∂r = mrθ̇² − U′(r) dão m(r̈ − rθ̇²) = f(r) = −U′(r). */
  const radialEOM = (r, thd, f, m) => f / m + r * thd * thd;      // devolve r̈
  /** θ ausente de L ⟹ d/dt(mr²θ̇) = 0. */
  const angularMomentum = (m, r, thd) => m * r * r * thd;
  /** d/dt(mr²θ̇) = mr(rθ̈ + 2ṙθ̇): a componente θ de Newton multiplicada por r. */
  const angularEOM = (r, rd, thd, m) => (-2 * m * r * rd * thd) / (m * r * r);   // devolve θ̈
  /** Aceleração polar reconstruída, para comparar com a Aula 3. */
  const polarAcceleration = (r, rd, rdd, thd, thdd) => [rdd - r * thd * thd, r * thdd + 2 * rd * thd];

  /* --- forças generalizadas e dissipação de Rayleigh --- */
  /** ℱ = ½bẋ² dá Q = −∂ℱ/∂ẋ = −bẋ, recuperando o amortecimento da Aula 12. */
  const rayleigh = (b, xd) => 0.5 * b * xd * xd;
  const generalisedForce = (b, xd) => -b * xd;
  /** ẍ obtido de mẍ + bẋ + kx = 0. */
  const dampedAcceleration = (x, xd, m, b, k) => (-b * xd - k * x) / m;
  /**
   * Integra o oscilador amortecido por Runge–Kutta de quarta ordem.
   * Devolve triplas [t, x, ẋ]: a velocidade sai do próprio integrador, e não de
   * uma diferença finita posterior, que seria de primeira ordem e estragaria
   * qualquer verificação de energia.
   */
  const integrate = (x0, v0, m, b, k, tf, n = 4000) => {
    const dt = tf / n;
    const serie = [[0, x0, v0]];
    let x = x0, v = v0;
    const f = (xx, vv) => [vv, dampedAcceleration(xx, vv, m, b, k)];
    for (let i = 1; i <= n; i += 1) {
      const [a1, b1] = f(x, v);
      const [a2, b2] = f(x + (dt / 2) * a1, v + (dt / 2) * b1);
      const [a3, b3] = f(x + (dt / 2) * a2, v + (dt / 2) * b2);
      const [a4, b4] = f(x + dt * a3, v + dt * b3);
      x += (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
      v += (dt / 6) * (b1 + 2 * b2 + 2 * b3 + b4);
      serie.push([i * dt, x, v]);
    }
    return serie;
  };
  /** Energia dissipada acumulada deve igualar a perda de energia mecânica. */
  const mechanicalEnergy = (x, v, m, k) => 0.5 * m * v * v + 0.5 * k * x * x;

  /* --- forças de vínculo pelo multiplicador --- */
  /**
   * Pêndulo com q = (r, θ) sem impor r = ℓ. A equação em r dá
   *   λ = −mℓθ̇² − mg cosθ,
   * e o módulo |λ| é a tração no fio.
   */
  const pendulumLambda = (m, l, th, thd, g = G) => -m * l * thd * thd - m * g * Math.cos(th);
  const pendulumTension = (m, l, th, thd, g = G) => Math.abs(pendulumLambda(m, l, th, thd, g));
  /** θ̇ a partir da energia, soltando do ângulo θ₀ em repouso. */
  const pendulumOmega = (l, th, th0, g = G) => {
    const k = (2 * g / l) * (Math.cos(th) - Math.cos(th0));
    return k <= 0 ? 0 : Math.sqrt(k);
  };

  /** Partícula deslizando na face externa de uma esfera: N = mg(3cosθ − 2cosθ₀). */
  const sphereNormal = (m, th, th0, g = G) => m * g * (3 * Math.cos(th) - 2 * Math.cos(th0));
  /** Desprende-se quando N = 0. Partindo do topo, cosθ = 2/3. */
  const detachAngle = (th0) => Math.acos((2 / 3) * Math.cos(th0));

  return { G, radialEOM, angularMomentum, angularEOM, polarAcceleration, rayleigh, generalisedForce, dampedAcceleration, integrate, mechanicalEnergy, pendulumLambda, pendulumTension, pendulumOmega, sphereNormal, detachAngle };
});
