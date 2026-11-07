/* Desafio 1 — uma cena animada por fase. Cada cena recebe o contexto, o
   tempo t (s) desde o início da cena, se a fase já foi validada e o gabarito.
   As escalas visuais são exageradas e declaradas na legenda. */
(function () {
  "use strict";
  const LD = window.LessonDraw, C = LD.C, TAU = 2 * Math.PI;
  const W = 680, H = 300;
  const D = window.DesafioPhysics.D;

  const texto = (ctx, x, y, s, cor = C.muted, align = "left", size = 11, weight = "600") => {
    ctx.save(); ctx.fillStyle = cor; ctx.font = `${weight} ${size}px Ubuntu, system-ui, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); ctx.restore();
  };
  const seta = (ctx, x0, y0, x1, y1, cor, w = 2.4) => LD.vector(ctx, x0, y0, x1, y1, cor, w, 8);
  const fmt = (v, n = 3) => Number(v).toLocaleString("pt-BR", { maximumSignificantDigits: n, useGrouping: false });

  /* Tubo em corte (vertical ou horizontal), com fração de sedimento no fundo. */
  function tubo(ctx, x, y, w, h, sedimento = 0, horizontal = false) {
    ctx.save();
    ctx.translate(x, y);
    if (horizontal) { ctx.rotate(-Math.PI / 2); ctx.translate(-h, 0); }
    // plasma
    ctx.fillStyle = "#f6efd9"; ctx.strokeStyle = C.gray; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h - w / 2); ctx.arc(w / 2, h - w / 2, w / 2, Math.PI, 0, true); ctx.lineTo(w, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // sedimento
    if (sedimento > 0) {
      const hs = sedimento * (h - 6);
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h - w / 2); ctx.arc(w / 2, h - w / 2, w / 2, Math.PI, 0, true); ctx.lineTo(w, 0); ctx.closePath(); ctx.clip();
      ctx.fillStyle = C.red; ctx.fillRect(0, h - hs, w, hs); ctx.restore();
    }
    ctx.restore();
  }

  /* Rotor visto de cima: disco, braços, tubos nos ângulos dados. */
  function rotorTopo(ctx, cx, cy, R, ang, tubos) {
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = "#eef3ee"; ctx.strokeStyle = C.grayLight; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.rotate(-ang);
    for (let k = 0; k < 4; k++) {
      ctx.save(); ctx.rotate(k * Math.PI / 2);
      ctx.strokeStyle = C.grayLight; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 0.85, 0); ctx.stroke();
      ctx.restore();
    }
    tubos.forEach(({ a, cheio }) => {
      ctx.save(); ctx.rotate(a);
      ctx.translate(R * 0.73, 0);
      ctx.fillStyle = cheio ? C.red : "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-18, -9, 36, 18, 6); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
  }
  const posTubo = (cx, cy, R, ang, a = 0) => ({ x: cx + R * 0.73 * Math.cos(-ang + a), y: cy + R * 0.73 * Math.sin(-ang + a) });

  /* Partículas pseudoaleatórias fixas (determinísticas). */
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

  const cenas = {
    /* Fase 1: hemácia isolada, forças equilibradas, movimento lento. */
    f1(ctx, t, ok, g) {
      tubo(ctx, 90, 30, 70, 240, 0);
      const y = 60 + ((t * 6) % 170);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.ellipse(125, y, 9, 4, 0, 0, TAU); ctx.fill();
      texto(ctx, 125, 285, "tubo em repouso (hemácia ampliada)", C.muted, "center", 10);
      // diagrama de forças
      const X = 420, Y = 150;
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.ellipse(X, Y, 34, 15, 0, 0, TAU); ctx.fill();
      seta(ctx, X, Y + 15, X, Y + 85, C.ink); texto(ctx, X + 8, Y + 70, "peso − empuxo", C.ink);
      seta(ctx, X, Y - 15, X, Y - 85, C.blue); texto(ctx, X + 8, Y - 70, "arrasto viscoso 6πηRv", C.blue);
      for (let k = 0; k < 5; k++) {
        const yy = Y - 60 + k * 30, ph = (t * 1.5 + k) % 1;
        ctx.strokeStyle = "rgba(69,123,157,.35)"; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let x = X - 120; x <= X + 120; x += 4) ctx.lineTo(x, yy + 4 * Math.sin((x - X) / 14 + ph * TAU)); ctx.stroke();
      }
      texto(ctx, X, 262, "forças equilibradas: v = v_T quase de imediato", C.muted, "center", 10);
      if (ok) texto(ctx, X, 40, `Re = ${LD.sci(g.f1.Re, 2)} ≪ 1 → arrasto linear`, C.green, "center", 13, "700");
      else texto(ctx, X, 40, "em que regime a hemácia se move?", C.muted, "center", 12);
    },
    /* Fase 2: sedimentação sob g, relógio em horas. */
    f2(ctx, t, ok, g) {
      const T = 12, frac = Math.min(1, (t % (T + 3)) / T);
      const hFront = frac;                  // fração do tubo já limpa
      tubo(ctx, 140, 30, 80, 240, 0.18 * frac);
      for (let i = 0; i < 90; i++) {
        const y0 = rnd(i, 1), x = 148 + rnd(i, 2) * 64;
        const y = y0 + frac * (1 - y0) * 0.95;          // todas descem; empilham no fundo
        if (y < hFront * 0.82 + 0.0) continue;          // acima da frente: plasma limpo
        ctx.fillStyle = "rgba(198,92,75,.8)"; ctx.beginPath(); ctx.arc(x, 36 + y * 215, 2.2, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = C.blue; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(130, 36 + hFront * 0.82 * 215); ctx.lineTo(230, 36 + hFront * 0.82 * 215); ctx.stroke(); ctx.setLineDash([]);
      texto(ctx, 236, 36 + hFront * 0.82 * 215, "frente de sedimentação", C.blue, "left", 10);
      const horas = frac * g.f2.tGravH;
      texto(ctx, 470, 70, `t = ${fmt(horas, 3)} h`, C.ink, "center", 26, "700");
      texto(ctx, 470, 100, "só com a gravidade (acelerado ~1000×)", C.muted, "center", 10);
      // gráfico frente x tempo
      const gx = 360, gy = 250, gw = 230, gh = 110;
      ctx.strokeStyle = C.grayLight; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = C.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw * frac, gy - gh * frac); ctx.stroke();
      texto(ctx, gx + gw / 2, gy + 14, "tempo", C.muted, "center", 10); texto(ctx, gx - 4, gy - gh, "x", C.muted, "right", 10);
      if (ok) texto(ctx, 470, 128, `v_T = ${fmt(g.f2.vTmmh)} mm/h · 2 cm em ${fmt(g.f2.tGravH)} h`, C.green, "center", 12, "700");
    },
    /* Fase 3: rotor girando, v_tan e a_c. */
    f3(ctx, t, ok, g) {
      const cx = 200, cy = 150, R = 120, om = g.f3.omega / 60, ang = om * t;
      rotorTopo(ctx, cx, cy, R, ang, [{ a: 0, cheio: true }, { a: Math.PI, cheio: true }]);
      const p = posTubo(cx, cy, R, ang);
      const ux = (p.x - cx) / (R * 0.73), uy = (p.y - cy) / (R * 0.73);
      seta(ctx, p.x, p.y, p.x - ux * 70, p.y - uy * 70, C.red); texto(ctx, p.x - ux * 80, p.y - uy * 80, "a_c", C.red, "center", 12);
      seta(ctx, p.x, p.y, p.x + uy * 60, p.y - ux * 60, C.lime); texto(ctx, p.x + uy * 72, p.y - ux * 72, "v", C.green, "center", 12);
      texto(ctx, 480, 60, "3000 rpm", C.ink, "center", 26, "700");
      texto(ctx, 480, 88, "tubo a r = 10 cm do eixo (giro desacelerado 60×)", C.muted, "center", 10);
      const lin = ok ? [`Ω = ${fmt(g.f3.omega, 4)} rad/s`, `a_c = Ω²r = ${fmt(g.f3.ac, 4)} m/s²`, `RCF = ${fmt(g.f3.rcf, 4)} g`, `v = Ωr = ${fmt(g.f3.vtan)} m/s`] : ["Ω = ?", "a_c = Ω²r = ?", "RCF = a_c/g = ?"];
      lin.forEach((s, k) => texto(ctx, 480, 130 + k * 26, s, ok ? C.green : C.muted, "center", 13, "700"));
    },
    /* Fase 4: a normal do suporte como força centrípeta. */
    f4(ctx, t, ok, g) {
      const cx = 200, cy = 150, R = 120, ang = (g.f3.omega / 60) * t;
      rotorTopo(ctx, cx, cy, R, ang, [{ a: 0, cheio: true }, { a: Math.PI, cheio: true }]);
      const p = posTubo(cx, cy, R, ang);
      const ux = (p.x - cx) / (R * 0.73), uy = (p.y - cy) / (R * 0.73);
      seta(ctx, p.x + ux * 22, p.y + uy * 22, p.x - ux * 75, p.y - uy * 75, C.blue, 3.2);
      texto(ctx, p.x - ux * 88, p.y - uy * 88, "N", C.blue, "center", 14, "700");
      texto(ctx, 480, 50, "referencial do laboratório", C.ink, "center", 15, "700");
      texto(ctx, 480, 74, "o suporte empurra o tubo para o eixo;", C.muted, "center", 11);
      texto(ctx, 480, 90, "nada puxa para fora", C.muted, "center", 11);
      // inset lateral: mg e reação vertical
      const X = 480, Y = 190;
      ctx.fillStyle = C.red; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(X - 10, Y - 28, 20, 56, 5); ctx.fill(); ctx.stroke();
      seta(ctx, X, Y, X, Y + 60, C.ink); texto(ctx, X + 8, Y + 50, "mg = 0,196 N", C.ink, "left", 10);
      seta(ctx, X, Y, X, Y - 60, C.gray); texto(ctx, X + 8, Y - 50, "apoio vertical", C.gray, "left", 10);
      if (ok) texto(ctx, 480, 275, `N = mΩ²r = ${fmt(g.f4.N, 4)} N = ${fmt(g.f4.razaoPeso, 4)} × mg`, C.green, "center", 13, "700");
    },
    /* Fase 5: gravidade efetiva no tubo basculante. */
    f5(ctx, t, ok, g) {
      const ex = 150, ey = 40;
      ctx.strokeStyle = C.grayLight; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex, 30); ctx.lineTo(ex, 270); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex, 90); ctx.lineTo(ex + 170, 90); ctx.stroke();
      texto(ctx, ex, 20, "eixo", C.muted, "center", 10);
      // tubo quase horizontal pendurado no braço
      const px = ex + 170, py = 90;
      ctx.save(); ctx.translate(px, py); ctx.rotate(-Math.PI / 2 + (g.f5.angulo * Math.PI / 180) * 40 + 0.0); // ângulo exagerado 40×
      ctx.translate(-40, 10); tubo(ctx, 0, 0, 36, 120, 0.25); ctx.restore();
      texto(ctx, px + 40, 140, "balde basculante (ângulo exagerado 40×)", C.muted, "left", 10);
      // vetores na amostra
      const X = 420, Y = 200, s = 160;
      const ac = g.f3.ac, G = 9.8, esc = s / ac;
      seta(ctx, X, Y, X + ac * esc, Y, C.red, 3); texto(ctx, X + s / 2, Y - 14, "a_c (centrífuga)", C.red, "center", 11);
      seta(ctx, X, Y, X, Y + G * esc * 50, C.ink, 2); texto(ctx, X - 8, Y + G * esc * 50, "g (ampliado 50×)", C.ink, "right", 10);
      seta(ctx, X, Y, X + ac * esc, Y + G * esc * 50, C.green, 2.6); texto(ctx, X + s + 6, Y + G * esc * 50 + 4, "g_ef", C.green, "left", 12, "700");
      if (ok) {
        texto(ctx, 480, 60, `|g_ef| = ${fmt(g.f5.gef, 4)} m/s²`, C.green, "center", 14, "700");
        texto(ctx, 480, 84, `θ = ${fmt(g.f5.angulo, 2)}° abaixo da horizontal`, C.green, "center", 13, "700");
      } else texto(ctx, 480, 60, "some os dois vetores", C.muted, "center", 13);
    },
    /* Fase 6: referencial girante, sedimentação radial e Coriolis. */
    f6(ctx, t, ok, g) {
      const cx = 110, cy = 150, R = 95;
      rotorTopo(ctx, cx, cy, R, 0, []);
      texto(ctx, cx, cy + R + 16, "referencial do rotor (parado nesta vista)", C.muted, "center", 10);
      // tubo radial ampliado à direita
      const x0 = 250, x1 = 640, y = 150;
      ctx.fillStyle = "#f6efd9"; ctx.strokeStyle = C.gray; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0, y - 40, x1 - x0, 80, 14); ctx.fill(); ctx.stroke();
      seta(ctx, 230, y, 250, y, C.grayLight, 1.5); texto(ctx, 240, y - 50, "eixo → fundo do tubo", C.muted, "center", 10);
      const T = 11.2, frac = (t % (T + 2)) / T;
      for (let i = 0; i < 40; i++) {
        const f0 = rnd(i, 3), yy = y - 30 + rnd(i, 4) * 60;
        const fr = Math.min(1, f0 + frac);
        const x = x0 + 12 + fr * (x1 - x0 - 24);
        const dy = -(fr - f0) * 60 * 0.3;          // desvio de Coriolis exagerado ×2500
        ctx.fillStyle = "rgba(198,92,75,.85)"; ctx.beginPath(); ctx.arc(x, yy + dy, 2.6, 0, TAU); ctx.fill();
      }
      const px = x0 + 60 + frac * 260;
      seta(ctx, px, y + 60, px + 70, y + 60, C.red, 2.6); texto(ctx, px + 35, y + 76, "a_c", C.red, "center", 11);
      seta(ctx, px, y + 60, px, y + 60 - 22, C.violet, 2.2); texto(ctx, px - 6, y + 40, "a_Cor (×2500)", C.violet, "right", 10);
      if (ok) {
        texto(ctx, 445, 40, `v_sed = ${fmt(g.f6.vSedmms)} mm/s`, C.green, "center", 13, "700");
        texto(ctx, 445, 60, `a_Cor/a_c = ${LD.sci(g.f6.razaoCor, 2)}: desprezível`, C.green, "center", 13, "700");
      } else texto(ctx, 445, 50, "Coriolis desvia a sedimentação?", C.muted, "center", 13);
    },
    /* Fase 7: aceleração do rotor, energia e potência. */
    f7(ctx, t, ok, g) {
      const T = D.tAcel, tt = t % (T + 5), fr = Math.min(1, tt / T), omMax = g.f3.omega / 60;
      const ang = tt < T ? omMax * tt * tt / (2 * T) : omMax * T / 2 + omMax * (tt - T);
      const cx = 170, cy = 150, R = 110;
      rotorTopo(ctx, cx, cy, R, ang, [{ a: 0, cheio: true }, { a: Math.PI, cheio: true }]);
      texto(ctx, cx, cy + R + 18, `t = ${fmt(Math.min(tt, T), 3)} s de 20 s`, C.ink, "center", 12, "700");
      const barra = (x, y, w, f, cor, rot, val) => {
        ctx.fillStyle = "#eef3ee"; ctx.fillRect(x, y, w, 18); ctx.fillStyle = cor; ctx.fillRect(x, y, w * f, 18);
        texto(ctx, x, y - 10, rot, C.muted, "left", 10); texto(ctx, x + w, y - 10, val, cor, "right", 11, "700");
      };
      barra(340, 70, 300, fr, C.blue, "Ω(t) — cresce linearmente", `${fmt(fr * g.f3.omega, 4)} rad/s`);
      barra(340, 130, 300, fr * fr, C.red, "E = ½IΩ² — cresce com o quadrado", `${fmt(fr * fr * g.f7.Ek, 4)} J`);
      barra(340, 190, 300, tt < T ? 1 : 0, C.green, "P média = E/Δt", tt < T ? `${fmt(g.f7.Pmed, 3)} W` : "0 W (regime)");
      if (ok) texto(ctx, 490, 250, `E = ${fmt(g.f7.Ek, 4)} J · P = ${fmt(g.f7.Pmed, 3)} W`, C.green, "center", 14, "700");
      else texto(ctx, 490, 250, "quanta energia o motor entrega?", C.muted, "center", 13);
    },
    /* Fase 8: rotor desbalanceado, CM e força girante no eixo. */
    f8(ctx, t, ok, g) {
      const om = g.f3.omega / 60, ang = om * t, ex = 30; // excentricidade exagerada (px)
      const cx = 220 + ex * Math.cos(-ang) * 0.25, cy = 150 + ex * Math.sin(-ang) * 0.25, R = 120;
      rotorTopo(ctx, cx, cy, R, ang, [{ a: 0, cheio: true }, { a: Math.PI, cheio: false }]);
      const mx = cx + ex * Math.cos(-ang), my = cy + ex * Math.sin(-ang);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(mx, my, 6, 0, TAU); ctx.fill();
      texto(ctx, mx - 18 * Math.sin(-ang), my + 18 * Math.cos(-ang), "CM (×30)", C.gold, "center", 10);
      seta(ctx, cx, cy, cx + 90 * Math.cos(-ang), cy + 90 * Math.sin(-ang), C.red, 3); 
      texto(ctx, 500, 50, "um tubo cheio, o oposto vazio", C.ink, "center", 15, "700");
      texto(ctx, 500, 74, "a força no eixo gira 50 vezes por segundo", C.muted, "center", 11);
      texto(ctx, 500, 92, "(oscilação do eixo exagerada)", C.muted, "center", 10);
      if (ok) {
        texto(ctx, 500, 150, `e = mr/M = ${fmt(g.f8.emm, 2)} mm`, C.green, "center", 14, "700");
        texto(ctx, 500, 176, `F = mrΩ² = ${fmt(g.f8.Fdes, 4)} N`, C.green, "center", 14, "700");
      } else texto(ctx, 500, 160, "quanto o CM se desloca? que força sacode o eixo?", C.muted, "center", 12);
    },
    /* Fase 9: gota que escapa tangencialmente — projétil. */
    f9(ctx, t, ok, g) {
      const chao = 265, hx = 150 / 1, sx = 44;      // 150 px/m vertical, 44 px/m horizontal
      const x0 = 40, y0 = chao - D.h * hx;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, chao); ctx.lineTo(W, chao); ctx.stroke();
      ctx.fillStyle = "#eef3ee"; ctx.fillRect(x0 - 30, y0 - 10, 60, chao - y0 + 10); ctx.strokeStyle = C.grayLight; ctx.strokeRect(x0 - 30, y0 - 10, 60, chao - y0 + 10);
      texto(ctx, x0, y0 - 22, "rotor, h = 0,80 m", C.muted, "center", 10);
      const Tq = g.f9.tQueda, tt = (t / 6) % (Tq + 0.25), tv = Math.min(tt, Tq); // câmera lenta 6×
      ctx.strokeStyle = C.red; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let s = 0; s <= tv; s += Tq / 60) ctx.lineTo(x0 + g.f3.vtan * s * sx, y0 + 0.5 * 9.8 * s * s * hx);
      ctx.stroke(); ctx.setLineDash([]);
      const gx = x0 + g.f3.vtan * tv * sx, gy = y0 + 0.5 * 9.8 * tv * tv * hx;
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, TAU); ctx.fill();
      seta(ctx, x0, y0, x0 + 70, y0, C.lime); texto(ctx, x0 + 76, y0, "v = Ωr", C.green, "left", 11);
      texto(ctx, 400, 40, `t = ${fmt(tv, 3)} s (câmera lenta 6×)`, C.ink, "center", 13, "700");
      texto(ctx, 400, 60, "escalas: 150 px/m na vertical, 44 px/m na horizontal", C.muted, "center", 10);
      if (ok) {
        const xa = x0 + g.f9.alcance * sx;
        seta(ctx, x0, chao + 18, xa, chao + 18, C.green, 2); texto(ctx, (x0 + xa) / 2, chao + 30, `alcance ${fmt(g.f9.alcance)} m em ${fmt(g.f9.tQueda)} s`, C.green, "center", 12, "700");
      } else texto(ctx, 400, 240, "onde a gota cai?", C.muted, "center", 12);
    },
    /* Fase 10: sedimentação na centrífuga em tempo real. */
    f10(ctx, t, ok, g) {
      const T = g.f10.tCentr, tt = t % (T + 3), fr = Math.min(1, tt / T);
      texto(ctx, 110, 40, "eixo", C.muted, "center", 10); ctx.strokeStyle = C.grayLight; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(110, 50); ctx.lineTo(110, 250); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(110, 150); ctx.lineTo(180, 150); ctx.stroke();
      // tubo horizontal: fundo para a direita
      const x0 = 180, len = 400, y = 150;
      ctx.save(); ctx.translate(x0, y - 40); tubo(ctx, 0, 0, 80, len, 0.18 * fr, true); ctx.restore();
      for (let i = 0; i < 90; i++) {
        const f0 = rnd(i, 5), yy = y - 30 + rnd(i, 6) * 60;
        const f = f0 + fr * (1 - f0) * 0.95;
        if (f < fr * 0.82) continue;
        ctx.fillStyle = "rgba(198,92,75,.8)"; ctx.beginPath(); ctx.arc(x0 + 10 + f * (len - 30), yy, 2.2, 0, TAU); ctx.fill();
      }
      texto(ctx, 380, 50, `t = ${fmt(Math.min(tt, T), 3)} s (tempo real, RCF ${fmt(g.f3.rcf, 4)} g)`, C.ink, "center", 14, "700");
      texto(ctx, 380, 250, "sob a gravidade, o mesmo percurso levaria 3,12 h", C.muted, "center", 11);
      if (ok) texto(ctx, 380, 272, `t = ${fmt(g.f10.tCentr)} s · ${fmt(g.f10.razaoTempos, 4)} vezes mais rápido`, C.green, "center", 13, "700");
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
