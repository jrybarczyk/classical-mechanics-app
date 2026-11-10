/* Desafio 2 — uma cena animada por fase. Cada cena recebe o contexto, o
   tempo t (s) desde o início da cena, se a fase já foi validada e o gabarito.
   As órbitas estão em escala real (a escala vai escrita em cada cena); o tempo
   é sempre comprimido, e os movimentos seguem a equação de Kepler, não um
   ritmo uniforme. Onde algo foi ampliado, a cena declara. */
(function () {
  "use strict";
  const LD = window.LessonDraw, C = LD.C, TAU = 2 * Math.PI;
  const W = 680, H = 300;
  const P = window.DesafioPhysics, D = P.D;

  const texto = (ctx, x, y, s, cor = C.muted, align = "left", size = 11, weight = "600") => {
    ctx.save(); ctx.fillStyle = cor; ctx.font = `${weight} ${size}px Ubuntu, system-ui, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); ctx.restore();
  };
  const seta = (ctx, x0, y0, x1, y1, cor, w = 2.4) => LD.vector(ctx, x0, y0, x1, y1, cor, w, 8);
  const fmt = (v, n = 3) => Number(v).toLocaleString("pt-BR", { maximumSignificantDigits: n, useGrouping: false });
  const km = (x) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const horas = (h) => `${Math.floor(h / 24)} d ${String(Math.floor(h % 24)).padStart(2, "0")} h`;

  /* Corpos: raio em px é o real na escala da cena, com mínimo visível declarado. */
  const terra = (ctx, x, y, r) => {
    ctx.save(); ctx.fillStyle = "#5b8fb9"; ctx.strokeStyle = "#2f5f86"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, Math.max(r, 2.5), 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  const lua = (ctx, x, y, r) => {
    ctx.save(); ctx.fillStyle = "#a7a9a6"; ctx.strokeStyle = "#6f7171"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, Math.max(r, 2.5), 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  const nave = (ctx, x, y, cor = C.red) => {
    ctx.save(); ctx.fillStyle = cor; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  const tracejado = (ctx, pts, cor, dash = [], w = 1.6) => {
    ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
  };

  /* Kepler elíptico e hiperbólico (Newton–Raphson). */
  const anomaliaE = (M, e) => {
    let E = e < 0.8 ? M : Math.PI;
    for (let k = 0; k < 40; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    return E;
  };
  const anomaliaH = (M, e) => {
    let Hh = Math.asinh(M / e);
    for (let k = 0; k < 40; k++) Hh -= (e * Math.sinh(Hh) - Hh - M) / (e * Math.cosh(Hh) - 1);
    return Hh;
  };
  /* Posição na elipse com foco na origem e perigeu em +x, no tempo t desde o perigeu. */
  const elipse = (a, e, t, GM = D.GM) => {
    const n = Math.sqrt(GM / (a * a * a)), E = anomaliaE(((n * t) % TAU + TAU) % TAU, e), b = a * Math.sqrt(1 - e * e);
    const den = 1 - e * Math.cos(E);
    return { x: a * (Math.cos(E) - e), y: b * Math.sin(E), vx: -a * n * Math.sin(E) / den, vy: b * n * Math.cos(E) / den };
  };
  const contornoElipse = (a, e, map, E0 = 0, E1 = TAU) => {
    const b = a * Math.sqrt(1 - e * e), pts = [];
    for (let k = 0; k <= 240; k++) { const E = E0 + (E1 - E0) * k / 240; pts.push(map(a * (Math.cos(E) - e), b * Math.sin(E))); }
    return pts;
  };
  /* Hipérbole atrativa com foco na origem e periapside em +x: r = a(ε cosh H − 1).
     Percorrida no sentido horário (+y é o sentido do movimento orbital da Lua),
     como no sobrevoo calculado no problema de três corpos da fase 10. */
  const hiperbole = (a, e, Hh) => ({ x: a * (e - Math.cosh(Hh)), y: -a * Math.sqrt(e * e - 1) * Math.sinh(Hh) });

  /* Trajetória de retorno livre, calculada uma vez (problema restrito de três corpos). */
  let RETORNO = null;
  const retorno = () => (RETORNO = RETORNO || P.retornoLivre());

  /* Geometria comum da órbita alta (fases 1 e 2): 1 px ≈ 217 km. */
  const heo = { s: 0.0046, ex: 72, ey: 150 };
  heo.map = (x, y) => [heo.ex - x * heo.s, heo.ey - y * heo.s];
  const rp = D.R + D.hp, ra = D.R + D.ha, aH = (rp + ra) / 2, eH = (ra - rp) / (ra + rp);
  const tauH = 2 * Math.PI * Math.sqrt(aH ** 3 / D.GM);

  function fundoHEO(ctx) {
    tracejado(ctx, contornoElipse(aH, eH, heo.map), C.blue, [], 1.8);
    const [xc, yc] = heo.map(-aH * eH, 0), [xa, ya] = heo.map(-ra, 0), [xp, yp] = heo.map(rp, 0);
    tracejado(ctx, [[xp, yp], [xa, ya]], C.grayLight, [3, 4], 1);
    ctx.fillStyle = C.gray; ctx.beginPath(); ctx.arc(xc, yc, 2, 0, TAU); ctx.fill();
    texto(ctx, xc, yc + 10, "centro", C.muted, "center", 9);
    terra(ctx, heo.ex, heo.ey, D.R * heo.s);
    tracejado(ctx, [[xp, yp], [xp - 6, yp + 44]], C.gray, [], 1);
    texto(ctx, xp - 8, yp + 52, "perigeu, 192 km", C.muted, "left", 10);
    texto(ctx, xa - 4, ya - 14, "apogeu 70 174 km", C.muted, "right", 10);
  }

  const cenas = {
    /* Fase 1: a órbita alta em escala real, nave no ritmo de Kepler. */
    f1(ctx, t, ok, g) {
      fundoHEO(ctx);
      const tt = ((t % 12) / 12) * tauH, p = elipse(aH, eH, tt), [x, y] = heo.map(p.x, p.y);
      nave(ctx, x, y);
      texto(ctx, 560, 34, "Órbita alta de espera (HEO)", C.ink, "center", 14, "700");
      texto(ctx, 560, 54, "escala real: 1 px ≈ 217 km; Terra em escala", C.muted, "center", 10);
      texto(ctx, 560, 70, "tempo comprimido: 1 volta em 12 s", C.muted, "center", 10);
      texto(ctx, 560, 104, `t = ${fmt(tt / 3600, 3)} h`, C.ink, "center", 22, "700");
      const lin = ok ? [`a = ${km(g.f1.a)} km`, `ε = ${fmt(g.f1.eps)}`, `τ = ${fmt(g.f1.tauH)} h (real 23,5 h)`] : ["a = ?", "ε = ?", "τ = ?"];
      lin.forEach((s, k) => texto(ctx, 560, 150 + k * 26, s, ok ? C.green : C.muted, "center", 14, "700"));
      texto(ctx, 560, 268, "a nave anda devagar longe da Terra", C.muted, "center", 10);
    },
    /* Fase 2: lei das áreas e velocidades nos ápsides. */
    f2(ctx, t, ok, g) {
      const n = 12, b = aH * Math.sqrt(1 - eH * eH);
      for (let k = 0; k < n; k++) {
        const E0 = anomaliaE(TAU * k / n, eH), E1 = anomaliaE(TAU * (k + 1) / n, eH) || TAU;
        const pts = [[heo.ex, heo.ey]];
        for (let j = 0; j <= 30; j++) { const E = E0 + ((k === n - 1 ? TAU : E1) - E0) * j / 30; pts.push(heo.map(aH * (Math.cos(E) - eH), b * Math.sin(E))); }
        ctx.fillStyle = k % 2 ? "rgba(69,123,157,.12)" : "rgba(131,196,78,.18)";
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
      }
      fundoHEO(ctx);
      const tt = ((t % 14) / 14) * tauH, p = elipse(aH, eH, tt), [x, y] = heo.map(p.x, p.y), ev = 6;   // 6 px por km/s
      seta(ctx, x, y, x - p.vx * ev, y - p.vy * ev, C.green, 2.2);
      nave(ctx, x, y);
      const [xp, yp] = heo.map(rp, 0), [xa, ya] = heo.map(-ra, 0);
      seta(ctx, xp, yp, xp, yp - 10.58 * ev, C.red, 2); texto(ctx, xp - 6, yp - 56, "v_p", C.red, "right", 11, "700");
      seta(ctx, xa, ya, xa, ya + 0.907 * ev + 1, C.red, 2); texto(ctx, xa + 6, ya + 14, "v_a", C.red, "left", 11, "700");
      texto(ctx, 560, 34, "Áreas iguais em tempos iguais", C.ink, "center", 14, "700");
      texto(ctx, 560, 54, "cada setor colorido é varrido em τ/12", C.muted, "center", 10);
      texto(ctx, 560, 70, "vetores: 6 px por km/s (mesma escala)", C.muted, "center", 10);
      texto(ctx, 560, 100, `|v| = ${fmt(Math.hypot(p.vx, p.vy), 3)} km/s`, C.ink, "center", 18, "700");
      const lin = ok ? [`v_p = ${fmt(g.f2.vp, 4)} km/s`, `v_a = ${fmt(g.f2.va)} km/s`, `ℓ/m = r_p v_p = r_a v_a`, `= ${fmt(g.f2.ell / 1e4, 3)}·10⁴ km²/s`] : ["v_p = ?", "v_a = ?", "ℓ/m = r v nos ápsides = ?"];
      lin.forEach((s, k) => texto(ctx, 560, 145 + k * 24, s, ok ? C.green : C.muted, "center", 13, "700"));
    },
    /* Fase 3: da órbita alta à elipse translunar, com a queima no perigeu. */
    f3(ctx, t, ok, g) {
      const s = 600 / (D.dTL + rp), ex = 30 + rp * s, ey = 152, map = (x, y) => [ex - x * s, ey - y * s];
      const aT = (rp + D.dTL) / 2, eT = (D.dTL - rp) / (D.dTL + rp);
      ctx.save(); ctx.strokeStyle = C.grayLight; ctx.setLineDash([2, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ex, ey, D.dTL * s, -0.5, 0.5); ctx.stroke(); ctx.restore();
      texto(ctx, ex + D.dTL * s - 6, ey - 76, "órbita da Lua", C.muted, "right", 10);
      tracejado(ctx, contornoElipse(aT, eT, map, 0, Math.PI), C.green, [6, 4], 1.6);
      tracejado(ctx, contornoElipse(aH, eH, map), C.blue, [], 1.4);
      terra(ctx, ex, ey, D.R * s); lua(ctx, ex + D.dTL * s, ey, D.RL * s);
      const T = 12, tt = t % T;
      let x, y, rot = "", tH = 0;
      if (tt < 3) { const q = elipse(aH, eH, (tt / 3) * tauH); [x, y] = map(q.x, q.y); rot = "órbita alta"; tH = (tt / 3) * tauH / 3600; }
      else if (tt < 4) {
        [x, y] = map(rp, 0); rot = "injeção translunar"; tH = tauH / 3600;
        const fl = 10 + 6 * Math.sin(tt * 40);
        ctx.fillStyle = "rgba(233,162,59,.85)"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + fl); ctx.lineTo(x + 4, y + fl); ctx.closePath(); ctx.fill();
        seta(ctx, x, y, x, y - 40, C.gold, 2.6); texto(ctx, x + 8, y - 34, "Δv", C.gold, "left", 12, "700");
      } else {
        const fr = Math.min(1, (tt - 4) / 7), tauT = 2 * Math.PI * Math.sqrt(aT ** 3 / D.GM);
        const q = elipse(aT, eT, fr * tauT / 2); [x, y] = map(q.x, q.y); rot = "cruzeiro até a Lua"; tH = (tauH + fr * tauT / 2) / 3600;
      }
      nave(ctx, x, y);
      texto(ctx, 20, 18, "Escala real: 1 px ≈ 650 km; Terra e Lua em escala (a Lua mal aparece)", C.muted, "left", 10);
      texto(ctx, 20, 34, `${rot} · t = ${fmt(tH, 3)} h`, C.ink, "left", 13, "700");
      if (ok) {
        texto(ctx, 20, 262, `v_TLI = ${fmt(g.f3.vTLI, 4)} km/s · Δv = ${fmt(g.f3.dv)} km/s (da circular: ${fmt(g.f3.dvCirc)} km/s)`, C.green, "left", 13, "700");
        texto(ctx, 20, 282, "a órbita alta (azul) já tem quase a energia da elipse translunar (verde)", C.green, "left", 11);
      } else texto(ctx, 20, 270, "quanto o motor precisa acrescentar no perigeu?", C.muted, "left", 12);
    },
    /* Fase 4: a queima — massa caindo, Δv acumulando. */
    f4(ctx, t, ok, g) {
      const u = D.Isp * D.g0, mdot = D.F / u, tq = g.f4.tq, acel = 20;
      const tt = Math.min(tq, (t % (tq / acel + 3)) * acel), m = D.m0 - mdot * tt, dv = u * Math.log(D.m0 / m);
      /* Orion + ESM, movendo-se para a direita, jato para a esquerda. */
      const X = 170, Y = 140;
      ctx.save(); ctx.translate(X, Y);
      ctx.fillStyle = "#d9dcd8"; ctx.strokeStyle = C.gray; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(30, -26); ctx.lineTo(78, -10); ctx.lineTo(78, 10); ctx.lineTo(30, 26); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#eef1ee"; ctx.fillRect(-40, -26, 70, 52); ctx.strokeRect(-40, -26, 70, 52);
      ctx.fillStyle = "#c9cfd6"; ctx.fillRect(-120, -6, 80, 12);
      ctx.fillRect(-36, -70, 10, 44); ctx.fillRect(-36, 26, 10, 44);
      ctx.fillStyle = C.gray; ctx.beginPath(); ctx.moveTo(-40, -9); ctx.lineTo(-58, -16); ctx.lineTo(-58, 16); ctx.lineTo(-40, 9); ctx.closePath(); ctx.fill();
      if (tt < tq) {
        const L = 70 + 14 * Math.sin(t * 37);
        const gr = ctx.createLinearGradient(-58, 0, -58 - L, 0); gr.addColorStop(0, "rgba(233,162,59,.95)"); gr.addColorStop(1, "rgba(233,162,59,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-58, -14); ctx.lineTo(-58 - L, 0); ctx.lineTo(-58, 14); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      texto(ctx, X + 25, Y + 45, "Orion: cápsula + módulo europeu (ESM)", C.muted, "center", 10);
      seta(ctx, X + 90, Y, X + 90 + 40, Y, C.green, 2.4); texto(ctx, X + 134, Y, "F", C.green, "left", 12, "700");
      seta(ctx, X - 130, Y + 70, X - 170, Y + 70, C.gold, 2); texto(ctx, X - 125, Y + 70, "u = I_sp g₀", C.gold, "left", 11, "700");
      /* Barra de massa. */
      const bx = 30, by = 250, bw = 280;
      ctx.fillStyle = "#eef3ee"; ctx.fillRect(bx, by, bw, 16); ctx.fillStyle = C.blue; ctx.fillRect(bx, by, bw * m / D.m0, 16);
      texto(ctx, bx, by - 10, "massa da nave", C.muted, "left", 10); texto(ctx, bx + bw, by - 10, `${km(m)} kg`, C.blue, "right", 11, "700");
      /* Gráfico Δv(t). */
      const gx = 380, gy = 230, gw = 270, gh = 150, dvMax = g.f3.dv * 1e3 * 1.1;
      ctx.strokeStyle = C.grayLight; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      const curva = [];
      for (let k = 0; k <= 60; k++) { const s = tq * k / 60; curva.push([gx + gw * s / (tq * 1.05), gy - gh * u * Math.log(D.m0 / (D.m0 - mdot * s)) / dvMax]); }
      tracejado(ctx, curva, C.grayLight, [3, 3], 1.2);
      tracejado(ctx, curva.filter((_, k) => k <= 60 * tt / tq), C.green, [], 2.4);
      texto(ctx, gx + gw / 2, gy + 14, "tempo de queima (acelerado 20×)", C.muted, "center", 10);
      texto(ctx, gx + 4, gy - gh - 10, "Δv(t) = u ln(m₀/m)", C.muted, "left", 10);
      texto(ctx, 515, 40, `t = ${fmt(tt, 3)} s · Δv = ${fmt(dv, 3)} m/s · a = ${fmt(D.F / m, 3)} m/s²`, C.ink, "center", 12, "700");
      if (ok) texto(ctx, 515, 268, `m_p = ${fmt(g.f4.mp / 1000, 3)} t · t = ${fmt(g.f4.tq)} s (real ≈ 350 s)`, C.green, "center", 13, "700");
      else texto(ctx, 515, 268, "quanto propelente e quanto tempo?", C.muted, "center", 12);
    },
    /* Fase 5: duas elipses disputando a corrida até r = D; a Lua chega ao encontro. */
    f5(ctx, t, ok, g) {
      const rA = D.raAlt, s = 610 / (rA + rp), ex = 30 + rp * s, ey = 150, map = (x, y) => [ex - x * s, ey - y * s];
      const aT = (rp + D.dTL) / 2, eT = (D.dTL - rp) / (D.dTL + rp), a2 = (rp + rA) / 2, e2 = (rA - rp) / (rA + rp);
      ctx.save(); ctx.strokeStyle = C.grayLight; ctx.setLineDash([2, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ex, ey, D.dTL * s, -1.4, 1.4); ctx.stroke(); ctx.restore();
      tracejado(ctx, contornoElipse(aT, eT, map, 0, Math.PI), C.green, [6, 4], 1.5);
      const E2 = Math.acos((1 - D.dTL / a2) / e2);
      tracejado(ctx, contornoElipse(a2, e2, map, 0, Math.PI), C.violet, [2, 4], 1.2);
      tracejado(ctx, contornoElipse(a2, e2, map, 0, E2), C.violet, [], 1.6);
      terra(ctx, ex, ey, D.R * s);
      const hMax = 125, tH = Math.min(hMax, (t % 12) / 10 * hMax);
      /* Lua: chega ao apogeu da elipse mínima em t = τ_T/2 (movimento médio de 27,32 d). */
      const nL = TAU / (27.32 * 24), fL = Math.PI - nL * (g.f5.tMinH - tH);
      const [lx, ly] = map(D.dTL * Math.cos(fL), D.dTL * Math.sin(fL)); lua(ctx, lx, ly, D.RL * s);
      texto(ctx, lx - 8, ly - 10, "Lua", C.gray, "right", 10);
      const q1 = elipse(aT, eT, Math.min(tH, g.f5.tMinH) * 3600), q2 = elipse(a2, e2, Math.min(tH, g.f5.tAltH) * 3600);
      const [x1, y1] = map(q1.x, q1.y), [x2, y2] = map(q2.x, q2.y);
      nave(ctx, x1, y1, C.green); nave(ctx, x2, y2, C.violet);
      texto(ctx, 20, 18, "Escala real (1 px ≈ 700 km). Tempo: 125 h em 10 s, posições pela equação de Kepler", C.muted, "left", 10);
      texto(ctx, 20, 36, `t = ${fmt(tH, 3)} h após a injeção`, C.ink, "left", 14, "700");
      texto(ctx, 20, 262, ok ? `apogeu em D: ${fmt(g.f5.tMinH)} h` : "apogeu em D: ? h", C.green, "left", 12, "700");
      texto(ctx, 20, 280, ok ? `apogeu em 420 000 km: ${fmt(g.f5.tAltH)} h até r = D (real: ≈ 95 h)` : "apogeu em 420 000 km: ? h até r = D", C.violet, "left", 12, "700");
    },
    /* Fase 6: campos ao longo da linha Terra–Lua, ponto de equilíbrio e esfera de influência. */
    f6(ctx, t, ok, g) {
      const x0 = 50, x1 = 610, s = (x1 - x0) / D.dTL, yL = 205;
      const X = (r) => x0 + r * s;
      /* Gráfico log10 g(r), em m/s². */
      const gy0 = 108, gh = 84, lmin = -5, lmax = 1, Yg = (l) => gy0 - gh * (l - lmin) / (lmax - lmin);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      for (let l = lmin; l <= lmax; l++) { ctx.beginPath(); ctx.moveTo(x0, Yg(l)); ctx.lineTo(x1, Yg(l)); ctx.stroke(); texto(ctx, x0 - 4, Yg(l), `10${LD.sup(l)}`, C.muted, "right", 8); }
      const cT = [], cL = [];
      for (let k = 0; k <= 300; k++) {
        const r = D.R + (D.dTL - D.R - D.RL) * k / 300;
        cT.push([X(r), Yg(Math.log10(D.GM / (r * r) * 1e3))]); cL.push([X(r), Yg(Math.log10(D.GML / ((D.dTL - r) ** 2) * 1e3))]);
      }
      tracejado(ctx, cT, C.blue, [], 2); tracejado(ctx, cL, C.gray, [], 2);
      texto(ctx, X(60000), Yg(-1.2), "g da Terra", C.blue, "left", 10); texto(ctx, X(250000), Yg(-4.3), "g da Lua", C.gray, "left", 10);
      texto(ctx, x0, 14, "campo (m/s², escala logarítmica)", C.muted, "left", 10);
      /* Linha Terra–Lua em escala. */
      ctx.save(); ctx.strokeStyle = C.violet; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(X(D.dTL), yL, g.f6.rSOI * s, 0, TAU); ctx.stroke(); ctx.restore();
      tracejado(ctx, [[x0, yL], [X(D.dTL), yL]], C.grayLight, [2, 4], 1);
      terra(ctx, x0, yL, D.R * s); lua(ctx, X(D.dTL), yL, D.RL * s);
      const xe = X(g.f6.rEq);
      tracejado(ctx, [[xe, yL - 8], [xe, Yg(lmin)]], C.red, [3, 3], 1.2);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(xe, yL, 3.5, 0, TAU); ctx.fill();
      texto(ctx, xe - 6, yL + 14, "equilíbrio", C.red, "right", 10);
      texto(ctx, X(D.dTL), yL + 52, "esfera de", C.violet, "center", 10);
      texto(ctx, X(D.dTL), yL + 64, "influência", C.violet, "center", 10);
      /* Nave atravessando a linha. */
      const fr = (t % 10) / 10, r = D.R + fr * (D.dTL - D.R - 20000);
      nave(ctx, X(r), yL);
      tracejado(ctx, [[X(r), Yg(lmax)], [X(r), Yg(lmin)]], "rgba(198,92,75,.35)", [], 1);
      /* Chegada no referencial da Lua (vetores: 90 px por km/s). */
      const vx0 = 80, vy0 = 262, ev = 90;
      seta(ctx, vx0, vy0, vx0 + g.f6.vL * ev, vy0, C.gray, 2.2); texto(ctx, vx0 + g.f6.vL * ev + 6, vy0, "v_Lua", C.gray, "left", 10, "700");
      seta(ctx, vx0, vy0 + 18, vx0 + g.f6.vApo * ev, vy0 + 18, C.red, 2.2); texto(ctx, vx0 + g.f6.vApo * ev + 8, vy0 + 18, "v_nave (apogeu)", C.red, "left", 10, "700");
      texto(ctx, vx0 - 6, vy0 + 9, "ref. da Terra:", C.muted, "right", 9);
      texto(ctx, 20, 290, "escala real ao longo da linha: 1 px ≈ 690 km", C.muted, "left", 9);
      if (ok) {
        texto(ctx, 250, 252, `r_eq = ${km(g.f6.rEq)} km (a ${km(g.f6.dLua)} km da Lua)`, C.green, "left", 12, "700");
        texto(ctx, 250, 270, `r_SOI = ${km(g.f6.rSOI)} km · chegada a ${fmt(g.f6.vRel)} km/s`, C.green, "left", 12, "700");
      } else texto(ctx, 250, 262, "onde a Lua passa a mandar?", C.muted, "left", 12);
    },
    /* Fase 7: hipérbole no referencial da Lua e o potencial efetivo (Aula 18). */
    f7(ctx, t, ok, g) {
      const rpL = D.RL + D.hL, E = D.vpL ** 2 / 2 - D.GML / rpL, vinf = Math.sqrt(2 * E);
      const a = D.GML / vinf ** 2, e = 1 + rpL * vinf ** 2 / D.GML, s = 0.0045, mx = 200, my = 150;
      const map = (x, y) => [mx + x * s, my - y * s];
      const curva = [];
      for (let k = -100; k <= 100; k++) { const p = hiperbole(a, e, 2.9 * k / 100); curva.push(map(p.x, p.y)); }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 360, H); ctx.clip();
      tracejado(ctx, curva, C.green, [], 2);
      lua(ctx, mx, my, D.RL * s);
      const n = Math.sqrt(D.GML / a ** 3), tSOI = g.f8.tSOIH * 3600, tt = ((t % 10) / 10 * 2 - 1) * tSOI;
      const p = hiperbole(a, e, anomaliaH(n * tt, e)), [x, y] = map(p.x, p.y);
      nave(ctx, x, y);
      ctx.restore();
      seta(ctx, 30, 30, 8, 30, C.blue, 1.8); texto(ctx, 34, 30, "para a Terra", C.blue, "left", 10);
      texto(ctx, 20, 285, "referencial da Lua · escala real: 1 px ≈ 220 km", C.muted, "left", 9);
      const r = Math.hypot(p.x, p.y);
      /* Potencial efetivo por unidade de massa: V(r)/m = −GM_L/r + (ℓ/m)²/(2r²). */
      const l = rpL * D.vpL, gx = 390, gy = 250, gw = 270, gh = 210, rMax = 60000, vMin = -0.15, vMax = 0.6;
      const X = (rr) => gx + gw * rr / rMax, Y = (v) => gy - gh * (v - vMin) / (vMax - vMin);
      ctx.strokeStyle = C.grayLight; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      tracejado(ctx, [[gx, Y(0)], [gx + gw, Y(0)]], C.grid, [], 1);
      const V = [];
      for (let k = 1; k <= 300; k++) { const rr = 4000 + (rMax - 4000) * k / 300; V.push([X(rr), Y(-D.GML / rr + l * l / (2 * rr * rr))]); }
      ctx.save(); ctx.beginPath(); ctx.rect(gx, gy - gh, gw, gh); ctx.clip(); tracejado(ctx, V, C.blue, [], 2); ctx.restore();
      tracejado(ctx, [[X(rpL), Y(E)], [X(rMax), Y(E)]], C.red, [], 2);
      tracejado(ctx, [[X(rpL), Y(E)], [X(rpL), gy]], C.red, [3, 3], 1);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(X(Math.min(r, rMax)), Y(E), 4, 0, TAU); ctx.fill();
      texto(ctx, gx + 6, gy - gh - 8, "V(r)/m = −GM_L/r + (ℓ/m)²/2r²  (km²/s²)", C.muted, "left", 10);
      texto(ctx, X(rMax) - 2, Y(E) - 10, "E/m", C.red, "right", 11, "700");
      texto(ctx, X(rpL) + 4, gy - 8, "r_p", C.red, "left", 10);
      texto(ctx, gx + gw / 2, gy + 14, "r (até 60 000 km)", C.muted, "center", 10);
      texto(ctx, X(30000), Y(0) + 10, "0", C.muted, "center", 9);
      if (ok) texto(ctx, 525, 12, `E/m = +${fmt(g.f7.E)} km²/s² · v∞ = ${fmt(g.f7.vinf)} km/s · ε = ${fmt(g.f7.epsH)}`, C.green, "center", 11, "700");
      else texto(ctx, 525, 12, "E > 0 ou E < 0? Que cônica?", C.muted, "center", 12);
    },
    /* Fase 8: a deflexão — assíntotas, parâmetro de impacto e θ. */
    f8(ctx, t, ok, g) {
      const rpL = D.RL + D.hL, vinf = g.f7.vinf, e = g.f7.epsH, a = D.GML / vinf ** 2;
      const s = 0.0028, mx = 300, my = 150, map = (x, y) => [mx + x * s, my - y * s];
      const fInf = Math.acos(-1 / e), dIn = [-Math.cos(fInf), -Math.sin(fInf)], dOut = [Math.cos(fInf), -Math.sin(fInf)];
      const Cx = a * e, [cx, cy] = map(Cx, 0);
      /* Esfera de influência. */
      ctx.save(); ctx.strokeStyle = C.violet; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(mx, my, g.f6.rSOI * s, 0, TAU); ctx.stroke(); ctx.restore();
      texto(ctx, mx + g.f6.rSOI * s * 0.71 + 4, my + g.f6.rSOI * s * 0.71 - 6, "fronteira da SOI", C.violet, "left", 10);
      /* Assíntotas. */
      const L = 70000;
      tracejado(ctx, [map(Cx - dIn[0] * L, -dIn[1] * L), map(Cx + dIn[0] * 30000, dIn[1] * 30000)], C.grayLight, [4, 4], 1);
      tracejado(ctx, [map(Cx, 0), map(Cx + dOut[0] * L, dOut[1] * L)], C.grayLight, [4, 4], 1);
      /* Hipérbole até a fronteira da SOI. */
      const Hs = Math.acosh((g.f6.rSOI / a + 1) / e), curva = [];
      for (let k = -100; k <= 100; k++) { const p = hiperbole(a, e, Hs * k / 100); curva.push(map(p.x, p.y)); }
      tracejado(ctx, curva, C.green, [], 2);
      lua(ctx, mx, my, D.RL * s);
      /* Parâmetro de impacto: perpendicular da Lua à assíntota de chegada. */
      const proj = Cx * dIn[0], F = [Cx - proj * dIn[0], -proj * dIn[1]], [fx, fy] = map(F[0], F[1]);
      tracejado(ctx, [[mx, my], [fx, fy]], C.gold, [], 2); texto(ctx, (mx + fx) / 2 - 2, (my + fy) / 2 - 11, "b", C.gold, "center", 13, "700");
      /* Ângulo θ entre as direções de chegada e de saída, no centro da hipérbole. */
      const angIn = Math.atan2(-dIn[1], dIn[0]), angOut = Math.atan2(-dOut[1], dOut[0]);
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 46, Math.min(angIn, angOut), Math.max(angIn, angOut)); ctx.stroke(); ctx.restore();
      texto(ctx, cx + 4, cy + 58, "θ", C.red, "center", 14, "700");
      /* Vetores v∞ de chegada e de saída (mesmo módulo). */
      const [ix, iy] = map(Cx - dIn[0] * 45000, -dIn[1] * 45000), [ox, oy] = map(Cx + dOut[0] * 45000, dOut[1] * 45000);
      seta(ctx, ix, iy, ix + dIn[0] * 50, iy - dIn[1] * 50, C.blue, 2.4); texto(ctx, ix + 10, iy + 4, "v∞ chegada", C.blue, "left", 10, "700");
      seta(ctx, ox - dOut[0] * 50, oy + dOut[1] * 50, ox, oy, C.blue, 2.4); texto(ctx, ox - 8, oy - 10, "v∞ saída", C.blue, "right", 10, "700");
      /* Nave no tempo certo (Kepler hiperbólico), de −t_SOI a +t_SOI. */
      const n = Math.sqrt(D.GML / a ** 3), tS = g.f8.tSOIH * 3600, tt = ((t % 12) / 12 * 2 - 1) * tS;
      const p = hiperbole(a, e, anomaliaH(n * tt, e)), [x, y] = map(p.x, p.y);
      const oculto = p.x > 0 && Math.abs(p.y) < D.RL;
      nave(ctx, x, y, oculto ? C.gray : C.red);
      seta(ctx, 64, 40, 20, 40, C.blue, 1.8); texto(ctx, 70, 40, "para a Terra", C.blue, "left", 10);
      texto(ctx, 20, 60, "referencial da Lua", C.muted, "left", 9);
      texto(ctx, 20, 73, "escala real: 1 px ≈ 360 km", C.muted, "left", 9);
      texto(ctx, 560, 120, "a Lua avança para cima nesta vista;", C.muted, "center", 9);
      texto(ctx, 560, 133, "contorno no sentido da simulação (fase 10)", C.muted, "center", 9);
      texto(ctx, 560, 34, `t − t_perilúnio = ${tt >= 0 ? "+" : "−"}${fmt(Math.abs(tt) / 3600, 3)} h`, C.ink, "center", 13, "700");
      if (oculto) texto(ctx, 560, 56, "atrás da Lua: sem sinal com a Terra", C.gray, "center", 11, "700");
      if (ok) {
        texto(ctx, 560, 210, `θ = ${fmt(g.f8.thetaGraus)}°`, C.green, "center", 14, "700");
        texto(ctx, 560, 232, `b = ${km(g.f8.b)} km`, C.green, "center", 14, "700");
        texto(ctx, 560, 254, `saída da SOI: ${fmt(g.f8.tSOIH)} h (real 18,4 h)`, C.green, "center", 12, "700");
      } else texto(ctx, 560, 232, "de quanto a Lua gira a velocidade?", C.muted, "center", 12);
    },
    /* Fase 9: a maré no corpo e a queda livre. */
    f9(ctx, t, ok, g) {
      ctx.save(); ctx.fillStyle = "#dfe9f2"; ctx.beginPath(); ctx.arc(170, 820, 560, 0, TAU); ctx.fill(); ctx.restore();
      texto(ctx, 170, 286, "Terra (direção do centro: para baixo)", C.blue, "center", 10);
      /* Cápsula e astronauta, ambos caindo com o mesmo g. */
      const cx = 170, cy = 128, bob = 4 * Math.sin(t * 1.3);
      ctx.save(); ctx.fillStyle = "#f3f5f3"; ctx.strokeStyle = C.gray; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx - 80, cy - 95, 160, 190, 18); ctx.fill(); ctx.stroke(); ctx.restore();
      const ay = cy + bob, ink = C.ink;
      ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, ay - 52, 10, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, ay - 42); ctx.lineTo(cx, ay + 10);
      ctx.moveTo(cx, ay - 30); ctx.lineTo(cx - 22, ay - 14 + 3 * Math.sin(t * 2)); ctx.moveTo(cx, ay - 30); ctx.lineTo(cx + 22, ay - 16 - 3 * Math.sin(t * 2));
      ctx.moveTo(cx, ay + 10); ctx.lineTo(cx - 12, ay + 50); ctx.moveTo(cx, ay + 10); ctx.lineTo(cx + 12, ay + 50); ctx.stroke(); ctx.restore();
      seta(ctx, cx + 100, cy - 40, cx + 100, cy + 10, C.blue, 2.4); texto(ctx, cx + 106, cy - 15, "g (nave)", C.blue, "left", 10, "700");
      seta(ctx, cx + 100, cy + 30, cx + 100, cy + 80, C.blue, 2.4); texto(ctx, cx + 106, cy + 55, "g (corpo)", C.blue, "left", 10, "700");
      seta(ctx, cx - 30, ay - 52, cx - 30, ay - 80, C.red, 2.2); seta(ctx, cx - 30, ay + 50, cx - 30, ay + 78, C.red, 2.2);
      texto(ctx, cx - 36, ay - 70, "maré", C.red, "right", 10, "700"); texto(ctx, cx - 36, ay + 66, "(ampliada)", C.red, "right", 9);
      texto(ctx, cx, 14, "tudo cai junto: o piso não empurra o corpo", C.ink, "center", 12, "700");
      /* Barras em escala logarítmica, de 10⁻⁹ a 10¹ m/s². */
      const bx = 400, bw = 250, l0 = -9, l1 = 1, Xl = (v) => bx + bw * (Math.log10(v) - l0) / (l1 - l0);
      const itens = [["g na superfície", 9.81, C.blue, true], ["g a 192 km", g.f9.gLEO, C.blue, ok], ["maré a 192 km", g.f9.mareLEO, C.red, ok], ["maré no perilúnio", g.f9.mareLua, C.red, ok]];
      texto(ctx, bx, 44, "aceleração (m/s², escala logarítmica)", C.muted, "left", 10);
      for (let l = l0; l <= l1; l += 2) { tracejado(ctx, [[Xl(10 ** l), 60], [Xl(10 ** l), 236]], C.grid, [], 1); texto(ctx, Xl(10 ** l), 248, `10${LD.sup(l)}`, C.muted, "center", 9); }
      itens.forEach(([rot, v, cor, mostra], k) => {
        const y = 78 + k * 42;
        texto(ctx, bx, y - 10, rot, C.ink, "left", 10);
        if (mostra) { ctx.fillStyle = cor; ctx.fillRect(bx, y - 2, Xl(v) - bx, 14); texto(ctx, Xl(v) + 4, y + 5, LD.sci(v, 2), cor, "left", 10, "700"); }
        else texto(ctx, bx + 4, y + 5, "?", C.muted, "left", 11, "700");
      });
      texto(ctx, 525, 276, "desenho do astronauta fora de escala", C.muted, "center", 9);
    },
    /* Fase 10: o voo inteiro no problema de três corpos e a chegada à reentrada. */
    f10(ctx, t, ok, g) {
      const R3 = retorno(), pts = R3.pts, mu = R3.mu, xE = -mu * D.dTL, xM = (1 - mu) * D.dTL;
      const s = 0.00105, ox = 40 - xE * s, oy = 150, map = (x, y) => [ox + x * s, oy - y * s];
      tracejado(ctx, pts.map((p) => map(p.x, p.y)), "rgba(97,155,96,.55)", [], 1.6);
      const [ex, ey] = map(xE, 0), [mx, my] = map(xM, 0);
      terra(ctx, ex, ey, D.R * s); lua(ctx, mx, my, D.RL * s);
      texto(ctx, ex, ey + 16, "Terra", C.blue, "center", 10); texto(ctx, mx, my + 14, "Lua", C.gray, "center", 10);
      /* Nave ao longo da trajetória (tempo interpolado). */
      const tTot = pts[pts.length - 1].tH, tH = Math.min(tTot, (t % 20) / 18 * tTot);
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m].tH <= tH) lo = m; else hi = m; }
      const A = pts[lo], B = pts[hi], w = B.tH > A.tH ? (tH - A.tH) / (B.tH - A.tH) : 0;
      const px = A.x + w * (B.x - A.x), py = A.y + w * (B.y - A.y), v = A.v + w * (B.v - A.v);
      const [nx, ny] = map(px, py); nave(ctx, nx, ny);
      texto(ctx, 20, 12, "Retorno livre calculado (Terra, Lua e nave; plano; Lua em órbita circular)", C.ink, "left", 11, "700");
      texto(ctx, 20, 26, "referencial que gira com a Lua · escala real: 1 px ≈ 950 km", C.muted, "left", 9);
      /* Ampliação em torno da Lua. */
      const zx = 528, zy = 44, zw = 145, zh = 118, zs = 0.0034, zmap = (x, y) => [zx + zw / 2 + (x - xM) * zs, zy + zh / 2 - y * zs];
      ctx.save(); ctx.fillStyle = "#fff"; ctx.strokeStyle = C.grayLight; ctx.fillRect(zx, zy, zw, zh); ctx.strokeRect(zx, zy, zw, zh);
      ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip();
      tracejado(ctx, pts.map((p) => zmap(p.x, p.y)), C.green, [], 1.6);
      const [zlx, zly] = zmap(xM, 0); lua(ctx, zlx, zly, D.RL * zs);
      const [znx, zny] = zmap(px, py); nave(ctx, znx, zny);
      ctx.restore();
      texto(ctx, zx + zw / 2, zy - 8, "ampliação (1 px ≈ 290 km)", C.muted, "center", 9);
      const r = Math.hypot(px - xE, py);
      texto(ctx, 600, 186, `${horas(tH)} após a injeção`, C.ink, "center", 12, "700");
      texto(ctx, 600, 204, `distância à Terra: ${km(r)} km`, C.ink, "center", 10);
      texto(ctx, 600, 220, `rapidez (ref. da Terra): ${fmt(v, 3)} km/s`, C.ink, "center", 10);
      if (ok) {
        texto(ctx, 600, 250, `modelo: ${fmt(g.f10.vEI, 4)} km/s a 122 km`, C.green, "center", 11, "700");
        texto(ctx, 600, 266, `real 11,03 · escape ${fmt(g.f10.vEsc, 4)} km/s`, C.green, "center", 11, "700");
        texto(ctx, 600, 282, `T = ${LD.sci(g.f10.T, 2)} J`, C.green, "center", 11, "700");
      } else texto(ctx, 600, 262, "com que rapidez ela volta?", C.muted, "center", 11);
      texto(ctx, 20, 288, `simulação: perilúnio ${km(R3.periluaKm)} km a ${fmt(R3.vPerilua, 4)} km/s; volta ao perigeu em ${fmt(R3.tTerraH, 3)} h`, C.muted, "left", 9);
    }
  };

  let raf = 0;
  function iniciar(canvas, faseId, ok, g) {
    parar();
    const ctx = canvas.getContext("2d"), cena = cenas[faseId];
    if (!cena) return;
    const t0 = performance.now();
    const quadro = (now) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      cena(ctx, (now - t0) / 1000, ok, g);
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
  }
  function parar() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  window.DesafioAnimacao = { iniciar, parar, cenas, W, H };
})();
