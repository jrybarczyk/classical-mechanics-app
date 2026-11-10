/* Aula 7 — movimento em duas e três dimensões, com arrasto linear. Funções puras.
   Todo o conteúdo desta aula depende de um único fato: com arrasto linear as
   componentes ainda desacoplam, e cada uma reproduz o problema da Aula 6. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;
  const rad = (g) => (g * Math.PI) / 180;

  /* --- sem arrasto --- */
  const vacuumRange = (v0, alphaDeg, g = G) => (v0 * v0 * Math.sin(2 * rad(alphaDeg))) / g;
  const vacuumApex = (v0, alphaDeg, g = G) => (v0 * v0 * Math.sin(rad(alphaDeg)) ** 2) / (2 * g);
  const vacuumTime = (v0, alphaDeg, g = G) => (2 * v0 * Math.sin(rad(alphaDeg))) / g;

  /* --- arrasto linear, eixo y para cima --- */
  /* Usa expm1 em vez de 1 − exp(−t/τ): para τ grande o argumento é minúsculo e a
     forma direta cancela dígitos significativos, deslocando o alcance na terceira
     casa mesmo no limite em que ele deveria reproduzir o vácuo exatamente. */
  const dragX = (t, v0x, tau) => -tau * v0x * Math.expm1(-t / tau);
  const dragY = (t, v0y, tau, g = G) => {
    const vT = g * tau;
    return -vT * t - tau * (v0y + vT) * Math.expm1(-t / tau);
  };
  const dragVx = (t, v0x, tau) => v0x * Math.exp(-t / tau);
  const dragVy = (t, v0y, tau, g = G) => {
    const vT = g * tau;
    return -vT + (v0y + vT) * Math.exp(-t / tau);
  };
  /* --- gotícula ejetada no ar: o mesmo arrasto linear, em escala micrométrica --- */
  /**
   * Tempo característico de uma esfera sob arrasto de Stokes: τ = m/b, com
   * m = (4/3)πR³ρ e b = 6πηR, o que dá τ = 2ρR²/9η. O ponto é a dependência em R²:
   * dividir o raio por dez divide τ por cem.
   */
  const stokesTau = (R, rho = 1000, eta = 1.8e-5) => (2 * rho * R * R) / (9 * eta);

  /** Velocidade terminal correspondente, v_T = gτ. */
  const terminalSpeed = (tau, g = G) => g * tau;

  /**
   * Tempo para vencer uma altura h já em regime terminal. É estimativa, e vale
   * quando τ é muito menor que o tempo de queda — o caso das gotículas finas.
   * A estação compara este valor com o exato para mostrar onde ela deixa de servir.
   */
  const settlingTime = (h, vT) => h / vT;

  /** Tempo de queda exato de uma altura h, por bisseção sobre a solução com arrasto. */
  const fallTime = (h, v0y, tau, g = G) => {
    let lo = 0, hi = 1;
    while (dragY(hi, v0y, tau, g) > -h && hi < 1e7) hi *= 2;
    for (let i = 0; i < 90; i += 1) {
      const mid = (lo + hi) / 2;
      if (dragY(mid, v0y, tau, g) > -h) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  /** O alcance horizontal é limitado mesmo em queda indefinida. */
  const horizontalLimit = (v0x, tau) => tau * v0x;

  /** Tempo de voo por bisseção: y(t) = 0 com t > 0. */
  const flightTime = (v0, alphaDeg, tau, g = G) => {
    const v0y = v0 * Math.sin(rad(alphaDeg));
    if (v0y <= 0) return 0;
    const f = (t) => dragY(t, v0y, tau, g);
    let hi = (2 * v0y) / g;
    for (let i = 0; i < 80 && f(hi) > 0; i += 1) hi *= 1.5;
    let lo = hi / 1.5 ** 2;
    if (f(lo) < 0) lo = 1e-9;
    for (let i = 0; i < 200; i += 1) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  /** Alcance exato (numérico) com arrasto linear. */
  const dragRange = (v0, alphaDeg, tau, g = G) =>
    dragX(flightTime(v0, alphaDeg, tau, g), v0 * Math.cos(rad(alphaDeg)), tau);

  /**
   * Correção de primeira ordem em 1/τ, deduzida na aula:
   *   R ≈ R₀(1 − 4v₀ᵧ/3gτ) = R₀(1 − 4v₀ᵧ/3v_T).
   * Ela vale enquanto v₀ᵧ ≪ v_T; a estação 3 mede exatamente onde ela falha.
   */
  const rangeFirstOrder = (v0, alphaDeg, tau, g = G) => {
    const v0y = v0 * Math.sin(rad(alphaDeg));
    return vacuumRange(v0, alphaDeg, g) * (1 - (4 * v0y) / (3 * g * tau));
  };

  /** Ângulo que maximiza o alcance, por varredura. Sem arrasto dá 45°. */
  const optimalAngle = (v0, tau, g = G) => {
    let melhor = 1, melhorR = -Infinity;
    for (let a = 1; a <= 89; a += 0.25) {
      const R = dragRange(v0, a, tau, g);
      if (R > melhorR) { melhorR = R; melhor = a; }
    }
    return { angulo: melhor, alcance: melhorR };
  };

  /* --- física médica: manchas de sangue, infusão, elétron em campo uniforme --- */

  /**
   * Gota lançada de altura h com rapidez v0 e ângulo alpha (graus, positivo para
   * cima), sem arrasto. Devolve tempo de voo, distância horizontal d, ângulo de
   * impacto beta com a superfície (graus) e a razão largura/comprimento da mancha
   * elíptica, w/ℓ = sin β (relação usada em perícia).
   */
  const bloodDrop = (v0, alphaDeg, h, g = G) => {
    const a = rad(alphaDeg), vx = v0 * Math.cos(a), vy0 = v0 * Math.sin(a);
    const t = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * h)) / g;
    const vyImp = vy0 - g * t;                  // negativa: para baixo
    const beta = Math.atan2(-vyImp, vx);
    const d = vx * t;
    return { t, d, betaGraus: (beta * 180) / Math.PI, razaoWL: Math.sin(beta), vImpacto: Math.hypot(vx, vyImp) };
  };

  /**
   * Padrão de manchas num anteparo horizontal: n gotas partem da mesma origem
   * (altura h, ângulo alpha) com azimutes em ±30° e rapidez entre 0,7 e 1,3 v0,
   * de forma determinística. Devolve, para cada gota, o azimute phi, a distância
   * d no piso, o ângulo de impacto e w/ℓ.
   */
  /* n = 24 é o padrão da função; a estação (scene.js) passa n = 26 explicitamente. */
  const spatterPattern = (v0, alphaDeg, h, n = 24) => {
    const rnd = (i, k) => { const q = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return q - Math.floor(q); };
    const out = [];
    for (let i = 0; i < n; i++) {
      const phi = ((i + 0.5) / n - 0.5) * (Math.PI / 3) + (rnd(i, 1) - 0.5) * 0.08;
      const vi = v0 * (0.7 + 0.6 * rnd(i, 2));
      const r = bloodDrop(vi, alphaDeg, h);
      out.push({ phi, v: vi, d: r.d, betaGraus: r.betaGraus, razaoWL: r.razaoWL });
    }
    return out;
  };

  /**
   * Reconstrução pericial por linha reta ("stringing"): a altura de origem é
   * estimada como d·tan β, como se a gota viajasse em linha reta. Como a
   * trajetória é parabólica, a estimativa supera a altura real; para lançamento
   * horizontal dá exatamente 2h.
   */
  const stringingHeight = (d, betaGraus) => d * Math.tan(rad(betaGraus));

  /**
   * Velocidade terminal de uma gota em regime quadrático (Re ~ 10²–10³):
   * v_T = sqrt(8 ρ_s R g / (3 ρ_ar C_d)), com C_d ≈ 0,5 para esfera. A razão
   * (v/v_T)² mede o arrasto em unidades de g e diz se desprezá-lo é aceitável.
   */
  const quadraticTerminal = (R, rhoS = 1060, rhoAr = 1.2, Cd = 0.5, g = G) => Math.sqrt((8 * rhoS * R * g) / (3 * rhoAr * Cd));

  /** Jato horizontal: u = Q/A sai de altura H e cai como projétil; alcance x = u·sqrt(2H/g). */
  const jetSpeed = (Q, d) => Q / (Math.PI * d * d / 4);
  const jetRange = (u, H, g = G) => u * Math.sqrt((2 * H) / g);
  /** Problema inverso (medidor de vazão por projétil): Q = A·x·sqrt(g/2H). */
  const flowFromRange = (x, H, d, g = G) => (Math.PI * d * d / 4) * x * Math.sqrt(g / (2 * H));
  /** Reynolds no cateter, ρud/η, com água/soro: ρ = 1000 kg/m³, η = 1,0·10⁻³ Pa·s. */
  const catheterReynolds = (u, d, rho = 1000, eta = 1.0e-3) => (rho * u * d) / eta;
  /** Gotejamento: equipo de macrogotas com 20 gotas/mL. Devolve gotas/min e intervalo (s). */
  const dripRate = (Q_mLh, gotasPorML = 20) => {
    const gpm = (Q_mLh * gotasPorML) / 60;
    return { gotasPorMin: gpm, intervalo: gpm > 0 ? 60 / gpm : Infinity };
  };
  /** Queda livre de h: t = sqrt(2h/g). */
  const freeFallTime = (h, g = G) => Math.sqrt((2 * h) / g);

  /* Elétron: carga e massa. */
  const E_CHARGE = 1.602e-19, E_MASS = 9.109e-31, C_LUZ = 2.998e8;
  /** Rapidez clássica após tensão aceleradora V (volts): v = sqrt(2eV/m). */
  const electronSpeed = (V) => Math.sqrt((2 * E_CHARGE * V) / E_MASS);
  /**
   * Deflexão eletrostática: placas de comprimento L separadas por d com tensão U;
   * campo E = U/d, aceleração a = eE/m. Dentro das placas o elétron é um projétil
   * com g → a: y = ½a(L/v)², tan θ = aL/v². Como v² = 2eV/m, a razão e/m cancela:
   * y = U L² / (4 V d). Após um trecho livre D, a deflexão na tela é y + D·tan θ.
   */
  const electrostaticDeflection = (V, U, L, d, D) => {
    const v = electronSpeed(V), a = (E_CHARGE * U) / (d * E_MASS);
    const tVoo = L / v, y = 0.5 * a * tVoo * tVoo, tanTheta = (a * L) / (v * v);
    return { v, a, y, tanTheta, thetaGraus: (Math.atan(tanTheta) * 180) / Math.PI, Y: y + D * tanTheta, yFormula: (U * L * L) / (4 * V * d) };
  };
  /** Raio de curvatura em campo magnético B (clássico): r = mv/(eB); a_c = v²/r. */
  const magneticRadius = (v, B) => (E_MASS * v) / (E_CHARGE * B);

  return { G, rad, vacuumRange, vacuumApex, vacuumTime, dragX, dragY, dragVx, dragVy, horizontalLimit, flightTime, dragRange, rangeFirstOrder, optimalAngle, stokesTau, terminalSpeed, settlingTime, fallTime,
    bloodDrop, spatterPattern, stringingHeight, quadraticTerminal, jetSpeed, jetRange, flowFromRange, catheterReynolds, dripRate, freeFallTime,
    E_CHARGE, E_MASS, C_LUZ, electronSpeed, electrostaticDeflection, magneticRadius };
});
