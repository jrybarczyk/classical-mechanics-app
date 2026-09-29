/* Aula 3 — cinemática vetorial em bases móveis. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** v = ṙ e_r + rθ̇ e_θ */
  const polarVelocity = (r, rdot, thetadot) => [rdot, r * thetadot];

  /** a = (r̈ − rθ̇²) e_r + (rθ̈ + 2ṙθ̇) e_θ */
  const polarAcceleration = (r, rdot, rddot, thetadot, thetaddot) => [
    rddot - r * thetadot * thetadot,
    r * thetaddot + 2 * rdot * thetadot
  ];

  /**
   * Espiral r = r₀e^{αt}, θ = ωt. Como ṙ = αr e r̈ = α²r, tudo sai em forma
   * fechada e as componentes ficam proporcionais ao próprio raio.
   */
  const spiral = (t, r0, alpha, omega) => {
    const r = r0 * Math.exp(alpha * t);
    const rdot = alpha * r;
    const rddot = alpha * alpha * r;
    const [vr, vt] = polarVelocity(r, rdot, omega);
    const [ar, at] = polarAcceleration(r, rdot, rddot, omega, 0);
    return { r, theta: omega * t, vr, vt, ar, at, speed: Math.hypot(vr, vt) };
  };

  /**
   * Parábola y = x²/(4p) percorrida com x = ut.
   * Escolhida porque a curvatura no vértice vale exatamente ρ = 2p, o que dá
   * um alvo analítico para conferir a decomposição tangencial-normal.
   */
  const parabola = (t, u, p) => {
    const x = u * t;
    const y = (x * x) / (4 * p);
    const vx = u;
    const vy = (u * u * t) / (2 * p);
    const ax = 0;
    const ay = (u * u) / (2 * p);
    const speed = Math.hypot(vx, vy);
    const at = (vx * ax + vy * ay) / speed;                 // projeção sobre e_t
    const an = Math.abs(vx * ay - vy * ax) / speed;         // módulo da parte normal
    const rho = an === 0 ? Infinity : (speed * speed) / an; // raio de curvatura
    return { x, y, vx, vy, ax, ay, speed, at, an, rho };
  };

  /** Raio de curvatura no vértice da parábola: vale 2p, independentemente de u. */
  const vertexCurvature = (p) => 2 * p;

  /** Raio de curvatura da parábola y = x²/(4p) em função de x: ρ = 2p(1 + x²/4p²)^{3/2}. */
  const parabolaCurvature = (x, p) => 2 * p * Math.pow(1 + (x * x) / (4 * p * p), 1.5);

  /**
   * Aceleração em coordenadas esféricas, com θ medido a partir do eixo z.
   * Devolve [a_r, a_θ, a_φ].
   */
  const sphericalAcceleration = (r, rdot, rddot, th, thdot, thddot, phdot, phddot) => [
    rddot - r * thdot * thdot - r * phdot * phdot * Math.sin(th) ** 2,
    r * thddot + 2 * rdot * thdot - r * phdot * phdot * Math.sin(th) * Math.cos(th),
    r * phddot * Math.sin(th) + 2 * rdot * phdot * Math.sin(th) + 2 * r * thdot * phdot * Math.cos(th)
  ];

  /** Base esférica {e_r, e_θ, e_φ} em cartesianas, com θ medido a partir de z. É dextrogira: e_r × e_θ = e_φ. */
  const sphericalBasis = (th, ph) => ({
    er: [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)],
    eth: [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), -Math.sin(th)],
    eph: [-Math.sin(ph), Math.cos(ph), 0]
  });

  /** v = ṙ e_r + rθ̇ e_θ + r senθ φ̇ e_φ. Devolve [v_r, v_θ, v_φ]. */
  const sphericalVelocity = (r, rdot, th, thdot, phdot) => [rdot, r * thdot, r * Math.sin(th) * phdot];

  /**
   * Formiga sobre a bola (Fowles–Cassiday, Problema 1.22, com amplitude A e número
   * de oscilações n livres; o enunciado tem A = 1/2 e n = 4):
   *   r = b,  φ = ωt,  θ = (π/2)[1 + A cos(nωt)].
   * Devolve as coordenadas, suas derivadas, a rapidez e a aceleração [a_r, a_θ, a_φ].
   */
  const antOnBall = (t, b, omega, A, n) => {
    const th = (Math.PI / 2) * (1 + A * Math.cos(n * omega * t));
    const thdot = -(Math.PI / 2) * A * n * omega * Math.sin(n * omega * t);
    const thddot = -(Math.PI / 2) * A * n * n * omega * omega * Math.cos(n * omega * t);
    const ph = omega * t;
    const [, vt, vp] = sphericalVelocity(b, 0, th, thdot, omega);
    const a = sphericalAcceleration(b, 0, 0, th, thdot, thddot, omega, 0);
    return { theta: th, phi: ph, thdot, thddot, speed: Math.hypot(vt, vp), vt, vp, a };
  };

  return { polarVelocity, polarAcceleration, spiral, parabola, vertexCurvature, parabolaCurvature, sphericalAcceleration, sphericalBasis, sphericalVelocity, antOnBall };
});
