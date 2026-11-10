(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula13",
    discipline: "Mecânica Clássica · Aula 13",
    title: "Oscilações forçadas e ressonância",
    subtitle: "Ressonância de quê? Amplitude e reatância dão respostas diferentes.",

    stations: [
      {
        id: "amplitude",
        tab: "Amplitude<br>e fase",
        heading: "Resposta estacionária",
        equation: "D(ω) = A/√[(ω₀²−ω²)² + 4β²ω²]<br>tanδ = 2βω/(ω₀²−ω²)",
        hint: "Suba β até o pico desaparecer. Anote o valor de β/ω₀ em que isso acontece.",
        controls: [
          { id: "parameter", label: "amortecimento β/ω₀", min: 0.02, max: 1.4, step: 0.01, value: 0.1, digits: 2 },
          { id: "secondary", label: "frequência examinada ω/ω₀", min: 0.05, max: 2.5, step: 0.01, value: 1, digits: 2 },
          { id: "tertiary", label: "amplitude do forçamento A", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const w0 = 1, g = v.parameter;
          const Amax = P.amplitude(P.hasAmplitudePeak(w0, g) ? P.omegaAmplitude(w0, g) : 0.05, v.tertiary, w0, g);
          const chart = api.axes(api.main, 0, 2.5, 0, Math.max(Amax * 1.15, v.tertiary * 1.4), "ω/ω₀", "amplitude A");
          [[0.05, "#cfd8d0"], [0.1, api.C.blue], [0.25, api.C.gold], [0.7, api.C.red]].forEach(([gg, cor]) => {
            api.line(chart, api.curve((w) => P.amplitude(w, v.tertiary, w0, gg), 0.02, 2.5, 300), cor, [5, 4], 1.5);
          });
          api.line(chart, api.curve((w) => P.amplitude(w, v.tertiary, w0, g), 0.02, 2.5, 400), api.C.green, [], 3.2);
          api.vline(chart, 1, api.C.grayLight, [3, 4], "ω₀");
          if (P.hasAmplitudePeak(w0, g)) {
            const wr = P.omegaAmplitude(w0, g);
            api.vline(chart, wr, api.C.red, [5, 4], `ω_R = ${api.fmt(wr, 3)}`);
            api.dot(chart, wr, P.amplitude(wr, v.tertiary, w0, g), api.C.red, 5);
          }
          api.dot(chart, v.secondary, P.amplitude(v.secondary, v.tertiary, w0, g), api.C.ink, 5.5);

          const s = api.axes(api.second, 0, 2.5, 0, 180, "ω/ω₀", "fase δ (°)", { yTicks: [0, 45, 90, 135, 180] });
          api.line(s, api.curve((w) => (P.phase(w, w0, g) * 180) / Math.PI, 0.02, 2.5, 300), api.C.green);
          api.hline(s, 90, api.C.gold, [5, 4], "π/2 em ω₀");
          api.vline(s, 1, api.C.grayLight, [3, 4]);
          api.dot(s, v.secondary, (P.phase(v.secondary, w0, g) * 180) / Math.PI, api.C.ink, 4.5);
        },

        text(v, api) {
          const w0 = 1, g = v.parameter;
          const A = P.amplitude(v.secondary, v.tertiary, w0, g);
          const d = (P.phase(v.secondary, w0, g) * 180) / Math.PI;
          const tem = P.hasAmplitudePeak(w0, g);
          const wr = P.omegaAmplitude(w0, g);
          return {
            title: "Amplitude e fase da resposta forçada",
            subtitle: `β/ω₀ = ${api.fmt(g)} · ω/ω₀ = ${api.fmt(v.secondary)} · Q = ${api.fmt(P.quality(w0, g), 2)}`,
            regime: tem ? [`pico em ω_R = ${api.fmt(wr, 3)} ω₀`, "ok"] : ["sem pico de amplitude", "alert"],
            caption: "O pico de deslocamento não está em ω₀: está em ω_R = √(ω₀² − 2β²), e desaparece quando β passa de ω₀/√2. A fase, essa vale π/2 em ω₀ sempre.",
            prediction: "Para que valor de β/ω₀ o pico de amplitude deixa de existir?",
            calculation: `D(ω) = A/√[(ω₀²−ω²)² + 4β²ω²] = ${api.fmt(v.tertiary)}/√[${api.fmt((1 - v.secondary ** 2) ** 2, 4)} + ${api.fmt(4 * g * g * v.secondary ** 2, 4)}] = <b>${api.fmt(A, 4)}</b><br>δ = <b>${api.fmt(d, 1)}°</b><em>${tem ? `ω_R/ω₀ = √(1 − 2β²/ω₀²) = ${api.fmt(wr, 4)}` : `1 − 2β²/ω₀² = ${api.fmt(1 - 2 * g * g, 4)} < 0: não há máximo`}</em>`,
            metrics: [
              ["D(ω)", api.fmt(A, 4)],
              ["fase δ", `${api.fmt(d, 1)}°`],
              ["ω_R/ω₀", tem ? api.fmt(wr, 4) : "não existe"],
              ["D(ω₀)", api.fmt(P.amplitude(1, v.tertiary, w0, g), 4)],
              ["Q", api.fmt(P.quality(w0, g), 2)],
              ["β/ω₀ crítico", api.fmt(1 / Math.SQRT2, 4)]
            ],
            concept: "Três frequências convivem e não coincidem: ω₀ da oscilação livre, ω₁ da livre amortecida e ω_R do pico de amplitude forçada.",
            prompts: [
              "Ache o β/ω₀ em que o pico some e compare com 1/√2.",
              "Verifique que δ = 90° em ω = ω₀ para qualquer β.",
              "Compare D(ω₀) com o pico D(ω_R) e diga quando a diferença importa."
            ],
            legend: [[api.C.green, "β escolhido"], [api.C.red, "ω_R"], [api.C.grayLight, "ω₀"]],
            secondaryTitle: "Fase contra frequência",
            secondarySubtitle: "de 0 a π, cruzando π/2 exatamente em ω₀",
            secondaryCaption: "É a fase, e não a amplitude, que marca ω₀ sem ambiguidade."
          };
        }
      },

      {
        id: "potencia",
        tab: "Potência e<br>largura",
        heading: "Meia potência e banda",
        equation: "⟨P⟩ = (F₀²/m)·βω²/[(ω₀²−ω²)² + 4β²ω²]   Δω ≈ 2β",
        hint: "A potência tem máximo em ω₀ para qualquer β — diferente da amplitude. Verifique.",
        controls: [
          { id: "parameter", label: "amortecimento β/ω₀", min: 0.02, max: 0.6, step: 0.01, value: 0.1, digits: 2 },
          { id: "secondary", label: "frequência examinada ω/ω₀", min: 0.2, max: 2, step: 0.01, value: 1, digits: 2 },
          { id: "tertiary", label: "força F₀", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2, unit: "N" }
        ],

        draw(api, v) {
          const w0 = 1, g = v.parameter;
          const Pmax = P.meanPower(w0, v.tertiary, 1, w0, g);
          const chart = api.axes(api.main, 0.2, 2, 0, Pmax * 1.15, "ω/ω₀", "potência média ⟨P⟩ (W)");
          api.line(chart, api.curve((w) => P.meanPower(w, v.tertiary, 1, w0, g), 0.2, 2, 400), api.C.green, [], 3);
          const [lo, hi] = P.halfPowerPoints(w0, g);
          api.area(chart, api.curve((w) => P.meanPower(w, v.tertiary, 1, w0, g), lo, hi, 200), "rgba(97,155,96,.15)", 0);
          api.hline(chart, Pmax / 2, api.C.gold, [5, 4], "meia potência");
          api.vline(chart, lo, api.C.red, [4, 4]);
          api.vline(chart, hi, api.C.red, [4, 4]);
          api.vline(chart, 1, api.C.grayLight, [3, 4], "ω₀");
          api.dot(chart, v.secondary, P.meanPower(v.secondary, v.tertiary, 1, w0, g), api.C.ink, 5.5);
          api.line(chart, [[lo, Pmax * 0.08], [hi, Pmax * 0.08]], api.C.red, [], 3);
          api.label(chart, (lo + hi) / 2, Pmax * 0.13, `Δω = ${api.fmt(hi - lo, 3)}`, api.C.red, "center");
        },

        text(v, api) {
          const w0 = 1, g = v.parameter;
          const Pmax = P.meanPower(w0, v.tertiary, 1, w0, g);
          const Pw = P.meanPower(v.secondary, v.tertiary, 1, w0, g);
          const [lo, hi] = P.halfPowerPoints(w0, g);
          const Q = P.quality(w0, g);
          return {
            title: "Potência média absorvida",
            subtitle: `β/ω₀ = ${api.fmt(g)} · F₀ = ${api.fmt(v.tertiary)} N · Q = ${api.fmt(Q, 2)}`,
            caption: "Ao contrário da amplitude, a potência absorvida é máxima exatamente em ω₀, qualquer que seja o amortecimento. É por isso que a largura de banda é definida sobre ela.",
            prediction: "O máximo de potência está em ω₀ ou em ω_R?",
            calculation: `⟨P⟩(ω₀) = F₀²/(4mβ) = ${api.fmt(v.tertiary ** 2)}/(4·${api.fmt(g)}) = <b>${api.fmt(Pmax, 4)} W</b><br>meia potência em |ω₀² − ω²| = 2βω ⟹ ω = <b>${api.fmt(lo, 4)}</b> e <b>${api.fmt(hi, 4)}</b><em>Δω = ${api.fmt(hi - lo, 4)} ≈ 2β = ${api.fmt(2 * g, 4)} · Q = ω₀/Δω = ${api.fmt(1 / (hi - lo), 3)}</em>`,
            metrics: [
              ["⟨P⟩ máxima", `${api.fmt(Pmax, 4)} W`],
              ["⟨P⟩ na frequência", `${api.fmt(Pw, 4)} W`],
              ["meia potência inferior", api.fmt(lo, 4)],
              ["meia potência superior", api.fmt(hi, 4)],
              ["largura Δω", api.fmt(hi - lo, 4)],
              ["Q = ω₀/Δω", api.fmt(1 / (hi - lo), 3)]
            ],
            concept: "Em regime estacionário a potência fornecida repõe exatamente a dissipada; o pico e a largura da curva de potência são a assinatura do sistema.",
            prompts: [
              "Confirme que Δω = 2β dentro do erro de leitura, para dois valores de β.",
              "Verifique que o máximo de potência não se desloca com β.",
              "Explique por que a largura de banda é definida na potência e não na amplitude."
            ],
            legend: [[api.C.green, "⟨P⟩(ω)"], [api.C.red, "banda de meia potência"]]
          };
        }
      },

      {
        id: "impedancia",
        tab: "Impedância<br>respiratória",
        heading: "Duas ressonâncias diferentes",
        equation: "Z(ω) = R + i(ωI − E_l/ω)   ·   X(ω) = 0 em ω = √(E_l/I)",
        hint: "Varie R e observe: a frequência em que X cruza zero se move? E o pico de amplitude, existe?",
        controls: [
          { id: "parameter", label: "resistência R", min: 0.2, max: 12, step: 0.1, value: 3, digits: 1, unit: "cmH₂O·s/L" },
          { id: "secondary", label: "inertância I", min: 0.004, max: 0.03, step: 0.001, value: 0.01, digits: 3, unit: "cmH₂O·s²/L" },
          { id: "tertiary", label: "complacência C", min: 0.03, max: 0.25, step: 0.005, value: 0.1, digits: 3, unit: "L/cmH₂O" }
        ],
        secondary: true,

        draw(api, v) {
          const R = v.parameter, I = v.secondary, C = v.tertiary;
          const wRes = P.resonanceReactance(I, C);
          const fMax = 25;
          const chart = api.axes(api.main, 0.5, fMax, -20, 20, "frequência (Hz)", "cmH₂O·s/L");
          const w = (f) => 2 * Math.PI * f;
          api.line(chart, api.curve((f) => P.reactance(w(f), I, C), 0.5, fMax, 300), api.C.blue, [], 3);
          api.line(chart, api.curve(() => R, 0.5, fMax, 2), api.C.red, [], 2.4);
          api.line(chart, api.curve((f) => P.impedanceMagnitude(w(f), R, I, C), 0.5, fMax, 300), api.C.green, [5, 4], 2.4);
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, P.hertz(wRes), api.C.gold, [5, 4], `X = 0 em ${api.fmt(P.hertz(wRes), 2)} Hz`);
          api.dot(chart, P.hertz(wRes), 0, api.C.gold, 5.5);
          api.label(chart, fMax * 0.96, R + 1.2, "R (resistiva)", api.C.red, "right");
          api.label(chart, fMax * 0.96, P.reactance(w(fMax), I, C) - 1.5, "X (reativa)", api.C.blue, "right", "top");

          /* Painel secundário: a amplitude mecânica correspondente (sem pico para R ≳ 0,45). */
          const w0 = wRes, g = P.dampingFromR(R, I);
          const pico = P.hasAmplitudePeak(w0, g) ? P.amplitude(P.omegaAmplitude(w0, g), 1, w0, g) : 0;
          const s = api.axes(api.second, 0.2, 3, 0, Math.max(P.amplitude(0.2 * w0, 1, w0, g), pico) * 1.15, "ω/ω₀", "amplitude de volume");
          api.line(s, api.curve((r) => P.amplitude(r * w0, 1, w0, g), 0.2, 3, 200), api.C.green);
          api.vline(s, 1, api.C.gold, [5, 4], "ω₀ = √(E_l/I)");
          if (P.hasAmplitudePeak(w0, g)) api.vline(s, P.omegaAmplitude(w0, g) / w0, api.C.red, [4, 4], "ω_R");
        },

        text(v, api) {
          const R = v.parameter, I = v.secondary, C = v.tertiary;
          const wRes = P.resonanceReactance(I, C);
          const fRes = P.hertz(wRes);
          const g = P.dampingFromR(R, I);
          const Q = P.quality(wRes, g);
          const tem = P.hasAmplitudePeak(wRes, g);
          return {
            title: "Reatância, resistência e impedância",
            subtitle: `R = ${api.fmt(R, 1)} · I = ${api.fmt(I, 3)} · C = ${api.fmt(C, 3)}`,
            regime: tem ? ["há pico de amplitude", "ok"] : ["supercrítico: sem pico de amplitude", "alert"],
            caption: "A reatância cruza zero em √(E_l/I) e esse cruzamento não se move quando R muda. É essa a ressonância que a técnica de oscilações forçadas mede.",
            prediction: "Aumentando R, a frequência de ressonância clínica se desloca?",
            calculation: `X(ω) = ωI − E_l/ω = 0 ⟹ ω = √(E_l/I) = √(${api.fmt(P.elastance(C), 1)}/${api.fmt(I, 3)}) = <b>${api.fmt(wRes, 2)} rad/s = ${api.fmt(fRes, 2)} Hz</b><br>β = R/2I = ${api.fmt(R, 1)}/(2·${api.fmt(I, 3)}) = <b>${api.fmt(g, 0)} s⁻¹</b><em>β/ω₀ = ${api.fmt(g / wRes, 2)} e Q = ${api.fmt(Q, 3)}: ${tem ? "ainda há pico de amplitude" : "não existe ω_R real — as duas ressonâncias são coisas distintas"}</em>`,
            metrics: [
              ["ressonância de reatância", `${api.fmt(fRes, 2)} Hz`],
              ["β = R/2I", `${api.fmt(g, 0)} s⁻¹`],
              ["β/ω₀", api.fmt(g / wRes, 2)],
              ["Q", api.fmt(Q, 3)],
              ["ω_R de amplitude", tem ? api.fmt(P.omegaAmplitude(wRes, g), 2) : "não existe"],
              ["|Z| mínimo", api.fmt(R, 2)]
            ],
            concept: "Ressonância de amplitude e ressonância de reatância são fenômenos diferentes: a primeira exige amortecimento fraco, a segunda existe sempre e é a que a clínica usa.",
            prompts: [
              "Varie R de 0,2 a 12 (o pico de amplitude só existe para R < 0,45) e confirme que a frequência de cruzamento não se move.",
              "Com R = 3, calcule β/ω₀ e verifique que √(ω₀² − 2β²) não é real.",
              "Explique por que o mínimo de |Z| vale exatamente R."
            ],
            legend: [[api.C.blue, "reatância X"], [api.C.red, "resistência R"], [api.C.green, "|Z|"]],
            secondaryTitle: "Amplitude de volume correspondente",
            secondarySubtitle: tem ? "com pico" : "sem pico: decresce desde ω = 0",
            secondaryCaption: "Este painel é o contraste: nenhum máximo aqui, e ainda assim há ressonância clínica em 5 Hz."
          };
        }
      }
    ]
  };
})();
