/* Aula 30 — parênteses de Poisson e síntese do curso. Somente funções puras.
   Convenção: um ponto do espaço de fase é o vetor z = [q₁…q_n, p₁…p_n]. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const HH = 1e-5;

  /** Derivada parcial central de f em relação à componente a de z. */
  const partial = (f, z, a, h = HH) => {
    const up = z.slice(), down = z.slice();
    up[a] += h; down[a] -= h;
    return (f(up) - f(down)) / (2 * h);
  };

  /** [f,g] = Σᵢ (∂f/∂qᵢ ∂g/∂pᵢ − ∂f/∂pᵢ ∂g/∂qᵢ). */
  const poisson = (f, g, z, h = HH) => {
    const n = z.length / 2;
    let s = 0;
    for (let i = 0; i < n; i += 1) {
      s += partial(f, z, i, h) * partial(g, z, n + i, h) - partial(f, z, n + i, h) * partial(g, z, i, h);
    }
    return s;
  };

  /** Parêntese fundamental [z_a, z_b]: vale δ entre um q e o seu p, zero no resto. */
  const fundamental = (a, b, n) => {
    const qa = a < n, qb = b < n;
    if (qa && qb) return 0;
    if (!qa && !qb) return 0;
    return qa ? (b - n === a ? 1 : 0) : (a - n === b ? -1 : 0);
  };
  const kronecker = (i, j) => (i === j ? 1 : 0);
  /** Símbolo de Levi-Civita, o mesmo da Aula 2 — reaparece na álgebra do momento angular. */
  const levi = (i, j, k) => {
    if (i === j || j === k || i === k) return 0;
    return ((i > j ? 1 : 0) + (i > k ? 1 : 0) + (j > k ? 1 : 0)) % 2 === 0 ? 1 : -1;
  };

  /* --- observáveis de uma partícula em três dimensões: z = [x,y,z,px,py,pz] --- */
  const radius = (z) => Math.hypot(z[0], z[1], z[2]);
  /** Componente i do momento angular ℓ = r × p, com i em {0,1,2}. */
  const angular = (i) => (z) => {
    const j = (i + 1) % 3, k = (i + 2) % 3;
    return z[j] * z[3 + k] - z[k] * z[3 + j];
  };
  /** Potencial central U(r) = −k/rⁿ. Com n = 1 é Kepler. */
  const potential = (r, k, n) => -k / Math.pow(r, n);
  const hamiltonian = (m, k, n) => (z) =>
    (z[3] * z[3] + z[4] * z[4] + z[5] * z[5]) / (2 * m) + potential(radius(z), k, n);
  /** Componente i do vetor de Laplace–Runge–Lenz A = p × ℓ − mk r̂. */
  const runge = (i, m, k) => (z) => {
    const j = (i + 1) % 3, l = (i + 2) % 3;
    const L = [angular(0)(z), angular(1)(z), angular(2)(z)];
    return z[3 + j] * L[l] - z[3 + l] * L[j] - (m * k * z[i]) / radius(z);
  };
  const speedSquared = (z) => z[3] * z[3] + z[4] * z[4] + z[5] * z[5];

  /* --- fluxo canônico ż_a = {z_a, H}, integrado por Runge–Kutta de 4ª ordem --- */
  const canonical = (H) => (z) => {
    const n = z.length / 2;
    const out = new Array(z.length);
    for (let i = 0; i < n; i += 1) {
      out[i] = partial(H, z, n + i);
      out[n + i] = -partial(H, z, i);
    }
    return out;
  };
  const rk4 = (dz, z, dt) => {
    const add = (a, b, s) => a.map((x, i) => x + b[i] * s);
    const k1 = dz(z), k2 = dz(add(z, k1, dt / 2)), k3 = dz(add(z, k2, dt / 2)), k4 = dz(add(z, k3, dt));
    return z.map((x, i) => x + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  /** Avança um intervalo T com RK4 de passo adaptativo (duplicação de passo).
      O passo encolhe sozinho perto do centro de força, onde a órbita é rápida:
      com passo fixo, pericentros pequenos (n ≳ 1,6) destruíam a conservação de H. */
  const rk4Adaptive = (dz, z, T, tol = 1e-11) => {
    let t = 0, h = T, cur = z;
    while (t < T) {
      h = Math.min(h, T - t);
      const big = rk4(dz, cur, h);
      const half = rk4(dz, rk4(dz, cur, h / 2), h / 2);
      let err = 0, esc = 1;
      for (let i = 0; i < cur.length; i += 1) {
        err = Math.max(err, Math.abs(half[i] - big[i]));
        esc = Math.max(esc, Math.abs(half[i]));
      }
      err /= esc;
      if (err <= tol || h < 1e-9) {
        cur = half.map((x, i) => x + (x - big[i]) / 15); /* extrapolação de Richardson */
        t += h;
        h *= err > 0 ? Math.min(2, 0.9 * Math.pow(tol / err, 0.2)) : 2;
      } else {
        h *= Math.max(0.2, 0.9 * Math.pow(tol / err, 0.2));
      }
    }
    return cur;
  };
  /** Trajetória amostrada; devolve os estados em t = 0, dt, 2dt, … */
  const trajectory = (z0, H, dt, steps) => {
    const dz = canonical(H);
    const out = [z0.slice()];
    let z = z0.slice();
    for (let i = 0; i < steps; i += 1) { z = rk4Adaptive(dz, z, dt); out.push(z.slice()); }
    return out;
  };
  /** Amostra a trajetória em um instante qualquer, por interpolação linear. */
  const at = (path, dt, t) => {
    const x = Math.min(Math.max(t / dt, 0), path.length - 1.0001);
    const i = Math.floor(x), f = x - i;
    return path[i].map((v, a) => v + (path[i + 1][a] - v) * f);
  };

  /* --- equação de Liouville: ∂ρ/∂t = [H,ρ] --- */
  const oscHamiltonian = (m, w) => (z) => (z[1] * z[1]) / (2 * m) + 0.5 * m * w * w * z[0] * z[0];
  /** Densidade canônica ρ ∝ e^(−H/kT), deformada pelo fator e^(λq), que não é função de H.
      Forma exponencial: ρ > 0 em todo o plano, para qualquer λ. Analiticamente,
      [H,ρ] = −λ (p/m) ρ. */
  const density = (m, w, kT, lambda) => (z) =>
    Math.exp(-oscHamiltonian(m, w)(z) / kT + lambda * z[0]);
  /** ∂ρ/∂t no ponto z. Nulo em todo lugar se e somente se ρ depender de z só através de H. */
  const drhoDt = (z, m, w, kT, lambda) => poisson(oscHamiltonian(m, w), density(m, w, kT, lambda), z, 1e-4);
  /** Máximo de |∂ρ/∂t| sobre a grade do mapa (|q| ≤ 4,8, |p| ≤ 3). */
  const maxDrhoDt = (m, w, kT, lambda) => {
    let mx = 0;
    for (let i = -12; i <= 12; i += 1) {
      for (let j = -8; j <= 8; j += 1) mx = Math.max(mx, Math.abs(drhoDt([(i * 4.8) / 12, (j * 3) / 8], m, w, kT, lambda)));
    }
    return mx;
  };

  return {
    partial, poisson, fundamental, kronecker, levi,
    radius, angular, potential, hamiltonian, runge, speedSquared,
    canonical, trajectory, at,
    oscHamiltonian, density, drhoDt, maxDrhoDt
  };
});
