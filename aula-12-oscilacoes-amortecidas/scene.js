(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula12",
    discipline: "Mecânica Clássica · Aula 12",
    title: "Oscilações amortecidas",
    subtitle: "O que exatamente o amortecimento crítico otimiza?",

    stations: [
      {
        id: "regimes",
        tab: "Três<br>regimes",
        heading: "Discriminante β² − ω₀²",
        equation: "ẍ + 2βẋ + ω₀²x = 0   r = −β ± √(β² − ω₀²)",
        hint: "Atravesse β = ω₀ devagar. Preveja se a curva muda de forma bruscamente.",
        controls: [
          { id: "parameter", label: "razão β/ω₀", min: 0, max: 2.5, step: 0.01, value: 0.15, digits: 2 },
          { id: "secondary", label: "posição inicial x₀", min: -1, max: 1, step: 0.05, value: 1, digits: 2, unit: "m" },
          { id: "tertiary", label: "velocidade inicial v₀", min: -6, max: 6, step: 0.1, value: 0, digits: 1, unit: "m/s" }
        ],
        secondary: true,

        draw(api, v) {
          const w0 = 1;
          const g = v.parameter * w0;
          const chart = api.axes(api.main, 0, 12, -1.1, 1.25, "tempo ω₀t", "posição x (m)");
          [[0.15, api.C.green], [1, api.C.blue], [2, api.C.red]].forEach(([r, cor]) => {
            api.line(chart, api.curve((t) => P.position(t, v.secondary, v.tertiary, w0, r * w0), 0, 12, 260), cor, [5, 4], 1.6);
          });
          api.line(chart, api.curve((t) => P.position(t, v.secondary, v.tertiary, w0, g), 0, 12, 320), api.C.ink, [], 3.2);
          if (g < w0) {
            const A = Math.hypot(v.secondary, (v.tertiary + g * v.secondary) / P.omega1(w0, g));
            api.line(chart, api.curve((t) => A * Math.exp(-g * t), 0, 12, 120), api.C.gold, [4, 4], 1.6);
            api.line(chart, api.curve((t) => -A * Math.exp(-g * t), 0, 12, 120), api.C.gold, [4, 4], 1.6);
            api.label(chart, 11.8, A * Math.exp(-g * 11.8) + 0.07, "envoltória e^{−βt}", api.C.gold, "right");
          }
          api.hline(chart, 0, "#b9c4bb", []);

          const s = api.axes(api.second, 0, 2.5, 0, 12, "β/ω₀", "tempo até |x| < 0,02 (ω₀t)");
          const assent = api.curve((r) => {
            for (let t = 0; t < 12; t += 0.05) {
              let ok = true;
              for (let u = t; u < 12; u += 0.25) if (Math.abs(P.position(u, 1, 0, 1, r)) > 0.02) { ok = false; break; }
              if (ok) return t;
            }
            return 12;
          }, 0.05, 2.5, 60);
          api.line(s, assent, api.C.blue);
          api.vline(s, 1, api.C.red, [5, 4], "crítico");
          api.dot(s, v.parameter, assent.reduce((best, p) => Math.abs(p[0] - v.parameter) < Math.abs(best[0] - v.parameter) ? p : best)[1], api.C.ink, 4.5);
        },

        text(v, api) {
          const w0 = 1, g = v.parameter * w0;
          const reg = P.regime(g, w0);
          const nome = { sub: "subamortecido", critico: "crítico", super: "supercrítico" }[reg];
          const w1 = P.omega1(w0, g);
          return {
            title: "Os três regimes a partir do mesmo estado inicial",
            subtitle: `β/ω₀ = ${api.fmt(v.parameter)} · x₀ = ${api.fmt(v.secondary)} m · v₀ = ${api.fmt(v.tertiary, 1)} m/s`,
            regime: [nome, reg === "sub" ? "ok" : reg === "critico" ? "warn" : "alert"],
            caption: "A forma muda quando o discriminante troca de sinal, mas a curva não salta: o caso crítico é o limite contínuo dos outros dois.",
            prediction: "O amortecimento crítico é sempre o que volta ao equilíbrio mais depressa?",
            calculation: `β² − ω₀² = ${api.fmt(g * g - w0 * w0, 4)}<br>r = −β ± √(β² − ω₀²) = <b>${reg === "sub" ? `−${api.fmt(g)} ± ${api.fmt(w1)}i` : reg === "critico" ? `−${api.fmt(g)} (raiz dupla)` : `−${api.fmt(g - Math.sqrt(g * g - w0 * w0))} e −${api.fmt(g + Math.sqrt(g * g - w0 * w0))}`}</b><em>${reg === "sub" ? `ω₁ = ${api.fmt(w1, 4)}, ${api.fmt((1 - w1 / w0) * 100, 2)} % abaixo de ω₀` : reg === "super" ? "a componente lenta domina em tempos longos" : "limite entre oscilar e não oscilar"}</em>`,
            metrics: [
              ["regime", nome],
              ["ω₁", reg === "sub" ? api.fmt(w1, 4) : "—"],
              ["β", api.fmt(g)],
              ["b crítico / b atual", api.fmt(1 / (v.parameter || 1e-9))],
              ["cruzamentos do equilíbrio", reg === "sub" ? "infinitos" : "no máximo um"]
            ],
            concept: "O amortecimento crítico é o limiar sem oscilação, e não um mínimo universal de tempo: o painel abaixo mostra que o ótimo depende do critério adotado.",
            prompts: [
              "Atravesse β = ω₀ e confirme que a curva não salta.",
              "Dê a v₀ um valor negativo grande e veja o supercrítico cruzar o equilíbrio uma vez.",
              "Encontre no painel inferior onde o retorno é mais rápido e compare com β = ω₀."
            ],
            legend: [[api.C.ink, "regime escolhido"], [api.C.gold, "envoltória"], [api.C.red, "supercrítico"]],
            secondaryTitle: "Tempo de acomodação contra β/ω₀",
            secondarySubtitle: "critério: |x| permanecer abaixo de 0,02",
            secondaryCaption: "O mínimo fica próximo do crítico, mas depende do critério e dos dados iniciais."
          };
        }
      },

      {
        id: "fase",
        tab: "Espaço de<br>fase e energia",
        heading: "A elipse vira espiral",
        equation: "dE/dt = −bẋ² ≤ 0",
        hint: "Compare com a elipse fechada da Aula 11. Preveja o que a área encerrada faz.",
        controls: [
          { id: "parameter", label: "razão β/ω₀", min: 0.02, max: 0.9, step: 0.01, value: 0.15, digits: 2 },
          { id: "secondary", label: "número de voltas mostradas", min: 1, max: 8, step: 0.5, value: 4, digits: 1 },
          { id: "tertiary", label: "instante ω₀t", min: 0, max: 30, step: 0.1, value: 6, digits: 1 }
        ],
        animate: { control: "tertiary", period: 8 },
        secondary: true,

        draw(api, v) {
          const w0 = 1, g = v.parameter;
          const tf = (v.secondary * 2 * Math.PI) / P.omega1(w0, g);
          const chart = api.axes(api.main, -1.2, 1.2, -1.2, 1.2, "x", "v/ω₀");
          api.line(chart, api.param((t) => [P.position(t, 1, 0, w0, g), P.velocity(t, 1, 0, w0, g) / w0], 0, tf, 700), api.C.green, [], 2.2);
          api.line(chart, api.param((t) => [Math.cos(t), -Math.sin(t)], 0, api.TAU, 160), api.C.grayLight, [4, 4], 1.5);
          api.label(chart, 1.02, 0.12, "sem amortecimento", api.C.grayLight, "left");
          const tt = Math.min(v.tertiary, tf);
          api.dot(chart, P.position(tt, 1, 0, w0, g), P.velocity(tt, 1, 0, w0, g) / w0, api.C.red, 5.5);
          api.dot(chart, 0, 0, api.C.ink, 4);
          api.label(chart, 0.08, -0.1, "atrator", api.C.ink, "left", "top");

          const s = api.axes(api.second, 0, tf, 0, 0.55, "tempo ω₀t", "energia (J)");
          api.line(s, api.curve((t) => P.energy(t, 1, 0, w0, g), 0, tf, 300), api.C.blue);
          api.line(s, api.curve((t) => 0.5 * Math.exp(-2 * g * t), 0, tf, 160), api.C.gold, [5, 4], 2);
          api.label(s, tf * 0.96, 0.5 * Math.exp(-2 * g * tf) + 0.05, "e^{−2βt}", api.C.gold, "right");
          api.dot(s, tt, P.energy(tt, 1, 0, w0, g), api.C.red, 4.5);
        },

        text(v, api) {
          const w0 = 1, g = v.parameter;
          const Q = P.quality(w0, g);
          const tt = v.tertiary;
          const E0 = P.energy(0, 1, 0, w0, g);
          const E = P.energy(tt, 1, 0, w0, g);
          return {
            title: "Trajetória de fase e decaimento da energia",
            subtitle: `β/ω₀ = ${api.fmt(v.parameter)} · Q = ${api.fmt(Q, 1)}`,
            caption: "A curva cinza é a elipse conservativa da Aula 11. Com dissipação ela deixa de fechar: a origem passa de centro a atrator.",
            prediction: "A área encerrada pela trajetória de fase cresce, encolhe ou se mantém?",
            calculation: `dE/dt = −bẋ² ≤ 0, logo E decresce monotonamente<br>E(ω₀t = ${api.fmt(tt, 1)}) / E(0) = <b>${api.fmt(E / E0, 4)}</b><em>envoltória prevista e^{−2βt} = ${api.fmt(Math.exp(-2 * g * tt), 4)}</em>`,
            metrics: [
              ["Q", api.fmt(Q, 2)],
              ["E(t)/E(0)", api.fmt(E / E0, 4)],
              ["e^{−2βt}", api.fmt(Math.exp(-2 * g * tt), 4)],
              ["queda por ciclo", api.fmt(P.decayPerCycle(w0, g), 4)],
              ["amplitude após 3 ciclos", api.fmt(P.amplitudeAfter(3, w0, g), 4)]
            ],
            concept: "A contração da área no espaço de fase é a assinatura geométrica da dissipação — e é exatamente o que o teorema de Liouville proíbe em sistemas hamiltonianos (Aula 29).",
            prompts: [
              "Verifique que a energia acompanha e^{−2βt} enquanto a amplitude acompanha e^{−βt}.",
              "Aumente β/ω₀ e conte quantas voltas a espiral consegue dar.",
              "Explique por que a origem é atrator e não centro."
            ],
            legend: [[api.C.green, "trajetória de fase"], [api.C.grayLight, "caso conservativo"]],
            secondaryTitle: "Energia contra tempo",
            secondarySubtitle: "a envoltória exponencial é o decaimento médio",
            secondaryCaption: "As ondulações são a troca T ↔ U dentro de cada ciclo."
          };
        }
      },

      {
        id: "qualidade",
        tab: "Fator Q em<br>Física Médica",
        heading: "Q como parâmetro de projeto",
        equation: "Q ≈ ω₀/2β   ·   amplitude após N ciclos = e^{−πN/Q}",
        hint: "Q baixo não é defeito. Veja o que ele compra em resolução axial.",
        controls: [
          { id: "parameter", label: "fator de qualidade Q", min: 0.5, max: 40, step: 0.5, value: 3, digits: 1 },
          { id: "secondary", label: "frequência do transdutor", min: 1, max: 15, step: 0.5, value: 5, digits: 1, unit: "MHz" },
          { id: "tertiary", label: "campo B₀ da ressonância", min: 0.2, max: 7, step: 0.1, value: 1.5, digits: 1, unit: "T" }
        ],
        secondary: true,

        draw(api, v) {
          const w0 = 1, g = w0 / (2 * v.parameter);
          const chart = api.axes(api.main, 0, 8, -1.15, 1.15, "número de ciclos", "amplitude relativa");
          const T = (2 * Math.PI) / P.omega1(w0, g);
          api.line(chart, api.curve((n) => P.position(n * T, 1, 0, w0, g), 0, 8, 500), api.C.green);
          api.line(chart, api.curve((n) => P.amplitudeAfter(n, w0, g), 0, 8, 120), api.C.gold, [5, 4], 2);
          api.line(chart, api.curve((n) => -P.amplitudeAfter(n, w0, g), 0, 8, 120), api.C.gold, [5, 4], 2);
          api.hline(chart, 0, "#b9c4bb", []);
          api.hline(chart, 0.05, api.C.grayLight, [2, 3], "5 % da amplitude inicial");
          api.dot(chart, 1, P.amplitudeAfter(1, w0, g), api.C.red, 4.5);

          const s = api.axes(api.second, 0.5, 40, 0, P.axialResolution(40, v.secondary * 1e6) * 1000 * 1.1, "fator Q", "resolução axial (mm)");
          api.line(s, api.curve((q) => P.axialResolution(q, v.secondary * 1e6) * 1000, 0.5, 40, 120), api.C.blue);
          api.dot(s, v.parameter, P.axialResolution(v.parameter, v.secondary * 1e6) * 1000, api.C.red, 4.5);
          api.vline(s, 4, api.C.gold, [5, 4], "faixa de imagem");
          api.vline(s, 2, api.C.gold, [5, 4]);
        },

        text(v, api) {
          const w0 = 1, g = w0 / (2 * v.parameter);
          const f = v.secondary * 1e6;
          const dur = P.pulseDuration(v.parameter, f);
          const res = P.axialResolution(v.parameter, f);
          const larmor = P.larmorMHz(v.tertiary);
          const T2 = 0.08;
          return {
            title: "Amplitude ao longo dos ciclos",
            subtitle: `Q = ${api.fmt(v.parameter, 1)} · f = ${api.fmt(v.secondary, 1)} MHz · B₀ = ${api.fmt(v.tertiary, 1)} T`,
            regime: v.parameter < 5 ? ["Q baixo: pulso curto", "ok"] : v.parameter < 15 ? ["Q intermediário", "warn"] : ["Q alto: banda estreita", "alert"],
            caption: "Com Q baixo a oscilação morre em poucos ciclos — é exatamente isso que um transdutor de imagem precisa. Q alto serve a Doppler e a terapia, que exigem estreiteza espectral.",
            prediction: "Q maior melhora ou piora a resolução axial da imagem?",
            calculation: `duração do pulso ≈ Q/f = ${api.fmt(v.parameter, 1)}/${api.sci(f)} = <b>${api.sci(dur)} s</b><br>resolução axial = c·duração/2 = 1540·${api.sci(dur)}/2 = <b>${api.fmt(res * 1000, 3)} mm</b><em>amplitude após 1 ciclo: e^{−π/Q} = ${api.fmt(P.decayPerCycle(w0, g), 4)}</em>`,
            metrics: [
              ["queda por ciclo", api.fmt(P.decayPerCycle(w0, g), 4)],
              ["duração do pulso", `${api.sci(dur)} s`],
              ["resolução axial", `${api.fmt(res * 1000, 3)} mm`],
              ["Larmor a B₀", `${api.fmt(larmor, 2)} MHz`],
              ["β equivalente a T₂ = 80 ms", `${api.fmt(1 / T2, 1)} s⁻¹`],
              ["precessões em um T₂", api.sci(P.precessionsIn(T2, v.tertiary))]
            ],
            concept: "Q não é qualidade no sentido comum: é a troca entre resolução temporal e seletividade em frequência, e cada aplicação escolhe o seu lado.",
            prompts: [
              "Confirme que dobrar Q dobra a duração do pulso e piora a resolução na mesma proporção.",
              "Calcule quantas precessões cabem em um T₂ de 80 ms a 1,5 T e comente a ordem de grandeza.",
              "Explique por que a analogia entre T₂ e 1/β é formal, e não mecânica."
            ],
            legend: [[api.C.green, "oscilação"], [api.C.gold, "e^{−πN/Q}"]],
            secondaryTitle: "Resolução axial contra Q",
            secondarySubtitle: "linear: pulso mais longo, resolução pior",
            secondaryCaption: "A faixa marcada é a usada em transdutores de imagem."
          };
        }
      }
    ]
  };
})();
