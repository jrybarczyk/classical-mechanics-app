(function () {
  "use strict";
  const P = window.LessonPhysics;

  /* Estação 4: as duas trajetórias são integradas uma vez por par (θ₁₀, δ) e
     reaproveitadas entre draw e text — sem isso cada quadro refaria 6000 passos. */
  const DT_CAOS = 0.004, PASSOS_CAOS = 3000, MM = 1, LL = 1;
  let caosCache = { chave: null, a: null, b: null };
  const caos = (th0, delta) => {
    const chave = `${th0}|${delta}`;
    if (caosCache.chave !== chave) {
      caosCache = {
        chave,
        a: P.doublePath([th0, th0, 0, 0], DT_CAOS, PASSOS_CAOS, MM, MM, LL, LL),
        b: P.doublePath([th0 + delta, th0, 0, 0], DT_CAOS, PASSOS_CAOS, MM, MM, LL, LL)
      };
    }
    return caosCache;
  };
  const quadro = (t) => Math.min(PASSOS_CAOS, Math.max(0, Math.round(t / DT_CAOS)));

  window.LessonScene = {
    id: "aula25",
    discipline: "Mecânica Clássica · Aula 24",
    title: "Aplicações lagrangianas",
    subtitle: "Um termo que vem da energia cinética pode se comportar como potencial?",

    stations: [
      {
        id: "aro",
        tab: "Conta em<br>aro girante",
        heading: "Bifurcação em ω_c",
        equation: "V = −mgRcosθ − ½mR²ω²sen²θ   ·   ω_c = √(g/R)",
        hint: "Atravesse ω_c e veja o mínimo em θ = 0 virar máximo.",
        controls: [
          { id: "parameter", label: "rotação ω / ω_c", min: 0.2, max: 2.4, step: 0.01, value: 0.7, digits: 2 },
          { id: "secondary", label: "raio do aro R", min: 0.2, max: 2, step: 0.05, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const m = v.tertiary, R = v.secondary;
          const wc = P.criticalOmega(R);
          const w = v.parameter * wc;
          const escala = m * P.G * R;
          /* Piso do eixo: o fundo do potencial é −mgR(r + 1/r)/2 em θ*, que passa de −2,4·mgR
             para ω/ω_c > ~2; o piso agora acompanha o mínimo de todas as curvas desenhadas. */
          let vMin = -escala * 2.4;
          [0.5 * wc, wc, 1.6 * wc, w].forEach((om) => {
            for (let k = 0; k <= 120; k += 1) vMin = Math.min(vMin, P.hoopVeff(-Math.PI + (k * 2 * Math.PI) / 120, m, R, om) * 1.12);
          });
          const chart = api.axes(api.main, -Math.PI, Math.PI, vMin, escala * 1.4, "ângulo θ (rad)", "V (J)", {
            xTicks: [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI],
            xFormat: (t) => (Math.abs(t) < 0.01 ? "0" : Math.abs(Math.abs(t) - Math.PI) < 0.01 ? (t > 0 ? "π" : "−π") : (t > 0 ? "π/2" : "−π/2"))
          });
          [0.5, 1, 1.6].forEach((r) => {
            api.line(chart, api.curve((th) => P.hoopVeff(th, m, R, r * wc), -Math.PI, Math.PI, 200), "#d8e0d9", [4, 4], 1.4);
          });
          api.line(chart, api.curve((th) => P.hoopVeff(th, m, R, w), -Math.PI, Math.PI, 300), api.C.green, [], 3.2);
          const estavelFundo = P.hoopVeffSecond(0, m, R, w) > 0;
          api.dot(chart, 0, P.hoopVeff(0, m, R, w), estavelFundo ? api.C.gold : api.C.red, 6, !estavelFundo);
          const ts = P.tiltedEquilibrium(R, w);
          if (Number.isFinite(ts)) {
            [ts, -ts].forEach((t) => api.dot(chart, t, P.hoopVeff(t, m, R, w), api.C.gold, 5.5));
            api.label(chart, ts, P.hoopVeff(ts, m, R, w) - escala * 0.2, "θ*", api.C.gold, "center", "top");
          }
          api.label(chart, 0, P.hoopVeff(0, m, R, w) + escala * 0.16, estavelFundo ? "mínimo" : "máximo", estavelFundo ? api.C.gold : api.C.red, "center");

          const s = api.axes(api.second, 0, 2.4, -1.75, 1.75, "ω / ω_c", "θ de equilíbrio (rad)", { yTicks: [-1.5708, 0, 1.5708], yFormat: (t) => (Math.abs(t) < 0.01 ? "0" : t > 0 ? "π/2" : "−π/2") });
          api.line(s, api.curve(() => 0, 0, 1, 2), api.C.green, [], 3);
          api.line(s, api.curve(() => 0, 1, 2.4, 2), api.C.red, [4, 4], 2.2);
          api.line(s, api.curve((r) => P.tiltedEquilibrium(R, r * wc), 1.001, 2.4, 120), api.C.green, [], 3);
          api.line(s, api.curve((r) => -P.tiltedEquilibrium(R, r * wc), 1.001, 2.4, 120), api.C.green, [], 3);
          api.vline(s, 1, api.C.gold, [3, 4], "ω_c");
          api.dot(s, v.parameter, Number.isFinite(ts) ? ts : 0, api.C.ink, 5);
          api.label(s, 1.9, 0.18, "instável", api.C.red, "center");
        },

        text(v, api) {
          const m = v.tertiary, R = v.secondary;
          const wc = P.criticalOmega(R);
          const w = v.parameter * wc;
          const ts = P.tiltedEquilibrium(R, w);
          const acima = v.parameter > 1;
          const V2 = P.hoopVeffSecond(0, m, R, w);
          return {
            title: "Potencial efetivo da conta",
            subtitle: `ω/ω_c = ${api.fmt(v.parameter)} · R = ${api.fmt(R)} m · ω_c = ${api.fmt(wc, 3)} rad/s`,
            regime: acima ? ["fundo instável, dois mínimos laterais", "alert"] : ["fundo estável", "ok"],
            caption: "Abaixo de ω_c há um único mínimo, no fundo. Acima dele o fundo vira máximo e nascem dois mínimos simétricos — é uma bifurcação, calculável à mão.",
            prediction: "Acima de que rotação a conta deixa de repousar no fundo do aro?",
            calculation: `V′ = mR senθ(g − Rω²cosθ) = 0 ⟹ θ = 0, π ou <b>cosθ* = g/Rω²</b><br>V″(0) = mgR − mR²ω² = <b>${api.fmt(V2, 4)}</b><em>${acima ? `θ* = ${api.fmt(ts, 4)} rad = ${api.fmt((ts * 180) / Math.PI, 1)}°, com ω_osc = ${api.fmt(P.tiltedFrequency(R, w), 4)} rad/s` : `fundo ainda estável, com ω_osc = ${api.fmt(P.bottomFrequency(R, w), 4)} rad/s`}</em>`,
            metrics: [
              ["ω_c = √(g/R)", `${api.fmt(wc, 4)} rad/s`],
              ["V″(0)", api.fmt(V2, 4)],
              ["θ*", Number.isFinite(ts) ? `${api.fmt((ts * 180) / Math.PI, 1)}°` : "não existe"],
              ["V″(θ*)", Number.isFinite(ts) ? api.fmt(P.hoopVeffSecond(ts, m, R, w), 4) : "—"],
              ["ω em torno do fundo", Number.isFinite(P.bottomFrequency(R, w)) ? api.fmt(P.bottomFrequency(R, w), 4) : "—"],
              ["ω em torno de θ*", Number.isFinite(ts) ? api.fmt(P.tiltedFrequency(R, w), 4) : "—"]
            ],
            concept: "O termo ½mR²ω²sen²θ vem da energia cinética, mas entra em V e se comporta como potencial: é a centrífuga da Aula 10 emergindo sozinha da escolha de coordenadas.",
            prompts: [
              "Verifique que V″(0) troca de sinal exatamente em ω = ω_c.",
              "Confirme que o equilíbrio inclinado é sempre estável quando existe.",
              "Mostre que a frequência em torno do fundo cai a zero na bifurcação."
            ],
            legend: [[api.C.green, "ω escolhido"], ["#d8e0d9", "outras rotações"], [api.C.gold, "equilíbrios estáveis"]],
            secondaryTitle: "Diagrama de bifurcação",
            secondarySubtitle: "o equilíbrio estável deixa de ser único em ω_c",
            secondaryCaption: "Forma clássica de forquilha: um ramo perde estabilidade e dois nascem."
          };
        }
      },

      {
        id: "duplo",
        tab: "Pêndulo<br>duplo",
        heading: "Acoplamento na massa",
        equation: "m fora da diagonal, A diagonal   ·   ω²± = (2±√2)g/ℓ",
        hint: "Compare com a Aula 14, onde o acoplamento estava em A. Aqui está em m.",
        controls: [
          { id: "parameter", label: "razão de massas m₂/m₁", min: 0.01, max: 5, step: 0.01, value: 1, digits: 2 },
          { id: "secondary", label: "razão de comprimentos ℓ₂/ℓ₁", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "fase do modo mostrado", min: 0, max: 6.28, step: 0.02, value: 0, digits: 2, unit: "rad" }
        ],
        animate: { control: "tertiary", period: 6 },
        secondary: true,

        draw(api, v) {
          const m1 = 1, m2 = v.parameter, l1 = 1, l2 = v.secondary;
          const [wm, wM] = P.doubleFrequencies(m1, m2, l1, l2);
          const [rLento, rRapido] = P.doubleModeRatios(m1, m2, l1, l2);
          const { ctx, width, height } = api.main;
          const cy = height * 0.16;
          [["modo lento", wm, width * 0.3, api.C.green, rLento], ["modo rápido", wM, width * 0.72, api.C.red, rRapido]].forEach(([nome, wmod, cx, cor, razao]) => {
            /* Autovetor (1, θ₂/θ₁) calculado dos sliders, normalizado para o maior ângulo valer 0,45 rad. */
            const norma = 0.45 / Math.max(1, Math.abs(razao));
            const amp = norma * Math.cos(v.tertiary);
            const t1 = amp, t2 = razao * amp;
            const esc = Math.min(height * 0.3, 90);
            const x1 = cx + esc * l1 * Math.sin(t1), y1 = cy + esc * l1 * Math.cos(t1);
            const x2 = x1 + esc * l2 * Math.sin(t2), y2 = y1 + esc * l2 * Math.cos(t2);
            api.hatch(ctx, cx - 26, cy, cx + 26, cy, "#b6c0b7", 11, 8);
            ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            ctx.fillStyle = cor;
            ctx.beginPath(); ctx.arc(x1, y1, 7 + 3 * Math.log(1 + m1), 0, api.TAU); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y2, 7 + 3 * Math.log(1 + m2), 0, api.TAU); ctx.fill();
            ctx.setLineDash([4, 4]); ctx.strokeStyle = "#c9d2ca"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + esc * (l1 + l2) * 1.1); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = cor; ctx.font = "600 13px Ubuntu, system-ui, sans-serif";
            ctx.fillText(`${nome}: ω = ${api.fmt(wmod, 3)} rad/s`, cx - 80, height - 22);
          });

          const s = api.axes(api.second, 0, 5, 0, P.doubleFrequencies(1, 5, l1, l2)[1] * 1.15, "razão m₂/m₁", "frequências normais (rad/s)");
          api.line(s, api.curve((r) => P.doubleFrequencies(1, r, l1, l2)[0], 0.01, 5, 160), api.C.green);
          api.line(s, api.curve((r) => P.doubleFrequencies(1, r, l1, l2)[1], 0.01, 5, 160), api.C.red);
          api.dot(s, v.parameter, wm, api.C.green, 4.5);
          api.dot(s, v.parameter, wM, api.C.red, 4.5);
          api.hline(s, Math.sqrt(P.G / l1), api.C.grayLight, [4, 4], "√(g/ℓ₁)");
          if (Math.abs(l2 - l1) > 0.03) api.hline(s, Math.sqrt(P.G / l2), api.C.grayLight, [2, 4], "√(g/ℓ₂)");
        },

        text(v, api) {
          const m1 = 1, m2 = v.parameter, l1 = 1, l2 = v.secondary;
          const [wm, wM] = P.doubleFrequencies(m1, m2, l1, l2);
          const { M, K } = P.doubleMatrices(m1, m2, l1, l2);
          const [rLento, rRapido] = P.doubleModeRatios(m1, m2, l1, l2);
          const iguais = Math.abs(m2 - 1) < 0.03 && Math.abs(l2 - 1) < 0.03;
          return {
            title: "Os dois modos normais",
            subtitle: `m₂/m₁ = ${api.fmt(m2)} · ℓ₂/ℓ₁ = ${api.fmt(l2)}`,
            regime: iguais ? ["caso simétrico: ω²± = (2±√2)g/ℓ", "ok"] : ["caso geral", "warn"],
            caption: "No modo lento as duas hastes vão juntas (θ₂/θ₁ > 0); no rápido, em oposição (θ₂/θ₁ < 0). A matriz de massa m é que está fora da diagonal — o oposto da Aula 14.",
            prediction: "Com m₂ muito pequena, as duas frequências convergem para quê?",
            calculation: `m = [[${api.fmt(M[0][0], 3)}, ${api.fmt(M[0][1], 3)}], [${api.fmt(M[1][0], 3)}, ${api.fmt(M[1][1], 3)}]]<br>A = [[${api.fmt(K[0][0], 3)}, 0], [0, ${api.fmt(K[1][1], 3)}]]<em>det(A − ω²m) = 0 ⟹ ω₋ = <b>${api.fmt(wm, 4)}</b> e ω₊ = <b>${api.fmt(wM, 4)}</b> rad/s; θ₂/θ₁ = ${api.fmt(rLento, 3)} e ${api.fmt(rRapido, 3)}</em>`,
            metrics: [
              ["ω₋ (lento)", `${api.fmt(wm, 4)} rad/s`],
              ["ω₊ (rápido)", `${api.fmt(wM, 4)} rad/s`],
              ["razão ω₊/ω₋", api.fmt(wM / wm, 4)],
              ["m fora da diagonal", api.fmt(M[0][1], 4)],
              ["A fora da diagonal", "0"],
              ["θ₂/θ₁ lento · rápido", `${api.fmt(rLento, 3)} · ${api.fmt(rRapido, 3)}`]
            ],
            concept: "Reapareceu, sem ter sido procurada, a estrutura m q̈ + A q = 0 da Aula 14 — com a diferença de que agora é m, e não A, que acopla. É o assunto da Aula 26.",
            prompts: [
              "Com massas e comprimentos iguais, confirme ω²± = (2±√2)g/ℓ e θ₂/θ₁ = ±√2.",
              "Leve m₂/m₁ a 0,01 (com ℓ₂ = ℓ₁) e explique para onde as duas frequências convergem.",
              "Descreva o padrão de movimento de cada modo."
            ],
            legend: [[api.C.green, "modo lento"], [api.C.red, "modo rápido"]],
            secondaryTitle: "Frequências contra a razão de massas",
            secondarySubtitle: "os dois ramos se afastam à medida que m₂ cresce",
            secondaryCaption: "Com m₂ → 0 elas tendem a √(g/ℓ₁) e √(g/ℓ₂): só se encontram nesse limite se ℓ₂ = ℓ₁."
          };
        }
      },

      {
        id: "marcha",
        tab: "A perna que<br>oscila",
        heading: "Modelo balístico e seu limite",
        equation: "I = ⅓mℓ²   ·   τ = 2π√(2ℓ/3g)",
        hint: "Compare o meio período com os 0,40 s observados. O erro é do modelo, não da física.",
        controls: [
          { id: "parameter", label: "comprimento da perna ℓ", min: 0.5, max: 1.2, step: 0.01, value: 0.9, digits: 2, unit: "m" },
          { id: "secondary", label: "fração I′/I", min: 0.15, max: 1, step: 0.005, value: 1, digits: 2 },
          { id: "tertiary", label: "tempo de balanço observado", min: 0.25, max: 0.7, step: 0.01, value: 0.4, digits: 2, unit: "s" }
        ],
        secondary: true,

        draw(api, v) {
          const chart = api.axes(api.main, 0.15, 1, 0, P.reducedPeriod(1.2, 1) / 2 * 1.1, "fração I′/I", "meio período (s)");
          [[0.7, "#cfd8d0"], [0.9, api.C.green], [1.1, api.C.blue]].forEach(([l, cor]) => {
            api.line(chart, api.curve((f) => P.reducedPeriod(l, f) / 2, 0.15, 1, 100), cor,
              Math.abs(l - v.parameter) < 0.03 ? [] : [5, 4], Math.abs(l - v.parameter) < 0.03 ? 3 : 1.6);
            api.label(chart, 0.98, P.reducedPeriod(l, 1) / 2, `ℓ = ${api.fmt(l)} m`, cor, "right");
          });
          api.hline(chart, v.tertiary, api.C.red, [5, 4], "observado na marcha normal");
          api.dot(chart, v.secondary, P.reducedPeriod(v.parameter, v.secondary) / 2, api.C.ink, 5.5);
          const f = P.requiredFactor(v.parameter, v.tertiary);
          if (f >= 0.15 && f <= 1) api.vline(chart, f, api.C.gold, [4, 4], `I necessário: ${api.fmt(f * 100, 0)} %`);

          const { ctx, width, height } = api.second;
          const hy = height * 0.16;
          const cx = width * 0.5;
          const esc = height * 0.6;
          api.hatch(ctx, cx - 40, hy, cx + 40, hy, "#b6c0b7", 11, 8);
          [[0, "#cfd8d0", 1], [0.35, api.C.green, v.secondary]].forEach(([th, cor, fator]) => {
            const flex = fator < 0.9 ? 0.7 : 0;
            const x1 = cx + esc * 0.55 * Math.sin(th), y1 = hy + esc * 0.55 * Math.cos(th);
            const x2 = x1 + esc * 0.45 * Math.sin(th + flex), y2 = y1 + esc * 0.45 * Math.cos(th + flex);
            ctx.strokeStyle = cor; ctx.lineWidth = 6; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, hy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x2, y2, 6, 0, api.TAU); ctx.fill();
          });
          ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.fillText("barra rígida", cx - 110, height - 12);
          ctx.fillStyle = api.C.green;
          ctx.fillText(v.secondary < 0.9 ? "com joelho fletido: I menor" : "sem flexão", cx + 20, height - 12);
        },

        text(v, api) {
          const tau = P.rodPeriod(v.parameter);
          const meio = P.reducedPeriod(v.parameter, v.secondary) / 2;
          const f = P.requiredFactor(v.parameter, v.tertiary);
          const erro = meio / v.tertiary;
          return {
            title: "Meio período contra a redução do momento de inércia",
            subtitle: `ℓ = ${api.fmt(v.parameter)} m · I reduzido a ${api.fmt(v.secondary * 100, 0)} %`,
            regime: Math.abs(erro - 1) < 0.12 ? ["compatível com o observado", "ok"] : erro > 1.5 ? ["modelo erra por fator ~2", "alert"] : ["desvio moderado", "warn"],
            caption: "A barra rígida dá quase o dobro do tempo observado. O diagnóstico está no modelo: o joelho flexiona e aproxima a massa distal do quadril.",
            prediction: "O erro de fator dois vem da física ou da hipótese de barra rígida?",
            calculation: `I = ⅓mℓ² e V = −mg(ℓ/2)cosθ ⟹ ω₀ = √(3g/2ℓ)<br>τ = 2π√(2ℓ/3g) = 2π√(2·${api.fmt(v.parameter)}/(3·9,8)) = <b>${api.fmt(tau, 4)} s</b><em>meio período = ${api.fmt(tau / 2, 4)} s contra ${api.fmt(v.tertiary)} s observados — razão ${api.fmt(tau / 2 / v.tertiary, 3)}</em>`,
            metrics: [
              ["período τ", `${api.fmt(tau, 4)} s`],
              ["meio período rígido", `${api.fmt(tau / 2, 4)} s`],
              ["meio período com I reduzido", `${api.fmt(meio, 4)} s`],
              ["observado", `${api.fmt(v.tertiary)} s`],
              ["razão modelo/observado", api.fmt(erro, 3)],
              ["I necessário", `${api.fmt(f * 100, 1)} %`]
            ],
            concept: "É por isso que modelos de marcha usam o pêndulo duplo desta aula, e não o simples: o segundo grau de liberdade não é refinamento cosmético, é o que faz o número fechar.",
            prompts: [
              "Ache a fração I′/I que reproduz exatamente o tempo observado.",
              "Como τ ∝ √I, confirme que reduzir I por 4 divide o período por 2.",
              "Cite duas hipóteses do modelo passivo que a marcha real viola."
            ],
            legend: [[api.C.green, "comprimento escolhido"], [api.C.red, "observado"], [api.C.gold, "I necessário"]],
            secondaryTitle: "Barra rígida contra perna com joelho fletido",
            secondarySubtitle: "flexionar aproxima a massa do eixo e reduz I",
            secondaryCaption: "O mesmo comprimento, dois momentos de inércia muito diferentes."
          };
        }
      },

      {
        id: "caos",
        tab: "Quando a<br>linearização morre",
        heading: "O mesmo pêndulo duplo, sem aproximar",
        equation: "sen θ ≈ θ vale até onde?",
        hint: "Comece em 10°, anime até o fim e repare que as duas cópias não se separam. Depois vá a 140°.",
        controls: [
          { id: "parameter", label: "amplitude inicial θ₁(0) = θ₂(0)", min: 5, max: 170, step: 1, value: 20, digits: 0, unit: "°" },
          { id: "secondary", label: "log₁₀ da perturbação δθ₁", min: -6, max: -1, step: 0.1, value: -4, digits: 1 },
          { id: "tertiary", label: "instante t", min: 0, max: 12, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 12 },
        secondary: true,

        draw(api, v) {
          const th0 = (v.parameter * Math.PI) / 180;
          const delta = Math.pow(10, v.secondary);
          const { a, b } = caos(th0, delta);
          const i = quadro(v.tertiary);

          /* Faixas iguais nos dois eixos, para o aparato não sair distorcido. A janela
             parte de [−1,9; 1,9] × [−2,4; 1,4] e cresce até conter toda a trajetória das
             duas cópias: com 170° o pêndulo começa quase em pé (y chega a +2) e passava do teto. */
          let yLo = -2.4, yHi = 1.4, xAbs = 0;
          [a, b].forEach((caminho) => caminho.forEach((y) => {
            const q = P.doublePositions(y[0], y[1], LL, LL);
            q.forEach(([px, py]) => { yLo = Math.min(yLo, py - 0.1); yHi = Math.max(yHi, py + 0.1); xAbs = Math.max(xAbs, Math.abs(px) + 0.1); });
          }));
          const span = Math.max(yHi - yLo, 2 * xAbs, 3.8), yMid = (yHi + yLo) / 2;
          const chart = api.axes(api.main, -span / 2, span / 2, yMid - span / 2, yMid + span / 2, "x (m)", "y (m)");
          /* Rastro da massa de baixo: é onde a diferença entre as cópias fica visível. */
          const rastro = (caminho, cor, largura) => {
            const de = Math.max(0, i - 500);
            api.line(chart, caminho.slice(de, i + 1).map((y) => P.doublePositions(y[0], y[1], LL, LL)[1]), cor, [], largura);
          };
          rastro(a, "#cbd8cb", 1.6);
          rastro(b, "#e6cfc9", 1.6);
          const desenha = (caminho, cor) => {
            const [p1, p2] = P.doublePositions(caminho[i][0], caminho[i][1], LL, LL);
            api.line(chart, [[0, 0], p1, p2], cor, [], 2.6);
            api.dot(chart, p1[0], p1[1], cor, 5);
            api.dot(chart, p2[0], p2[1], cor, 6.5);
          };
          desenha(a, api.C.green);
          desenha(b, api.C.red);
          api.dot(chart, 0, 0, api.C.ink, 4);
          api.label(chart, 0.08, 0.12, "pivô", api.C.ink, "left");

          /* Separação entre as cópias, em escala logarítmica. */
          const sep = (j) => Math.max(1e-12, P.angularSeparation(a[j], b[j]));
          const s = api.axes(api.second, 0, 12, -7, 2, "tempo t (s)", "log₁₀ da separação (rad)");
          api.line(s, a.map((_, j) => [j * DT_CAOS, Math.log10(sep(j))]), api.C.violet, [], 2.6);
          api.hline(s, Math.log10(delta), api.C.grayLight, [4, 3], "perturbação inicial");
          api.hline(s, 0, api.C.gold, [4, 3], "1 rad — cópias irreconhecíveis");
          api.vline(s, v.tertiary, api.C.ink, [3, 3]);
          api.dot(s, v.tertiary, Math.log10(sep(i)), api.C.red, 4.5);
        },

        text(v, api) {
          const th0 = (v.parameter * Math.PI) / 180;
          const delta = Math.pow(10, v.secondary);
          const { a, b } = caos(th0, delta);
          const i = quadro(v.tertiary);
          const sep = Math.max(1e-12, P.angularSeparation(a[i], b[i]));
          const sepFinal = P.angularSeparation(a[PASSOS_CAOS], b[PASSOS_CAOS]);
          const E0 = P.doubleEnergy(...a[0], MM, MM, LL, LL);
          const E = P.doubleEnergy(...a[i], MM, MM, LL, LL);
          const [wLento, wRapido] = P.doubleFrequencies(MM, MM, LL, LL);
          const explodiu = sepFinal > 0.5;
          return {
            title: "Duas cópias quase idênticas",
            subtitle: `θ₁(0) = ${api.fmt(v.parameter, 0)}° · δθ₁ = ${api.sci(delta, 1)} rad · t = ${api.fmt(v.tertiary)} s`,
            regime: explodiu ? ["sensível às condições iniciais", "alert"] : ["separação limitada", "ok"],
            caption: "As duas cópias começam com uma diferença invisível no primeiro ângulo. Em amplitude pequena elas continuam juntas; em amplitude grande, separam-se por completo antes dos doze segundos.",
            prediction: "As duas cópias vão continuar juntas até o fim, ou vão se separar? A partir de que amplitude a resposta muda?",
            calculation: `separação inicial = ${api.sci(delta, 2)} rad<br>separação em t = ${api.fmt(v.tertiary)} s: <b>${api.sci(sep, 3)} rad</b><br>fator de crescimento = ${api.sci(sep / delta, 3)}<em>ω₋ = ${api.fmt(wLento, 3)} e ω₊ = ${api.fmt(wRapido, 3)} rad/s são as frequências normais da estação 2 — válidas só enquanto sen θ ≈ θ</em>`,
            metrics: [
              ["separação em t", `${api.sci(sep, 3)} rad`],
              ["separação em t = 12 s", `${api.sci(sepFinal, 3)} rad`],
              ["fator de crescimento", api.sci(sepFinal / delta, 3)],
              ["energia inicial", `${api.fmt(E0, 4)} J`],
              ["energia em t", `${api.fmt(E, 4)} J`],
              ["ω₋ lento (linearizado)", `${api.fmt(wLento, 3)} rad/s`]
            ],
            concept: "A lagrangiana é exata; a aproximação está só na expansão quadrática que produziu os modos normais da estação 2. Ao sair do regime de pequenas oscilações, o mesmo sistema deixa de ser previsível na prática, embora continue determinístico e continue conservando energia — o integrador mantém E fixo em todas as amplitudes. Determinismo e previsibilidade não são a mesma coisa, e é isso que separa esta estação da figura de Lissajous da Aula 11, que parece desordenada sem ser sensível a nada.",
            prompts: [
              "Com θ₁(0) = 10°, anime até 12 s e anote a separação final. Repita com 140°.",
              "Reduza a perturbação de 10⁻⁴ para 10⁻⁶ em amplitude grande: quanto tempo você ganha?",
              "Confira que a energia permanece constante nos dois casos e explique por que isso não garante previsibilidade."
            ],
            legend: [[api.C.green, "cópia A"], [api.C.red, "cópia B"], [api.C.violet, "separação"], [api.C.gold, "1 rad"]],
            secondaryTitle: "Separação entre as duas cópias",
            secondarySubtitle: "escala logarítmica — uma reta aqui é crescimento exponencial",
            secondaryCaption: "Em amplitude pequena a curva fica colada na perturbação inicial; em amplitude grande ela sobe como reta até cerca de 1 rad e depois cresce de modo irregular, até dezenas de radianos — os ângulos não são reduzidos a 2π, e as hastes dão voltas completas."
          };
        }
      }
    ]
  };
})();
