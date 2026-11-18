/* Aula 29 — equações de Hamilton e espaço de fase.
   O motor ../_shared/dashboard.js constrói a interface a partir deste objeto. */
(function () {
  "use strict";
  const P = window.LessonPhysics;
  const M = 1; /* massa unitária em todas as estações, para não competir com a variável em estudo */

  window.LessonScene = {
    id: "aula29",
    discipline: "Mecânica Clássica · Aula 28",
    title: "Equações de Hamilton e espaço de fase",
    subtitle: "Trocar n equações de segunda ordem por 2n de primeira compensa? O que se ganha é geometria.",

    stations: [
      {
        id: "fluxo",
        tab: "O fluxo<br>hamiltoniano",
        heading: "Campo w = (∂H/∂p, −∂H/∂q)",
        equation: "q̇ = ∂H/∂p   ·   ṗ = −∂H/∂q",
        hint: "Mantenha ω fixo e varie a energia: as trajetórias mudam de tamanho, o campo de fundo não.",
        controls: [
          { id: "parameter", label: "frequência ω", min: 0.4, max: 3, step: 0.05, value: 1.6, digits: 2, unit: "rad/s" },
          { id: "secondary", label: "energia E", min: 0.1, max: 4, step: 0.05, value: 1.2, digits: 2, unit: "J" },
          { id: "tertiary", label: "instante t", min: 0, max: 12, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const w = v.parameter, E = v.secondary;
          const dV = (q) => M * w * w * q;
          /* Amplitudes da elipse de energia E: q_máx = √(2E/mω²), p_máx = √(2mE). */
          const qm = Math.sqrt((2 * E) / (M * w * w));
          const pm = Math.sqrt(2 * M * E);
          const lim = Math.max(qm, pm / w) * 1.45 + 0.3;

          const chart = api.axes(api.main, -lim, lim, -lim * w, lim * w, "coordenada q (m)", "momento p (kg·m/s)");
          api.field(chart, (q, p) => P.flowField(q, p, M, dV));
          /* Curvas de nível de H: elipses concêntricas, o "relevo" que o fluxo contorna. */
          for (const frac of [0.25, 0.5, 1, 1.6]) {
            const a = qm * Math.sqrt(frac), b = pm * Math.sqrt(frac);
            api.line(chart, api.param((s) => [a * Math.cos(s), b * Math.sin(s)], 0, api.TAU, 180),
              frac === 1 ? api.C.green : "#cbd8cb", frac === 1 ? [] : [3, 4], frac === 1 ? 3.2 : 1.4);
          }
          /* Um ponto percorrendo a órbita, com w tangente e ∇H perpendicular a ele. */
          const [q, p] = P.oscillatorFlow(qm, 0, v.tertiary, M, w);
          const wv = P.flowField(q, p, M, dV);
          const gr = [dV(q), p / M];
          const esc = (lim * 0.45) / Math.max(1e-9, Math.hypot(wv[0], wv[1] / w));
          const escG = (lim * 0.45) / Math.max(1e-9, Math.hypot(gr[0], gr[1] / w));
          api.arrow(chart, q, p, q + wv[0] * esc, p + wv[1] * esc, api.C.red, 2.6, 9);
          api.arrow(chart, q, p, q + gr[0] * escG, p + gr[1] * escG, api.C.blue, 2.2, 8);
          api.dot(chart, q, p, api.C.ink, 5.5);
          api.label(chart, q + wv[0] * esc, p + wv[1] * esc, " w", api.C.red, "left");
          api.label(chart, q + gr[0] * escG, p + gr[1] * escG, " ∇H", api.C.blue, "left");
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, 0, "#b9c4bb", []);

          /* Segundo canvas: q(t) e p(t), as duas projeções da mesma órbita. */
          const s = api.axes(api.second, 0, 12, -Math.max(qm, pm) * 1.15, Math.max(qm, pm) * 1.15, "tempo t (s)", "q, p");
          api.line(s, api.curve((t) => P.oscillatorFlow(qm, 0, t, M, w)[0], 0, 12, 300), api.C.green, [], 2.6);
          api.line(s, api.curve((t) => P.oscillatorFlow(qm, 0, t, M, w)[1], 0, 12, 300), api.C.gold, [4, 3], 2.4);
          api.vline(s, v.tertiary, api.C.red, [4, 3]);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const w = v.parameter, E = v.secondary;
          const dV = (q) => M * w * w * q;
          const qm = Math.sqrt((2 * E) / (M * w * w));
          const [q, p] = P.oscillatorFlow(qm, 0, v.tertiary, M, w);
          const H = (p * p) / (2 * M) + 0.5 * M * w * w * q * q;
          /* Período medido na trajetória de energia E, e não lido da fórmula 2π/ω. */
          const T = P.measuredPeriod((t) => P.oscillatorFlow(qm, 0, t, M, w), (3 * api.TAU) / w);
          return {
            title: "Retrato de fase do oscilador",
            subtitle: `ω = ${api.fmt(w)} rad/s · E = ${api.fmt(E)} J · t = ${api.fmt(v.tertiary)} s`,
            regime: ["fluxo incompressível", "ok"],
            caption: "As setas cinzas são o campo w em cada ponto. A trajetória não é escolhida: ela é a curva que o campo obriga a seguir, e coincide com uma curva de H constante.",
            prediction: "O ponto vai andar ao longo da elipse ou atravessá-la? E por quê?",
            calculation: `q̇ = ∂H/∂p = p/m = ${api.fmt(p / M, 4)} m/s<br>ṗ = −∂H/∂q = −mω²q = ${api.fmt(-dV(q), 4)} N<br>w·∇H = ${api.fmt(P.flowDotGradH(q, p, M, dV), 4)}<em>∇·w = ∂²H/∂q∂p − ∂²H/∂p∂q = ${api.fmt(P.divergence(q, p, M, dV), 4)} — nulo pelo teorema de Schwarz</em>`,
            metrics: [
              ["q(t)", `${api.fmt(q, 3)} m`],
              ["p(t)", `${api.fmt(p, 3)} kg·m/s`],
              ["H conferido", `${api.fmt(H, 4)} J`],
              ["w·∇H", api.fmt(P.flowDotGradH(q, p, M, dV), 4)],
              ["∇·w", api.fmt(P.divergence(q, p, M, dV), 4)],
              ["período medido T", `${api.fmt(T, 3)} s (2π/ω = ${api.fmt(api.TAU / w, 3)})`]
            ],
            concept: "O sinal assimétrico de ṗ = −∂H/∂q é o que torna w perpendicular a ∇H. É por isso que a conservação da energia deixa de ser uma conta e vira uma afirmação geométrica: o fluxo anda ao longo das curvas de nível.",
            prompts: [
              "Aumente E mantendo ω e confirme que o período medido não muda — a isocronia, vista no espaço de fase.",
              "Verifique que w·∇H permanece nulo em qualquer instante.",
              "Explique por que duas trajetórias de fase nunca podem se cruzar."
            ],
            legend: [[api.C.green, "órbita de energia E"], [api.C.red, "w (tangente)"], [api.C.blue, "∇H (normal)"], ["#cbd8cb", "outras curvas de H"]],
            secondaryTitle: "As projeções q(t) e p(t)",
            secondarySubtitle: "defasadas de 90°, como as duas coordenadas de um giro",
            secondaryCaption: "O retrato de fase junta estas duas curvas em uma só, ao preço de esconder o tempo."
          };
        }
      },

      {
        id: "liouville",
        tab: "Teorema<br>de Liouville",
        heading: "Uma célula de condições iniciais",
        equation: "vol(ℛ_t) = vol(ℛ₀)   ⟸   ∇·w = 0",
        hint: "Comece com b = 0 e anime o tempo: a forma muda, a área não. Só depois ligue o amortecimento.",
        controls: [
          { id: "parameter", label: "instante t", min: 0, max: 8, step: 0.02, value: 0, digits: 2, unit: "s" },
          { id: "secondary", label: "amortecimento b", min: 0, max: 1.2, step: 0.02, value: 0, digits: 2, unit: "kg/s" },
          { id: "tertiary", label: "lado da célula", min: 0.2, max: 1.2, step: 0.02, value: 0.8, digits: 2 }
        ],
        animate: { control: "parameter", period: 10 },
        secondary: true,

        draw(api, v) {
          const w = 1.4, b = v.secondary, L = v.tertiary, t = v.parameter;
          const cel = P.cell(0.55, 0.55, L, L, 40);
          const chart = api.axes(api.main, -2.8, 2.8, -3.2, 3.2, "coordenada q (m)", "momento p (kg·m/s)");
          api.field(chart, (q, p) => [p / M, -M * w * w * q - (b * p) / M], "#d3dcd3");
          /* Célula inicial e as duas evoluções, para separar mudança de forma de mudança de área. */
          api.line(chart, [...cel, cel[0]], api.C.grayLight, [4, 3], 1.8);
          const osc = P.advect(cel, (q, p) => P.dampedFlow(q, p, t, M, w, b));
          api.line(chart, [...osc, osc[0]], b > 0 ? api.C.red : api.C.green, [], 3);
          const livre = P.advect(cel, (q, p) => P.freeFlow(q, p, t, M));
          api.line(chart, [...livre, livre[0]], api.C.blue, [5, 4], 2.2);
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, 0, "#b9c4bb", []);
          api.label(chart, 0.55 + L / 2, 0.55 - 0.18, "ℛ₀", api.C.gray, "center", "top");

          /* Segundo canvas: a área de cada célula ao longo do tempo. */
          const A0 = P.polygonArea(cel);
          const s = api.axes(api.second, 0, 8, 0, A0 * 1.5, "tempo t (s)", "área da célula");
          api.line(s, api.curve((x) => P.polygonArea(P.advect(cel, (q, p) => P.freeFlow(q, p, x, M))), 0, 8, 60), api.C.blue, [5, 4], 2.2);
          api.line(s, api.curve((x) => P.polygonArea(P.advect(cel, (q, p) => P.dampedFlow(q, p, x, M, w, b))), 0, 8, 60), b > 0 ? api.C.red : api.C.green, [], 3);
          api.hline(s, A0, api.C.gold, [4, 3], "área inicial");
          api.vline(s, t, api.C.ink, [3, 3]);
        },

        text(v, api) {
          const w = 1.4, b = v.secondary, L = v.tertiary, t = v.parameter;
          const cel = P.cell(0.55, 0.55, L, L, 40);
          const A0 = P.polygonArea(cel);
          const Aosc = P.polygonArea(P.advect(cel, (q, p) => P.dampedFlow(q, p, t, M, w, b)));
          const livre = P.advect(cel, (q, p) => P.freeFlow(q, p, t, M));
          const Alivre = P.polygonArea(livre);
          const larg = Math.max(...livre.map((x) => x[0])) - Math.min(...livre.map((x) => x[0]));
          return {
            title: "Área no espaço de fase",
            subtitle: `t = ${api.fmt(t)} s · b = ${api.fmt(b)} kg/s · lado = ${api.fmt(L)}`,
            regime: b > 0 ? ["dissipativo — Liouville não vale", "alert"] : ["hamiltoniano — área conservada", "ok"],
            caption: "A célula cisalha, gira e se alonga. Enquanto b = 0, nada disso muda a área: é o análogo exato de um fluido incompressível.",
            prediction: "A célula vai encolher, esticar ou girar? E o que acontece com a área em cada caso?",
            calculation: `A₀ = ${api.fmt(A0, 4)}<br>A(t) com amortecimento = <b>${api.fmt(Aosc, 4)}</b>, razão A/A₀ = ${api.fmt(Aosc / A0, 4)}<br>previsão e^(−bt/m) = e^(−${api.fmt(b)}·${api.fmt(t)}) = <b>${api.fmt(Math.exp((-b * t) / M), 4)}</b><em>partícula livre: A = ${api.fmt(Alivre, 4)} — cisalhamento puro, jacobiano 1</em>`,
            metrics: [
              ["A₀", api.fmt(A0, 4)],
              ["A(t) oscilador/amortecido", api.fmt(Aosc, 4)],
              ["A(t) partícula livre", api.fmt(Alivre, 4)],
              ["A/A₀", api.fmt(Aosc / A0, 4)],
              ["e^(−bt/m)", api.fmt(Math.exp((-b * t) / M), 4)],
              ["largura da célula livre", api.fmt(larg, 3)]
            ],
            concept: "A contração de área é a assinatura geométrica da dissipação — é a mesma espiral da Aula 12, vista agora como um fluxo que não é hamiltoniano. Sem atrito, o volume de fase é uma quantidade que nenhuma dinâmica hamiltoniana consegue mexer.",
            prompts: [
              "Com b = 0, anime até t = 8 e confirme que a área não se move da linha dourada.",
              "Compare a forma da célula livre com a da célula do oscilador no mesmo instante.",
              "Ligue b = 0,4 e verifique A/A₀ contra e^(−bt/m) em três instantes."
            ],
            legend: [[api.C.grayLight, "ℛ₀"], [api.C.green, "ℛ_t oscilador"], [api.C.red, "ℛ_t amortecido"], [api.C.blue, "ℛ_t partícula livre"]],
            secondaryTitle: "Área contra tempo",
            secondarySubtitle: "linha reta enquanto o fluxo for hamiltoniano",
            secondaryCaption: "Qualquer desvio da linha dourada denuncia um termo não conservativo."
          };
        }
      },

      {
        id: "emitancia",
        tab: "Emitância<br>de um feixe",
        heading: "Liouville em um acelerador",
        equation: "ε = área/π = (largura total × divergência total)/4 = const.",
        hint: "Escolha a largura focalizada e observe o que acontece com a divergência. Não há como melhorar as duas.",
        controls: [
          { id: "parameter", label: "largura focalizada σ₁", min: 0.2, max: 4, step: 0.05, value: 0.5, digits: 2, unit: "mm" },
          { id: "secondary", label: "largura na fonte σ₀", min: 0.5, max: 5, step: 0.05, value: 2, digits: 2, unit: "mm" },
          { id: "tertiary", label: "divergência na fonte θ₀", min: 0.5, max: 8, step: 0.1, value: 3, digits: 1, unit: "mrad" }
        ],
        secondary: true,

        draw(api, v) {
          const s0 = v.secondary, t0 = v.tertiary, s1 = v.parameter;
          const t1 = P.focusedDivergence(s0, t0, s1);
          /* σ e θ são larguras TOTAIS: a elipse tem semieixos σ/2 e θ/2, área πσθ/4 = πε. */
          const lim = Math.max(s0, s1) * 0.68;
          const limY = Math.max(t0, t1) * 0.63;
          const chart = api.axes(api.main, -lim, lim, -limY, limY, "posição x (mm)", "divergência x′ (mrad)");
          /* Elipse de fase antes e depois da focalização: mesma área, formatos opostos. */
          api.line(chart, api.param((a) => [(s0 / 2) * Math.cos(a), (t0 / 2) * Math.sin(a)], 0, api.TAU, 200), api.C.green, [], 3);
          api.line(chart, api.param((a) => [(s1 / 2) * Math.cos(a), (t1 / 2) * Math.sin(a)], 0, api.TAU, 200), api.C.red, [], 3);
          api.arrow(chart, s0 / 2, 0, s1 / 2, 0, api.C.gold, 2.4, 8);
          api.arrow(chart, 0, t0 / 2, 0, t1 / 2, api.C.gold, 2.4, 8);
          api.label(chart, s0 / 2, -limY * 0.12, "σ₀/2", api.C.green, "center", "top");
          api.label(chart, s1 / 2, limY * 0.08, "σ₁/2", api.C.red, "center");
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, 0, "#b9c4bb", []);

          /* Segundo canvas: a hipérbole de troca σ ↔ θ, com o par escolhido marcado. */
          /* Teto: contém os dois pontos (fonte e focalizado). A hipérbole diverge para σ → 0
             (σθ = const.), então é desenhada só a partir de onde cruza o teto, com um
             rótulo "continua ↑": antes o ramo de σ pequeno saía do quadro sem aviso. */
          const topo = Math.max(20, t1 * 1.15, t0 * 1.15);
          const s = api.axes(api.second, 0.2, 5, 0, topo, "largura σ (mm)", "divergência mínima (mrad)");
          const xCorte = Math.max(0.2, (s0 * t0) / topo);
          api.line(s, api.curve((x) => P.focusedDivergence(s0, t0, x), xCorte, 5, 200), api.C.blue, [], 2.8);
          if (xCorte > 0.21) api.label(s, xCorte + 0.4, topo * 0.95, "continua ↑", api.C.blue, "left", "top");
          api.dot(s, s0, t0, api.C.green, 5);
          api.dot(s, s1, t1, api.C.red, 5);
          api.label(s, s1, t1, " par escolhido", api.C.red, "left");
        },

        text(v, api) {
          const s0 = v.secondary, t0 = v.tertiary, s1 = v.parameter;
          const t1 = P.focusedDivergence(s0, t0, s1);
          const e0 = P.emittance(s0, t0);
          const e1 = P.emittance(s1, t1);
          return {
            title: "Espaço de fase transversal do feixe",
            subtitle: `σ₀ = ${api.fmt(s0)} mm · θ₀ = ${api.fmt(t0, 1)} mrad · σ₁ = ${api.fmt(s1)} mm`,
            regime: s1 < s0 ? ["feixe apertado, mais divergente", "warn"] : ["feixe alargado, mais paralelo", "ok"],
            caption: "As duas elipses têm exatamente a mesma área, πσθ/4 (semieixos iguais à metade das larguras totais σ e θ). A focalização gira e deforma a elipse; ela não pode encolhê-la.",
            prediction: "Apertar o feixe pela metade melhora ou piora a divergência? Em que proporção?",
            calculation: `ε = σθ/4 = ${api.fmt(s0)}·${api.fmt(t0, 1)}/4 = <b>${api.fmt(e0, 4)} mm·mrad</b><br>σ₀θ₀ = σ₁θ₁ ⟹ θ₁ = σ₀θ₀/σ₁ = ${api.fmt(s0)}·${api.fmt(t0, 1)}/${api.fmt(s1)} = <b>${api.fmt(t1, 3)} mrad</b><em>conferindo: ε depois = ${api.fmt(e1, 4)} mm·mrad — inalterada, como Liouville exige</em>`,
            metrics: [
              ["ε na fonte", `${api.fmt(e0, 4)} mm·mrad`],
              ["ε após focalizar", `${api.fmt(e1, 4)} mm·mrad`],
              ["θ₁ mínima", `${api.fmt(t1, 3)} mrad`],
              ["fator σ₀/σ₁", api.fmt(s0 / s1, 3)],
              ["fator θ₁/θ₀", api.fmt(t1 / t0, 3)],
              ["área da elipse π(σ/2)(θ/2)", `${api.fmt(Math.PI * e0, 4)} mm·mrad`]
            ],
            concept: "Em um acelerador de radioterapia a qualidade do feixe é decidida na fonte: campos elétricos e magnéticos geram dinâmica hamiltoniana (o que importa não é serem conservativos — a força magnética não vem de um potencial), logo apenas trocam tamanho por divergência. O invariante estrito é a emitância normalizada; a geométrica, em (x, x′), só é constante enquanto o momento longitudinal não muda. O que degrada a emitância são processos não hamiltonianos — o espalhamento múltiplo, do complemento da Aula 19 (material complementar de forças centrais), é o principal deles.",
            prompts: [
              "Confirme numericamente que reduzir σ por 4 multiplica θ por 4.",
              "Com σ₀ = 2 mm e θ₀ = 3 mrad, que divergência resulta se o feixe for alargado para σ₁ = 4 mm? Que uso isso tem?",
              "Explique por que nenhuma lente magnética resolve o problema de um feixe de má qualidade."
            ],
            legend: [[api.C.green, "feixe na fonte"], [api.C.red, "feixe focalizado"], [api.C.gold, "troca imposta"]],
            secondaryTitle: "Divergência mínima contra largura",
            secondarySubtitle: "hipérbole σθ = const.",
            secondaryCaption: "Todo ponto da curva tem a mesma emitância; abaixo dela não existe feixe."
          };
        }
      }
    ]
  };
})();
