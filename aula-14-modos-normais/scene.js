(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula14",
    discipline: "Mecânica Clássica · Aula 14",
    title: "Osciladores acoplados e modos normais",
    subtitle: "Se cada modo conserva sua energia, o que exatamente migra no batimento?",

    stations: [
      {
        id: "modos",
        tab: "Dois modos<br>normais",
        heading: "Simétrico e antissimétrico",
        equation: "ω₊ = √(k/m)   ω₋ = √((k+2κ)/m)",
        hint: "Repare na mola central em cada modo. Preveja qual dos dois é mais rápido.",
        controls: [
          { id: "parameter", label: "acoplamento κ", min: 0, max: 8, step: 0.1, value: 2, digits: 1, unit: "N/m" },
          { id: "secondary", label: "mola de parede k", min: 1, max: 20, step: 0.5, value: 10, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "fase do movimento", min: 0, max: 6.28, step: 0.02, value: 0.8, digits: 2, unit: "rad" }
        ],
        animate: { control: "tertiary", period: 5 },
        secondary: true,

        draw(api, v) {
          const { ctx, width, height } = api.main;
          const m = 1, k = v.secondary, kap = v.parameter;
          const desl = 26 * Math.cos(v.tertiary);
          const x0 = 70, xf = Math.min(width - 60, 640);
          const larg = 46;

          [["simétrico", 1, height * 0.3, api.C.green, P.omegaSym(k, m)],
           ["antissimétrico", -1, height * 0.74, api.C.red, P.omegaAnti(k, kap, m)]].forEach(([nome, sinal, y, cor, w]) => {
            api.hatch(ctx, x0, y - 34, x0, y + 34, "#b6c0b7", 11, 9);
            api.hatch(ctx, xf, y + 34, xf, y - 34, "#b6c0b7", 11, 9);
            const c1 = x0 + (xf - x0) * 0.34 + desl;
            const c2 = x0 + (xf - x0) * 0.66 + sinal * desl;
            api.spring(ctx, x0, y, c1 - larg / 2, y, 8, 7, "#8fa091");
            api.spring(ctx, c1 + larg / 2, y, c2 - larg / 2, y, 7, 8, cor);
            api.spring(ctx, c2 + larg / 2, y, xf, y, 8, 7, "#8fa091");
            [c1, c2].forEach((cx) => {
              ctx.fillStyle = `${cor}29`; ctx.strokeStyle = cor; ctx.lineWidth = 2;
              ctx.fillRect(cx - larg / 2, y - 17, larg, 34);
              ctx.strokeRect(cx - larg / 2, y - 17, larg, 34);
            });
            api.vector(ctx, c1, y - 30, c1 + Math.sign(desl || 1) * 22, y - 30, cor, 2, 7);
            api.vector(ctx, c2, y - 30, c2 + sinal * Math.sign(desl || 1) * 22, y - 30, cor, 2, 7);
            ctx.fillStyle = cor; ctx.font = "600 13px Ubuntu, system-ui, sans-serif";
            ctx.fillText(`${nome} · ω = ${api.fmt(w)} rad/s`, x0, y - 52);
            ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
            ctx.fillText(sinal > 0 ? "mola central mantém o comprimento natural" : "mola central comprime e estende", x0, y + 52);
          });

          /* Como as duas frequências se separam à medida que a mola central endurece.
             Em κ = 0 elas coincidem: é a degenerescência que o acoplamento desfaz. */
          const s2 = api.axes(api.second, 0, 8, 0, P.omegaAnti(k, 8, m) * 1.15, "acoplamento κ (N/m)", "ω (rad/s)");
          api.line(s2, api.curve(() => P.omegaSym(k, m), 0, 8, 2), api.C.green, [], 2.8);
          api.line(s2, api.curve((x) => P.omegaAnti(k, x, m), 0, 8, 160), api.C.red, [], 2.8);
          api.vline(s2, kap, api.C.ink, [3, 3]);
          api.dot(s2, kap, P.omegaSym(k, m), api.C.green, 4.5);
          api.dot(s2, kap, P.omegaAnti(k, kap, m), api.C.red, 4.5);
          api.dot(s2, 0, P.omegaSym(k, m), api.C.gold, 5, true);
          api.label(s2, 0.15, P.omegaSym(k, m) * 1.06, "degenerescência", api.C.gold, "left");
        },

        text(v, api) {
          const m = 1, k = v.secondary, kap = v.parameter;
          const wp = P.omegaSym(k, m), wn = P.omegaAnti(k, kap, m);
          return {
            title: "Os dois padrões coletivos",
            subtitle: `k = ${api.fmt(k, 1)} N/m · κ = ${api.fmt(kap, 1)} N/m`,
            regime: kap === 0 ? ["modos degenerados", "alert"] : kap < k / 5 ? ["acoplamento fraco", "ok"] : ["acoplamento forte", "warn"],
            caption: "No modo simétrico a mola central acompanha as massas sem se deformar, e por isso não contribui. No antissimétrico ela é solicitada duas vezes por ciclo.",
            prediction: "Qual dos dois modos tem frequência maior, e por quê?",
            calculation: `ω₊ = √(k/m) = √(${api.fmt(k, 1)}/1) = <b>${api.fmt(wp)} rad/s</b><br>ω₋ = √((k+2κ)/m) = √(${api.fmt(k + 2 * kap, 1)}) = <b>${api.fmt(wn)} rad/s</b><em>a mola central só aparece em ω₋, e com o fator 2</em>`,
            metrics: [
              ["ω₊ simétrico", `${api.fmt(wp)} rad/s`],
              ["ω₋ antissimétrico", `${api.fmt(wn)} rad/s`],
              ["Δω = ω₋ − ω₊", `${api.fmt(wn - wp, 4)} rad/s`],
              ["ω̄ médio", `${api.fmt((wp + wn) / 2)} rad/s`],
              ["razão ω₋/ω₊", api.fmt(wn / wp, 4)]
            ],
            concept: "As frequências pertencem aos padrões coletivos, não às massas. Nenhuma das duas massas “possui” uma frequência própria.",
            prompts: [
              "Zere κ e explique a degenerescência que aparece.",
              "Ache o κ que torna ω₋ exatamente o dobro de ω₊.",
              "Verifique que os autovetores (1,1) e (1,−1) são ortogonais."
            ],
            legend: [[api.C.green, "simétrico"], [api.C.red, "antissimétrico"]],
            secondaryTitle: "Separação das frequências",
            secondarySubtitle: "ω₊ não depende de κ; ω₋ cresce com ele",
            secondaryCaption: "O acoplamento não mexe no modo em que a mola central não trabalha — só no outro."
          };
        }
      },

      {
        id: "batimento",
        tab: "Batimento",
        heading: "Só a massa 1 deslocada",
        equation: "x₁ = A cos(Δωt/2)cos(ω̄t)<br>x₂ = A sen(Δωt/2)sen(ω̄t)",
        hint: "Marque quando x₁ zera pela primeira vez. Esse instante é π/Δω, e não 2π/Δω.",
        controls: [
          { id: "parameter", label: "acoplamento κ", min: 0.05, max: 2, step: 0.01, value: 0.2, digits: 2, unit: "N/m" },
          { id: "secondary", label: "mola de parede k", min: 4, max: 20, step: 0.5, value: 10, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "instante t", min: 0, max: 1, step: 0.005, value: 0.3, digits: 3, unit: "× 2π/Δω" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const m = 1, k = v.secondary, kap = v.parameter;
          const dw = P.deltaOmega(k, kap, m);
          const tr = P.returnTime(k, kap, m);
          const chart = api.axes(api.main, 0, tr, -1.25, 1.25, "tempo t (s)", "deslocamento x/A", {
            xTicks: [0, tr / 4, tr / 2, (3 * tr) / 4, tr],
            xFormat: (t) => {
              const r = t / tr;
              return r < 0.01 ? "0" : Math.abs(r - 0.5) < 0.01 ? "π/Δω" : Math.abs(r - 1) < 0.01 ? "2π/Δω" : "";
            }
          });
          api.line(chart, api.curve((t) => P.beat(t, 1, k, kap, m)[0], 0, tr, 1400), api.C.green, [], 1.6);
          api.line(chart, api.curve((t) => P.beat(t, 1, k, kap, m)[1], 0, tr, 1400), api.C.red, [], 1.6);
          api.line(chart, api.curve((t) => Math.cos((dw * t) / 2), 0, tr, 200), api.C.grayLight, [5, 4], 1.6);
          api.line(chart, api.curve((t) => -Math.cos((dw * t) / 2), 0, tr, 200), api.C.grayLight, [5, 4], 1.6);
          api.vline(chart, tr / 2, api.C.gold, [5, 4], "energia toda em x₂");
          api.hline(chart, 0, "#b9c4bb", []);
          const tt = v.tertiary * tr;
          api.dot(chart, tt, P.beat(tt, 1, k, kap, m)[0], api.C.green, 5);
          api.dot(chart, tt, P.beat(tt, 1, k, kap, m)[1], api.C.red, 5);

          /* As mesmas soluções nas coordenadas normais: duas senoides de amplitude
             rigorosamente constante. O batimento some ao trocar de base. */
          const s2 = api.axes(api.second, 0, tr, -0.7, 0.7, "tempo t (s)", "η₊ e η₋", { xTicks: [0, tr / 2, tr] });
          api.line(s2, api.curve((t) => P.normalCoordinates(...P.beat(t, 1, k, kap, m))[0], 0, tr, 1400), api.C.blue, [], 1.6);
          api.line(s2, api.curve((t) => P.normalCoordinates(...P.beat(t, 1, k, kap, m))[1], 0, tr, 1400), api.C.gold, [], 1.6);
          api.hline(s2, 0.5, api.C.grayLight, [4, 3], "amplitude fixa");
          api.hline(s2, -0.5, api.C.grayLight, [4, 3]);
          api.vline(s2, tt, api.C.ink, [3, 3]);
        },

        text(v, api) {
          const m = 1, k = v.secondary, kap = v.parameter;
          const dw = P.deltaOmega(k, kap, m);
          const tt = P.transferTime(k, kap, m);
          const tr = P.returnTime(k, kap, m);
          const aprox = P.deltaOmegaWeak(k, kap, m);
          const t = v.tertiary * tr;
          const [x1, x2] = P.beat(t, 1, k, kap, m);
          return {
            title: "Migração da amplitude entre as massas",
            subtitle: `κ/k = ${api.fmt(kap / k, 3)} · Δω = ${api.fmt(dw, 4)} rad/s`,
            regime: kap / k < 0.05 ? ["acoplamento fraco", "ok"] : ["acoplamento apreciável", "warn"],
            caption: "As envoltórias estão em quadratura: quando uma massa para, a outra está na amplitude máxima. A transferência completa leva π/Δω, e o retorno, 2π/Δω.",
            prediction: "Em que instante a massa 1 fica momentaneamente parada pela primeira vez?",
            calculation: `Δω = ω₋ − ω₊ = <b>${api.fmt(dw, 5)} rad/s</b> (aproximação κω₊/k = ${api.fmt(aprox, 5)})<br>transferência completa em π/Δω = <b>${api.fmt(tt, 3)} s</b><em>retorno à massa 1 em 2π/Δω = ${api.fmt(tr, 3)} s</em>`,
            metrics: [
              ["Δω exato", api.fmt(dw, 5)],
              ["Δω ≈ κω₊/k", api.fmt(aprox, 5)],
              ["tempo de transferência", `${api.fmt(tt, 3)} s`],
              ["tempo de retorno", `${api.fmt(tr, 3)} s`],
              ["x₁ no instante", api.fmt(x1, 4)],
              ["x₂ no instante", api.fmt(x2, 4)]
            ],
            concept: "O batimento não é um fenômeno novo: é a interferência entre dois modos normais, cada um com amplitude rigorosamente constante.",
            prompts: [
              "Confirme que x₁ se anula pela primeira vez em π/Δω, e não em 2π/Δω.",
              "Reduza κ e verifique que o tempo de transferência cresce como 1/κ.",
              "Compare Δω exato com a aproximação κω₊/k e diga quando ela deixa de servir."
            ],
            legend: [[api.C.green, "x₁"], [api.C.red, "x₂"], [api.C.grayLight, "envoltória"]],
            secondaryTitle: "As mesmas soluções em η₊ e η₋",
            secondarySubtitle: "amplitude constante, sem vestígio de batimento",
            secondaryCaption: "Trocar de base não muda a física: revela que o batimento estava na escolha das coordenadas."
          };
        }
      },

      {
        id: "energia",
        tab: "Energia por<br>modo e por massa",
        heading: "O que migra e o que não migra",
        equation: "E₊ e E₋ constantes · E₁ e E₂ oscilam",
        hint: "Duas curvas devem ser retas horizontais. Preveja quais antes de olhar.",
        controls: [
          { id: "parameter", label: "acoplamento κ", min: 0.05, max: 2, step: 0.01, value: 0.2, digits: 2, unit: "N/m" },
          { id: "secondary", label: "mola de parede k", min: 4, max: 20, step: 0.5, value: 10, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "instante t", min: 0, max: 1, step: 0.005, value: 0.25, digits: 3, unit: "× 2π/Δω" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const m = 1, k = v.secondary, kap = v.parameter;
          const tr = P.returnTime(k, kap, m);
          const Etot = P.modeEnergies(0, 1, k, kap, m).reduce((a, b) => a + b, 0);
          const chart = api.axes(api.main, 0, tr, 0, Etot * 1.2, "tempo t (s)", "energia (J)", {
            xTicks: [0, tr / 2, tr],
            xFormat: (t) => (t < 1e-9 ? "0" : Math.abs(t - tr / 2) < tr * 0.01 ? "π/Δω" : "2π/Δω")
          });
          api.line(chart, api.curve((t) => P.massEnergies(t, 1, k, kap, m)[0], 0, tr, 700), api.C.green, [], 1.6);
          api.line(chart, api.curve((t) => P.massEnergies(t, 1, k, kap, m)[1], 0, tr, 700), api.C.red, [], 1.6);
          api.line(chart, api.curve((t) => P.modeEnergies(t, 1, k, kap, m)[0], 0, tr, 200), api.C.blue, [6, 4], 2.6);
          api.line(chart, api.curve((t) => P.modeEnergies(t, 1, k, kap, m)[1], 0, tr, 200), api.C.gold, [6, 4], 2.6);
          api.vline(chart, tr / 2, api.C.grayLight, [4, 4]);
          const t = v.tertiary * tr;
          api.dot(chart, t, P.massEnergies(t, 1, k, kap, m)[0], api.C.green, 4.5);
          api.dot(chart, t, P.massEnergies(t, 1, k, kap, m)[1], api.C.red, 4.5);

          /* A mesma energia repartida de duas maneiras no instante escolhido:
             pelos modos, sempre meio a meio; pelas massas, variando o tempo todo. */
          const [Ep, En] = P.modeEnergies(t, 1, k, kap, m);
          const [E1, E2] = P.massEnergies(t, 1, k, kap, m);
          const s2 = api.axes(api.second, 0, 4, 0, Etot * 0.75, "", "energia (J)", { xTicks: [] });
          api.bars(s2, [["E₊", Ep, api.C.blue], ["E₋", En, api.C.gold], ["E₁", E1, api.C.green], ["E₂", E2, api.C.red]], api.C.green, { pad: 26 });
          api.hline(s2, Etot / 2, api.C.grayLight, [4, 3], "metade da energia total");
        },

        text(v, api) {
          const m = 1, k = v.secondary, kap = v.parameter;
          const tr = P.returnTime(k, kap, m);
          const t = v.tertiary * tr;
          const [Ep, En] = P.modeEnergies(t, 1, k, kap, m);
          const [E1, E2] = P.massEnergies(t, 1, k, kap, m);
          const [Ep0, En0] = P.modeEnergies(0, 1, k, kap, m);
          return {
            title: "Energia dos modos e energia das massas",
            subtitle: `t = ${api.fmt(t, 3)} s de ${api.fmt(tr, 3)} s`,
            caption: "As duas tracejadas são retas: cada modo normal conserva sua energia. As cheias oscilam em oposição — é a energia das massas que migra.",
            prediction: "Quais das quatro curvas são horizontais?",
            calculation: `E₊ = ${api.fmt(Ep, 5)} J (em t = 0 valia ${api.fmt(Ep0, 5)} J)<br>E₋ = ${api.fmt(En, 5)} J (em t = 0 valia ${api.fmt(En0, 5)} J)<em>E₁ = ${api.fmt(E1, 5)} J e E₂ = ${api.fmt(E2, 5)} J, que trocam de valor a cada π/Δω</em>`,
            metrics: [
              ["E₊ do modo simétrico", `${api.fmt(Ep, 5)} J`],
              ["E₋ do modo antissimétrico", `${api.fmt(En, 5)} J`],
              ["variação de E₊", api.sci(Math.abs(Ep - Ep0))],
              ["E₁ da massa 1", `${api.fmt(E1, 5)} J`],
              ["E₂ da massa 2", `${api.fmt(E2, 5)} J`],
              ["E total", `${api.fmt(Ep + En, 5)} J`]
            ],
            concept: "Nada de misterioso atravessa o sistema: os modos são independentes e constantes, e o batimento é apenas como essa superposição aparece nas coordenadas x₁ e x₂.",
            prompts: [
              "Meça a variação de E₊ ao longo de um ciclo completo de batimento.",
              "Mostre que E₁ + E₂ não é exatamente constante e explique onde está o resto.",
              "Relacione o instante de máximo de E₂ com π/Δω."
            ],
            legend: [[api.C.blue, "modo simétrico"], [api.C.gold, "modo antissimétrico"], [api.C.green, "massa 1"], [api.C.red, "massa 2"]],
            secondaryTitle: "Repartição no instante escolhido",
            secondarySubtitle: "duas barras não se movem; duas trocam de altura",
            secondaryCaption: "As duas primeiras somam o mesmo que as duas últimas: é a mesma energia, contada em bases diferentes."
          };
        }
      }
    ]
  };
})();
