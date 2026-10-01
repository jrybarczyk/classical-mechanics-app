(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula06",
    discipline: "Mecânica Clássica · Aula 6",
    title: "Arrasto e velocidade terminal",
    subtitle: "Por que existe velocidade terminal, e o que fixa a escala de tempo?",

    stations: [
      {
        id: "queda",
        tab: "Linear e<br>quadrático",
        heading: "Aproximação da terminal",
        equation: "v = v_T(1 − e^{−t/τ})   ·   v = v_T tanh(gt/v_T)",
        hint: "As duas curvas estão em unidades do próprio τ. Preveja qual satura antes.",
        controls: [
          { id: "parameter", label: "massa m", min: 0.05, max: 5, step: 0.05, value: 1, digits: 2, unit: "kg" },
          { id: "secondary", label: "coeficiente linear b", min: 0.05, max: 4, step: 0.05, value: 0.5, digits: 2, unit: "kg/s" },
          { id: "tertiary", label: "instante t", min: 0, max: 5, step: 0.02, value: 1, digits: 2, unit: "τ" }
        ],
        animate: { control: "tertiary", period: 6 },
        secondary: true,

        draw(api, v) {
          const tauv = P.tau(v.parameter, v.secondary);
          const chart = api.axes(api.main, 0, 5, 0, 1.12, "tempo t/τ", "v / v_T");
          api.line(chart, api.curve((s) => 1 - Math.exp(-s), 0, 5, 200), api.C.green);
          api.line(chart, api.curve((s) => Math.tanh(s), 0, 5, 200), api.C.red);
          api.line(chart, api.curve((s) => Math.min(1.12, s), 0, 1.2, 40), api.C.grayLight, [4, 4], 1.6);
          api.label(chart, 1.05, 1.05, "queda livre v = gt", api.C.gray, "left");
          api.hline(chart, 1, api.C.gold, [5, 4], "v_T");
          api.hline(chart, 0.95, "#cfd8d0", [2, 3]);
          api.dot(chart, 2.9957, 0.95, api.C.green, 4.5);
          api.label(chart, 3.05, 0.9, "95 % em 3τ", api.C.green, "left", "top");
          api.dot(chart, v.tertiary, 1 - Math.exp(-v.tertiary), api.C.green, 5);
          api.dot(chart, v.tertiary, Math.tanh(v.tertiary), api.C.red, 5);

          const s = api.axes(api.second, 0, 5, 0, 3.4, "tempo t/τ", "distância x / (v_T τ)");
          api.line(s, api.curve((u) => u - (1 - Math.exp(-u)), 0, 5, 160), api.C.green);
          api.line(s, api.curve((u) => Math.log(Math.cosh(u)), 0, 5, 160), api.C.red);
          api.dot(s, v.tertiary, v.tertiary - (1 - Math.exp(-v.tertiary)), api.C.green, 4.2);
        },

        text(v, api) {
          const tauv = P.tau(v.parameter, v.secondary);
          const vT = P.terminalLinear(v.parameter, v.secondary);
          const t = v.tertiary * tauv;
          const vAtual = P.vLinear(t, vT, tauv);
          return {
            title: "Aproximação da velocidade terminal",
            subtitle: `m = ${api.fmt(v.parameter)} kg · b = ${api.fmt(v.secondary)} kg/s · τ = ${api.fmt(tauv)} s`,
            caption: "Ambas partem como queda livre e saturam. Com o mesmo τ, o arrasto quadrático satura antes porque a força cresce mais depressa com v.",
            prediction: "Depois de um τ, qual das duas está mais perto da terminal? E depois de três?",
            calculation: `τ = m/b = ${api.fmt(v.parameter)}/${api.fmt(v.secondary)} = <b>${api.fmt(tauv)} s</b><br>v_T = mg/b = ${api.fmt(v.parameter)}·9,8/${api.fmt(v.secondary)} = <b>${api.fmt(vT)} m/s</b><em>0,95 = 1 − e^{−t/τ} ⟹ t = −τ ln(0,05) = ${api.fmt(P.timeToFraction(0.95, tauv))} s</em>`,
            metrics: [
              ["τ = m/b", `${api.fmt(tauv)} s`],
              ["v_T linear", `${api.fmt(vT)} m/s`],
              ["v em t", `${api.fmt(vAtual)} m/s`],
              ["v/v_T linear", api.fmt(1 - Math.exp(-v.tertiary))],
              ["v/v_T quadrático", api.fmt(Math.tanh(v.tertiary))],
              ["t para 95 %", `${api.fmt(P.timeToFraction(0.95, tauv))} s`]
            ],
            concept: "A velocidade terminal existe porque o arrasto cresce com v até equilibrar o peso; τ é o tempo que o sistema leva para esquecer a condição inicial.",
            prompts: [
              "Confirme que 95 % de v_T é atingido em 3τ, e mostre que isso não depende de m nem de b.",
              "Duplique b e diga o que acontece com v_T e com τ.",
              "Expanda a exponencial para t ≪ τ e recupere v ≈ gt."
            ],
            legend: [[api.C.green, "linear"], [api.C.red, "quadrático"], [api.C.gold, "v_T"]],
            secondaryTitle: "Distância percorrida",
            secondarySubtitle: "as duas tendem a retas de mesma inclinação, deslocadas",
            secondaryCaption: "A assíntota é x ≈ v_T(t − τ): o atraso τ é a memória do transiente."
          };
        }
      },

      {
        id: "atrator",
        tab: "Velocidade terminal<br>como atrator",
        heading: "Condição inicial arbitrária",
        equation: "v(t) = v_T + (v₀ − v_T) e^{−t/τ}<br>v − v_T decai com τ, qualquer que seja v₀",
        hint: "É a figura 2.6 do livro: lance o corpo mais rápido ou mais devagar que v_T e veja a mesma constante de tempo governar a aproximação, por cima ou por baixo.",
        controls: [
          { id: "parameter", label: "velocidade inicial v₀ (em v_T)", min: 0, max: 2.5, step: 0.05, value: 2, digits: 2, unit: "v_T" },
          { id: "secondary", label: "massa m", min: 0.05, max: 5, step: 0.05, value: 1, digits: 2, unit: "kg" },
          { id: "tertiary", label: "coeficiente linear b", min: 0.05, max: 4, step: 0.05, value: 0.5, digits: 2, unit: "kg/s" },
          { id: "quaternary", label: "instante t", min: 0, max: 4, step: 0.02, value: 1, digits: 2, unit: "τ" }
        ],
        animate: { control: "quaternary", period: 6 },
        secondary: true,

        draw(api, v) {
          const u0 = v.parameter, s0 = v.quaternary;
          const chart = api.axes(api.main, 0, 4, 0, 2.6, "tempo t/τ", "v / v_T");
          [[2, api.C.red], [1.5, api.C.gold], [0.5, api.C.lime], [0, api.C.blue]].forEach(([u, cor]) => {
            api.line(chart, api.curve((x) => 1 + (u - 1) * Math.exp(-x), 0, 4, 160), cor, [], 1.4);
          });
          api.hline(chart, 1, api.C.gray, [5, 4], "v₀ = v_T: nada muda");
          api.line(chart, api.curve((x) => Math.min(2.6, x), 0, 1.3, 20), api.C.grayLight, [3, 3], 1.2);
          api.line(chart, api.curve((x) => 1 + (u0 - 1) * Math.exp(-x), 0, 4, 200), api.C.green, [], 3.2);
          api.dot(chart, s0, 1 + (u0 - 1) * Math.exp(-s0), api.C.green, 5.5);
          api.line(chart, [[0, u0], [0.6, u0 + (1 - u0) * 0.6]], api.C.green, [4, 3], 1.2);
          api.label(chart, 3.95, 1 + (u0 - 1) * Math.exp(-3.95) + (u0 >= 1 ? 0.08 : -0.08), "sua curva", api.C.green, "right", u0 >= 1 ? "bottom" : "top");

          const sc = api.axes(api.second, 0, 4, -2.2, 0.4, "tempo t/τ", "log₁₀ |v − v_T| / |v₀ − v_T|");
          api.line(sc, api.curve((x) => -x / Math.LN10, 0, 4, 40), api.C.green, [], 2.6);
          api.dot(sc, s0, -s0 / Math.LN10, api.C.green, 4.5);
          api.hline(sc, -2, api.C.grayLight, [3, 3], "1 % em 4,6 τ");
        },

        text(v, api) {
          const tauv = P.tau(v.secondary, v.tertiary), vT = P.terminalLinear(v.secondary, v.tertiary);
          const v0 = v.parameter * vT, t = v.quaternary * tauv;
          const vt = P.vLinearGeneral(t, vT, tauv, v0);
          const acima = v.parameter > 1 + 1e-9, igual = Math.abs(v.parameter - 1) < 1e-9;
          return {
            title: "A velocidade terminal como atrator",
            subtitle: `v₀ = ${api.fmt(v.parameter)} v_T = ${api.fmt(v0)} m/s · τ = ${api.fmt(tauv)} s · v_T = ${api.fmt(vT)} m/s`,
            regime: igual ? ["v₀ = v_T: movimento uniforme", "ok"] : acima ? ["freando: aproxima-se de v_T por cima", "warn"] : ["acelerando: aproxima-se de v_T por baixo", "ok"],
            caption: "Todas as curvas convergem a v_T com a mesma constante de tempo τ: por baixo se v₀ < v_T, por cima se v₀ > v_T. A tracejada curta é a tangente inicial, de inclinação g − v₀/τ. O painel de baixo mostra que a diferença para v_T cai na mesma reta, em escala logarítmica, para qualquer v₀.",
            prediction: "Lançado com 2v_T, o corpo leva mais, menos ou o mesmo tempo para chegar a 10 % acima de v_T do que um corpo solto do repouso leva para chegar a 10 % abaixo?",
            calculation: `v(t) = v_T + (v₀ − v_T)e^{−t/τ} = ${api.fmt(vT)} + (${api.fmt(v0 - vT)})·e^{−${api.fmt(v.quaternary)}} = <b>${api.fmt(vt)} m/s</b><br>aceleração inicial: (v_T − v₀)/τ = g − v₀/τ = <b>${api.fmt((vT - v0) / tauv)} m/s²</b><em>|v − v_T| cai a 1/e em τ e a 1 % em τ ln 100 = ${api.fmt(P.timeToShrink(0.01, tauv))} s, independentemente de v₀</em>`,
            metrics: [
              ["v em t", `${api.fmt(vt)} m/s`],
              ["(v − v_T)/(v₀ − v_T)", igual ? "—" : api.fmt(Math.exp(-v.quaternary), 3)],
              ["aceleração inicial g − v₀/τ", `${api.fmt((vT - v0) / tauv)} m/s²`],
              ["tempo para |v − v_T| cair a 10 %", `${api.fmt(P.timeToShrink(0.1, tauv))} s = 2,30 τ`],
              ["tempo para 1 %", `${api.fmt(P.timeToShrink(0.01, tauv))} s = 4,61 τ`],
              ["avanço extra em relação a v_T t", `${api.fmt((v0 - vT) * tauv * (1 - Math.exp(-v.quaternary)))} m (satura em ${api.fmt((v0 - vT) * tauv)} m)`]
            ],
            concept: "Um atrator: a equação é linear e a diferença para v_T obedece ẏ = −y/τ, que não sabe de onde partiu. Isso é exclusivo do arrasto linear; no quadrático a taxa de aproximação depende da velocidade.",
            prompts: [
              "Exercício 1. Ponha v₀ = 2v_T e depois v₀ = 0 e leia o instante em que cada curva fica a 10 % de v_T. Explique por que coincidem.",
              "Exercício 2. Mostre que a aceleração inicial é g − v₀/τ e ache o v₀ que a anula.",
              "Exercício 3. Com v₀ = 2v_T, confirme que o corpo fica, para sempre, apenas (v₀ − v_T)τ à frente de um corpo que já partisse com v_T.",
              "Exercício 4. Por que este resultado (mesma constante de tempo para qualquer v₀) não vale para o arrasto quadrático?"
            ],
            legend: [[api.C.green, "sua curva"], [api.C.red, "v₀ = 2v_T"], [api.C.gold, "v₀ = 1,5v_T"], [api.C.lime, "v₀ = 0,5v_T"], [api.C.blue, "v₀ = 0"]],
            secondaryTitle: "Diferença para v_T em escala logarítmica",
            secondarySubtitle: "a mesma reta de inclinação −1/τ para qualquer v₀",
            secondaryCaption: "Uma reta em semilog é a assinatura do decaimento exponencial."
          };
        }
      },

      {
        id: "projetil",
        tab: "Projétil com arrasto:<br>perturbação",
        heading: "Alcance em primeira ordem em k",
        equation: "ẍ = −kẋ, ÿ = −kẏ − g · ε = kV/g<br>T ≃ T₀(1 − ε/3) · R′ ≃ R(1 − 4ε/3)<br>ΔR ≃ (4k v₀³/3g²) senθ sen2θ",
        hint: "A equação do tempo de voo é transcendente. Compare a solução exata (bissecção) com a primeira ordem em k e descubra até onde a reta vale.",
        controls: [
          { id: "parameter", label: "coeficiente k = b/m", min: 0, max: 0.4, step: 0.005, value: 0.02, digits: 3, unit: "1/s" },
          { id: "secondary", label: "rapidez inicial v₀", min: 10, max: 60, step: 1, value: 30, digits: 0, unit: "m/s" },
          { id: "tertiary", label: "ângulo de lançamento θ", min: 15, max: 75, step: 1, value: 45, digits: 0, unit: "°" }
        ],
        secondary: true,

        draw(api, v) {
          const k = v.parameter, v0 = v.secondary, th = v.tertiary;
          const q = P.projectileLinear(v0, th, k);
          const q0 = P.projectileLinear(v0, th, 0);
          const chart = api.axes(api.main, 0, q0.R * 1.06, 0, q0.H * 1.25, "x (m)", "y (m)");
          const parab = []; for (let i = 0; i <= 120; i += 1) { const t = (q0.T * i) / 120; parab.push([q0.U * t, q0.V * t - 4.9 * t * t]); }
          api.line(chart, parab, api.C.grayLight, [5, 4], 1.6);
          if (k > 0) {
            const pts = []; for (let i = 0; i <= 160; i += 1) { const t = (q.T * i) / 160; pts.push([q.x(t), Math.max(0, q.y(t))]); }
            api.line(chart, pts, api.C.green, [], 3);
          } else api.line(chart, parab, api.C.green, [], 3);
          api.dot(chart, q0.R, 0, api.C.gray, 4.5);
          api.dot(chart, q.R, 0, api.C.green, 5.5);
          if (q.Rlin > 0) api.dot(chart, q.Rlin, 0, api.C.red, 5, true);
          api.label(chart, q0.R, q0.H * 0.08, "R", api.C.gray, "center");
          api.label(chart, q.R, q0.H * 0.17, "R′ exato", api.C.green, "center");
          if (k > 0 && q.Rlin > 0) api.label(chart, q.Rlin, q0.H * 0.08, "1ª ordem", api.C.red, "center", "bottom");

          const sc = api.axes(api.second, 0, 0.6, 0, 0.8, "ε = kV/g", "ΔR / R");
          const ptsE = [];
          for (let e = 0; e <= 0.6001; e += 0.02) { const kk = (e * 9.8) / q0.V; const w = P.projectileLinear(v0, th, kk); ptsE.push([e, (w.R0 - w.R) / w.R0]); }
          api.line(sc, ptsE, api.C.green, [], 2.6);
          api.line(sc, [[0, 0], [0.6, 0.8]], api.C.red, [5, 4], 1.8);
          api.label(sc, 0.5, 0.72, "4ε/3", api.C.red, "right", "bottom");
          if (q.eps <= 0.6) api.dot(sc, q.eps, (q.R0 - q.R) / q.R0, api.C.green, 5);
        },

        text(v, api) {
          const k = v.parameter, v0 = v.secondary, th = v.tertiary;
          const q = P.projectileLinear(v0, th, k);
          const dR = q.R0 - q.R, dRlin = q.R0 - q.Rlin;
          const erro = dR > 0 ? Math.abs(dRlin - dR) / dR : 0;
          const regime = k === 0 ? ["sem arrasto: parábola", "ok"] : erro < 0.1 ? ["primeira ordem confiável", "ok"] : erro < 0.3 ? ["primeira ordem com erro visível", "warn"] : ["perturbação insuficiente", "alert"];
          return {
            title: "Perturbação em primeira ordem contra a solução exata",
            subtitle: `k = ${api.fmt(k, 3)} s⁻¹ · v₀ = ${api.fmt(v0, 0)} m/s · θ = ${api.fmt(th, 0)}° · ε = kV/g = ${api.fmt(q.eps, 3)}`,
            regime,
            caption: "A tracejada cinza é a parábola sem arrasto; a verde é a trajetória exata, mais curta e assimétrica. O ponto vermelho vazado marca o alcance previsto pela primeira ordem em k: ela superestima a redução, porque os termos de ordem ε² desprezados são positivos em R′. Para ε acima de 3/4 a fórmula dá alcance negativo e o ponto some: a série truncada deixou de significar algo.",
            prediction: "A redução relativa do alcance é igual, o dobro ou o quádruplo da redução relativa do tempo de voo?",
            calculation: `R = v₀² sen2θ/g = <b>${api.fmt(q.R0)} m</b> · T₀ = 2V/g = ${api.fmt(q.T0)} s · ε = ${api.fmt(k, 3)}·${api.fmt(q.V)}/9,8 = ${api.fmt(q.eps, 4)}<br>1ª ordem: T ≃ T₀(1 − ε/3) = ${api.fmt(q.Tlin)} s · R′ ≃ R(1 − 4ε/3) = <b>${api.fmt(q.Rlin)} m</b> · ΔR ≃ ${api.fmt(dRlin)} m<br>exato (bissecção em y(T) = 0): T = ${api.fmt(q.T, 3)} s · R′ = x(T) = <b>${api.fmt(q.R)} m</b> · ΔR = ${api.fmt(dR)} m<em>erro da primeira ordem em ΔR: ${api.fmt(100 * erro, 1)} % · altura máxima: exata ${api.fmt(q.H)} m, 1ª ordem H₀(1 − 2ε/3) = ${api.fmt(q.Hlin)} m</em>`,
            metrics: [
              ["parâmetro ε = kV/g", api.fmt(q.eps, 4)],
              ["tempo de voo T exato / 1ª ordem", `${api.fmt(q.T, 3)} / ${api.fmt(q.Tlin, 3)} s`],
              ["alcance R′ exato / 1ª ordem", `${api.fmt(q.R)} / ${q.Rlin > 0 ? api.fmt(q.Rlin) + " m" : "negativo: a 1ª ordem perdeu o sentido"}`],
              ["ΔR exato / 1ª ordem", `${api.fmt(dR)} / ${api.fmt(dRlin)} m`],
              ["erro da 1ª ordem em ΔR", `${api.fmt(100 * erro, 1)} %`],
              ["altura máxima exata / 1ª ordem", `${api.fmt(q.H)} / ${api.fmt(q.Hlin)} m`],
              ["limite horizontal U/k (assíntota)", k > 0 ? `${api.fmt(q.U / k, 0)} m` : "∞"]
            ],
            concept: "Perturbação troca uma equação transcendente por uma sequência de contas algébricas, cada uma usando a anterior: dentro do termo que já tem um fator k entra a solução de ordem zero. O preço é uma série truncada, que só vale enquanto a própria correção é pequena.",
            prompts: [
              "Exercício 1. Com k = 0,02 s⁻¹, v₀ = 30 m/s e θ = 45°, reproduza à mão R, T₀, ε, T e ΔR da primeira ordem e compare com os valores exatos da tela (é o exemplo resolvido da nota).",
              "Exercício 2. Aumente k até o erro da primeira ordem em ΔR chegar a 10 % e anote o ε correspondente; repita para 25 %. Vale a regra 'confiável enquanto ΔR/R ≲ 0,1'?",
              "Exercício 3. Verifique que ΔR/R é quatro vezes a redução relativa de T e o dobro da de H, e explique as duas vias pelas quais o arrasto encurta o alcance.",
              "Exercício 4. Mantenha k e v₀ e varie θ: para que ângulo ΔR é máximo? Confira com senθ sen2θ.",
              "Exercício 5. Leve k a 0,4 s⁻¹: a trajetória exata tende a uma assíntota vertical em x = U/k. Leia U/k e compare com R′."
            ],
            legend: [[api.C.grayLight, "sem arrasto"], [api.C.green, "exato"], [api.C.red, "primeira ordem"]],
            secondaryTitle: "Redução relativa do alcance contra ε",
            secondarySubtitle: "curva exata e reta 4ε/3 da primeira ordem (Fig. 3-5 do Marion)",
            secondaryCaption: "A reta superestima ΔR; o afastamento cresce com ε e é o custo de truncar a série."
          };
        }
      },

      {
        id: "sedimentacao",
        tab: "Sedimentação<br>de Stokes",
        heading: "Regime linear em contexto",
        equation: "b = 6πηR   v_T = 2R²(ρp − ρf)g / 9η",
        hint: "R é o controle decisivo. Antes de movê-lo, decida se v_T cresce com R ou com R².",
        controls: [
          { id: "parameter", label: "raio R", min: 0.5e-6, max: 2e-5, step: 1e-7, value: 3.5e-6, digits: 7, unit: "m" },
          { id: "secondary", label: "contraste ρp − ρf", min: 10, max: 400, step: 5, value: 80, digits: 0, unit: "kg/m³" },
          { id: "tertiary", label: "viscosidade η", min: 0.5e-3, max: 4e-3, step: 0.05e-3, value: 1.2e-3, digits: 4, unit: "Pa·s" }
        ],

        draw(api, v) {
          const L10 = Math.log10;
          const chart = api.axes(api.main, -6.5, -4.4, -9, -3, "raio R (m)", "v_T (m/s)", {
            xFormat: (t) => `10${api.sup(Math.round(t * 10) / 10)}`,
            yFormat: (t) => `10${api.sup(Math.round(t))}`
          });
          api.line(chart, api.curve((lr) => L10(P.stokesTerminal(Math.pow(10, lr), v.secondary, v.tertiary)), -6.5, -4.4, 140), api.C.green);

          /* Inclinação 2 no gráfico log-log é a assinatura de v_T ∝ R². */
          const r0 = -6.2, y0 = L10(P.stokesTerminal(Math.pow(10, r0), v.secondary, v.tertiary));
          api.line(chart, [[r0, y0], [r0 + 0.5, y0], [r0 + 0.5, y0 + 1]], api.C.gold, [4, 4], 1.6);
          api.label(chart, r0 + 0.52, y0 + 0.55, "inclinação 2", api.C.gold, "left");

          const vAtual = P.stokesTerminal(v.parameter, v.secondary, v.tertiary);
          api.dot(chart, L10(v.parameter), L10(vAtual), api.C.red, 5.5);
          [["hemácia", 3.5e-6], ["rouleaux", 1.2e-5], ["plaqueta", 1.2e-6]].forEach(([nome, R]) => {
            api.dot(chart, L10(R), L10(P.stokesTerminal(R, v.secondary, v.tertiary)), api.C.blue, 4);
            api.label(chart, L10(R), L10(P.stokesTerminal(R, v.secondary, v.tertiary)) + 0.28, nome, api.C.muted, "center");
          });
        },

        text(v, api) {
          const vT = P.stokesTerminal(v.parameter, v.secondary, v.tertiary);
          const mmh = P.toMillimetresPerHour(vT);
          const Re = P.reynolds(1025, vT, v.parameter, v.tertiary);
          const tauS = P.stokesTau(v.parameter, 1100, v.tertiary);
          return {
            title: "Velocidade de sedimentação contra o raio",
            subtitle: `R = ${api.sci(v.parameter)} m · Δρ = ${api.fmt(v.secondary, 0)} kg/m³ · η = ${api.sci(v.tertiary)} Pa·s`,
            regime: Re < 1 ? ["Stokes válido", "ok"] : ["fora do regime de Stokes", "alert"],
            caption: "A reta tem inclinação 2, não 1: dobrar o raio quadruplica a sedimentação. É por isso que a agregação em rouleaux acelera tanto a hemossedimentação.",
            prediction: "Se o raio dobrar, v_T dobra ou quadruplica?",
            calculation: `v_T = 2R²Δρg/9η = 2·(${api.sci(v.parameter)})²·${api.fmt(v.secondary, 0)}·9,8 / (9·${api.sci(v.tertiary)})<br><b>= ${api.sci(vT)} m/s = ${api.fmt(mmh)} mm/h</b><em>τ = m/b = ${api.sci(tauS)} s: o regime terminal é atingido de imediato</em>`,
            metrics: [
              ["v_T", `${api.sci(vT)} m/s`],
              ["v_T em mm/h", api.fmt(mmh)],
              ["b = 6πηR", api.sci(P.stokesB(v.tertiary, v.parameter))],
              ["τ = m/b", `${api.sci(tauS)} s`],
              ["Reynolds", api.sci(Re)]
            ],
            concept: "O coeficiente b não é ajustável: para a esfera, a hidrodinâmica o calcula. É isso que transforma o modelo em previsão, e não em ajuste.",
            prompts: [
              "Confirme a inclinação 2 medindo v_T em dois raios que difiram por um fator 10.",
              "Ache o η que levaria a hemácia a sedimentar dez vezes mais devagar.",
              "Verifique que Re permanece muito abaixo de 1 em toda a faixa de raios."
            ],
            legend: [[api.C.green, "v_T(R)"], [api.C.gold, "inclinação 2"], [api.C.blue, "casos de referência"]]
          };
        }
      },

      {
        id: "aerossol",
        tab: "Física médica:<br>aerossóis inalados",
        heading: "Partícula de aerossol no ar",
        equation: "v_T = d²(ρ_p − ρ_ar)g / 18η_ar<br>fração depositada ≃ v_T t / D",
        hint: "Por que os inaladores produzem gotas de 1 a 5 μm, e por que se pede para prender a respiração depois do jato? É Stokes no ar.",
        controls: [
          { id: "parameter", label: "diâmetro da partícula d", min: 0.5, max: 10, step: 0.1, value: 3, digits: 1, unit: "μm" },
          { id: "secondary", label: "pausa respiratória t", min: 0, max: 10, step: 0.1, value: 2, digits: 1, unit: "s" },
          { id: "tertiary", label: "diâmetro da via aérea D", min: 0.2, max: 4, step: 0.1, value: 0.6, digits: 1, unit: "mm" },
          { id: "quaternary", label: "densidade da partícula ρ_p", min: 800, max: 1500, step: 10, value: 1000, digits: 0, unit: "kg/m³" }
        ],
        secondary: true,

        draw(api, v) {
          const d = v.parameter * 1e-6, t = v.secondary, D = v.tertiary * 1e-3, rho = v.quaternary;
          const a = P.aerosolSettling(d, rho, D, t);
          const chart = api.axes(api.main, 0.5, 10, 0, 1.05, "diâmetro d (μm)", "fração depositada por sedimentação");
          api.line(chart, api.curve((dd) => P.aerosolSettling(dd * 1e-6, rho, D, t).fracao, 0.5, 10, 200), api.C.green, [], 3);
          [0.5, 1, 5].forEach((tt) => api.line(chart, api.curve((dd) => P.aerosolSettling(dd * 1e-6, rho, D, tt).fracao, 0.5, 10, 160), api.C.grayLight, [4, 4], 1.2));
          api.label(chart, 9.8, Math.min(1, P.aerosolSettling(9.8e-6, rho, D, 0.5).fracao) - 0.03, "t = 0,5 s", api.C.gray, "right", "top");
          api.label(chart, 9.8, Math.min(1, P.aerosolSettling(9.8e-6, rho, D, 5).fracao) + 0.02, "t = 5 s", api.C.gray, "right", "bottom");
          api.area(chart, [[1, 0], [5, 0]], "rgba(131,196,78,.12)", 1.05);
          api.label(chart, 3, 1.0, "faixa respirável dos inaladores (1 a 5 μm)", api.C.lime, "center", "top");
          api.dot(chart, v.parameter, a.fracao, api.C.red, 6);

          const L10 = Math.log10;
          const sc = api.axes(api.second, L10(0.5), L10(10), -5.2, -2, "diâmetro d (μm)", "v_T (m/s)", {
            xTicks: [L10(0.5), 0, L10(2), L10(5), 1], xFormat: (x) => api.fmt(Math.pow(10, x), 1), yFormat: (y) => `10${api.sup(Math.round(y))}`
          });
          api.line(sc, api.curve((lx) => L10(P.aerosolSettling(Math.pow(10, lx) * 1e-6, rho, D, t).vT), L10(0.5), 1, 100), api.C.blue);
          api.dot(sc, L10(v.parameter), L10(a.vT), api.C.red, 4.5);
        },

        text(v, api) {
          const d = v.parameter * 1e-6, t = v.secondary, D = v.tertiary * 1e-3, rho = v.quaternary;
          const a = P.aerosolSettling(d, rho, D, t);
          return {
            title: "Sedimentação de aerossóis nas vias aéreas",
            subtitle: `d = ${api.fmt(v.parameter, 1)} μm · ρ_p = ${api.fmt(rho, 0)} kg/m³ · D = ${api.fmt(v.tertiary, 1)} mm · pausa ${api.fmt(t, 1)} s`,
            regime: a.Re > 1 ? ["fora de Stokes", "alert"] : a.fracao >= 0.999 ? ["deposição completa", "ok"] : a.fracao > 0.3 ? ["deposição parcial", "warn"] : ["quase tudo exalado", "alert"],
            caption: "No ar, uma gota de poucos micrômetros cai a milímetros por segundo: em um bronquíolo de meio milímetro, uma pausa de poucos segundos basta para depositá-la; sem pausa, ela sai na expiração. Partículas grandes nem chegam lá, pois impactam na garganta; pequenas demais não sedimentam a tempo. Daí a faixa de 1 a 5 μm dos inaladores.",
            prediction: "Dobrar o diâmetro da gota multiplica a velocidade de sedimentação por 2 ou por 4?",
            calculation: `v_T = d²(ρ_p − ρ_ar)g/18η = (${api.sci(d)})²·${api.fmt(rho - 1.2, 0)}·9,8/(18·1,8·10⁻⁵) = <b>${api.sci(a.vT)} m/s = ${api.fmt(a.vT * 1000, 2)} mm/s</b><br>tempo para atravessar D: D/v_T = ${api.fmt(a.tQueda, 2)} s · fração em ${api.fmt(t, 1)} s: v_T t/D = <b>${api.fmt(Math.min(1, (a.vT * t) / D), 2)}</b><em>Re = ${api.sci(a.Re)} (Stokes vale) · τ = m/b = ${api.sci(a.tauP)} s: a gota está sempre na velocidade terminal local</em>`,
            metrics: [
              ["v_T no ar", `${api.fmt(a.vT * 1000, 3)} mm/s`],
              ["tempo para cair D", `${api.fmt(a.tQueda, 2)} s`],
              ["fração depositada na pausa", api.fmt(a.fracao, 2)],
              ["pausa para deposição completa", `${api.fmt(a.tQueda, 1)} s`],
              ["Reynolds", api.sci(a.Re)],
              ["τ de relaxação da gota", `${api.sci(a.tauP)} s`]
            ],
            concept: "É a mesma lei de Stokes da hemossedimentação, com o ar no lugar do plasma: v_T ∝ d². Como a via aérea é estreita, uma velocidade de milímetros por segundo decide, em segundos, se o fármaco fica ou sai.",
            prompts: [
              "Exercício 1. Para d = 3 μm e D = 0,6 mm, ache a pausa mínima para deposição completa e compare com os 5 a 10 s recomendados nas bulas.",
              "Exercício 2. Mostre que a fração depositada cresce com d²: uma gota de 1 μm precisa de uma pausa 9 vezes maior que uma de 3 μm.",
              "Exercício 3. Troque D para 4 mm (brônquio) e explique por que a sedimentação quase não deposita nada ali, deixando esse papel para a inércia (impactação) nas bifurcações.",
              "Exercício 4. Por que uma gota de 20 μm, que sedimentaria depressa, não é usada? Pense onde ela para antes de chegar aos bronquíolos.",
              "Exercício 5. Estime τ = m/b da gota e justifique por que v_T pode ser tratada como instantânea."
            ],
            legend: [[api.C.green, "fração depositada (pausa atual)"], [api.C.grayLight, "pausas de 0,5, 1 e 5 s"], [api.C.lime, "faixa dos inaladores"], [api.C.blue, "v_T(d)"]],
            secondaryTitle: "Velocidade terminal contra o diâmetro",
            secondarySubtitle: "log-log, inclinação 2: v_T ∝ d²",
            secondaryCaption: "De 1 a 10 μm, v_T vai de 0,03 a 3 mm/s."
          };
        }
      },

      {
        id: "centrifuga",
        tab: "Física médica:<br>centrifugação",
        heading: "Sedimentação acelerada: g → Ω²r",
        equation: "Ω = 2π·rpm/60 · RCF = Ω²r/g<br>v = 2R²Δρ(Ω²r)/9η · t = L/v",
        hint: "A mesma esfera de Stokes, com a gravidade substituída pela aceleração centrífuga. Preveja por quanto a sedimentação acelera a 3000 rpm e 10 cm.",
        controls: [
          { id: "parameter", label: "rotação", min: 500, max: 6000, step: 50, value: 3000, digits: 0, unit: "rpm" },
          { id: "secondary", label: "raio efetivo r do rotor", min: 5, max: 20, step: 0.5, value: 10, digits: 1, unit: "cm" },
          { id: "tertiary", label: "raio da partícula R", min: 0.5, max: 6, step: 0.1, value: 3.5, digits: 1, unit: "μm" },
          { id: "quaternary", label: "percurso L no tubo", min: 0.5, max: 5, step: 0.1, value: 2, digits: 1, unit: "cm" }
        ],
        secondary: true,

        draw(api, v) {
          const rpm = v.parameter, r = v.secondary / 100, R = v.tertiary * 1e-6, L = v.quaternary / 100;
          const c = P.centrifugeSettling(R, 80, 1.2e-3, rpm, r, L);
          const L10 = Math.log10;
          const chart = api.axes(api.main, 500, 6000, 0, Math.max(2.5, L10(P.centrifugeSettling(R, 80, 1.2e-3, 500, r, L).tempo) + 0.3), "rotação (rpm)", "tempo para percorrer L (s)", {
            yTicks: [0, 1, 2, 3, 4], yFormat: (y) => `10${api.sup(Math.round(y))}`
          });
          api.line(chart, api.curve((n) => L10(P.centrifugeSettling(R, 80, 1.2e-3, n, r, L).tempo), 500, 6000, 200), api.C.green, [], 3);
          api.hline(chart, L10(60), api.C.gold, [4, 4], "1 min");
          api.hline(chart, L10(600), api.C.gold, [4, 4], "10 min");
          api.dot(chart, rpm, L10(c.tempo), api.C.red, 6);
          api.label(chart, rpm, L10(c.tempo) + 0.15, `${api.fmt(c.tempo, 0)} s`, api.C.red, "center", "bottom");

          const sc = api.axes(api.second, 500, 6000, 0, P.centrifuge(6000, r).rcf * 1.05, "rotação (rpm)", "RCF = Ω²r/g");
          api.line(sc, api.curve((n) => P.centrifuge(n, r).rcf, 500, 6000, 120), api.C.blue);
          api.dot(sc, rpm, c.rcf, api.C.red, 4.5);
        },

        text(v, api) {
          const rpm = v.parameter, r = v.secondary / 100, R = v.tertiary * 1e-6, L = v.quaternary / 100;
          const c = P.centrifugeSettling(R, 80, 1.2e-3, rpm, r, L);
          const horas = c.tempoG / 3600;
          return {
            title: "Centrifugação de sangue",
            subtitle: `${api.fmt(rpm, 0)} rpm · r = ${api.fmt(v.secondary, 1)} cm · R = ${api.fmt(v.tertiary, 1)} μm · L = ${api.fmt(v.quaternary, 1)} cm`,
            regime: c.Re > 1 ? ["fora de Stokes", "alert"] : c.tempo < 120 ? ["sedimenta em menos de 2 min", "ok"] : c.tempo < 900 ? ["alguns minutos", "warn"] : ["lento: aumente rpm ou r", "alert"],
            caption: "Com Δρ = 80 kg/m³ e η = 1,2·10⁻³ Pa·s, os valores do exemplo da hemácia. Sob gravidade a hemácia leva horas para percorrer 2 cm; a centrífuga multiplica a aceleração pelo RCF e o tempo cai na mesma proporção. A troca g → Ω²r vale no referencial do tubo, que gira com o rotor (Aula 10).",
            prediction: "Dobrar a rotação divide o tempo de sedimentação por 2 ou por 4?",
            calculation: `Ω = 2π·${api.fmt(rpm, 0)}/60 = <b>${api.fmt(c.omega, 1)} rad/s</b> · Ω²r = ${api.fmt(c.a, 0)} m/s² = <b>${api.fmt(c.rcf, 0)} g</b><br>v = 2R²Δρ(Ω²r)/9η = <b>${api.sci(c.v)} m/s</b> contra ${api.sci(c.vg)} m/s sob gravidade<br>t = L/v = <b>${api.fmt(c.tempo, 1)} s</b> contra ${api.fmt(horas, 1)} h sob gravidade<em>Re = ${api.sci(c.Re)}: Stokes continua válido mesmo com a aceleração multiplicada</em>`,
            metrics: [
              ["Ω", `${api.fmt(c.omega, 1)} rad/s`],
              ["RCF = Ω²r/g", `${api.fmt(c.rcf, 0)} g`],
              ["v de sedimentação", `${api.sci(c.v)} m/s`],
              ["tempo para L na centrífuga", `${api.fmt(c.tempo, 1)} s`],
              ["tempo para L sob gravidade", `${api.fmt(horas, 2)} h`],
              ["Reynolds na centrífuga", api.sci(c.Re)]
            ],
            concept: "Nada muda na física da esfera: a lei de Stokes é a mesma. Muda a aceleração efetiva, e é por isso que os protocolos de laboratório falam em RCF (g relativo), não em rpm, que só tem sentido junto com o raio do rotor.",
            prompts: [
              "Exercício 1. A 3000 rpm e r = 10 cm, calcule Ω, o RCF e o tempo para uma hemácia percorrer 2 cm; compare com o tempo sob gravidade (é o Exercício 11 da nota).",
              "Exercício 2. Mostre que o tempo cai com 1/rpm²: dobrar a rotação divide o tempo por 4. Confira na curva.",
              "Exercício 3. Dois rotores dão o mesmo RCF com rpm diferentes se r for ajustado: ache o par (rpm, r) que reproduz 1000 g com r = 15 cm.",
              "Exercício 4. Para plaquetas (R ≈ 1,2 μm) o tempo é quanto maior? Use R² e explique por que o plasma rico em plaquetas é obtido com centrifugação mais branda.",
              "Exercício 5. Verifique que Re permanece ≪ 1 até 6000 rpm e discuta o que falharia no modelo se não permanecesse."
            ],
            legend: [[api.C.green, "tempo para percorrer L"], [api.C.gold, "1 e 10 minutos"], [api.C.blue, "RCF(rpm)"], [api.C.red, "ponto atual"]],
            secondaryTitle: "Aceleração relativa contra a rotação",
            secondarySubtitle: "RCF ∝ rpm²: a parábola que os protocolos escondem atrás do número em g",
            secondaryCaption: "O mesmo RCF em rotores de raio diferente exige rpm diferentes."
          };
        }
      },

      {
        id: "euler",
        tab: "Integração<br>numérica",
        heading: "Euler contra a solução exata",
        equation: "v_{n+1} = v_n + (Δt/m)[mg − c|v_n|v_n]",
        hint: "Reduza Δt pela metade e verifique se o erro cai pela metade. Preveja antes.",
        controls: [
          { id: "parameter", label: "passo Δt", min: 0.005, max: 0.4, step: 0.005, value: 0.2, digits: 3, unit: "s" },
          { id: "secondary", label: "coeficiente quadrático c", min: 0.05, max: 2, step: 0.05, value: 0.5, digits: 2, unit: "kg/m" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 5, step: 0.1, value: 2, digits: 1, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const tf = 4;
          const r = P.eulerQuadratic(v.parameter, tf, v.tertiary, v.secondary);
          const chart = api.axes(api.main, 0, tf, 0, r.vT * 1.25, "tempo t (s)", "velocidade v (m/s)");
          api.line(chart, api.curve((t) => P.vQuadratic(t, r.vT), 0, tf, 200), api.C.green, [], 3);
          api.line(chart, r.serie, api.C.red, [], 2);
          r.serie.filter((_, i) => i % Math.max(1, Math.round(r.serie.length / 26)) === 0)
            .forEach(([t, vv]) => api.dot(chart, t, vv, api.C.red, 3));
          api.hline(chart, r.vT, api.C.gold, [5, 4], "v_T = √(mg/c)");

          const s = api.axes(api.second, -2.4, -0.4, -4, -0.6, "log₁₀ Δt", "log₁₀ erro máximo", {
            xFormat: (t) => `10${api.sup(Math.round(t * 10) / 10)}`,
            yFormat: (t) => `10${api.sup(Math.round(t))}`
          });
          const pts = [];
          for (let e = -2.4; e <= -0.4; e += 0.1) {
            const dt = Math.pow(10, e);
            pts.push([e, Math.log10(Math.max(1e-12, P.eulerQuadratic(dt, tf, v.tertiary, v.secondary).erroMaximo))]);
          }
          api.line(s, pts, api.C.blue);
          api.dot(s, Math.log10(v.parameter), Math.log10(Math.max(1e-12, r.erroMaximo)), api.C.red, 4.5);
          const [ax, ay] = pts[4];
          api.line(s, [[ax, ay], [ax + 0.6, ay], [ax + 0.6, ay + 0.6]], api.C.gold, [4, 4], 1.5);
          api.label(s, ax + 0.62, ay + 0.32, "inclinação 1", api.C.gold, "left");
        },

        text(v, api) {
          const r = P.eulerQuadratic(v.parameter, 4, v.tertiary, v.secondary);
          const meio = P.eulerQuadratic(v.parameter / 2, 4, v.tertiary, v.secondary);
          const razao = meio.erroMaximo > 0 ? r.erroMaximo / meio.erroMaximo : NaN;
          return {
            title: "Euler explícito e a solução analítica",
            subtitle: `Δt = ${api.fmt(v.parameter, 3)} s · c = ${api.fmt(v.secondary)} kg/m · m = ${api.fmt(v.tertiary, 1)} kg`,
            regime: r.erroMaximo < 0.01 ? ["erro abaixo de 1 %", "ok"] : r.erroMaximo < 0.05 ? ["erro visível", "warn"] : ["passo grande demais", "alert"],
            caption: "A curva verde é a solução em tanh; os pontos vermelhos são Euler. O painel secundário mostra que o erro cai proporcionalmente ao passo — primeira ordem.",
            prediction: "Metade do passo dá metade do erro, um quarto, ou a raiz?",
            calculation: `v_T = √(mg/c) = √(${api.fmt(v.tertiary, 1)}·9,8/${api.fmt(v.secondary)}) = <b>${api.fmt(r.vT)} m/s</b><br>erro máximo com Δt = ${api.fmt(v.parameter, 3)} s: <b>${api.sci(r.erroMaximo)}</b><em>com Δt/2: ${api.sci(meio.erroMaximo)} — razão ${api.fmt(razao)}, próxima de 2</em>`,
            metrics: [
              ["v_T", `${api.fmt(r.vT)} m/s`],
              ["passos", String(r.serie.length - 1)],
              ["erro máximo", api.sci(r.erroMaximo)],
              ["erro com Δt/2", api.sci(meio.erroMaximo)],
              ["razão dos erros", api.fmt(razao)]
            ],
            concept: "Comparar duas resoluções é o único teste honesto de um resultado numérico: quem não faz o refinamento não sabe se o número significa algo.",
            prompts: [
              "Meça a razão dos erros para três passos diferentes e confirme a primeira ordem.",
              "Ache o maior Δt que mantém o erro abaixo de 1 %.",
              "Explique por que Euler explícito subestima ou superestima v durante o transiente."
            ],
            legend: [[api.C.green, "tanh exato"], [api.C.red, "Euler"], [api.C.gold, "v_T"]],
            secondaryTitle: "Erro contra passo, em log-log",
            secondarySubtitle: "inclinação 1 confirma o método de primeira ordem",
            secondaryCaption: "Se a inclinação fosse 2, o método seria de segunda ordem."
          };
        }
      }
    ]
  };
})();
