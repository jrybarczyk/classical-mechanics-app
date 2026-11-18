(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula26",
    discipline: "Mecânica Clássica · Aula 25",
    title: "Simetrias e conservação",
    subtitle: "“h se conserva” e “h é a energia” são a mesma afirmação?",

    stations: [
      {
        id: "energia",
        tab: "h contra E",
        heading: "O contraexemplo do aro girante",
        equation: "h = Σpq̇ − L   ·   ḣ = −∂L/∂t",
        hint: "Uma das duas curvas deve ser uma reta horizontal. Preveja qual antes de olhar.",
        controls: [
          { id: "parameter", label: "rotação do aro ω", min: 0, max: 7, step: 0.05, value: 4, digits: 2, unit: "rad/s" },
          { id: "secondary", label: "ângulo inicial θ₀", min: 0.1, max: 2.8, step: 0.02, value: 0.8, digits: 2, unit: "rad" },
          { id: "tertiary", label: "instante examinado", min: 0, max: 20, step: 0.1, value: 6, digits: 1, unit: "s" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const m = 1, R = 1, w = v.parameter;
          const serie = P.hoopIntegrate(v.secondary, 0, m, R, w, 20, 3000);
          const h = (a, b) => P.hoopH(a, b, m, R, w);
          const E = (a, b) => P.hoopE(a, b, m, R, w);
          const hs = serie.map(([t, a, b]) => [t, h(a, b)]);
          const Es = serie.map(([t, a, b]) => [t, E(a, b)]);
          const todos = [...hs.map((p) => p[1]), ...Es.map((p) => p[1])];
          const lo = Math.min(...todos), hi = Math.max(...todos);
          const pad = (hi - lo) * 0.15 + 0.1;
          const chart = api.axes(api.main, 0, 20, lo - pad, hi + pad, "tempo t (s)", "energia (J)");
          api.line(chart, Es, api.C.red, [], 2.4);
          api.line(chart, hs, api.C.green, [], 3.2);
          api.dot(chart, v.tertiary, h(...serie[Math.min(serie.length - 1, Math.round((v.tertiary / 20) * 3000))].slice(1)), api.C.green, 5);
          api.dot(chart, v.tertiary, E(...serie[Math.min(serie.length - 1, Math.round((v.tertiary / 20) * 3000))].slice(1)), api.C.red, 5);
          api.label(chart, 19.5, hs[hs.length - 1][1] + pad * 0.3, "h", api.C.green, "right");
          api.label(chart, 19.5, Es[Es.length - 1][1] + pad * 0.3, "E = T + U", api.C.red, "right");

          /* Faixa vertical automática: θ̇ em rad/s, sem reescala. */
          const thdMax = Math.max(0.5, ...serie.map(([, , b]) => Math.abs(b))) * 1.15;
          const s = api.axes(api.second, -3.2, 3.2, -thdMax, thdMax, "θ (rad)", "θ̇ (rad/s)", { xTicks: [-3.14, 0, 3.14] });
          api.line(s, serie.map(([, a, b]) => [a, b]), api.C.blue, [], 1.6);
          const idx = Math.min(serie.length - 1, Math.round((v.tertiary / 20) * 3000));
          api.dot(s, serie[idx][1], serie[idx][2], api.C.red, 5);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const m = 1, R = 1, w = v.parameter;
          const serie = P.hoopIntegrate(v.secondary, 0, m, R, w, 20, 4000);
          const h = (a, b) => P.hoopH(a, b, m, R, w);
          const E = (a, b) => P.hoopE(a, b, m, R, w);
          const dh = P.spread(serie, h);
          const dE = P.spread(serie, E);
          const idx = Math.min(serie.length - 1, Math.round((v.tertiary / 20) * 4000));
          const [, th, thd] = serie[idx];
          const fixo = w < 1e-9;
          return {
            title: "Função energia e energia mecânica",
            subtitle: `ω = ${api.fmt(w)} rad/s · θ₀ = ${api.fmt(v.secondary)} rad · t = ${api.fmt(v.tertiary, 1)} s`,
            regime: fixo ? ["vínculo fixo: h = E", "ok"] : ["vínculo móvel: h ≠ E", "alert"],
            caption: "A curva verde é rigorosamente horizontal. A vermelha não: quem gira o aro precisa fornecer e retirar energia para manter ω constante enquanto a conta se desloca.",
            prediction: "h se conserva. E se conserva? As duas são a mesma coisa?",
            calculation: `h = ½mR²θ̇² <b>−</b> ½mR²ω²sen²θ − mgRcosθ = ${api.fmt(h(th, thd), 5)} J<br>E = ½mR²θ̇² <b>+</b> ½mR²ω²sen²θ − mgRcosθ = ${api.fmt(E(th, thd), 5)} J<em>diferença = mR²ω²sen²θ = ${api.fmt(E(th, thd) - h(th, thd), 5)} J — as duas só coincidem onde senθ = 0</em>`,
            metrics: [
              ["h no instante", `${api.fmt(h(th, thd), 5)} J`],
              ["E no instante", `${api.fmt(E(th, thd), 5)} J`],
              ["variação relativa de h", api.sci(dh.relativa)],
              ["variação relativa de E", api.sci(dE.relativa)],
              ["E mínima", `${api.fmt(dE.min, 4)} J`],
              ["E máxima", `${api.fmt(dE.max, 4)} J`]
            ],
            concept: "h se conserva porque L não depende explicitamente do tempo. h vale T + U apenas se, além disso, os vínculos forem fixos — e aqui eles não são.",
            prompts: [
              "Zere ω e confirme que as duas curvas se sobrepõem.",
              "Meça a variação relativa de h e de E e compare as ordens de grandeza.",
              "Ache os instantes em que h e E coincidem e relacione com senθ = 0."
            ],
            legend: [[api.C.green, "h (conservada)"], [api.C.red, "E (não conservada)"]],
            secondaryTitle: "Trajetória no plano de fase",
            secondarySubtitle: "curva fechada: h constante é a lei de conservação que a organiza",
            secondaryCaption: "A órbita fecha porque h se conserva, e não porque E se conserve."
          };
        }
      },

      {
        id: "ciclicas",
        tab: "Coordenadas<br>cíclicas",
        heading: "Basta olhar para L",
        equation: "p_i = ∂L/∂q̇_i   ·   q_i ausente de L ⟹ p_i constante",
        hint: "Uma coordenada cíclica pode ter velocidade não nula. Verifique.",
        controls: [
          { id: "parameter", label: "raio r", min: 0.5, max: 4, step: 0.05, value: 2, digits: 2, unit: "m" },
          { id: "secondary", label: "velocidade angular θ̇", min: -3, max: 3, step: 0.01, value: 1.5, digits: 2, unit: "rad/s" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 4, step: 0.05, value: 1, digits: 2, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const m = v.tertiary;
          const chart = api.axes(api.main, 0.5, 4, 0, m * 16 * 3 * 1.1, "raio r (m)", "p_θ = mr²θ̇ (kg·m²/s)");
          [[0.5, "#cfd8d0"], [1.5, api.C.green], [2.5, api.C.blue]].forEach(([thd, cor]) => {
            api.line(chart, api.curve((r) => m * r * r * Math.abs(thd), 0.5, 4, 100), cor,
              Math.abs(thd - Math.abs(v.secondary)) < 0.06 ? [] : [5, 4], Math.abs(thd - Math.abs(v.secondary)) < 0.06 ? 3 : 1.6);
            api.label(chart, 3.9, m * 16 * Math.abs(thd), `θ̇ = ${api.fmt(thd)}`, cor, "right");
          });
          const pth = m * v.parameter ** 2 * Math.abs(v.secondary);
          api.dot(chart, v.parameter, pth, api.C.red, 5.5);
          /* Nível de p_θ constante: os pares (r, θ̇) compatíveis estão no painel secundário. */
          api.line(chart, api.curve(() => pth, 0.5, 4, 2), api.C.gold, [4, 4], 1.8);
          api.label(chart, 1.4, pth + m * 16 * 3 * 0.05, "p_θ constante", api.C.gold, "left");

          const s = api.axes(api.second, 0.5, 4, 0, 4, "raio r (m)", "θ̇ compatível (rad/s)");
          api.line(s, api.curve((r) => Math.min(4, pth / (m * r * r)), 0.5, 4, 120), api.C.gold, [], 2.8);
          api.dot(s, v.parameter, Math.abs(v.secondary), api.C.red, 4.5);
        },

        text(v, api) {
          const m = v.tertiary;
          const c = P.centralMomenta(m, v.parameter, 0, v.secondary);
          /* Pêndulo deslizante de exemplo: M = 3 kg, m = 1 kg, ℓ = 1,2 m, Ẋ = 2 m/s, θ = 0,6 rad; θ̇ vem do slider. */
          const pX = P.slidingMomentumX(3, 1, 1.2, 2, 0.6, v.secondary);
          return {
            title: "Momento conjugado a uma coordenada cíclica",
            subtitle: `r = ${api.fmt(v.parameter)} m · θ̇ = ${api.fmt(v.secondary)} rad/s · m = ${api.fmt(m)} kg`,
            caption: "θ não aparece em L, mas θ̇ aparece — e é isso que torna p_θ uma constante não trivial. Reduzir r obriga θ̇ a crescer para manter o produto.",
            prediction: "Uma coordenada cíclica pode ter velocidade não nula? Pode ter velocidade variável?",
            calculation: `L = ½m(ṙ² + r²θ̇²) − U(r): θ ausente<br>p_θ = ∂L/∂θ̇ = mr²θ̇ = ${api.fmt(m)}·${api.fmt(v.parameter ** 2, 3)}·${api.fmt(v.secondary)} = <b>${api.fmt(c.p_theta, 4)} kg·m²/s</b><em>p_θ tem dimensão de momento angular: o conjugado herda a dimensão complementar à da coordenada.<br>Pêndulo deslizante de exemplo (M = 3 kg, m = 1 kg, ℓ = 1,2 m, Ẋ = 2 m/s, θ = 0,6 rad, θ̇ do slider): p_X = (M+m)Ẋ + mℓθ̇cosθ = ${api.fmt(pX, 4)} kg·m/s ≠ (M+m)Ẋ = 8</em>`,
            metrics: [
              ["p_θ = mr²θ̇", api.fmt(c.p_theta, 4)],
              ["p_r = mṙ", api.fmt(c.p_r, 4)],
              ["θ̇ se r dobrar", api.fmt(v.secondary / 4, 4)],
              ["p_X do pêndulo deslizante", `${api.fmt(pX, 4)} kg·m/s`],
              ["cíclicas em cilíndricas", "φ e z"],
              ["não cíclica", "ρ (aparece em T)"]
            ],
            concept: "Cíclica significa ausente de L, não ausente do problema. E p_i não é necessariamente m q̇_i: no pêndulo com suporte deslizante, p_X envolve a outra coordenada.",
            prompts: [
              "Dobre r e confirme que θ̇ precisa cair a um quarto para manter p_θ.",
              "Identifique todas as cíclicas de uma partícula livre em cilíndricas.",
              "Explique por que ρ não é cíclica, ainda que não haja potencial."
            ],
            legend: [[api.C.green, "θ̇ escolhida"], [api.C.gold, "p_θ constante"]],
            secondaryTitle: "Pares (r, θ̇) com o mesmo p_θ",
            secondarySubtitle: "curva de p_θ fixo: θ̇ ∝ 1/r²",
            secondaryCaption: "É este vínculo que permite eliminar θ da equação radial."
          };
        }
      },

      {
        id: "noether",
        tab: "Dicionário<br>de Noether",
        heading: "Simetria contínua e constante",
        equation: "toda simetria contínua da ação ⟹ uma quantidade conservada",
        hint: "Teste cada simetria em um sistema de duas partículas com U(|r₁ − r₂|).",
        controls: [
          { id: "parameter", label: "deslocamento rígido", min: -2, max: 2, step: 0.05, value: 0, digits: 2, unit: "m" },
          { id: "secondary", label: "rotação rígida", min: 0, max: 3.14, step: 0.02, value: 0, digits: 2, unit: "rad" },
          { id: "tertiary", label: "deslocamento de uma só partícula", min: -2, max: 2, step: 0.05, value: 0, digits: 2, unit: "m" }
        ],

        draw(api, v) {
          const r1 = [-1, 0.4], r2 = [1.2, -0.5];
          const desloca = (p, d) => [p[0] + d, p[1]];
          const gira = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
          const A = gira(desloca(r1, v.parameter), v.secondary);
          const B = desloca(gira(desloca(r2, v.parameter), v.secondary), v.tertiary);
          const d0 = Math.hypot(r1[0] - r2[0], r1[1] - r2[1]);
          const d1 = Math.hypot(A[0] - B[0], A[1] - B[1]);
          /* Janela 4:3 que cresce até conter as quatro posições: com deslocamento rígido e
             individual somados (até 2 + 2 m) a partícula passava de x = 4; com rotação,
             as partículas também podem passar de |y| = 3. */
          const alvo = [r1, r2, A, B];
          const hx = Math.max(4, ...alvo.map((p) => Math.abs(p[0]) + 0.5), ...alvo.map((p) => ((Math.abs(p[1]) + 0.5) * 4) / 3));
          const chart = api.axes(api.main, -hx, hx, (-hx * 3) / 4, (hx * 3) / 4, "x (m)", "y (m)");
          api.line(chart, [r1, r2], api.C.grayLight, [4, 4], 1.8);
          api.dot(chart, r1[0], r1[1], api.C.grayLight, 5);
          api.dot(chart, r2[0], r2[1], api.C.grayLight, 5);
          api.line(chart, [A, B], Math.abs(d1 - d0) < 1e-9 ? api.C.green : api.C.red, [], 3);
          api.dot(chart, A[0], A[1], api.C.green, 6);
          api.dot(chart, B[0], B[1], api.C.blue, 6);
          api.label(chart, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 0.28, `|r₁ − r₂| = ${api.fmt(d1, 4)}`, Math.abs(d1 - d0) < 1e-9 ? api.C.green : api.C.red, "center");
          api.label(chart, (r1[0] + r2[0]) / 2, (r1[1] + r2[1]) / 2 - 0.3, `original: ${api.fmt(d0, 4)}`, api.C.grayLight, "center", "top");
        },

        text(v, api) {
          const r1 = [-1, 0.4], r2 = [1.2, -0.5];
          const desloca = (p, d) => [p[0] + d, p[1]];
          const gira = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
          const A = gira(desloca(r1, v.parameter), v.secondary);
          const B = desloca(gira(desloca(r2, v.parameter), v.secondary), v.tertiary);
          const d0 = Math.hypot(r1[0] - r2[0], r1[1] - r2[1]);
          const d1 = Math.hypot(A[0] - B[0], A[1] - B[1]);
          const invariante = Math.abs(d1 - d0) < 1e-9;
          const quebra = Math.abs(v.tertiary) > 1e-9;
          return {
            title: "Testando as simetrias de U(|r₁ − r₂|)",
            subtitle: `deslocamento ${api.fmt(v.parameter)} m · rotação ${api.fmt(v.secondary)} rad · uma partícula ${api.fmt(v.tertiary)} m`,
            regime: invariante ? ["L invariante", "ok"] : ["L alterado: não é simetria", "alert"],
            caption: "Translação e rotação rígidas preservam a distância e portanto L. Deslocar uma só partícula não preserva — e por isso não há constante associada.",
            prediction: "Qual das três operações não é simetria do sistema?",
            calculation: `|r₁ − r₂| original = ${api.fmt(d0, 6)}<br>após as operações = <b>${api.fmt(d1, 6)}</b><em>${invariante ? "distância preservada: L é invariante e há constante do movimento" : `distância alterada em ${api.sci(d1 - d0)}: ${quebra ? "deslocar uma só partícula quebra a simetria" : "operação não é simetria"}`}</em>`,
            metrics: [
              ["distância original", api.fmt(d0, 6)],
              ["distância após", api.fmt(d1, 6)],
              ["variação", api.sci(d1 - d0)],
              ["translação rígida ⟹", "momento linear P"],
              ["rotação rígida ⟹", "momento angular total"],
              ["translação no tempo ⟹", "energia"]
            ],
            concept: "As leis de conservação deixam de ser fatos empíricos independentes e passam a ser consequências de propriedades do espaço e do tempo.",
            prompts: [
              "Aplique translação e rotação juntas e confirme que a distância não muda.",
              "Desloque só uma partícula: por que o momento p₁ dessa partícula, isolado, não se conserva? E o momento total P?",
              "Uma coordenada cíclica é o caso em que a simetria está visível. Dê um exemplo em que ela não está."
            ],
            legend: [[api.C.green, "configuração transformada"], [api.C.grayLight, "original"]]
          };
        }
      }
    ]
  };
})();
