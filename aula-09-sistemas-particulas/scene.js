(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula09",
    discipline: "Mecânica Clássica · Aula 9",
    title: "Centro de massa e colisões",
    subtitle: "O que as forças internas podem mudar, e o que elas jamais mudam?",

    stations: [
      {
        id: "cm",
        tab: "Centro<br>de massa",
        heading: "Interno contra externo",
        equation: "MR̈ = F_ext",
        hint: "As duas partículas se agitam internamente. Acompanhe só o ponto preto.",
        controls: [
          { id: "parameter", label: "massa m₁", min: 0.5, max: 6, step: 0.1, value: 1, digits: 1, unit: "kg" },
          { id: "secondary", label: "amplitude do movimento interno", min: 0, max: 2.5, step: 0.05, value: 1.4, digits: 2, unit: "m" },
          { id: "tertiary", label: "instante t", min: 0, max: 2.4, step: 0.02, value: 1, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 5 },

        draw(api, v) {
          const m1 = v.parameter, m2 = 2;
          const M = m1 + m2;
          const chart = api.axes(api.main, -1, 11, -1.5, 9, "x (m)", "y (m)");

          const posicoes = (t) => {
            const [X, Y] = P.cmTrajectory(t, 0, 0, 4, 12);
            /* Movimento interno arbitrário, sujeito a Σmᵢrᵢ′ = 0. */
            const s = v.secondary * Math.sin(4 * t);
            const c = v.secondary * 0.6 * Math.cos(4 * t);
            return {
              cm: [X, Y],
              p1: [X + (m2 / M) * s, Y + (m2 / M) * c],
              p2: [X - (m1 / M) * s, Y - (m1 / M) * c]
            };
          };

          api.line(chart, api.param((t) => posicoes(t).cm, 0, 2.4, 200), api.C.ink, [5, 4], 2);
          api.line(chart, api.param((t) => posicoes(t).p1, 0, 2.4, 300), api.C.green, [], 1.8);
          api.line(chart, api.param((t) => posicoes(t).p2, 0, 2.4, 300), api.C.blue, [], 1.8);

          const agora = posicoes(v.tertiary);
          api.line(chart, [agora.p1, agora.p2], api.C.grayLight, [3, 3], 1.4);
          api.dot(chart, agora.p1[0], agora.p1[1], api.C.green, 4 + m1);
          api.dot(chart, agora.p2[0], agora.p2[1], api.C.blue, 4 + m2);
          api.dot(chart, agora.cm[0], agora.cm[1], api.C.ink, 5.5);
          api.label(chart, agora.cm[0], agora.cm[1] + 0.35, "CM", api.C.ink, "center");
          api.hline(chart, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const m1 = v.parameter, m2 = 2, M = m1 + m2;
          const [X, Y] = P.cmTrajectory(v.tertiary, 0, 0, 4, 12);
          return {
            title: "Trajetórias das partículas e do centro de massa",
            subtitle: `m₁ = ${api.fmt(m1, 1)} kg · m₂ = ${api.fmt(m2, 1)} kg · t = ${api.fmt(v.tertiary)} s`,
            caption: "As duas curvas coloridas são complicadas; a tracejada preta é uma parábola perfeita. Nenhuma agitação interna consegue tirá-la de lá.",
            prediction: "Aumentando a amplitude do movimento interno, a trajetória do CM muda?",
            calculation: `R = (m₁r₁ + m₂r₂)/M, com M = ${api.fmt(M, 1)} kg<br>Y_CM(t) = v₀ᵧt − ½gt² = 12·${api.fmt(v.tertiary)} − 4,9·${api.fmt(v.tertiary ** 2)} = <b>${api.fmt(Y)} m</b><em>as forças internas cancelam aos pares e somem de MR̈ = F_ext</em>`,
            metrics: [
              ["massa total M", `${api.fmt(M, 1)} kg`],
              ["X do CM", `${api.fmt(X)} m`],
              ["Y do CM", `${api.fmt(Y)} m`],
              ["amplitude interna", `${api.fmt(v.secondary)} m`],
              ["razão de excursões", api.fmt(m2 / m1)]
            ],
            concept: "As interações internas redistribuem posição e energia, mas não deslocam o centro de massa: a terceira lei as cancela aos pares.",
            prompts: [
              "Zere a amplitude interna e confirme que as três curvas se sobrepõem.",
              "Mostre que a excursão de cada partícula em torno do CM é inversa à sua massa.",
              "Explique por que o CM de um saltador segue a parábola do peso, qualquer que seja a técnica."
            ],
            legend: [[api.C.green, "m₁"], [api.C.blue, "m₂"], [api.C.ink, "centro de massa"]]
          };
        }
      },

      {
        id: "colisao",
        tab: "Colisão e<br>restituição",
        heading: "Coeficiente de restituição",
        equation: "e = −(v₂f − v₁f)/(v₂ᵢ − v₁ᵢ)",
        hint: "O momento se conserva para todo e. Preveja o que acontece com a energia.",
        controls: [
          { id: "parameter", label: "coeficiente e", min: 0, max: 1, step: 0.01, value: 0.6, digits: 2 },
          { id: "secondary", label: "razão de massas m₁/m₂", min: 0.1, max: 6, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "velocidade inicial v₁", min: 0.5, max: 10, step: 0.1, value: 5, digits: 1, unit: "m/s" }
        ],
        secondary: true,

        draw(api, v) {
          const m2 = 2, m1 = v.secondary * m2;
          const r = P.restitution1D(m1, m2, v.tertiary, 0, v.parameter);
          const lim = Math.max(Math.abs(r.v1f), Math.abs(r.v2f), v.tertiary) * 1.3;
          const chart = api.axes(api.main, -0.5, 4.5, -lim, lim, "", "velocidade (m/s)", { xTicks: [] });
          api.hline(chart, 0, "#b9c4bb", []);
          api.bars(chart, [
            ["v₁ antes", v.tertiary, api.C.green],
            ["v₂ antes", 0, api.C.blue],
            ["v₁ depois", r.v1f, api.C.green],
            ["v₂ depois", r.v2f, api.C.blue]
          ], api.C.green, { pad: 26 });
          api.hline(chart, r.vcm, api.C.gold, [5, 4], "v do centro de massa");

          const s = api.axes(api.second, 0, 1, 0, P.maxLoss(m1, m2, v.tertiary, 0) * 1.15, "coeficiente e", "energia perdida (J)");
          api.line(s, api.curve((e) => P.restitution1D(m1, m2, v.tertiary, 0, e).perda, 0, 1, 120), api.C.red);
          api.hline(s, P.maxLoss(m1, m2, v.tertiary, 0), api.C.gold, [5, 4], "½μv_rel²");
          api.dot(s, v.parameter, r.perda, api.C.red, 4.5);
        },

        text(v, api) {
          const m2 = 2, m1 = v.secondary * m2;
          const r = P.restitution1D(m1, m2, v.tertiary, 0, v.parameter);
          const mu = P.reducedMass(m1, m2);
          return {
            title: "Velocidades antes e depois",
            subtitle: `e = ${api.fmt(v.parameter)} · m₁/m₂ = ${api.fmt(v.secondary)} · v₁ = ${api.fmt(v.tertiary, 1)} m/s`,
            regime: v.parameter > 0.99 ? ["elástica", "ok"] : v.parameter < 0.01 ? ["perfeitamente inelástica", "alert"] : ["parcialmente inelástica", "warn"],
            caption: "A linha dourada tracejada é a velocidade do centro de massa: ela não se move na colisão, e as duas barras finais se reorganizam em torno dela.",
            prediction: "Para que valor de e a perda de energia é máxima?",
            calculation: `v_cm = (m₁v₁ + m₂v₂)/M = <b>${api.fmt(r.vcm)} m/s</b><br>T perdida = ${api.fmt(r.Ki)} − ${api.fmt(r.Kf)} = <b>${api.fmt(r.perda)} J</b><em>máximo possível ½μv_rel² = ½·${api.fmt(mu)}·${api.fmt(v.tertiary ** 2)} = ${api.fmt(P.maxLoss(m1, m2, v.tertiary, 0))} J</em>`,
            metrics: [
              ["v₁ depois", `${api.fmt(r.v1f)} m/s`],
              ["v₂ depois", `${api.fmt(r.v2f)} m/s`],
              ["v do CM", `${api.fmt(r.vcm)} m/s`],
              ["T perdida", `${api.fmt(r.perda)} J`],
              ["massa reduzida μ", `${api.fmt(mu)} kg`],
              ["momento total", `${api.fmt(m1 * r.v1f + m2 * r.v2f)} kg·m/s`]
            ],
            concept: "O momento se conserva em qualquer colisão; a energia cinética macroscópica só se conserva quando e = 1. A diferença vai para graus internos.",
            prompts: [
              "Com massas iguais e e = 1, mostre que as velocidades simplesmente trocam.",
              "Confirme que o momento total é o mesmo em todas as configurações.",
              "Verifique que a perda máxima vale ½μv_rel² e ocorre em e = 0."
            ],
            legend: [[api.C.green, "m₁"], [api.C.blue, "m₂"], [api.C.gold, "v do CM"]],
            secondaryTitle: "Energia perdida contra e",
            secondarySubtitle: "parábola: a perda vai com 1 − e²",
            secondaryCaption: "O teto é a energia interna disponível, ½μv_rel²."
          };
        }
      },

      {
        id: "angulos",
        tab: "Laboratório<br>e centro de massa",
        heading: "Transformação do ângulo",
        equation: "tanθ_lab = senθ_cm / (cosθ_cm + m₁/m₂)",
        hint: "Suba a razão de massas até 1 ou mais e procure o teto no eixo vertical (90° em m₁ = m₂).",
        controls: [
          { id: "parameter", label: "razão de massas m₁/m₂", min: 0.05, max: 5, step: 0.05, value: 2, digits: 2 },
          { id: "secondary", label: "ângulo no CM", min: 0, max: 180, step: 1, value: 90, digits: 0, unit: "°" },
          { id: "tertiary", label: "densidade de raios", min: 5, max: 25, step: 1, value: 13, digits: 0 }
        ],

        draw(api, v) {
          const deg = 180 / Math.PI;
          const chart = api.axes(api.main, 0, 180, 0, 185, "ângulo no CM (°)", "ângulo no laboratório (°)", {
            xTicks: [0, 45, 90, 135, 180], yTicks: [0, 45, 90, 135, 180]
          });
          [[0.25, "#cfd8d0"], [0.5, "#b9c4bb"], [1, api.C.blue], [2, api.C.gold], [4, api.C.red]].forEach(([r, cor]) => {
            api.line(chart, api.curve((t) => P.labAngle(t / deg, r) * deg, 0, 180, 180), cor, r === v.parameter ? [] : [4, 4], r === v.parameter ? 3 : 1.6);
          });
          api.line(chart, api.curve((t) => P.labAngle(t / deg, v.parameter) * deg, 0, 180, 200), api.C.green, [], 3.4);

          const teto = P.maxLabAngle(v.parameter) * deg;
          if (v.parameter >= 1) api.hline(chart, teto, api.C.red, [5, 4], `teto ${api.fmt(teto, 1)}° = arcsen(m₂/m₁)`);
          api.line(chart, [[0, 0], [180, 180]], "#dfe6e0", [3, 3], 1.2);
          api.label(chart, 172, 176, "θ_lab = θ_cm", api.C.grayLight, "right");
          api.dot(chart, v.secondary, P.labAngle(v.secondary / deg, v.parameter) * deg, api.C.ink, 5.5);
        },

        text(v, api) {
          const deg = 180 / Math.PI;
          const lab = P.labAngle(v.secondary / deg, v.parameter) * deg;
          const teto = P.maxLabAngle(v.parameter) * deg;
          const pesado = v.parameter >= 1;   /* m₁ ≥ m₂: há teto (90° em m₁ = m₂) */
          return {
            title: "Ângulo de laboratório contra ângulo no CM",
            subtitle: `m₁/m₂ = ${api.fmt(v.parameter)} · θ_cm = ${api.fmt(v.secondary, 0)}°`,
            regime: pesado ? [`teto em ${api.fmt(teto, 1)}°`, "alert"] : ["sem teto: até 180° no laboratório", "ok"],
            caption: "No centro de massa a colisão elástica apenas gira a velocidade relativa. Toda a assimetria do laboratório vem de somar de volta a velocidade do CM.",
            prediction: "Um projétil mais pesado que o alvo pode ser espalhado para trás?",
            calculation: `tanθ_lab = sen${api.fmt(v.secondary, 0)}° / (cos${api.fmt(v.secondary, 0)}° + ${api.fmt(v.parameter)}) = ${api.fmt(Math.sin(v.secondary / deg) / (Math.cos(v.secondary / deg) + v.parameter), 4)}<br>θ_lab = <b>${api.fmt(lab, 2)}°</b><em>${pesado ? `m₁ ≥ m₂: nenhum θ_cm leva além de arcsen(m₂/m₁) = ${api.fmt(teto, 2)}°` : "m₁ < m₂: o laboratório alcança todo o intervalo até 180°"}</em>`,
            metrics: [
              ["θ_cm", `${api.fmt(v.secondary, 0)}°`],
              ["θ_lab", `${api.fmt(lab, 2)}°`],
              ["ângulo máximo", pesado ? `${api.fmt(teto, 2)}°` : "180°"],
              ["m₁/m₂", api.fmt(v.parameter)],
              ["θ_lab/θ_cm", api.fmt(lab / (v.secondary || 1))]
            ],
            concept: "É no centro de massa que a física da colisão mora — um único ângulo. O laboratório apenas acrescenta a cinemática de quem observa.",
            prompts: [
              "Com m₁ = m₂, confirme que θ_lab = θ_cm/2 para vários ângulos.",
              "Ache a razão de massas em que o teto vale exatamente 30°.",
              "Explique por que a fórmula de Rutherford da Aula 20 é escrita no CM."
            ],
            legend: [[api.C.green, "razão escolhida"], [api.C.red, "teto de laboratório"], [api.C.grayLight, "θ_lab = θ_cm"]]
          };
        }
      },

      {
        id: "moderacao",
        tab: "Moderação<br>de nêutrons",
        heading: "A colisão frontal como problema de blindagem",
        equation: "f = 4m₁m₂/(m₁+m₂)²   ·   máxima quando m₁ = m₂",
        hint: "Comece em A = 1 e vá subindo. Preveja onde a transferência deixa de ser eficiente.",
        controls: [
          { id: "parameter", label: "massa do núcleo alvo A", min: 1, max: 210, step: 1, value: 1, digits: 0, unit: "u" },
          { id: "secondary", label: "energia inicial E₀", min: 0.5, max: 10, step: 0.1, value: 2, digits: 1, unit: "MeV" },
          { id: "tertiary", label: "colisões sofridas", min: 0, max: 40, step: 1, value: 0, digits: 0 }
        ],
        animate: { control: "tertiary", period: 10 },
        secondary: true,

        draw(api, v) {
          const A = Math.round(v.parameter);
          const E0 = v.secondary * 1e6;               /* eV */
          const ETH = 0.025;                          /* energia térmica a 20 °C */
          const logE = (n, a) => Math.log10(Math.max(1e-3, P.energyAfter(E0, 1, a, n)));
          /* A curva (colisões frontais) para ao atingir a energia térmica: abaixo dela não há mais moderação. */
          const nStop = (a) => Math.min(40, P.frontalCollisionsToThermal(E0, ETH, 1, a));

          const chart = api.axes(api.main, 0, 40, -2, 7.2, "número de colisões frontais (limite)", "log₁₀ da energia (eV)");
          /* Três materiais de referência, para o A escolhido ter contra o que ser lido. */
          for (const [a, cor, nome] of [[1, "#cbd8cb", "H (A=1)"], [12, "#cbd8cb", "C (A=12)"], [207, "#cbd8cb", "Pb (A=207)"]]) {
            const fim = nStop(a);
            if (fim > 0) {
              api.line(chart, api.curve((n) => logE(n, a), 0, fim, 120), cor, [], 1.6);
              api.label(chart, Math.min(39, fim), logE(Math.min(39, fim), a) + 0.22, nome, api.C.grayLight, "right");
            } else {
              api.label(chart, 1, logE(0, a) - 0.3, nome + ": 1 colisão", api.C.grayLight, "left");
            }
          }
          const fimA = nStop(A);
          if (fimA > 0) api.line(chart, api.curve((n) => logE(n, A), 0, fimA, 120), api.C.green, [], 3.2);
          api.hline(chart, Math.log10(ETH), api.C.gold, [5, 4], "energia térmica (0,025 eV)");
          if (P.energyAfter(E0, 1, A, v.tertiary) >= ETH) api.dot(chart, v.tertiary, logE(v.tertiary, A), api.C.red, 5.5);

          /* A fração transferida como função do alvo: o pico em A = 1 é o resultado. */
          const s2 = api.axes(api.second, 1, 210, 0, 1.1, "massa do alvo A (u)", "fração transferida f");
          api.line(s2, api.curve((a) => P.energyTransferFraction(1, a), 1, 210, 260), api.C.blue, [], 2.8);
          for (const [a, nome] of [[1, "H"], [12, "C"], [207, "Pb"]]) {
            api.dot(s2, a, P.energyTransferFraction(1, a), api.C.grayLight, 4);
            api.label(s2, a, P.energyTransferFraction(1, a) + 0.06, nome, api.C.grayLight, "left");
          }
          api.dot(s2, A, P.energyTransferFraction(1, A), api.C.red, 5);
        },

        text(v, api) {
          const A = Math.round(v.parameter);
          const E0 = v.secondary * 1e6;
          const ETH = 0.025;
          const f = P.energyTransferFraction(1, A);
          const xi = P.lethargy(A);
          const n = P.collisionsToThermal(E0, ETH, A);
          const E = P.energyAfter(E0, 1, A, v.tertiary);
          const nFront = P.frontalCollisionsToThermal(E0, ETH, 1, A);
          return {
            title: "Um nêutron perdendo energia por colisão",
            subtitle: `A = ${A} u · E₀ = ${api.fmt(v.secondary, 1)} MeV · ${api.fmt(v.tertiary, 0)} colisões`,
            regime: f > 0.5 ? ["moderador eficiente", "ok"] : f > 0.1 ? ["moderador razoável", "warn"] : ["quase não modera", "alert"],
            caption: "Curva de colisões frontais (limite): cada colisão frontal tira a fração máxima f da energia que resta, o que dá uma reta em escala logarítmica, interrompida ao atingir a energia térmica. A colisão real tem ângulo de espalhamento qualquer e perde menos em média: o número médio de colisões usa ξ e é maior.",
            prediction: "Chumbo é denso e bloqueia raios X muito bem. Ele serve para blindar nêutrons?",
            calculation: `f = 4m₁m₂/(m₁+m₂)² = 4·1·${A}/(1+${A})² = <b>${api.fmt(f, 4)}</b><br>E após ${api.fmt(v.tertiary, 0)} colisões frontais = E₀(1−f)ⁿ = <b>${api.sci(E, 3)} eV</b> (limite inferior)<em>colisões até a energia térmica, em média (ξ): ln(E₀/E_t)/ξ = ${api.fmt(Math.log(E0 / ETH), 2)}/${api.fmt(xi, 4)} = ${api.fmt(n, 0)}; só frontais: ${nFront < 1 ? "1" : api.fmt(nFront, 0)}</em>`,
            metrics: [
              ["fração transferida f", api.fmt(f, 4)],
              ["letargia ξ", api.fmt(xi, 4)],
              ["colisões até térmico (média, ξ)", api.fmt(n, 0)],
              ["colisões frontais até térmico (mín.)", nFront < 1 ? "1" : api.fmt(nFront, 0)],
              ["energia após n frontais (limite)", `${api.sci(E, 3)} eV`],
              ["média até térmico, H e Pb", `${api.fmt(P.collisionsToThermal(E0, ETH, 1), 0)} e ${api.fmt(P.collisionsToThermal(E0, ETH, 207), 0)}`]
            ],
            concept: "A transferência é máxima quando as massas são iguais — o mesmo resultado da estação 2, agora com consequência prática. Em média (ξ, espalhamento isotrópico no CM), um nêutron precisa de cerca de 18 colisões com hidrogênio e de quase 1900 com chumbo para termalizar; só colisões frontais seriam o melhor caso, com muito menos. É por isso que a blindagem de nêutrons em torno de um acelerador clínico acima de 10 MV usa parafina, polietileno ou concreto hidratado, e não chumbo: contra fóton vale densidade, contra nêutron vale massa parecida.",
            prompts: [
              "Confirme que f = 1 em A = 1 e explique o que acontece fisicamente nessa colisão.",
              "Ache o A em que f cai abaixo de 10 % e diga que elementos ficam acima dele.",
              "Compare o número de colisões de H, C e Pb e justifique a escolha de material de blindagem."
            ],
            legend: [[api.C.green, "alvo escolhido"], ["#cbd8cb", "H, C e Pb"], [api.C.gold, "energia térmica"], [api.C.blue, "f(A)"]],
            secondaryTitle: "Fração transferida contra a massa do alvo",
            secondarySubtitle: "cai depressa: f ≈ 4/A para A grande",
            secondaryCaption: "Nenhum núcleo pesado consegue tirar muito de um nêutron numa única colisão."
          };
        }
      }
    ]
  };
})();
