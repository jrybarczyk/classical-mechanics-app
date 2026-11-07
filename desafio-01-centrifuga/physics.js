/* Desafio 1 — a amostra de sangue na centrífuga. Funções puras e o gabarito
   das dez fases, encadeadas: cada fase usa um resultado da anterior. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DesafioPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;

  /* Dados fixos do problema (uma amostra, um rotor, um laboratório). */
  const D = {
    R: 3.5e-6,        // raio da hemácia (m)
    dRho: 80,         // ρ_hemácia − ρ_plasma (kg/m³)
    rhoP: 1025,       // densidade do plasma (kg/m³)
    eta: 1.2e-3,      // viscosidade do plasma (Pa·s)
    L: 0.02,          // percurso no tubo (m)
    rpm: 3000,        // rotação do protocolo
    r: 0.10,          // raio efetivo do rotor (m)
    mTubo: 0.020,     // tubo com 5 mL de sangue (kg)
    I: 0.05,          // momento de inércia do rotor (kg·m²)
    tAcel: 20,        // tempo para atingir a rotação (s)
    M: 2.0,           // massa do rotor (kg)
    h: 0.8            // altura do rotor acima do piso (m)
  };

  /* Fase 1 — escalas (Aula 1): Reynolds da hemácia sedimentando. */
  const stokesTerminal = (R, dRho, eta, g = G) => (2 * R * R * dRho * g) / (9 * eta);
  const reynolds = (rho, v, L, eta) => (rho * v * L) / eta;
  /* Fase 3 — cinemática circular (Aula 3). */
  const omega = (rpm) => (2 * Math.PI * rpm) / 60;
  /* Fase 5 — vetores (Aula 2): gravidade efetiva no referencial do tubo. */
  const gEfetiva = (ac, g = G) => ({ modulo: Math.hypot(g, ac), anguloGraus: (Math.atan(g / ac) * 180) / Math.PI });
  /* Fase 6 — referencial girante (Aula 10): Coriolis sobre a hemácia que sedimenta. */
  const coriolis = (om, v) => 2 * om * v;
  /* Fase 7 — energia (Aula 5). */
  const energiaRotor = (I, om) => 0.5 * I * om * om;
  /* Fase 8 — sistemas de partículas (Aula 9): tubo oposto vazio desloca o CM. */
  const excentricidade = (m, r, M) => (m * r) / M;
  /* Fase 9 — movimento em 2D (Aula 7): gota que escapa tangencialmente. */
  const alcance = (v, h, g = G) => v * Math.sqrt((2 * h) / g);

  /* O gabarito encadeado. */
  const gabarito = () => {
    const vT = stokesTerminal(D.R, D.dRho, D.eta);
    const Re = reynolds(D.rhoP, vT, D.R, D.eta);
    const om = omega(D.rpm), ac = om * om * D.r, rcf = ac / G, vtan = om * D.r;
    const N = D.mTubo * ac;
    const ge = gEfetiva(ac);
    const vSed = vT * rcf, aCor = coriolis(om, vSed);
    const Ek = energiaRotor(D.I, om);
    const e = excentricidade(D.mTubo, D.r, D.M), Fdes = D.mTubo * D.r * om * om;
    const tq = Math.sqrt((2 * D.h) / G);
    return {
      f1: { Re, modelo: "linear" },
      f2: { vT, vTmmh: vT * 3.6e6, tGravH: D.L / vT / 3600 },
      f3: { omega: om, ac, rcf, vtan },
      f4: { N, razaoPeso: N / (D.mTubo * G) },
      f5: { gef: ge.modulo, angulo: ge.anguloGraus },
      f6: { vSedmms: vSed * 1e3, aCor, razaoCor: aCor / ac },
      f7: { Ek, Pmed: Ek / D.tAcel },
      f8: { emm: e * 1e3, Fdes },
      f9: { vtan, tQueda: tq, alcance: alcance(vtan, D.h) },
      f10: { tCentr: D.L / vSed, razaoTempos: (D.L / vT) / (D.L / vSed) }
    };
  };

  /**
   * Leitura tolerante de números digitados: vírgula decimal, notação científica
   * ('5,3e-6', '5,3·10^-6', '5,3×10⁻⁶', '5,3 x 10^-6'), espaços.
   */
  const lerNumero = (txt) => {
    if (txt === null || txt === undefined) return NaN;
    let s = String(txt).trim().toLowerCase();
    if (!s) return NaN;
    const sup = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => sup[c]);
    s = s.replace(/\s+/g, "").replace(/,/g, ".").replace(/−/g, "-");
    s = s.replace(/[·×x\*]10\^?(-?\d+)/g, "e$1");           // 5.3·10^-6 → 5.3e-6
    s = s.replace(/^10\^(-?\d+)$/, "1e$1");               // 10^-6 → 1e-6 (mas 1007 fica 1007)
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  };

  /** Resposta aceita se |dado − certo| ≤ tol·|certo| (tolerância relativa). */
  const confere = (dado, certo, tol) => Number.isFinite(dado) && Math.abs(dado - certo) <= tol * Math.abs(certo);

  return { G, D, stokesTerminal, reynolds, omega, gEfetiva, coriolis, energiaRotor, excentricidade, alcance, gabarito, lerNumero, confere };
});
