(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula05",
    discipline: "Mecânica Clássica · Aula 5",
    title: "Paisagem de energia potencial",
    subtitle: "O que se pode dizer do movimento antes de resolver qualquer integral?",

    stations: [
      {
        id: "paisagem",
        tab: "Regiões e<br>pontos de retorno",
        heading: "Poço duplo",
        equation: "U(x) = U₀(x²/a² − 1)²",
        hint: "Suba E devagar. Preveja em que valor o movimento deixa de ficar preso a um poço.",
        controls: [
          { id: "parameter", label: "energia E/U₀", min: 0.02, max: 2.2, step: 0.01, value: 0.25, digits: 2 },
          { id: "secondary", label: "meia separação a", min: 0.6, max: 2, step: 0.02, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "profundidade U₀", min: 0.5, max: 5, step: 0.1, value: 1, digits: 1, unit: "J" }
        ],

        draw(api, v) {
          const U0 = v.tertiary, a = v.secondary, E = v.parameter * U0;
          const xm = a * Math.sqrt(1 + Math.sqrt(2.2)) * 1.12;
          const chart = api.axes(api.main, -xm, xm, -0.2 * U0, 2.6 * U0, "posição x (m)", "energia (J)");

          /* Região proibida: onde U > E, o movimento não pode ocorrer. */
          const proib = api.curve((x) => Math.max(P.U(x, U0, a), E), -xm, xm, 300);
          api.area(chart, proib, "rgba(198,92,75,.10)", 2.6 * U0);
          api.line(chart, api.curve((x) => P.U(x, U0, a), -xm, xm, 320), api.C.green, [], 3);
          api.hline(chart, E, api.C.red, [6, 4], `E = ${api.fmt(v.parameter)} U₀`);
          api.hline(chart, U0, api.C.gold, [3, 4], "topo da barreira");

          P.turningPoints(E, U0, a).forEach((x) => api.dot(chart, x, E, api.C.red, 4.6));
          [[-a, "U″>0"], [a, "U″>0"], [0, "U″<0"]].forEach(([x, rot]) => {
            api.dot(chart, x, P.U(x, U0, a), api.C.blue, 4.2, true);
            api.label(chart, x, P.U(x, U0, a) - 0.14 * U0, rot, api.C.blue, "center", "top");
          });

          const seg = P.excursion(E, U0, a);
          if (seg) {
            api.line(chart, [[seg[0], -0.1 * U0], [seg[1], -0.1 * U0]], api.C.lime, [], 4);
            api.label(chart, (seg[0] + seg[1]) / 2, -0.19 * U0, "região permitida", api.C.lime, "center", "top");
          }
        },

        text(v, api) {
          const U0 = v.tertiary, a = v.secondary, E = v.parameter * U0;
          const t = P.turningPoints(E, U0, a);
          const preso = P.confined(E, U0);
          const s = Math.sqrt(v.parameter);
          return {
            title: "Regiões permitidas e pontos de retorno",
            subtitle: `E = ${api.fmt(v.parameter)} U₀ · a = ${api.fmt(a)} m · U₀ = ${api.fmt(U0, 1)} J`,
            regime: preso ? ["confinado a um poço", "ok"] : ["atravessa os dois poços", "warn"],
            caption: "A faixa avermelhada é proibida: ali E < U e a rapidez seria imaginária. Os pontos vermelhos são exatamente as interseções.",
            prediction: "Em que valor de E/U₀ a partícula passa a atravessar os dois poços?",
            calculation: `E = U(x) ⟹ (x²/a² − 1)² = E/U₀ = ${api.fmt(v.parameter)}<br>x²/a² = 1 ± ${api.fmt(s)} ⟹ x = <b>${t.map((x) => api.fmt(x)).join(" ; ")}</b><em>${preso ? "1 − √(E/U₀) > 0: os quatro pontos existem e o poço aprisiona" : "1 − √(E/U₀) < 0: os dois internos somem e a barreira é vencida"}</em>`,
            metrics: [
              ["pontos de retorno", String(t.length)],
              [preso ? "x mínimo permitido (poço da direita; o da esquerda é simétrico)" : "x mínimo permitido", api.fmt(P.excursion(E, U0, a)[0])],
              ["x máximo permitido", api.fmt(P.excursion(E, U0, a)[1])],
              ["U no topo da barreira", `${api.fmt(U0, 1)} J`],
              ["rapidez no fundo do poço, √(2E/m) com m = 1 kg", `${api.fmt(Math.sqrt(2 * E))} m/s`]
            ],
            concept: "O diagrama de energia responde antes de qualquer integração: onde há movimento, onde ele para e quantos regimes existem.",
            prompts: [
              "Ache o E em que os pontos internos se encontram e explique o que acontece ali.",
              "Dobre a e veja o que muda nos pontos de retorno — e o que não muda.",
              "Para E = U₀ exatamente, quanto tempo leva para chegar ao topo?"
            ],
            legend: [[api.C.green, "U(x)"], [api.C.red, "energia E"], [api.C.lime, "região permitida"]]
          };
        }
      },

      {
        id: "quadratura",
        tab: "Rapidez e<br>período",
        heading: "Do potencial ao tempo",
        equation: "ẋ = ±√(2[E − U(x)]/m)   T = 2∫dx/ẋ",
        hint: "Aproxime E de U₀ e acompanhe o período. Antes disso, preveja se ele cresce, cai ou satura.",
        controls: [
          { id: "parameter", label: "energia E/U₀", min: 0.01, max: 0.999, step: 0.001, value: 0.25, digits: 3 },
          { id: "secondary", label: "massa m", min: 0.2, max: 4, step: 0.05, value: 1, digits: 2, unit: "kg" },
          { id: "tertiary", label: "profundidade U₀", min: 0.5, max: 4, step: 0.1, value: 1, digits: 1, unit: "J" }
        ],
        secondary: true,

        draw(api, v) {
          const U0 = v.tertiary, a = 1, m = v.secondary, E = v.parameter * U0;
          const seg = P.excursion(E, U0, a);
          const chart = api.axes(api.main, 0, 2.1, 0, Math.sqrt((2 * U0) / m) * 1.15, "posição x (m)", "rapidez |ẋ| (m/s)");
          api.line(chart, api.curve((x) => P.speed(x, E, U0, a, m), 0, 2.1, 320), api.C.green);
          api.area(chart, api.curve((x) => P.speed(x, E, U0, a, m), seg[0], seg[1], 240), "rgba(97,155,96,.14)", 0);
          api.vline(chart, seg[0], api.C.red, [5, 4], "retorno");
          api.vline(chart, seg[1], api.C.red, [5, 4]);
          api.dot(chart, a, P.speed(a, E, U0, a, m), api.C.gold, 5);
          api.label(chart, a, P.speed(a, E, U0, a, m) * 1.06, "rapidez máxima, no fundo", api.C.gold, "center");

          const wH = P.omegaSmall(U0, a, m);
          const Th = (2 * Math.PI) / wH;
          const s = api.axes(api.second, 0.01, 1, 0, Th * 3.2, "E/U₀", "período τ (s)");
          api.line(s, api.curve((e) => Math.min(Th * 3.2, P.period(e * U0, U0, a, m, 400)), 0.01, 0.995, 90), api.C.blue);
          api.hline(s, Th, api.C.gold, [5, 4], "limite harmônico 2π/ω₀");
          api.dot(s, v.parameter, Math.min(Th * 3.2, P.period(E, U0, a, m, 600)), api.C.red, 4.5);
        },

        text(v, api) {
          const U0 = v.tertiary, a = 1, m = v.secondary, E = v.parameter * U0;
          const seg = P.excursion(E, U0, a);
          const T = P.period(E, U0, a, m);
          const w = P.omegaSmall(U0, a, m);
          const Th = (2 * Math.PI) / w;
          return {
            title: "Rapidez ao longo do poço",
            subtitle: `E = ${api.fmt(v.parameter, 3)} U₀ · m = ${api.fmt(m)} kg`,
            regime: T > 1.5 * Th ? ["período muito acima do harmônico", "alert"] : T > 1.05 * Th ? ["anarmônico", "warn"] : ["quase harmônico", "ok"],
            caption: "A rapidez zera nos dois pontos de retorno e é máxima no fundo. O período é a área sob 1/ẋ — e é ela que diverge quando E se aproxima do topo.",
            prediction: "Com E tendendo a U₀, o período tende a um valor finito ou cresce sem limite?",
            calculation: `ẋ(a) = √(2[E − U(a)]/m) = √(2·${api.fmt(E)}/${api.fmt(m)}) = <b>${api.fmt(P.speed(a, E, U0, a, m))} m/s</b><br>T = 2∫dx/ẋ entre ${api.fmt(seg[0])} e ${api.fmt(seg[1])} = <b>${api.fmt(T)} s</b><em>limite harmônico: 2π/ω₀ = 2π/√(8U₀/a²m) = ${api.fmt(Th)} s</em>`,
            metrics: [
              ["rapidez máxima", `${api.fmt(P.speed(a, E, U0, a, m))} m/s`],
              ["retorno interno", `${api.fmt(seg[0])} m`],
              ["retorno externo", `${api.fmt(seg[1])} m`],
              ["período T", `${api.fmt(T)} s`],
              ["T harmônico", `${api.fmt(Th)} s`],
              ["razão τ/τ₀", api.fmt(T / Th)]
            ],
            concept: "A conservação da energia devolve a rapidez em cada ponto e, por quadratura, o tempo — sem nunca resolver a equação de movimento.",
            prompts: [
              "Verifique que T tende a 2π/ω₀ quando E → 0.",
              "Quadruplique m e confirme que T dobra.",
              "Explique por que o período diverge ao aproximar E do topo da barreira."
            ],
            legend: [[api.C.green, "|ẋ|(x)"], [api.C.red, "pontos de retorno"], [api.C.gold, "fundo do poço"]],
            secondaryTitle: "Período contra energia",
            secondarySubtitle: "o oscilador harmônico é o platô à esquerda",
            secondaryCaption: "A divergência à direita é a separatriz que a Aula 15 retoma."
          };
        }
      },

      {
        id: "estabilidade",
        tab: "Equilíbrio e<br>linearização",
        heading: "Aproximação quadrática",
        equation: "U ≈ U(xₑ) + ½U″(xₑ)ξ²   ω₀ = √(U″/m)",
        hint: "Compare a parábola com o potencial exato. Onde ela deixa de servir?",
        controls: [
          { id: "parameter", label: "amplitude ξ examinada", min: 0.02, max: 1.2, step: 0.01, value: 0.35, digits: 2, unit: "m" },
          { id: "secondary", label: "meia separação a", min: 0.6, max: 2, step: 0.02, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 4, step: 0.05, value: 1, digits: 2, unit: "kg" }
        ],

        draw(api, v) {
          const U0 = 1, a = v.secondary, m = v.tertiary;
          const k = P.Upp(a, U0, a);
          const xm = a * 2.1;
          const chart = api.axes(api.main, 0, xm, -0.15, 1.4, "posição x (m)", "U (J)");
          api.line(chart, api.curve((x) => P.U(x, U0, a), 0, xm, 300), api.C.green, [], 3);
          api.line(chart, api.curve((x) => 0.5 * k * (x - a) ** 2, 0, xm, 200), api.C.blue, [6, 4], 2.4);

          const E = 0.5 * k * v.parameter ** 2;
          api.hline(chart, E, api.C.red, [4, 4], "energia da oscilação examinada");
          api.line(chart, [[a - v.parameter, -0.1], [a + v.parameter, -0.1]], api.C.gold, [], 4);
          api.label(chart, a, -0.135, "amplitude ξ", api.C.gold, "center", "top");
          api.dot(chart, a, 0, api.C.blue, 4.5, true);
          api.dot(chart, a - v.parameter, P.U(a - v.parameter, U0, a), api.C.red, 4);
          api.dot(chart, a + v.parameter, P.U(a + v.parameter, U0, a), api.C.red, 4);
        },

        text(v, api) {
          const U0 = 1, a = v.secondary, m = v.tertiary;
          const k = P.Upp(a, U0, a);
          const w = Math.sqrt(k / m);
          const exato = P.U(a + v.parameter, U0, a);
          const aprox = 0.5 * k * v.parameter ** 2;
          const erro = Math.abs(exato - aprox) / (aprox || 1);
          return {
            title: "Potencial exato e parábola osculadora",
            subtitle: `a = ${api.fmt(a)} m · m = ${api.fmt(m)} kg · ξ = ${api.fmt(v.parameter)} m`,
            regime: erro < 0.05 ? ["aproximação boa", "ok"] : erro < 0.2 ? ["anarmonicidade visível", "warn"] : ["linearização falha", "alert"],
            caption: "A parábola azul é o único termo que sobrevive à expansão em torno do mínimo. O potencial verde a abandona assim que ξ deixa de ser pequeno — e assimetricamente.",
            prediction: "A parábola erra mais para dentro ou para fora do poço?",
            calculation: `U″(a) = 4U₀(3a²/a² − 1)/a² = 8U₀/a² = <b>${api.fmt(k)} N/m</b><br>ω₀ = √(U″/m) = √(${api.fmt(k)}/${api.fmt(m)}) = <b>${api.fmt(w)} rad/s</b><em>em x = a + ξ: exato ${api.fmt(exato, 4)} J contra parabólico ${api.fmt(aprox, 4)} J</em>`,
            metrics: [
              ["k efetivo = U″(a)", `${api.fmt(k)} N/m`],
              ["ω₀", `${api.fmt(w)} rad/s`],
              ["período 2π/ω₀", `${api.fmt((2 * Math.PI) / w)} s`],
              ["U exato em a+ξ", `${api.fmt(exato, 4)} J`],
              ["U parabólico", `${api.fmt(aprox, 4)} J`],
              ["erro relativo", `${api.fmt(erro * 100, 1)} %`]
            ],
            concept: "Todo mínimo suave é um oscilador harmônico em escala pequena o bastante; a curvatura do potencial é a constante de mola efetiva.",
            prompts: [
              "Compare o erro em x = a + ξ e em x = a − ξ. Por que eles diferem?",
              "Dobre a e mostre que ω₀ cai pela metade.",
              "Ache a amplitude em que o erro da parábola chega a 5 %."
            ],
            legend: [[api.C.green, "U exato"], [api.C.blue, "½U″ξ²"], [api.C.gold, "amplitude"]]
          };
        }
      },

      {
        id: "metaestavel",
        tab: "Estável, instável<br>e metaestável",
        heading: "Poço duplo inclinado",
        equation: "U = U₀[(x²/a² − 1)² + ε x/a]<br>equilíbrio: U′ = 0 · estável: U″ > 0 · instável: U″ < 0<br>metaestável: mínimo local acima do mínimo global",
        hint: "Incline o potencial com ε. Preveja qual poço vira metaestável e quanta energia a partícula precisa para escapar dele.",
        controls: [
          { id: "parameter", label: "inclinação ε", min: -0.9, max: 0.9, step: 0.01, value: 0.3, digits: 2 },
          { id: "secondary", label: "energia da partícula E/U₀", min: 0, max: 2.0, step: 0.01, value: 0.55, digits: 2 },
          { id: "tertiary", label: "posição inicial x₀/a (em repouso)", min: -1.6, max: 1.6, step: 0.01, value: 0.96, digits: 2 }
        ],

        draw(api, v) {
          const U0 = 1, a = 1, eps = v.parameter;
          const eq = P.equilibria(U0, a, eps);
          const xm = 1.75;
          const uMin = Math.min(...eq.map((p) => p.U), 0);
          const yMin = Math.min(-0.95, uMin - 0.35);
          const chart = api.axes(api.main, -xm, xm, yMin, 1.8, "posição x/a", "U/U₀");
          api.line(chart, api.curve((x) => P.tiltedU(x, U0, a, eps), -xm, xm, 400), api.C.green, [], 3);
          const cores = { estavel: api.C.green, instavel: api.C.red, metaestavel: api.C.gold, indiferente: api.C.gray };
          const nomes = { estavel: "estável (global)", instavel: "instável", metaestavel: "metaestável", indiferente: "indiferente" };
          eq.forEach((p) => {
            api.dot(chart, p.x, p.U, cores[p.tipo], 5.5);
            api.label(chart, p.x, p.U + (p.tipo === "instavel" ? 0.12 : -0.12), nomes[p.tipo], cores[p.tipo], "center", p.tipo === "instavel" ? "bottom" : "top");
          });
          /* Barreira a partir do poço metaestável. */
          const max = eq.find((p) => p.tipo === "instavel"), meta = eq.find((p) => p.tipo === "metaestavel");
          if (max && meta) {
            const xb = (max.x + meta.x) / 2;
            api.line(chart, [[xb, meta.U], [xb, max.U]], api.C.red, [], 1.6);
            api.line(chart, [[xb, meta.U], [meta.x, meta.U]], "#b9c4bb", [3, 3], 1);
            api.line(chart, [[xb, max.U], [max.x, max.U]], "#b9c4bb", [3, 3], 1);
            api.label(chart, xb + (meta.x > max.x ? -0.04 : 0.04), (meta.U + max.U) / 2, "ΔU", api.C.red, meta.x > max.x ? "right" : "left", "middle");
          }
          /* Energia da partícula posta em repouso em x₀: E = U(x₀) + E extra do slider? Usa-se o
             slider de energia diretamente, e a região permitida que contém x₀. */
          const E = v.secondary * U0;
          api.hline(chart, E, api.C.blue, [6, 4], `E = ${api.fmt(v.secondary)} U₀`);
          /* Região permitida conectada a x₀. */
          const x0 = v.tertiary;
          if (P.tiltedU(x0, U0, a, eps) <= E) {
            const passo = 0.002; let l = x0, r = x0;
            while (l > -xm && P.tiltedU(l - passo, U0, a, eps) <= E) l -= passo;
            while (r < xm && P.tiltedU(r + passo, U0, a, eps) <= E) r += passo;
            api.line(chart, [[l, yMin + 0.12], [r, yMin + 0.12]], api.C.lime, [], 4);
            api.label(chart, (l + r) / 2, yMin + 0.07, "região acessível a partir de x₀", api.C.lime, "center", "top");
            api.dot(chart, l, E, api.C.blue, 4); api.dot(chart, r, E, api.C.blue, 4);
          }
          api.dot(chart, x0, P.tiltedU(x0, U0, a, eps), api.C.ink, 4.5);
          api.label(chart, x0, P.tiltedU(x0, U0, a, eps) + 0.1, "x₀", api.C.ink, "center", "bottom");
        },

        text(v, api) {
          const U0 = 1, a = 1, eps = v.parameter, E = v.secondary;
          const eq = P.equilibria(U0, a, eps);
          const b = P.barrier(U0, a, eps);
          const meta = eq.find((p) => p.tipo === "metaestavel"), est = eq.find((p) => p.tipo === "estavel"), max = eq.find((p) => p.tipo === "instavel");
          const x0 = v.tertiary, Ux0 = P.tiltedU(x0, U0, a, eps);
          const noMeta = meta && Math.abs(x0 - meta.x) < Math.abs(x0 - (est ? est.x : 99));
          const escapa = max ? E > max.U : true;
          const regime = Ux0 > E ? ["x₀ está na região proibida para esse E", "alert"]
            : escapa ? ["E acima da barreira: percorre os dois poços", "warn"]
              : noMeta ? ["presa no poço metaestável", "ok"] : ["presa no poço estável", "ok"];
          const fmtEq = (p) => p ? `x = ${api.fmt(p.x)} a, U = ${api.fmt(p.U)} U₀, U″ = ${api.fmt(p.Upp)} U₀/a²` : "—";
          return {
            title: "Três tipos de equilíbrio num só potencial",
            subtitle: `ε = ${api.fmt(eps)} · E = ${api.fmt(E)} U₀ · x₀ = ${api.fmt(x0)} a`,
            regime,
            caption: "O termo linear ε x/a desnivela os poços: o mais fundo é o equilíbrio estável global, o mais alto é metaestável e o máximo entre eles é instável. ΔU é a barreira que a partícula presa no poço metaestável precisa vencer para cair no outro, de onde, com a mesma energia, não volta.",
            prediction: "Com ε > 0, qual dos dois poços fica metaestável? E se ε trocar de sinal?",
            calculation: `U′ = 0 ⟹ 4(x/a)[(x/a)² − 1] + ε = 0 ⟹ x ≃ ${eq.map((p) => api.fmt(p.x)).join(" ; ")}<br>U″ = (4U₀/a²)(3x²/a² − 1): ${eq.map((p) => `${api.fmt(p.Upp, 1)} (${p.tipo})`).join(" · ")}<br>barreira do poço metaestável ΔU = U(x_máx) − U(x_meta) = <b>${Number.isFinite(b.meta) ? api.fmt(b.meta) : "—"} U₀</b> (≈ U₀(1 − |ε|) = ${api.fmt(1 - Math.abs(eps))})<em>diferença entre os poços U_meta − U_est = ${Number.isFinite(b.diferenca) ? api.fmt(b.diferenca) : "—"} U₀ ≈ 2|ε|U₀ = ${api.fmt(2 * Math.abs(eps))}</em>`,
            metrics: [
              ["estável (global)", fmtEq(est)],
              ["instável", fmtEq(max)],
              ["metaestável", fmtEq(meta)],
              ["barreira ΔU do poço metaestável", Number.isFinite(b.meta) ? `${api.fmt(b.meta)} U₀` : "—"],
              ["barreira a partir do poço estável", Number.isFinite(b.estavel) ? `${api.fmt(b.estavel)} U₀` : "—"],
              ["ω₀ nos poços (×√(U₀/m)/a)", `${est ? api.fmt(est.omega) : "—"} e ${meta ? api.fmt(meta.omega) : "—"}`],
              ["U(x₀)", `${api.fmt(Ux0)} U₀`]
            ],
            concept: "Estável, instável e metaestável são três respostas à mesma pergunta: o que uma pequena perturbação faz. A diferença entre estável e metaestável só aparece quando a perturbação deixa de ser pequena e alcança a barreira.",
            prompts: [
              "Exercício 1. Com ε = 0,3, classifique os três equilíbrios pelo sinal de U″ e confira com a cor dos pontos.",
              "Exercício 2. Ponha x₀ = 0,96 (fundo do poço metaestável) e suba E a partir de U(x₀): em que E a partícula escapa? Compare com ΔU + U(x₀).",
              "Exercício 3. Com E entre os dois mínimos mais a barreira, mostre que a partícula que escapou do poço metaestável fica confinada no estável e não volta.",
              "Exercício 4. Leve ε a zero e explique por que, com os poços nivelados, não há metaestabilidade; depois troque o sinal de ε e veja os papéis se inverterem.",
              "Exercício 5. Um canal iônico tem estados fechado e aberto como dois poços; o potencial de membrana faz o papel de ε. Que sinal de ε favorece o estado aberto se ele for o poço da direita?"
            ],
            legend: [[api.C.green, "U(x) e equilíbrio estável"], [api.C.red, "instável e barreira ΔU"], [api.C.gold, "metaestável"], [api.C.blue, "energia E"], [api.C.lime, "região acessível"]]
          };
        }
      },

      {
        id: "quadril",
        tab: "Física médica:<br>queda e fratura",
        heading: "Queda sobre o quadril",
        equation: "E = m_ef g h = ½m_ef v²<br>impacto: F̄·d = m_ef g h ⟹ F̄ = m_ef g h/d<br>(Δ(T+U) = W_nc, com W_nc = −F̄ d)",
        hint: "Só a massa efetiva (pelve e tronco, cerca de um terço do corpo) é freada no quadril; o resto desacelera depois. A energia está decidida por h; o que o protetor muda é d. Preveja se dobrar d divide a força por dois.",
        controls: [
          { id: "parameter", label: "altura de queda do quadril h", min: 0.3, max: 1.2, step: 0.01, value: 0.7, digits: 2, unit: "m" },
          { id: "secondary", label: "massa efetiva no impacto m_ef (≈ ⅓ do corpo)", min: 10, max: 60, step: 1, value: 25, digits: 0, unit: "kg" },
          { id: "tertiary", label: "distância de frenagem d (tecido + protetor)", min: 0.5, max: 8, step: 0.1, value: 3.0, digits: 1, unit: "cm" },
          { id: "quaternary", label: "limiar de fratura do colo do fêmur", min: 2000, max: 6000, step: 100, value: 3500, digits: 0, unit: "N" }
        ],
        secondary: true,

        draw(api, v) {
          const h = v.parameter, m = v.secondary, d = v.tertiary / 100, Flim = v.quaternary;
          const q = P.fallImpact(m, h, d);
          /* Painel principal: força média contra a distância de frenagem, com o limiar. */
          const chart = api.axes(api.main, 0.3, 8, 0, Math.max(Flim * 1.3, P.fallImpact(m, h, 0.01).Fmed * 0.6), "distância de frenagem d (cm)", "força média no impacto (N)");
          api.area(chart, [[0.3, Flim], [8, Flim]], "rgba(198,92,75,.08)", chart.yMax);
          api.line(chart, api.curve((dc) => P.fallImpact(m, h, dc / 100).Fmed, 0.3, 8, 240), api.C.green, [], 3);
          api.hline(chart, Flim, api.C.red, [6, 4], "limiar de fratura");
          const dReq = P.requiredCushion(Flim, m, h) * 100;
          if (dReq >= 0.3 && dReq <= 8) api.vline(chart, dReq, api.C.gold, [4, 4], `d mínimo = ${api.fmt(dReq, 1)} cm`);
          api.dot(chart, v.tertiary, q.Fmed, q.Fmed > Flim ? api.C.red : api.C.green, 6);
          api.label(chart, v.tertiary + 0.12, q.Fmed, `F̄ = ${api.fmt(q.Fmed / 1000, 1)} kN`, api.C.ink, "left", "middle");

          /* Painel secundário: altura crítica contra d. */
          const s = api.axes(api.second, 0.3, 8, 0, 1.6, "distância de frenagem d (cm)", "altura crítica h_c (m)");
          api.line(s, api.curve((dc) => Math.min(1.6, P.criticalHeight(Flim, m, dc / 100)), 0.3, 8, 200), api.C.blue);
          api.hline(s, h, api.C.gold, [5, 4], "altura da queda h");
          api.dot(s, v.tertiary, Math.min(1.6, P.criticalHeight(Flim, m, d)), api.C.red, 4.5);
        },

        text(v, api) {
          const h = v.parameter, m = v.secondary, d = v.tertiary / 100, Flim = v.quaternary;
          const q = P.fallImpact(m, h, d);
          const hc = P.criticalHeight(Flim, m, d);
          const dReq = P.requiredCushion(Flim, m, h);
          const fratura = q.Fmed > Flim;
          return {
            title: "Energia da queda e força no impacto",
            subtitle: `h = ${api.fmt(h)} m · m_ef = ${api.fmt(m, 0)} kg · d = ${api.fmt(v.tertiary, 1)} cm · F_lim = ${api.fmt(Flim, 0)} N`,
            regime: fratura ? ["força média acima do limiar", "alert"] : ["abaixo do limiar", "ok"],
            caption: "A energia que chega ao quadril é m_ef g h, com a massa efetiva que de fato é freada ali (o resto do corpo desacelera depois, por outras vias). O que o tecido mole, um protetor de quadril ou um piso macio fazem é alongar a distância d em que essa energia é absorvida, dividindo a força média. Em quedas reais medem-se picos de 2,5 a 8 kN; o limiar de fratura do colo do fêmur varia de 2 a 6 kN com a densidade óssea.",
            prediction: "Dobrar a distância de frenagem d dobra, divide por dois ou não altera a força média no impacto?",
            calculation: `E = m_ef g h = ${api.fmt(m, 0)}·9,8·${api.fmt(h)} = <b>${api.fmt(q.E, 0)} J</b> · v = √(2gh) = <b>${api.fmt(q.v)} m/s</b><br>Δ(T+U) = W_nc ⟹ 0 − m_ef g h = −F̄ d ⟹ F̄ = m_ef g h/d = ${api.fmt(q.E, 0)}/${api.fmt(d, 3)} = <b>${api.fmt(q.Fmed / 1000, 2)} kN</b><em>desaceleração média ${api.fmt(q.decel / 9.8, 0)} g; para ficar no limiar seria preciso d ≥ ${api.fmt(dReq * 100, 1)} cm, ou h ≤ ${api.fmt(hc, 2)} m</em>`,
            metrics: [
              ["energia no impacto m_ef g h", `${api.fmt(q.E, 0)} J`],
              ["velocidade ao tocar", `${api.fmt(q.v)} m/s`],
              ["força média F̄ = m_ef g h/d", `${api.fmt(q.Fmed / 1000, 2)} kN`],
              ["F̄ em pesos de um corpo de 70 kg", `${api.fmt(q.Fmed / (70 * 9.8), 1)} ×`],
              ["desaceleração média", `${api.fmt(q.decel / 9.8, 0)} g`],
              ["d mínimo para F̄ = F_lim", `${api.fmt(dReq * 100, 1)} cm`],
              ["altura crítica h_c para este d", `${api.fmt(hc, 2)} m`]
            ],
            concept: "O balanço de energia não diz quanto tempo o impacto dura nem como a força varia, mas fixa o produto F̄·d. Por isso proteção contra fratura é sempre uma questão de distância de frenagem: amortecer é alongar d. E usar a massa inteira do corpo superestima a força em várias vezes: um bom modelo começa por decidir o que de fato é freado.",
            prompts: [
              "Exercício 1. Com m_ef = 25 kg e h = 0,70 m, ache o d mínimo para a força média ficar abaixo de 3,5 kN (≈ 4,9 cm) e compare com a espessura de tecido mole sobre o trocânter (1 a 3 cm): é a diferença que um protetor de quadril precisa cobrir.",
              "Exercício 2. Mostre que, para d fixo, a altura crítica é h_c = F_lim d/(m_ef g): ela cai com a massa. Pessoas mais leves estão menos ou mais protegidas, para o mesmo d? E por que a magreza, na prática, piora o quadro (pense em d)?",
              "Exercício 3. A força média é um limite inferior do pico: se a força cresce linearmente com a deformação (mola), o pico vale 2F̄. Recalcule o veredito com esse fator.",
              "Exercício 4. Escreva o balanço Δ(T+U) = W_nc para a queda inteira, do repouso até parar, e identifique cada termo.",
              "Exercício 5. Refaça a conta com a massa corporal inteira (70 kg) e compare com os 2,5 a 8 kN medidos em quedas reais: o que o excesso diz sobre a hipótese de que todo o corpo para no quadril?"
            ],
            legend: [[api.C.green, "F̄(d) = m_ef g h/d"], [api.C.red, "limiar de fratura"], [api.C.gold, "d mínimo / altura da queda"], [api.C.blue, "altura crítica h_c(d)"]],
            secondaryTitle: "Altura crítica contra a distância de frenagem",
            secondarySubtitle: "h_c = F_lim d/(m_ef g): acima da curva, a força média ultrapassa o limiar",
            secondaryCaption: "Alongar d em poucos centímetros desloca h_c para além da altura do quadril."
          };
        }
      },

      {
        id: "coracao",
        tab: "Física médica:<br>trabalho do coração",
        heading: "Ventrículo esquerdo como bomba",
        equation: "W = p̄ ΔV + ½ρΔV v²<br>𝒫 = W·f  (f em batimentos/s)<br>1 mmHg = 133,3 Pa",
        hint: "O trabalho de cada batimento é pressão vezes volume. Preveja quanto vale, em joules, e quanta potência isso dá a 70 bpm.",
        controls: [
          { id: "parameter", label: "pressão média de ejeção p̄", min: 60, max: 200, step: 1, value: 100, digits: 0, unit: "mmHg" },
          { id: "secondary", label: "volume sistólico ΔV", min: 30, max: 120, step: 1, value: 70, digits: 0, unit: "mL" },
          { id: "tertiary", label: "frequência cardíaca f", min: 40, max: 180, step: 1, value: 70, digits: 0, unit: "bpm" },
          { id: "quaternary", label: "velocidade de ejeção na aorta (estenose: 3 a 5 m/s)", min: 0.2, max: 4.0, step: 0.05, value: 0.5, digits: 2, unit: "m/s" }
        ],
        secondary: true,

        draw(api, v) {
          const p = v.parameter, dV = v.secondary, f = v.tertiary, vej = v.quaternary;
          const c = P.cardiacWork(p, dV, vej);
          /* Painel principal: o retângulo pressão–volume cuja área é o trabalho de pressão. */
          const chart = api.axes(api.main, 0, 130, 0, 210, "volume ejetado (mL)", "pressão (mmHg)");
          api.area(chart, [[0, p], [dV, p]], "rgba(97,155,96,.18)", 0);
          api.line(chart, [[0, p], [dV, p], [dV, 0]], api.C.green, [], 2.6);
          api.label(chart, dV / 2, p / 2, `W_p = p̄ ΔV = ${api.fmt(c.Wp, 2)} J`, api.C.green, "center", "middle");
          api.hline(chart, 120, api.C.gold, [3, 4], "sistólica típica 120 mmHg");
          api.hline(chart, 80, api.C.gold, [3, 4], "diastólica típica 80 mmHg");
          api.dot(chart, dV, p, api.C.red, 5);

          /* Painel secundário: potência contra frequência, com a pressão atual. */
          const s = api.axes(api.second, 40, 180, 0, Math.max(1.6, P.cardiacPower(c.W, 180) * 1.1), "frequência (bpm)", "potência (W)");
          api.line(s, api.curve((bpm) => P.cardiacPower(c.W, bpm), 40, 180, 100), api.C.blue);
          api.hline(s, 1.0, api.C.gray, [3, 4], "1 W");
          api.dot(s, f, P.cardiacPower(c.W, f), api.C.red, 4.5);
        },

        text(v, api) {
          const p = v.parameter, dV = v.secondary, f = v.tertiary, vej = v.quaternary;
          const c = P.cardiacWork(p, dV, vej);
          const pot = P.cardiacPower(c.W, f);
          const diario = pot * 86400;
          const vd = P.cardiacWork(15, dV, vej);           // ventrículo direito: pressão pulmonar média ≈ 15 mmHg
          const total = c.W + vd.W;
          return {
            title: "Trabalho por batimento e potência",
            subtitle: `p̄ = ${api.fmt(p, 0)} mmHg · ΔV = ${api.fmt(dV, 0)} mL · f = ${api.fmt(f, 0)} bpm`,
            regime: pot > 4 ? ["esforço intenso", "alert"] : pot > 1.8 ? ["esforço moderado", "warn"] : ["repouso", "ok"],
            caption: "A área do retângulo é o trabalho de pressão–volume do ventrículo esquerdo, a parte dominante. A energia cinética dada ao sangue ejetado é a parcela pequena que a velocidade na aorta controla, e só cresce numa estenose. Multiplicar pelo número de batimentos por segundo dá a potência mecânica da bomba; o ventrículo direito acrescenta cerca de um sétimo.",
            prediction: "A potência mecânica do coração em repouso é da ordem de 1 W, 10 W ou 100 W?",
            calculation: `W_p = p̄ ΔV = ${api.fmt(p, 0)}·133,3 Pa · ${api.fmt(dV, 0)}·10⁻⁶ m³ = <b>${api.fmt(c.Wp, 3)} J</b><br>T = ½ρΔV v² = ½·1060·${api.fmt(dV * 1e-6, 6)}·${api.fmt(vej)}² = ${api.fmt(c.Tk, 4)} J (${api.fmt(100 * c.Tk / c.W, 1)} %)<br>𝒫 = W f = ${api.fmt(c.W, 3)} J · ${api.fmt(f / 60, 3)} s⁻¹ = <b>${api.fmt(pot, 2)} W</b><em>em um dia: ${api.fmt(diario / 1000, 0)} kJ ≈ ${api.fmt(diario / 4184, 0)} kcal de trabalho mecânico; com eficiência de ~20 %, o músculo gasta cerca de ${api.fmt(diario / 4184 / 0.2, 0)} kcal</em>`,
            metrics: [
              ["trabalho de pressão W_p", `${api.fmt(c.Wp, 3)} J`],
              ["energia cinética do sangue ejetado", `${api.fmt(c.Tk, 4)} J`],
              ["trabalho por batimento W", `${api.fmt(c.W, 3)} J`],
              ["potência mecânica 𝒫 (VE)", `${api.fmt(pot, 2)} W`],
              ["ventrículo direito (p̄ ≈ 15 mmHg), por batimento", `${api.fmt(vd.W, 3)} J`],
              ["coração inteiro (VE + VD)", `${api.fmt(total, 2)} J · ${api.fmt(P.cardiacPower(total, f), 2)} W`],
              ["fração do metabolismo basal (~80 W), VE", `${api.fmt(100 * pot / 80, 1)} %`],
              ["trabalho em 24 h", `${api.fmt(diario / 1000, 0)} kJ`]
            ],
            concept: "𝒫 = dW/dt aplicado a uma bomba: trabalho por ciclo vezes ciclos por segundo. A pressão é a força por área e o volume é a área vezes o deslocamento, de modo que p ΔV é exatamente F·d.",
            prompts: [
              "Exercício 1. Confirme que p ΔV tem dimensão de trabalho e converta 100 mmHg · 70 mL para joules à mão.",
              "Exercício 2. Em hipertensão (p̄ = 150 mmHg) com o mesmo ΔV, de quanto cresce o trabalho por batimento? E a potência a 70 bpm?",
              "Exercício 3. Em exercício, f sobe para 150 bpm e ΔV para 100 mL: estime a potência e compare com o repouso.",
              "Exercício 4. Mostre que a parte cinética passa de 10 % do trabalho de pressão para velocidades de ejeção acima de ≈ 1,6 m/s (½ρv² = 0,1 p̄), e leve o controle a 3 ou 4 m/s, a faixa de uma estenose aórtica: que fração ela atinge?",
              "Exercício 5. O ventrículo direito ejeta o mesmo volume contra ≈ 15 mmHg. Mostre que seu trabalho é cerca de um sétimo do esquerdo e some os dois para o trabalho do coração inteiro."
            ],
            legend: [[api.C.green, "trabalho pressão–volume"], [api.C.gold, "pressões típicas"], [api.C.blue, "potência contra frequência"], [api.C.red, "ponto atual"]],
            secondaryTitle: "Potência mecânica contra a frequência cardíaca",
            secondarySubtitle: "𝒫 = W f, com o trabalho por batimento atual",
            secondaryCaption: "Em repouso, cerca de 1 W: pouco mais de 1 % do metabolismo basal."
          };
        }
      }
    ]
  };
})();
