(function () {
  "use strict";
  const P = window.LessonPhysics;
  const rad = (d) => (d * Math.PI) / 180;

  window.LessonScene = {
    id: "aula15",
    discipline: "Mecânica Clássica · Aula 14 (complemento)",
    title: "O pêndulo não linear",
    subtitle: "Onde exatamente a aproximação de pequenas oscilações deixa de servir?",

    stations: [
      {
        id: "periodo",
        tab: "Período e<br>amplitude",
        heading: "Três expressões para τ",
        equation: "τ = 4√(ℓ/g)·K(sen θ₀/2)   ·   τ ≈ τ₀(1 + θ₀²/16)",
        hint: "Compare exato, primeira ordem e harmônico. Ache onde a diferença chega a 1 %.",
        controls: [
          { id: "parameter", label: "amplitude θ₀", min: 1, max: 179, step: 1, value: 30, digits: 0, unit: "°" },
          { id: "secondary", label: "comprimento ℓ", min: 0.1, max: 3, step: 0.05, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "gravidade g", min: 1.6, max: 25, step: 0.1, value: 9.8, digits: 1, unit: "m/s²" }
        ],
        secondary: true,

        draw(api, v) {
          const l = v.secondary, g = v.tertiary;
          const tau0 = P.periodSmall(l, g);
          const chart = api.axes(api.main, 0, 179, 0.95, 3.2, "amplitude θ₀ (°)", "τ / τ₀", { xTicks: [0, 45, 90, 135, 180] });
          api.line(chart, api.curve((d) => Math.min(3.2, P.periodExact(rad(d), l, g) / tau0), 1, 179, 200), api.C.green, [], 3);
          api.line(chart, api.curve((d) => P.periodFirstOrder(rad(d), l, g) / tau0, 1, 179, 120), api.C.red, [6, 4], 2.2);
          api.hline(chart, 1, api.C.grayLight, [3, 4], "harmônico");
          api.vline(chart, v.parameter, api.C.gold, [4, 4]);
          api.dot(chart, v.parameter, Math.min(3.2, P.periodExact(rad(v.parameter), l, g) / tau0), api.C.green, 5.5);
          api.dot(chart, v.parameter, P.periodFirstOrder(rad(v.parameter), l, g) / tau0, api.C.red, 4.5);
          api.label(chart, 176, 3.1, "τ → ∞ em 180°", api.C.green, "right");

          const s = api.axes(api.second, 0, 179, 0, 30, "amplitude θ₀ (°)", "erro da 1ª ordem (%)", { xTicks: [0, 45, 90, 135, 180] });
          api.line(s, api.curve((d) => {
            const e = P.periodExact(rad(d), l, g);
            return Math.min(30, (Math.abs(P.periodFirstOrder(rad(d), l, g) - e) / e) * 100);
          }, 1, 179, 160), api.C.blue);
          api.hline(s, 1, api.C.gold, [5, 4], "1 %");
          api.dot(s, v.parameter, Math.min(30, (Math.abs(P.periodFirstOrder(rad(v.parameter), l, g) - P.periodExact(rad(v.parameter), l, g)) / P.periodExact(rad(v.parameter), l, g)) * 100), api.C.red, 4.5);
        },

        text(v, api) {
          const l = v.secondary, g = v.tertiary;
          const th = rad(v.parameter);
          const tau0 = P.periodSmall(l, g);
          const tauEx = P.periodExact(th, l, g);
          const tau1 = P.periodFirstOrder(th, l, g);
          const err = (Math.abs(tau1 - tauEx) / tauEx) * 100;
          return {
            title: "Período contra amplitude",
            subtitle: `θ₀ = ${api.fmt(v.parameter, 0)}° · ℓ = ${api.fmt(l)} m · g = ${api.fmt(g, 1)} m/s²`,
            regime: err < 0.1 ? ["primeira ordem excelente", "ok"] : err < 2 ? ["primeira ordem aceitável", "warn"] : ["expansão insuficiente", "alert"],
            caption: "A curva verde é exata. A vermelha é a correção de primeira ordem: ela fica abaixo de 1 % de erro até cerca de 74° e depois abandona, subestimando cada vez mais.",
            prediction: "Em que amplitude a correção θ₀²/16 erra 1 %?",
            calculation: `τ₀ = 2π√(ℓ/g) = <b>${api.fmt(tau0, 4)} s</b><br>τ = 4√(ℓ/g)·K(sen ${api.fmt(v.parameter / 2, 1)}°) = <b>${Number.isFinite(tauEx) ? api.fmt(tauEx, 4) + " s" : "∞"}</b><em>1ª ordem: τ₀(1 + θ₀²/16) = ${api.fmt(tau1, 4)} s — erro de ${api.fmt(err, 2)} %</em>`,
            metrics: [
              ["τ₀ harmônico", `${api.fmt(tau0, 4)} s`],
              ["τ exato", Number.isFinite(tauEx) ? `${api.fmt(tauEx, 4)} s` : "∞"],
              ["τ de 1ª ordem", `${api.fmt(tau1, 4)} s`],
              ["τ/τ₀ exato", api.fmt(tauEx / tau0, 4)],
              ["correção θ₀²/16", api.fmt(th * th / 16, 4)],
              ["erro da 1ª ordem", `${api.fmt(err, 2)} %`]
            ],
            concept: "A dependência do período com a amplitude é a marca da não linearidade: o oscilador harmônico é isócrono, e o pêndulo real não é.",
            prompts: [
              "Reproduza o exemplo das notas: θ₀ = 30° dá cerca de 1,7 % de aumento.",
              "Ache a amplitude em que o erro da primeira ordem chega a 1 %.",
              "Verifique que τ/τ₀ não depende de ℓ nem de g — só de θ₀."
            ],
            legend: [[api.C.green, "exato"], [api.C.red, "1ª ordem"], [api.C.grayLight, "harmônico"]],
            secondaryTitle: "Erro da expansão de primeira ordem",
            secondarySubtitle: "cresce como θ₀⁴ e explode perto da separatriz",
            secondaryCaption: "A linha de 1 % marca o fim prático do domínio da correção."
          };
        }
      },

      {
        id: "fase",
        tab: "Retrato<br>de fase",
        heading: "Oscilação, separatriz e rotação",
        equation: "E = ½mℓ²θ̇² + mgℓ(1 − cosθ)   ·   E_sep = 2mgℓ",
        hint: "Atravesse E = 2mgℓ devagar. Preveja o que acontece com a forma das curvas.",
        controls: [
          { id: "parameter", label: "energia E / 2mgℓ", min: 0.05, max: 2.2, step: 0.01, value: 0.6, digits: 2 },
          { id: "secondary", label: "comprimento ℓ", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "número de curvas", min: 3, max: 13, step: 2, value: 7, digits: 0 }
        ],

        draw(api, v) {
          const m = 1, l = v.secondary, g = P.G;
          const w0 = P.omega0(l, g);
          const Es = P.separatrixEnergy(m, l, g);
          const chart = api.axes(api.main, -1.45 * Math.PI, 1.45 * Math.PI, -3.2 * w0, 3.2 * w0, "θ (rad)", "θ̇ (rad/s)", {
            xTicks: [-Math.PI, 0, Math.PI],
            xFormat: (t) => (Math.abs(t) < 0.01 ? "0" : t > 0 ? "π" : "−π")
          });
          api.field(chart, (th, td) => [td, -w0 * w0 * Math.sin(th)], "#cfd8d0", 19, 11, 0.55);

          /* Curvas de nível abaixo da separatriz (oscilação). */
          for (let i = 1; i <= v.tertiary; i += 1) {
            const E = (i / (v.tertiary + 1)) * Es;
            const thMax = Math.acos(1 - E / (m * g * l));
            for (const sinal of [1, -1]) {
              api.line(chart, api.curve((th) => sinal * P.thetaDotAt(th, E, m, l, g), -thMax, thMax, 200), "#a9c6ab", [], 1.4);
            }
          }
          /* Rotação, acima da separatriz. */
          for (let i = 1; i <= Math.ceil(v.tertiary / 2); i += 1) {
            const E = Es * (1 + (i / (v.tertiary / 2 + 1)) * 1.3);
            for (const sinal of [1, -1]) {
              api.line(chart, api.curve((th) => sinal * P.thetaDotAt(th, E, m, l, g), -1.45 * Math.PI, 1.45 * Math.PI, 240), "#b7c9dd", [], 1.4);
            }
          }
          /* Separatriz. */
          for (const sinal of [1, -1]) {
            api.line(chart, api.curve((th) => sinal * P.separatrixBranch(th, l, g), -Math.PI, Math.PI, 240), api.C.red, [], 2.8);
          }
          /* Curva selecionada. */
          const E = v.parameter * Es;
          if (v.parameter < 1) {
            const thMax = Math.acos(1 - E / (m * g * l));
            for (const sinal of [1, -1]) api.line(chart, api.curve((th) => sinal * P.thetaDotAt(th, E, m, l, g), -thMax, thMax, 260), api.C.green, [], 3.2);
          } else if (v.parameter > 1) {
            for (const sinal of [1, -1]) api.line(chart, api.curve((th) => sinal * P.thetaDotAt(th, E, m, l, g), -1.45 * Math.PI, 1.45 * Math.PI, 300), api.C.blue, [], 3.2);
          }
          api.dot(chart, 0, 0, api.C.ink, 5);
          api.dot(chart, Math.PI, 0, api.C.red, 5.5, true);
          api.dot(chart, -Math.PI, 0, api.C.red, 5.5, true);
          api.label(chart, 0, -0.35 * w0, "centro", api.C.ink, "center", "top");
          api.label(chart, Math.PI, 0.35 * w0, "sela", api.C.red, "center");
        },

        text(v, api) {
          const m = 1, l = v.secondary, g = P.G;
          const Es = P.separatrixEnergy(m, l, g);
          const E = v.parameter * Es;
          const rot = P.isRotation(E, m, l, g);
          const thMax = v.parameter < 1 ? Math.acos(1 - E / (m * g * l)) : Math.PI;
          /* Oscilação: período de ida e volta; rotação: tempo de uma volta completa.
             Só exatamente na separatriz o período é infinito. */
          const tau = v.parameter < 1 ? P.periodExact(thMax, l, g) : v.parameter > 1 ? P.rotationPeriod(E, m, l, g) : Infinity;
          return {
            title: "Retrato de fase do pêndulo",
            subtitle: `E/2mgℓ = ${api.fmt(v.parameter)} · ℓ = ${api.fmt(l)} m`,
            regime: rot ? ["rotação completa", "alert"] : Math.abs(v.parameter - 1) < 0.005 ? ["na separatriz", "warn"] : ["oscilação", "ok"],
            caption: "Dentro da separatriz vermelha as curvas fecham: o pêndulo oscila. Fora, elas atravessam: ele gira. A sela em ±π é o equilíbrio instável de onde a separatriz emana.",
            prediction: "O que acontece com o período de uma curva que se aproxima da separatriz?",
            calculation: `E_sep = 2mgℓ = 2·1·9,8·${api.fmt(l)} = <b>${api.fmt(Es, 3)} J</b><br>E = ${api.fmt(v.parameter)}·E_sep = <b>${api.fmt(E, 3)} J</b><em>${rot ? `E > E_sep: θ̇ nunca se anula e o pêndulo dá voltas completas; uma volta leva τ_rot = (2k/ω₀)K(k) = ${api.fmt(tau, 3)} s, com k² = E_sep/E` : `amplitude θ₀ = arccos(1 − E/mgℓ) = ${api.fmt((thMax * 180) / Math.PI, 1)}°, período ${Number.isFinite(tau) ? api.fmt(tau, 3) + " s" : "∞"}`}</em>`,
            metrics: [
              ["E da separatriz", `${api.fmt(Es, 3)} J`],
              ["E escolhida", `${api.fmt(E, 3)} J`],
              ["regime", rot ? "rotação" : "oscilação"],
              ["amplitude θ₀", rot ? "—" : `${api.fmt((thMax * 180) / Math.PI, 1)}°`],
              [rot ? "período de uma volta" : "período", Number.isFinite(tau) ? `${api.fmt(tau, 3)} s` : "∞"],
              ["θ̇ em θ = 0", `${api.fmt(P.thetaDotAt(0, E, m, l, g), 3)} rad/s`]
            ],
            concept: "A separatriz não é uma curva a mais: ela separa dois tipos de movimento e leva tempo infinito para ser percorrida.",
            prompts: [
              "Aproxime E de E_sep por baixo e por cima: o período cresce dos dois lados e só é infinito na separatriz.",
              "Classifique θ = 0 e θ = ±π e diga o que o campo de direções mostra em cada um.",
              "Explique por que a rotação nunca cruza o eixo θ̇ = 0."
            ],
            legend: [[api.C.green, "oscilação"], [api.C.red, "separatriz"], [api.C.blue, "rotação"]]
          };
        }
      },

      {
        id: "linearizacao",
        tab: "Limite da<br>linearização",
        heading: "sen θ contra θ",
        equation: "sen θ = θ − θ³/6 + …",
        hint: "Compare o erro em sen θ com o erro no período. Eles crescem juntos?",
        controls: [
          { id: "parameter", label: "ângulo θ", min: 1, max: 90, step: 1, value: 30, digits: 0, unit: "°" },
          { id: "secondary", label: "tolerância aceita", min: 0.001, max: 0.1, step: 0.001, value: 0.01, digits: 3 },
          { id: "tertiary", label: "termos da série", min: 1, max: 4, step: 1, value: 1, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const serie = (x, n) => {
            let s = 0, termo = x;
            for (let i = 0; i < n; i += 1) {
              s += termo;
              termo *= (-x * x) / ((2 * i + 2) * (2 * i + 3));
            }
            return s;
          };
          const chart = api.axes(api.main, 0, rad(90), 0, 1.65, "θ (rad)", "valor");
          api.line(chart, api.curve((x) => Math.sin(x), 0, rad(90), 200), api.C.green, [], 3);
          api.line(chart, api.curve((x) => x, 0, rad(90), 60), api.C.grayLight, [5, 4], 2);
          api.line(chart, api.curve((x) => serie(x, v.tertiary), 0, rad(90), 200), api.C.red, [6, 4], 2.4);
          api.label(chart, rad(88), rad(88), "θ", api.C.grayLight, "right");
          api.label(chart, rad(88), 1.06, "sen θ", api.C.green, "right");
          api.dot(chart, rad(v.parameter), Math.sin(rad(v.parameter)), api.C.ink, 5);

          const s = api.axes(api.second, 1, 90, 0, 20, "θ (°)", "erro relativo (%)", { xTicks: [0, 30, 60, 90] });
          api.line(s, api.curve((d) => Math.min(20, P.linearisationError(rad(d)) * 100), 1, 90, 160), api.C.blue);
          api.line(s, api.curve((d) => {
            const e = P.periodExact(rad(d), 1);
            return Math.min(20, (Math.abs(P.periodSmall(1) - e) / e) * 100);
          }, 1, 90, 160), api.C.gold, [5, 4], 2.2);
          api.hline(s, v.secondary * 100, api.C.red, [4, 4], "tolerância");
          api.dot(s, v.parameter, Math.min(20, P.linearisationError(rad(v.parameter)) * 100), api.C.blue, 4.5);
        },

        text(v, api) {
          const th = rad(v.parameter);
          const errSin = P.linearisationError(th);
          const Tex = P.periodExact(th, 1);
          const errT = Math.abs(P.periodSmall(1) - Tex) / Tex;
          return {
            title: "Onde sen θ ≈ θ deixa de valer",
            subtitle: `θ = ${api.fmt(v.parameter, 0)}° = ${api.fmt(th, 4)} rad · ${api.fmt(v.tertiary, 0)} termo(s) da série`,
            regime: errSin < v.secondary ? ["dentro da tolerância", "ok"] : ["fora da tolerância", "alert"],
            caption: "O erro na força e o erro no período crescem juntos, mas não na mesma proporção: o período é uma média sobre todo o percurso, e por isso é mais tolerante.",
            prediction: "Para 1 % de tolerância, qual ângulo é o limite da aproximação?",
            calculation: `sen ${api.fmt(v.parameter, 0)}° = ${api.fmt(Math.sin(th), 5)} contra θ = ${api.fmt(th, 5)}<br>erro relativo = <b>${api.fmt(errSin * 100, 2)} %</b><em>erro correspondente no período: ${api.fmt(errT * 100, 2)} %</em>`,
            metrics: [
              ["sen θ", api.fmt(Math.sin(th), 5)],
              ["θ em radianos", api.fmt(th, 5)],
              ["erro em sen θ", `${api.fmt(errSin * 100, 2)} %`],
              ["erro no período", `${api.fmt(errT * 100, 2)} %`],
              ["primeiro termo omitido", api.sci(th ** 3 / 6)],
              ["tolerância adotada", `${api.fmt(v.secondary * 100, 1)} %`]
            ],
            concept: "Não linearidade não implica caos: este pêndulo autônomo tem um grau de liberdade e energia conservada, o que confina as órbitas a curvas no plano de fase.",
            prompts: [
              "Ache o ângulo em que o erro em sen θ atinge a tolerância escolhida.",
              "Compare esse ângulo com aquele em que o período erra o mesmo tanto.",
              "Acrescente termos da série e veja o alcance da aproximação aumentar."
            ],
            legend: [[api.C.green, "sen θ"], [api.C.grayLight, "θ"], [api.C.red, "série truncada"]],
            secondaryTitle: "Erro na força e erro no período",
            secondarySubtitle: "azul: sen θ ≈ θ · dourado: τ ≈ τ₀",
            secondaryCaption: "O período tolera mais porque resulta de uma média sobre o ciclo."
          };
        }
      }
    ]
  };
})();
