/* Desafio 2 — Artemis II: ida e volta à Lua em trajetória de retorno livre.
   Funções puras, dados fixos e o gabarito das dez fases, encadeadas: cada
   fase usa um resultado de uma fase anterior. Unidades internas: km, s, kg
   (a maré e a queima usam m e m/s, convertidos explicitamente).

   Notação (NOTACAO.md, Thornton–Marion): τ período, ε excentricidade,
   ℓ momento angular por unidade de massa (aqui r·v nos ápsides), T energia
   cinética, U potencial, θ ângulo de deflexão (espalhamento). O parâmetro
   gravitacional é escrito GM: a astrodinâmica o chama de μ, mas aqui μ é a
   massa reduzida. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DesafioPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const GRAU = Math.PI / 180;

  /* Dados fixos do problema (constantes e números divulgados da missão). */
  const D = {
    GM: 398600,        // GM da Terra (km³/s²)
    R: 6371,           // raio médio da Terra (km)
    GML: 4902.8,       // GM da Lua (km³/s²)
    RL: 1737.4,        // raio da Lua (km)
    dTL: 384400,       // distância média Terra–Lua (km)
    q: 0.0123,         // M_L/M_⊕
    g0: 9.80665,       // gravidade padrão (m/s²), define o impulso específico
    hp: 192,           // altitude do perigeu da órbita alta (km)
    ha: 70174,         // altitude do apogeu da órbita alta (km)
    m0: 26300,         // massa da Orion (CM + ESM) no início da injeção (kg), aproximada
    F: 26.7e3,         // empuxo do motor principal do ESM (N), catálogo, aproximado
    Isp: 316,          // impulso específico do motor (s), catálogo, aproximado
    raAlt: 420000,     // apogeu alternativo para comparar o tempo de voo (km)
    hL: 6545,          // altitude do perilúnio (km)
    vpL: 1.403,        // velocidade no perilúnio relativa à Lua (km/s)
    hCorpo: 1.8,       // altura do astronauta (m)
    hEI: 122,          // altitude da interface de reentrada (km) = 400 000 ft
    rMax: 406771,      // distância máxima da Terra (km), tomada ao centro da Terra
    mCap: 9300         // massa da cápsula na reentrada (kg), aproximada
  };

  /* Números divulgados do voo real (1 a 11 de abril de 2026), só para comparação. */
  const REAL = {
    tauHEO: 23.5,      // período da órbita alta (h)
    tQueima: 350,      // duração da injeção translunar (s)
    tVoo: 95.2,        // da injeção (2/4 23:49) à maior aproximação (6/4 23:00), h
    tSOI: 18.42,       // da maior aproximação à saída da esfera de influência (7/4 17:25), h
    tRetorno: 96.9,    // da maior aproximação à interface de reentrada (10/4 23:53), h
    vEI: 11.03,        // velocidade máxima na reentrada (km/s), 24 664 mph
    apollo13: 400171   // recorde anterior de distância (km)
  };

  /* ---- Fases 1 e 2: elipse kepleriana (Aulas 17 e 19) ---- */
  const semieixo = (rp, ra) => (rp + ra) / 2;
  const excentricidade = (rp, ra) => (ra - rp) / (ra + rp);
  const periodo = (a, GM = D.GM) => 2 * Math.PI * Math.sqrt(a * a * a / GM);
  const visViva = (r, a, GM = D.GM) => Math.sqrt(GM * (2 / r - 1 / a));
  /* ---- Fase 4: equação do foguete (Aula 9) ---- */
  const propelente = (m0, dv, u) => m0 * (1 - Math.exp(-dv / u));
  /* ---- Fase 5: equação de Kepler, tempo do perigeu até o raio r (Aula 19) ---- */
  const tempoAteRaio = (rp, ra, r, GM = D.GM) => {
    const a = semieixo(rp, ra), e = excentricidade(rp, ra);
    const E = Math.acos((1 - r / a) / e);           // anomalia excêntrica
    return (E - e * Math.sin(E)) / Math.sqrt(GM / (a * a * a));
  };
  /* ---- Fase 6: onde a Lua manda (Aula 16) ---- */
  const pontoEquilibrio = (d, q) => d / (1 + Math.sqrt(q));
  const raioSOI = (d, q) => d * Math.pow(q, 0.4);
  /* ---- Fases 7 e 8: hipérbole em torno da Lua (Aula 18 e complemento da 19) ---- */
  const vInfinito = (vp, rp, GM) => Math.sqrt(vp * vp - 2 * GM / rp);
  const excHiperbole = (rp, vinf, GM) => 1 + rp * vinf * vinf / GM;
  const deflexao = (e) => 2 * Math.asin(1 / e);
  const parametroImpacto = (rp, vinf, GM) => rp * Math.sqrt(1 + 2 * GM / (rp * vinf * vinf));
  /* Kepler hiperbólico: r = a(ε cosh H − 1), t = (ε sinh H − H)/n, a = GM/v∞². */
  const tempoHiperbole = (r, vinf, e, GM) => {
    const a = GM / (vinf * vinf), H = Math.acosh((r / a + 1) / e);
    return (e * Math.sinh(H) - H) / Math.sqrt(GM / (a * a * a));
  };
  /* ---- Fase 9: aceleração de maré ao longo de um corpo de comprimento h (Aula 16) ---- */
  const mare = (GMsi, r_m, h_m) => 2 * GMsi * h_m / (r_m * r_m * r_m);

  /* O gabarito encadeado. */
  const gabarito = () => {
    /* Fase 1 — órbita alta. */
    const rp = D.R + D.hp, ra = D.R + D.ha;
    const a = semieixo(rp, ra), eps = excentricidade(rp, ra), tau = periodo(a);
    /* Fase 2 — velocidades nos ápsides (usa a da fase 1). */
    const vp = visViva(rp, a), va = visViva(ra, a);
    /* Fase 3 — injeção translunar no perigeu (usa vp da fase 2). */
    const aT = semieixo(rp, D.dTL), vTLI = visViva(rp, aT), dv = vTLI - vp;
    const vc = Math.sqrt(D.GM / rp), dvCirc = vTLI - vc;
    /* Fase 4 — a queima (usa Δv da fase 3). */
    const u = D.Isp * D.g0, mp = propelente(D.m0, dv * 1e3, u), mdot = D.F / u;
    /* Fase 5 — tempo de voo (usa aT da fase 3). */
    const tMin = periodo(aT) / 2, tAlt = tempoAteRaio(rp, D.raAlt, D.dTL);
    /* Fase 6 — equilíbrio, esfera de influência e chegada no referencial da Lua (usa aT). */
    const rEq = pontoEquilibrio(D.dTL, D.q), rSOI = raioSOI(D.dTL, D.q);
    const vApo = visViva(D.dTL, aT), vL = Math.sqrt(D.GM / D.dTL);
    /* Fase 7 — energia e forma do sobrevoo. */
    const rpL = D.RL + D.hL, E = D.vpL * D.vpL / 2 - D.GML / rpL;
    const vinf = vInfinito(D.vpL, rpL, D.GML), epsH = excHiperbole(rpL, vinf, D.GML);
    /* Fase 8 — deflexão, parâmetro de impacto, saída da esfera de influência (usa rSOI da 6). */
    const th = deflexao(epsH), b = parametroImpacto(rpL, vinf, D.GML);
    const tSOI = tempoHiperbole(rSOI, vinf, epsH, D.GML);
    /* Fase 9 — maré no corpo (usa rp da fase 1 e rpL da fase 7). */
    const gLEO = D.GM * 1e9 / Math.pow(rp * 1e3, 2);
    const mareLEO = mare(D.GM * 1e9, rp * 1e3, D.hCorpo), mareLua = mare(D.GML * 1e9, rpL * 1e3, D.hCorpo);
    /* Fase 10 — queda de volta à Terra e reentrada. */
    const rEI = D.R + D.hEI;
    const vEI = Math.sqrt(2 * D.GM * (1 / rEI - 1 / D.rMax)), vEsc = Math.sqrt(2 * D.GM / rEI);
    const T = 0.5 * D.mCap * Math.pow(vEI * 1e3, 2);
    return {
      f1: { rp, ra, a, eps, tauH: tau / 3600 },
      f2: { vp, va, ell: rp * vp, ellA: ra * va },
      f3: { aT, vTLI, dv, vc, dvCirc, porque: 1 },
      f4: { u, a0: D.F / D.m0, mp, mf: D.m0 - mp, mdot, tq: mp / mdot },
      f5: { tMinH: tMin / 3600, tAltH: tAlt / 3600, porque: 0 },
      f6: { rEq, dLua: D.dTL - rEq, rSOI, vApo, vL, vRel: vL - vApo },
      f7: { rpL, E, conica: 2, vinf, epsH },
      f8: { thetaGraus: th / GRAU, b, tSOIH: tSOI / 3600 },
      f9: { gLEO, mareLEO, mareLua, flutua: 1 },
      f10: { rEI, vEI, vEsc, razao: vEI / vEsc, T }
    };
  };

  /* ------------------------------------------------------------------
     Trajetória de retorno livre no problema restrito circular de três
     corpos, plano, no referencial que gira com a Lua (unidades: distância
     Terra–Lua, 1/n). A condição inicial (perigeu a 192 km, velocidade e
     ângulo da injeção) foi obtida por tiro numérico (scipy, RK45 com
     tolerância 1e-11) para dar perilúnio a 8 282 km e retorno com
     perigeu a 6 450 km do centro da Terra. Usada só na animação da fase 10.
     ------------------------------------------------------------------ */
  const RETORNO = { v0: 10.93748778, phi0: 235.72838974 };   // km/s, graus a partir da direção Terra→Lua
  const retornoLivre = (passo = 1e-3) => {
    const m = D.GML / (D.GM + D.GML), n = Math.sqrt((D.GM + D.GML) / Math.pow(D.dTL, 3));
    const VU = D.dTL * n, r0 = (D.R + D.hp) / D.dTL, ph = RETORNO.phi0 * GRAU, v = RETORNO.v0 / VU;
    let x = -m + r0 * Math.cos(ph), y = r0 * Math.sin(ph);
    let s = [x, y, -v * Math.sin(ph) + y, -m + v * Math.cos(ph) - x];
    const f = (z) => {
      const dx1 = z[0] + m, dx2 = z[0] - 1 + m;
      const r1 = Math.hypot(dx1, z[1]), r2 = Math.hypot(dx2, z[1]);
      const k1 = (1 - m) / (r1 * r1 * r1), k2 = m / (r2 * r2 * r2);
      return [z[2], z[3], 2 * z[3] + z[0] - k1 * dx1 - k2 * dx2, -2 * z[2] + z[1] - k1 * z[1] - k2 * z[1]];
    };
    const soma = (a, b, h) => a.map((ai, i) => ai + h * b[i]);
    const pts = [];
    let t = 0, perilua = Infinity, tL = 0, iL = 0, vL = 0, perigeu = Infinity, tE = 0, vE = 0, rMax = 0, depois = false;
    const tFim = 12 * 86400 * n;
    while (t < tFim) {
      const r1 = Math.hypot(s[0] + m, s[1]), r2 = Math.hypot(s[0] - 1 + m, s[1]);
      /* Passo proporcional ao tempo dinâmico local: fino perto da Terra e da Lua. */
      const h = passo * Math.min(Math.pow(r1, 1.5) / Math.sqrt(1 - m), Math.pow(r2, 1.5) / Math.sqrt(m), 1);
      if (pts.length === 0 || t - pts[pts.length - 1].t >= 1800 * n || r2 < 0.06) {
        pts.push({ x: s[0] * D.dTL, y: s[1] * D.dTL, t, v: Math.hypot(s[2] - s[1], s[3] + s[0] + m) * VU });
      }
      /* Velocidade inercial relativa a cada corpo: v_rot + ω × r. */
      if (!depois && r2 < perilua) { perilua = r2; tL = t; iL = pts.length - 1; vL = Math.hypot(s[2] - s[1], s[3] + (s[0] - 1 + m)); }
      if (!depois && r2 > perilua * 1.5 && perilua < 0.1) depois = true;
      if (!depois) rMax = Math.max(rMax, r1);
      if (depois && r1 < perigeu) { perigeu = r1; tE = t; vE = Math.hypot(s[2] - s[1], s[3] + s[0] + m); }
      if (depois && r1 > perigeu * 1.2 && perigeu < 0.05) break;
      const k1 = f(s), k2 = f(soma(s, k1, h / 2)), k3 = f(soma(s, k2, h / 2)), k4 = f(soma(s, k3, h));
      s = s.map((si, i) => si + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      t += h;
    }
    pts.push({ x: s[0] * D.dTL, y: s[1] * D.dTL, t, v: Math.hypot(s[2] - s[1], s[3] + s[0] + m) * VU });
    const tu = 1 / n;
    return {
      pts: pts.map((p) => ({ x: p.x, y: p.y, tH: p.t * tu / 3600, v: p.v })), iL, mu: m,
      periluaKm: perilua * D.dTL, perigeuKm: perigeu * D.dTL, tLuaH: tL * tu / 3600, tTerraH: tE * tu / 3600,
      vPerilua: vL * VU, vPerigeu: vE * VU, rMaxKm: rMax * D.dTL
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
    s = s.replace(/[·×x\*]10\^?(-?\d+)/g, "e$1");
    s = s.replace(/^10\^(-?\d+)$/, "1e$1");
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  };

  /** Resposta aceita se |dado − certo| ≤ tol·|certo| (tolerância relativa). */
  const confere = (dado, certo, tol) => Number.isFinite(dado) && Math.abs(dado - certo) <= tol * Math.abs(certo);

  return {
    D, REAL, GRAU, semieixo, excentricidade, periodo, visViva, propelente, tempoAteRaio,
    pontoEquilibrio, raioSOI, vInfinito, excHiperbole, deflexao, parametroImpacto, tempoHiperbole, mare,
    gabarito, RETORNO, retornoLivre, lerNumero, confere
  };
});
