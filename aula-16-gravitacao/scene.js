(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula16",
    discipline: "Mecânica Clássica · Aula 16",
    title: "Campo e potencial gravitacionais",
    subtitle: "Onde |g| é máximo dentro de um planeta — no centro ou na superfície?",

    stations: [
      {
        id: "esfera",
        tab: "Esfera<br>uniforme",
        heading: "Campo e potencial",
        equation: "g = −GMr/R³ (r ≤ R)   ·   g = −GM/r² (r ≥ R)",
        hint: "Antes de olhar o gráfico, aponte onde |g| deve ser máximo.",
        controls: [
          { id: "parameter", label: "raio examinado r/R", min: 0, max: 3, step: 0.01, value: 1, digits: 2 },
          { id: "secondary", label: "massa M", min: 0.2, max: 5, step: 0.05, value: 1, digits: 2, unit: "M⊕" },
          { id: "tertiary", label: "raio R", min: 0.4, max: 3, step: 0.05, value: 1, digits: 2, unit: "R⊕" }
        ],
        secondary: true,

        draw(api, v) {
          const M = v.secondary * P.M_TERRA, R = v.tertiary * P.R_TERRA;
          const gs = P.surfaceField(R, M);
          const chart = api.axes(api.main, 0, 3, 0, gs * 1.25, "r / R", "|g| (m/s²)");
          api.line(chart, api.curve((x) => Math.abs(P.sphereField(x * R, R, M)), 0, 1, 100), api.C.green, [], 3);
          api.line(chart, api.curve((x) => Math.abs(P.sphereField(x * R, R, M)), 1, 3, 160), api.C.green, [], 3);
          api.line(chart, api.curve((x) => (x === 0 ? gs * 1.25 : Math.min(gs * 1.25, gs / (x * x))), 0.35, 3, 160), api.C.grayLight, [5, 4], 1.8);
          api.label(chart, 2.95, gs * 0.5, "GM/r² (toda a massa no centro)", api.C.muted, "right");
          api.vline(chart, 1, api.C.gold, [4, 4], "superfície");
          api.dot(chart, 1, gs, api.C.gold, 5.5);
          api.dot(chart, v.parameter, Math.abs(P.sphereField(v.parameter * R, R, M)), api.C.red, 5);

          const s = api.axes(api.second, 0, 3, (-1.6 * P.G * M) / R, 0.05 * (P.G * M) / R, "r / R", "Φ (J/kg)");
          api.line(s, api.curve((x) => P.spherePotential(x * R, R, M), 0, 3, 220), api.C.blue, [], 2.8);
          api.hline(s, -(P.G * M) / R, api.C.gold, [4, 4], "Φ na superfície");
          api.dot(s, 0, P.spherePotential(0, R, M), api.C.red, 4.5);
          api.dot(s, v.parameter, P.spherePotential(v.parameter * R, R, M), api.C.red, 4.5);
        },

        text(v, api) {
          const M = v.secondary * P.M_TERRA, R = v.tertiary * P.R_TERRA;
          const r = v.parameter * R;
          const g = Math.abs(P.sphereField(r, R, M));
          const gs = P.surfaceField(R, M);
          const phi = P.spherePotential(r, R, M);
          return {
            title: "Campo dentro e fora de uma esfera uniforme",
            subtitle: `M = ${api.fmt(v.secondary)} M⊕ · R = ${api.fmt(v.tertiary)} R⊕ · r/R = ${api.fmt(v.parameter)}`,
            regime: v.parameter < 1 ? ["interior", "warn"] : v.parameter > 1 ? ["exterior", "ok"] : ["superfície: |g| máximo", "ok"],
            caption: "Dentro, só a massa interior conta e o campo cresce linearmente. Fora, tudo se passa como se a massa estivesse no centro. O máximo está na junção.",
            prediction: "Descendo um poço em direção ao centro, |g| aumenta ou diminui?",
            calculation: `${v.parameter <= 1
              ? `M_int = M(r/R)³ = ${api.fmt(v.parameter ** 3, 4)} M ⟹ g = GM r/R³ = <b>${api.fmt(g, 4)} m/s²</b>`
              : `g = GM/r² = <b>${api.fmt(g, 4)} m/s²</b>`}<br>g na superfície = <b>${api.fmt(gs, 4)} m/s²</b><em>Φ(R) = −GM/R = ${api.sci(-(P.G * M) / R)} J/kg: compare com Φ(0) nas leituras</em>`,
            metrics: [
              ["|g| em r", `${api.fmt(g, 4)} m/s²`],
              ["|g| na superfície", `${api.fmt(gs, 4)} m/s²`],
              ["g/g_superfície", api.fmt(g / gs, 4)],
              ["Φ em r", api.sci(phi)],
              ["Φ(0)", api.sci(P.spherePotential(0, R, M))],
              ["Φ(R)", api.sci(-(P.G * M) / R)]
            ],
            concept: "Descendo, perde-se fonte atratora: a casca acima não contribui, e é isso que faz |g| cair para o centro em vez de divergir.",
            prompts: [
              "Confirme que |g| é máximo exatamente em r = R.",
              "Verifique que o potencial é contínuo e com derivada contínua na superfície.",
              "Mostre que Φ(0) é 1,5 vez Φ(R) para qualquer M e R."
            ],
            legend: [[api.C.green, "|g|(r)"], [api.C.grayLight, "GM/r²"], [api.C.gold, "superfície"]],
            secondaryTitle: "Potencial gravitacional",
            secondarySubtitle: "parabólico dentro, −GM/r fora",
            secondaryCaption: "A curvatura troca de sinal na superfície, mas a inclinação não salta."
          };
        }
      },

      {
        id: "casca",
        tab: "Teorema<br>da casca",
        heading: "Casca de raios a e b",
        equation: "M_int = M(r³ − a³)/(b³ − a³)",
        hint: "Encolha a espessura até virar casca fina. O que sobra dentro da cavidade?",
        controls: [
          { id: "parameter", label: "raio interno a", min: 0, max: 0.99, step: 0.01, value: 0.5, digits: 2, unit: "R" },
          { id: "secondary", label: "raio externo b", min: 0.2, max: 1, step: 0.01, value: 1, digits: 2, unit: "R" },
          { id: "tertiary", label: "raio examinado r", min: 0, max: 2.5, step: 0.01, value: 0.3, digits: 2, unit: "R" }
        ],

        draw(api, v) {
          const a = Math.min(v.parameter, v.secondary - 0.01);
          const b = v.secondary;
          const M = P.M_TERRA, R = P.R_TERRA;
          const gs = (P.G * M) / (R * R);
          const chart = api.axes(api.main, 0, 2.5, 0, gs * 1.35, "r / R", "|g| (m/s²)");
          api.area(chart, [[a, gs * 1.35], [b, gs * 1.35]], "rgba(97,155,96,.10)", 0);
          api.line(chart, api.curve((x) => Math.abs(P.thickShellField(x * R, a * R, b * R, M)), 0.001, 2.5, 400), api.C.green, [], 3);
          api.vline(chart, a, api.C.blue, [4, 4], "a");
          api.vline(chart, b, api.C.red, [4, 4], "b");
          api.label(chart, (a + b) / 2, gs * 1.28, "matéria", api.C.muted, "center");
          if (a > 0) api.label(chart, a / 2, gs * 0.12, "cavidade: g = 0", api.C.blue, "center");
          api.dot(chart, v.tertiary, Math.abs(P.thickShellField(v.tertiary * R, a * R, b * R, M)), api.C.ink, 5.5);
        },

        text(v, api) {
          const a = Math.min(v.parameter, v.secondary - 0.01);
          const b = v.secondary;
          const M = P.M_TERRA, R = P.R_TERRA;
          const r = v.tertiary;
          const g = Math.abs(P.thickShellField(r * R, a * R, b * R, M));
          const dentro = a > 0 && r <= a;
          const fora = r >= b;
          const Mint = P.shellEnclosed(r * R, a * R, b * R, M);
          return {
            title: "Campo de uma casca esférica espessa",
            subtitle: `a = ${api.fmt(a)} R · b = ${api.fmt(b)} R · r = ${api.fmt(r)} R`,
            regime: dentro ? ["dentro da cavidade: g = 0", "ok"] : fora ? ["fora: como massa puntiforme", "ok"] : ["dentro da matéria", "warn"],
            caption: "Na cavidade o campo é rigorosamente nulo, qualquer que seja a espessura. Fora, a casca atrai como se toda a massa estivesse no centro.",
            prediction: "Um corpo dentro da cavidade sente força em direção à parede mais próxima?",
            calculation: `M_int(r) = M(r³ − a³)/(b³ − a³) = <b>${api.sci(Mint)} kg</b><br>g = GM_int/r² = <b>${api.fmt(g, 5)} m/s²</b><em>${dentro ? "M_int = 0: o fluxo através da superfície gaussiana é nulo" : fora ? "M_int = M: indistinguível de uma massa puntiforme" : "só a matéria abaixo de r contribui"}</em>`,
            metrics: [
              ["massa interior", api.sci(Mint)],
              ["fração da massa total", api.fmt(Mint / M, 4)],
              ["|g| em r", `${api.fmt(g, 5)} m/s²`],
              ["espessura b − a", `${api.fmt(b - a)} R`],
              ["|g| em r = b", `${api.fmt(Math.abs(P.thickShellField(b * R, a * R, b * R, M)), 5)} m/s²`]
            ],
            concept: "A anulação dentro da cavidade não é aproximação: as contribuições de todos os elementos da casca se cancelam exatamente, e é isso que Newton adiou os Principia para demonstrar.",
            prompts: [
              "Faça a → b e confirme que a casca fina tem a mesma propriedade.",
              "Faça a → 0 e recupere a esfera maciça da estação anterior.",
              "Explique por que o campo é descontínuo em derivada, mas não em valor, em r = a."
            ],
            legend: [[api.C.green, "|g|(r)"], [api.C.blue, "raio interno"], [api.C.red, "raio externo"]]
          };
        }
      },

      {
        id: "inversoquadrado",
        tab: "Inverso do<br>quadrado",
        heading: "A mesma geometria em proteção radiológica",
        equation: "Ḋ₂/Ḋ₁ = (r₁/r₂)²",
        hint: "Distância é o mais barato dos três fatores de proteção. Meça quanto ela rende.",
        controls: [
          { id: "parameter", label: "distância r", min: 0.1, max: 6, step: 0.05, value: 1.2, digits: 2, unit: "m" },
          { id: "secondary", label: "taxa de referência Ḋ₁", min: 10, max: 2000, step: 10, value: 100, digits: 0, unit: "µSv/h" },
          { id: "tertiary", label: "distância de referência r₁", min: 0.1, max: 1, step: 0.05, value: 0.3, digits: 2, unit: "m" }
        ],
        secondary: true,

        draw(api, v) {
          /* Teto do eixo: a referência (r₁, Ḋ₁) e o início da curva em r = 0,15 m ficam sempre visíveis. */
          const ymax = Math.max(v.secondary, P.doseRate(v.secondary, v.tertiary, 0.15)) * 1.05;
          const chart = api.axes(api.main, 0.1, 6, 0, ymax, "distância r (m)", "taxa de dose (µSv/h)");
          api.line(chart, api.curve((r) => P.doseRate(v.secondary, v.tertiary, r), 0.15, 6, 300), api.C.green, [], 3);
          api.dot(chart, v.tertiary, v.secondary, api.C.gold, 5.5);
          api.label(chart, v.tertiary, v.secondary * 1.06, "referência", api.C.gold, "left");
          api.dot(chart, v.parameter, P.doseRate(v.secondary, v.tertiary, v.parameter), api.C.red, 5.5);
          const dobro = v.tertiary * 2, quadruplo = v.tertiary * 4;
          [dobro, quadruplo].forEach((d, i) => {
            api.vline(chart, d, api.C.grayLight, [3, 4], i === 0 ? "2r₁" : "4r₁");
            api.dot(chart, d, P.doseRate(v.secondary, v.tertiary, d), api.C.blue, 4);
          });

          const L10 = Math.log10;
          const s = api.axes(api.second, L10(0.15), L10(6), L10(P.doseRate(v.secondary, v.tertiary, 6)), L10(P.doseRate(v.secondary, v.tertiary, 0.15)),
            "log₁₀ r", "log₁₀ taxa", { xFormat: (t) => `10${api.sup(Math.round(t * 10) / 10)}`, yFormat: (t) => `10${api.sup(Math.round(t))}` });
          api.line(s, api.curve((lr) => L10(P.doseRate(v.secondary, v.tertiary, Math.pow(10, lr))), L10(0.15), L10(6), 120), api.C.blue);
          const x0 = L10(0.4), y0 = L10(P.doseRate(v.secondary, v.tertiary, 0.4));
          api.line(s, [[x0, y0], [x0 + 0.4, y0], [x0 + 0.4, y0 - 0.8]], api.C.gold, [4, 4], 1.6);
          api.label(s, x0 + 0.42, y0 - 0.4, "inclinação −2", api.C.gold, "left");
        },

        text(v, api) {
          const D = P.doseRate(v.secondary, v.tertiary, v.parameter);
          const fator = (v.parameter / v.tertiary) ** 2;
          return {
            title: "Taxa de dose contra distância",
            subtitle: `Ḋ₁ = ${api.fmt(v.secondary, 0)} µSv/h a ${api.fmt(v.tertiary)} m`,
            caption: "A mesma álgebra do campo gravitacional: fluxo constante repartido por área crescente. A inclinação −2 no log-log é a assinatura geométrica.",
            prediction: "Quadruplicar a distância divide a taxa por quanto?",
            calculation: `Ḋ₂ = Ḋ₁(r₁/r₂)² = ${api.fmt(v.secondary, 0)}·(${api.fmt(v.tertiary)}/${api.fmt(v.parameter)})² = <b>${api.fmt(D, 2)} µSv/h</b><br>fator de redução = <b>${api.fmt(fator, 2)} ×</b><em>para chegar a 20 µSv/h seria preciso ${api.fmt(P.distanceForRate(v.secondary, v.tertiary, 20), 2)} m</em>`,
            metrics: [
              ["taxa em r", `${api.fmt(D, 2)} µSv/h`],
              ["fator de redução", `${api.fmt(fator, 2)} ×`],
              ["taxa em 2r₁", `${api.fmt(P.doseRate(v.secondary, v.tertiary, 2 * v.tertiary), 2)} µSv/h`],
              ["taxa em 4r₁", `${api.fmt(P.doseRate(v.secondary, v.tertiary, 4 * v.tertiary), 2)} µSv/h`],
              ["r para 20 µSv/h", `${api.fmt(P.distanceForRate(v.secondary, v.tertiary, 20), 2)} m`]
            ],
            concept: "O expoente 2 não é da gravidade nem da radiação: é da geometria de três dimensões, com o fluxo se conservando sobre uma esfera de área 4πr².",
            prompts: [
              "Confirme que quadruplicar a distância divide a taxa por 16.",
              "Meça a inclinação no painel log-log e explique por que ela vale −2.",
              "Diga em que duas situações a lei do inverso do quadrado falha."
            ],
            legend: [[api.C.green, "taxa de dose"], [api.C.gold, "referência"]],
            secondaryTitle: "A mesma curva em log-log",
            secondarySubtitle: "reta de inclinação −2",
            secondaryCaption: "Fonte extensa ou meio atenuante quebram essa reta — é o limite do modelo."
          };
        }
      },

      {
        id: "tunel",
        tab: "Túnel pelo<br>centro",
        heading: "O que acontece se a esfera for atravessada",
        equation: "F = −(GMm/R³) r   ⟹   ω² = GM/R³",
        hint: "Preveja o período antes de animar, e depois compare com o de uma órbita rasante. Mude a amplitude para testar a isocronia.",
        controls: [
          { id: "parameter", label: "raio R", min: 0.4, max: 3, step: 0.05, value: 1, digits: 2, unit: "R⊕" },
          { id: "secondary", label: "massa M", min: 0.2, max: 5, step: 0.05, value: 1, digits: 2, unit: "M⊕" },
          { id: "tertiary", label: "fase do movimento t/τ", min: 0, max: 1, step: 0.002, value: 0, digits: 3 },
          { id: "quaternary", label: "ponto de partida x₀/R", min: 0.1, max: 1, step: 0.05, value: 1, digits: 2 }
        ],
        animate: { control: "tertiary", period: 7 },
        secondary: true,

        draw(api, v) {
          const R = v.parameter * P.R_TERRA, M = v.secondary * P.M_TERRA;
          const A = v.quaternary || 1;                         /* amplitude em unidades de R */
          const x = A * Math.cos(2 * Math.PI * v.tertiary);  /* posição em unidades de R */
          const lim = 1.35;
          const chart = api.axes(api.main, -lim * 1.9, lim * 1.9, -lim, lim, "x / R", "y / R", { xTicks: [-1, 0, 1], yTicks: [-1, 0, 1] });
          /* Corte da esfera, com a densidade sugerida por círculos concêntricos. */
          for (const f of [1, 0.75, 0.5, 0.25]) {
            api.line(chart, api.param((a) => [f * Math.cos(a), f * Math.sin(a)], 0, api.TAU, 200), f === 1 ? api.C.green : "#d7e2d7", [], f === 1 ? 3 : 1.3);
          }
          /* O túnel e o corpo dentro dele. */
          api.line(chart, [[-1, 0], [1, 0]], api.C.gold, [], 2.2);
          api.dot(chart, x, 0, api.C.ink, 6);
          /* A força restauradora é proporcional à distância ao centro, e some no centro. */
          api.arrow(chart, x, 0, x - x * 0.55, 0, api.C.red, 2.6, 9);
          api.dot(chart, 0, 0, api.C.gold, 4.5);
          api.label(chart, 0, -0.16, "centro: F = 0", api.C.gold, "center", "top");
          api.label(chart, x, 0.12, "F ∝ −r", api.C.red, "center");
          api.label(chart, -lim * 1.85, lim * 0.88, "massa só conta a parte interior (teorema da casca)", api.C.muted, "left");

          /* Posição e velocidade ao longo de um período. */
          const vmax = (A * P.tunnelMaxSpeed(R, M)) / 1000;
          const s = api.axes(api.second, 0, 1, -1.15, 1.15, "t / τ", "x/R e v/(ωR)");
          api.line(s, api.curve((f) => A * Math.cos(2 * Math.PI * f), 0, 1, 200), api.C.green, [], 2.8);
          api.line(s, api.curve((f) => -A * Math.sin(2 * Math.PI * f), 0, 1, 200), api.C.blue, [4, 3], 2.2);
          api.hline(s, 0, "#b9c4bb", []);
          api.vline(s, v.tertiary, api.C.red, [3, 3]);
          api.dot(s, v.tertiary, x, api.C.ink, 4.5);
          api.label(s, 0.02, 1.05, `v_máx = ${api.fmt(vmax)} km/s`, api.C.blue, "left");
        },

        text(v, api) {
          const R = v.parameter * P.R_TERRA, M = v.secondary * P.M_TERRA;
          const T = P.tunnelPeriod(R, M);
          const Torb = P.lowOrbitPeriod(R, M);
          const w = P.tunnelOmega(R, M);
          const A = v.quaternary || 1;
          const vmax = A * P.tunnelMaxSpeed(R, M);
          const U = P.bindingEnergy(M, R);
          return {
            title: "Queda pelo interior da esfera",
            subtitle: `R = ${api.fmt(v.parameter)} R⊕ · M = ${api.fmt(v.secondary)} M⊕ · x₀ = ${api.fmt(A)} R · t/τ = ${api.fmt(v.tertiary, 3)}`,
            regime: ["harmônico simples", "ok"],
            caption: "Dentro da esfera só a massa interior conta, e ela cresce com r³ — de modo que a força cai com r³/r² = r. Uma força restauradora linear é a definição de oscilador harmônico.",
            prediction: "A ida e volta pelo túnel demora mais, menos ou o mesmo que uma volta em órbita rasante?",
            calculation: `M(r) = M(r/R)³ ⟹ F = −GmM(r)/r² = −(GMm/R³)r<br>ω = √(GM/R³) = <b>${api.sci(w, 3)} rad/s</b><br>τ = 2π/ω = <b>${api.fmt(T / 60)} min</b><em>órbita rasante, deduzida à parte de GMm/R² = mv²/R: ${api.fmt(Torb / 60)} min — exatamente o mesmo valor</em>`,
            metrics: [
              ["período no túnel", `${api.fmt(T / 60)} min`],
              ["período em órbita rasante", `${api.fmt(Torb / 60)} min`],
              ["travessia (meio período)", `${api.fmt(T / 120)} min`],
              ["v no centro", `${api.fmt(vmax / 1000)} km/s`],
              ["v de escape", `${api.fmt(P.escapeVelocity(R, M) / 1000)} km/s`],
              ["energia de ligação", `${api.sci(U, 2)} J`]
            ],
            concept: "O período não depende do ponto de partida nem da massa que cai — é a isocronia da Aula 11, reencontrada aqui a partir da geometria da distribuição, e não de uma mola. E a coincidência com a órbita rasante não é acidente: as duas situações são a mesma força de superfície agindo sobre a mesma escala de comprimento, uma projetada em uma reta e outra em um círculo.",
            prompts: [
              "Mude o ponto de partida x₀ e verifique que o período não muda, só a velocidade no centro — a isocronia.",
              "Dobre R mantendo M e confirme que τ cresce por 2^(3/2).",
              "Com x₀ = R, explique por que a velocidade no centro é a velocidade orbital, e não a de escape."
            ],
            legend: [[api.C.green, "esfera e x(t)"], [api.C.gold, "túnel"], [api.C.red, "força restauradora"], [api.C.blue, "v(t)"]],
            secondaryTitle: "Posição e velocidade em um período",
            secondarySubtitle: "cosseno e seno, defasados de 90°",
            secondaryCaption: "A velocidade é máxima no centro, onde a força se anula — como em qualquer oscilador."
          };
        }
      }
    ]
  };
})();
