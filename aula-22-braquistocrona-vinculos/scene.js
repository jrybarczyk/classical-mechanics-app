(function () {
  "use strict";
  const P = window.LessonPhysics;
  const deg = (d) => (d * Math.PI) / 180;

  window.LessonScene = {
    id: "aula22",
    discipline: "Mecânica Clássica · Aula 21",
    title: "Braquistócrona, Snell e vínculos",
    subtitle: "A curva mais curta e a mais rápida são o mesmo problema?",

    stations: [
      {
        id: "braquistocrona",
        tab: "Braquistócrona",
        heading: "Descida em tempo mínimo",
        equation: "t[y] = ∫√[(1 + y′²)/(2gy)] dx   ·   y(1 + y′²) = 2a",
        hint: "Compare o comprimento e o tempo. Preveja se a curva mais curta é a mais rápida.",
        controls: [
          { id: "parameter", label: "expoente p da curva de teste", min: 0.35, max: 1.9, step: 0.05, value: 1, digits: 2 },
          { id: "secondary", label: "parâmetro a da cicloide", min: 0.3, max: 2, step: 0.05, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "largada θ₀/π na cicloide", min: 0, max: 0.95, step: 0.05, value: 0, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const a = v.secondary;
          const X = Math.PI * a, Y = 2 * a;
          /* Desenhamos a altura acima do ponto final, Y − y (y medido para baixo). */
          const chart = api.axes(api.main, 0, X * 1.05, 0, Y * 1.15, "x (m)", "altura acima do ponto final, 2a − y (m)");
          const teste = (x) => Y * Math.pow(x / X, v.parameter);
          api.line(chart, api.curve((x) => Y - teste(x), 0, X, 200), api.C.red, [], 2.6);
          api.line(chart, api.param((th) => { const [cx, cy] = P.cycloid(th, a); return [cx, Y - cy]; }, 0, Math.PI, 260), api.C.green, [], 3.2);
          api.line(chart, [[0, Y], [X, 0]], api.C.grayLight, [5, 4], 2);
          api.dot(chart, 0, Y, api.C.ink, 5.5);
          api.dot(chart, X, 0, api.C.ink, 5.5);
          const th = Math.PI * v.tertiary;
          const [px, py] = P.cycloid(th, a);
          api.dot(chart, px, Y - py, api.C.gold, 5.5);
          api.label(chart, X * 0.5, Y * 1.08, "cicloide", api.C.green, "center");
          api.label(chart, X * 0.72, Y - teste(X * 0.72) - Y * 0.06, "curva de teste", api.C.red, "center");

          const Tc = P.cycloidTime(Math.PI, a);
          const yTop = 2.4 * Tc;
          const s = api.axes(api.second, 0.35, 1.9, 0.9 * Tc, yTop,
            "expoente p da curva de teste", "tempo de descida (s)");
          api.line(s, api.curve((p) => Math.min(yTop, P.powerCurveTime(p, X, Y, P.G, 400)), 0.35, 1.9, 63), api.C.blue);
          api.hline(s, P.cycloidTime(Math.PI, a), api.C.green, [5, 4], "cicloide: o mínimo absoluto");
          api.hline(s, P.straightTime(X, Y), api.C.grayLight, [3, 4], "reta");
          api.dot(s, v.parameter, Math.min(yTop, P.powerCurveTime(v.parameter, X, Y, P.G, 800)), api.C.red, 4.5);
        },

        text(v, api) {
          const a = v.secondary;
          const X = Math.PI * a, Y = 2 * a;
          const Tc = P.cycloidTime(Math.PI, a);
          const Tr = P.straightTime(X, Y);
          const Tt = P.powerCurveTime(v.parameter, X, Y, P.G, 1200);
          const Lc = 4 * a;            // meio arco: ∫₀^π 2a·sen(θ/2)dθ = 4a
          const th0 = Math.PI * v.tertiary;
          const Tq = P.cycloidTimeFromRest(th0, a);
          const Lr = Math.hypot(X, Y);
          return {
            title: "Cicloide, reta e curva de teste",
            subtitle: `a = ${api.fmt(a)} m · expoente = ${api.fmt(v.parameter)}`,
            regime: Tt < Tc * 1.002 ? ["próximo do ótimo", "ok"] : Tt < Tc * 1.05 ? ["acima do mínimo", "warn"] : ["bem acima do mínimo", "alert"],
            caption: "A cicloide é mais longa que a reta e mesmo assim mais rápida: ela ganha rapidez cedo, no trecho íngreme inicial.",
            prediction: "A curva mais curta é a mais rápida? Compare comprimento e tempo.",
            calculation: `cicloide: τ = θ√(a/g) = π·√(${api.fmt(a)}/9,8) = <b>${api.fmt(Tc, 4)} s</b><br>reta: τ = L√(2/gY) = ${api.fmt(Lr, 3)}·√(2/(9,8·${api.fmt(Y)})) = <b>${api.fmt(Tr, 4)} s</b><br>largando do repouso em θ₀ = ${api.fmt(v.tertiary)}π: t(θ₀ → fundo) = <b>${api.fmt(Tq, 4)} s</b><em>comprimentos: cicloide 4a = ${api.fmt(Lc, 3)} m contra reta ${api.fmt(Lr, 3)} m — a mais longa vence</em>`,
            metrics: [
              ["τ cicloide", `${api.fmt(Tc, 4)} s`],
              ["τ reta", `${api.fmt(Tr, 4)} s`],
              ["τ curva de teste", `${api.fmt(Tt, 4)} s`],
              ["comprimento da cicloide", `${api.fmt(Lc, 3)} m`],
              ["comprimento da reta", `${api.fmt(Lr, 3)} m`],
              ["t da largada θ₀ ao fundo", `${api.fmt(Tq, 4)} s`]
            ],
            concept: "Menor distância e menor tempo são problemas diferentes, com funcionais diferentes e respostas diferentes. Confundi-los é o erro mais comum aqui.",
            prompts: [
              "Varra o expoente e confirme que nenhum valor bate a cicloide.",
              "Mude a largada θ₀ e verifique que o tempo até o fundo continua π√(a/g): a tautócrona.",
              "Explique por que a curva mais longa pode ser a mais rápida."
            ],
            legend: [[api.C.green, "cicloide"], [api.C.grayLight, "reta"], [api.C.red, "curva de teste"]],
            secondaryTitle: "Tempo de descida contra o expoente",
            secondarySubtitle: "toda a família fica acima da linha verde (p ≥ 2 nem chega: tempo infinito)",
            secondaryCaption: "A cicloide é o mínimo, e nenhuma potência simples o alcança."
          };
        }
      },

      {
        id: "snell",
        tab: "Snell e sombra<br>acústica",
        heading: "Fermat na interface",
        equation: "senθ₁/v₁ = senθ₂/v₂   ·   θ_c = arcsen(v₁/v₂)",
        hint: "Suba o ângulo até passar do crítico. O que acontece com a energia transmitida?",
        controls: [
          { id: "parameter", label: "ângulo de incidência θ₁", min: 1, max: 75, step: 1, value: 20, digits: 0, unit: "°" },
          { id: "secondary", label: "velocidade no meio 2", min: 1400, max: 4500, step: 10, value: 3500, digits: 0, unit: "m/s" },
          { id: "tertiary", label: "espessura da camada", min: 1, max: 20, step: 0.5, value: 5, digits: 1, unit: "mm" }
        ],
        secondary: true,

        draw(api, v) {
          const c1 = 1540, c2 = v.secondary;
          const t1 = deg(v.parameter);
          const t2 = P.snellAngle(t1, c1, c2);
          const { ctx, width, height } = api.main;
          const yi = height * 0.42;
          const cx = width * 0.42;
          ctx.save();
          ctx.fillStyle = "rgba(69,123,157,.07)";
          ctx.fillRect(0, 0, width, yi);
          ctx.fillStyle = "rgba(198,92,75,.07)";
          ctx.fillRect(0, yi, width, height - yi);
          ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, yi); ctx.lineTo(width, yi); ctx.stroke();
          ctx.setLineDash([5, 4]); ctx.strokeStyle = "#b9c4bb"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(cx, 16); ctx.lineTo(cx, height - 16); ctx.stroke();
          ctx.setLineDash([]);
          const Lin = 190;
          api.vector(ctx, cx - Lin * Math.sin(t1), yi - Lin * Math.cos(t1), cx, yi, api.C.blue, 2.8, 9);
          /* Reflexão sempre existe. */
          ctx.strokeStyle = api.C.grayLight; ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(cx, yi); ctx.lineTo(cx + Lin * 0.8 * Math.sin(t1), yi - Lin * 0.8 * Math.cos(t1)); ctx.stroke();
          ctx.setLineDash([]);
          if (!Number.isNaN(t2)) {
            api.vector(ctx, cx, yi, cx + Lin * Math.sin(t2), yi + Lin * Math.cos(t2), api.C.red, 2.8, 9);
          }
          ctx.fillStyle = api.C.muted; ctx.font = "12px Ubuntu, system-ui, sans-serif";
          ctx.fillText(`tecido mole · c₁ = 1540 m/s`, 16, yi - 14);
          ctx.fillText(`meio 2 · c₂ = ${api.fmt(c2, 0)} m/s`, 16, yi + 24);
          ctx.fillStyle = Number.isNaN(t2) ? api.C.red : api.C.green;
          ctx.font = "600 13px Ubuntu, system-ui, sans-serif";
          ctx.fillText(Number.isNaN(t2) ? "reflexão total: nenhuma onda transmitida" : `θ₂ = ${api.fmt((t2 * 180) / Math.PI, 1)}°`, 16, 26);
          ctx.restore();

          const s = api.axes(api.second, 1, 75, 0, 90, "θ₁ (°)", "θ₂ (°)", { xTicks: [0, 15, 30, 45, 60, 75] });
          api.line(s, api.curve((d) => {
            const t = P.snellAngle(deg(d), c1, c2);
            return Number.isNaN(t) ? null : (t * 180) / Math.PI;
          }, 1, 75, 150).filter((p) => p[1] !== null), api.C.green, [], 2.8);
          const tc = P.criticalAngle(c1, c2);
          if (!Number.isNaN(tc)) api.vline(s, (tc * 180) / Math.PI, api.C.red, [5, 4], `θ_c = ${api.fmt((tc * 180) / Math.PI, 1)}°`);
          api.hline(s, 90, api.C.grayLight, [3, 4]);
          if (!Number.isNaN(t2)) api.dot(s, v.parameter, (t2 * 180) / Math.PI, api.C.ink, 4.5);
        },

        text(v, api) {
          const c1 = 1540, c2 = v.secondary;
          const t1 = deg(v.parameter);
          const t2 = P.snellAngle(t1, c1, c2);
          const tc = P.criticalAngle(c1, c2);
          const shift = P.lateralShift(t1, c1, c2, v.tertiary);
          const total = P.totalReflection(t1, c1, c2);
          return {
            title: "Refração na interface",
            subtitle: `θ₁ = ${api.fmt(v.parameter, 0)}° · c₂ = ${api.fmt(c2, 0)} m/s`,
            regime: total ? ["reflexão total", "alert"] : v.parameter > (tc * 180) / Math.PI - 6 ? ["próximo do crítico", "warn"] : ["transmite", "ok"],
            caption: "Acima do ângulo crítico não há onda transmitida: toda a energia volta. Somado ao descasamento de impedância, é isso que produz a sombra acústica atrás do osso.",
            prediction: "Existe um ângulo acima do qual nada atravessa? De que ele depende?",
            calculation: `senθ₂ = (c₂/c₁)senθ₁ = ${api.fmt(c2 / c1, 3)}·sen${api.fmt(v.parameter, 0)}° = ${api.fmt((c2 / c1) * Math.sin(t1), 4)}<br>θ₂ = <b>${total ? "não existe" : api.fmt((t2 * 180) / Math.PI, 2) + "°"}</b><em>${Number.isNaN(tc) ? "c₂ < c₁: o raio se aproxima da normal e não há ângulo crítico" : `θ_c = arcsen(c₁/c₂) = arcsen(${api.fmt(c1 / c2, 3)}) = ${api.fmt((tc * 180) / Math.PI, 1)}°`}</em>`,
            metrics: [
              ["θ₂", total ? "—" : `${api.fmt((t2 * 180) / Math.PI, 2)}°`],
              ["ângulo crítico θ_c", Number.isNaN(tc) ? "não existe" : `${api.fmt((tc * 180) / Math.PI, 1)}°`],
              ["razão c₂/c₁", api.fmt(c2 / c1, 3)],
              ["deslocamento lateral (uma travessia)", total ? "—" : `${api.fmt(shift, 2)} mm`],
              ["espessura", `${api.fmt(v.tertiary, 1)} mm`]
            ],
            concept: "A lei de Snell não é uma lei da óptica: é o que o princípio do tempo estacionário produz em qualquer onda, som incluído.",
            prompts: [
              "Reproduza o exemplo das notas: tecido–osso dá θ_c = 26°.",
              "Com θ₁ = 20° e 5 mm de osso, confirme o desvio lateral de 4,4 mm.",
              "Explique por que esse desvio gera artefato de posição na imagem."
            ],
            legend: [[api.C.blue, "incidente"], [api.C.red, "transmitida"], [api.C.grayLight, "refletida"]],
            secondaryTitle: "θ₂ contra θ₁",
            secondarySubtitle: "para c₂ > c₁ a curva termina no ângulo crítico",
            secondaryCaption: "Além dele não há solução real: a onda não atravessa."
          };
        }
      },

      {
        id: "multiplicador",
        tab: "Multiplicador<br>de Lagrange",
        heading: "Problema isoperimétrico",
        equation: "maximizar A = ∮y dx com ∮√(1+y′²)dx = P   ⟹   λ = P/2π",
        hint: "Compare formas de mesmo perímetro. O multiplicador tem significado geométrico — qual?",
        controls: [
          { id: "parameter", label: "perímetro P", min: 4, max: 30, step: 0.5, value: 10, digits: 1, unit: "m" },
          { id: "secondary", label: "razão do retângulo", min: 1, max: 8, step: 0.1, value: 2, digits: 1 },
          { id: "tertiary", label: "lados do polígono regular", min: 3, max: 24, step: 1, value: 6, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const Pp = v.parameter;
          const R = P.isoperimetricLambda(Pp);
          const lim = R * 1.6;
          const chart = api.axes(api.main, -lim, lim, -lim, lim, "x (m)", "y (m)");
          api.area(chart, api.param((t) => [R * Math.cos(t), R * Math.sin(t)], 0, api.TAU, 200), "rgba(97,155,96,.16)", 0);
          api.line(chart, api.param((t) => [R * Math.cos(t), R * Math.sin(t)], 0, api.TAU, 200), api.C.green, [], 3);
          /* Retângulo de mesmo perímetro. */
          const b = Pp / (2 * (1 + v.secondary)), h = v.secondary * b;
          api.line(chart, [[-b / 2, -h / 2], [b / 2, -h / 2], [b / 2, h / 2], [-b / 2, h / 2], [-b / 2, -h / 2]], api.C.red, [5, 4], 2);
          /* Polígono regular de mesmo perímetro. */
          const n = Math.round(v.tertiary);
          const rp = Pp / (2 * n * Math.sin(Math.PI / n));
          api.line(chart, api.param((t) => {
            const k = Math.floor((t / api.TAU) * n);
            const a0 = (k / n) * api.TAU, a1 = ((k + 1) / n) * api.TAU;
            const s = ((t / api.TAU) * n) - k;
            return [rp * ((1 - s) * Math.cos(a0) + s * Math.cos(a1)), rp * ((1 - s) * Math.sin(a0) + s * Math.sin(a1))];
          }, 0, api.TAU, 400), api.C.blue, [3, 3], 1.8);
          api.arrow(chart, 0, 0, R * Math.cos(0.9), R * Math.sin(0.9), api.C.gold, 2.4, 8);
          api.label(chart, R * 0.55 * Math.cos(0.9), R * 0.55 * Math.sin(0.9) + lim * 0.06, "λ = R", api.C.gold, "center");
          api.dot(chart, 0, 0, api.C.ink, 4);

          const s = api.axes(api.second, 3, 24, 0, P.circleArea(Pp) * 1.1, "lados do polígono", "área (m²)");
          api.line(s, api.curve((nn) => P.polygonArea(Pp, Math.round(nn)), 3, 24, 44), api.C.blue);
          api.hline(s, P.circleArea(Pp), api.C.green, [5, 4], "círculo: máximo");
          api.dot(s, n, P.polygonArea(Pp, n), api.C.red, 4.5);
        },

        text(v, api) {
          const Pp = v.parameter;
          const R = P.isoperimetricLambda(Pp);
          const Ac = P.circleArea(Pp);
          const Ar = P.rectangleArea(Pp, v.secondary);
          const n = Math.round(v.tertiary);
          const Ap = P.polygonArea(Pp, n);
          return {
            title: "Formas de mesmo perímetro",
            subtitle: `P = ${api.fmt(Pp, 1)} m · retângulo ${api.fmt(v.secondary, 1)}:1 · polígono de ${n} lados`,
            caption: "Todas as três curvas têm o mesmo perímetro. A circunferência encerra a maior área, e o raio dela é exatamente o multiplicador de Lagrange.",
            prediction: "O multiplicador é apenas uma incógnita auxiliar, ou tem significado?",
            calculation: `f̃ = y + λ√(1+y′²) ⟹ λy′/√(1+y′²) = x − x₀<br>integrando: (x−x₀)² + (y−y₀)² = λ² ⟹ <b>λ = P/2π = ${api.fmt(R, 4)} m</b><em>o multiplicador é o próprio raio da circunferência</em>`,
            metrics: [
              ["multiplicador λ = R", `${api.fmt(R, 4)} m`],
              ["área do círculo", `${api.fmt(Ac, 4)} m²`],
              ["área do retângulo", `${api.fmt(Ar, 4)} m²`],
              ["área do polígono", `${api.fmt(Ap, 4)} m²`],
              ["círculo / retângulo", api.fmt(Ac / Ar, 4)],
              ["círculo / polígono", api.fmt(Ac / Ap, 4)]
            ],
            concept: "O multiplicador paga uma incógnita a mais e devolve informação quantitativa sobre o vínculo. Na Aula 23 ele devolverá a própria força de vínculo.",
            prompts: [
              "Aumente os lados do polígono e veja a área convergir para a do círculo por baixo.",
              "Ache a razão do retângulo que maximiza a área e confirme que é o quadrado.",
              "Verifique que λ = P/2π vale para qualquer perímetro."
            ],
            legend: [[api.C.green, "círculo"], [api.C.red, "retângulo"], [api.C.blue, "polígono"]],
            secondaryTitle: "Área do polígono regular contra o número de lados",
            secondarySubtitle: "converge para o círculo, sempre por baixo",
            secondaryCaption: "O círculo é o supremo, atingido apenas no limite."
          };
        }
      }
    ]
  };
})();
