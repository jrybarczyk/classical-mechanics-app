(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula10",
    discipline: "Mecânica Clássica · Aula 10",
    title: "Referenciais em rotação",
    subtitle: "Por que Coriolis conta em escala geofísica e não conta no laboratório?",

    stations: [
      {
        id: "coriolis",
        tab: "Desvio para<br>leste",
        heading: "Queda livre em latitude λ",
        equation: "a_C = 2ωgt cosλ  ⟹  d = ⅓ωg t³ cosλ",
        hint: "O desvio depende de cosλ. Preveja onde ele é máximo antes de mover a latitude.",
        controls: [
          { id: "parameter", label: "altura de queda h", min: 5, max: 500, step: 5, value: 100, digits: 0, unit: "m" },
          { id: "secondary", label: "latitude λ", min: -85, max: 85, step: 1, value: 23, digits: 0, unit: "°" },
          { id: "tertiary", label: "rotação ω / ω_Terra", min: 0.1, max: 3, step: 0.05, value: 1, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const w = v.tertiary * P.OMEGA_TERRA;
          const chart = api.axes(api.main, 0, 500, 0, P.eastwardDeflection(500, 0, 3 * P.OMEGA_TERRA) * 100 * 1.05,
            "altura de queda h (m)", "desvio para leste (cm)");
          [[0, "equador"], [23, "λ = 23°"], [45, "λ = 45°"], [70, "λ = 70°"]].forEach(([lat, rot], i) => {
            const cor = [api.C.green, api.C.blue, api.C.gold, api.C.red][i];
            api.line(chart, api.curve((h) => P.eastwardDeflection(h, lat, w) * 100, 0, 500, 120), cor,
              Math.abs(lat - Math.abs(v.secondary)) < 0.5 ? [] : [5, 4], 2);
            api.label(chart, 495, P.eastwardDeflection(500, lat, w) * 100, rot, cor, "right");
          });
          api.line(chart, api.curve((h) => P.eastwardDeflection(h, v.secondary, w) * 100, 0, 500, 160), api.C.ink, [], 3);
          api.dot(chart, v.parameter, P.eastwardDeflection(v.parameter, v.secondary, w) * 100, api.C.red, 5.5);

          const oc = P.orderComparison(v.parameter, v.secondary, w);
          const s = api.axes(api.second, 0.1, 3, -5, 1, "ω / ω_Terra", "log₁₀ do desvio (m)", {
            yFormat: (t) => `10${api.sup(Math.round(t))}`
          });
          api.line(s, api.curve((r) => Math.log10(Math.max(1e-9, P.eastwardDeflection(v.parameter, v.secondary, r * P.OMEGA_TERRA))), 0.1, 3, 100), api.C.green);
          api.line(s, api.curve((r) => Math.log10(Math.max(1e-9, P.orderComparison(v.parameter, v.secondary, r * P.OMEGA_TERRA).correcao)), 0.1, 3, 100), api.C.red, [5, 4], 2.2);
          api.dot(s, v.tertiary, Math.log10(Math.max(1e-9, oc.primeira)), api.C.green, 4.2);
          api.dot(s, v.tertiary, Math.log10(Math.max(1e-9, oc.correcao)), api.C.red, 4.2);
        },

        text(v, api) {
          const w = v.tertiary * P.OMEGA_TERRA;
          const t = P.fallTime(v.parameter);
          const d = P.eastwardDeflection(v.parameter, v.secondary, w);
          const oc = P.orderComparison(v.parameter, v.secondary, w);
          return {
            title: "Desvio para leste na queda livre",
            subtitle: `h = ${api.fmt(v.parameter, 0)} m · λ = ${api.fmt(v.secondary, 0)}° · ω = ${api.fmt(v.tertiary)} ω_Terra`,
            regime: Math.abs(v.secondary) > 84 ? ["desvio praticamente nulo", "alert"] : d > 0.05 ? ["desvio mensurável", "warn"] : ["desvio pequeno", "ok"],
            caption: "O desvio é para leste nos dois hemisférios, porque depende de cosλ e não do sinal da latitude. A tracejada vermelha do painel abaixo é a correção (relativa O(ω²), absoluta O(ω³)) de trocar g por g efetiva.",
            prediction: "O corpo desvia para o mesmo lado no hemisfério norte e no sul?",
            calculation: `t = √(2h/g) = √(2·${api.fmt(v.parameter, 0)}/9,8) = <b>${api.fmt(t)} s</b><br>d = ⅓ωg t³cosλ = ⅓·${api.sci(w)}·9,8·${api.fmt(t ** 3)}·${api.fmt(Math.cos(P.rad(v.secondary)))} = <b>${api.fmt(d * 100)} cm</b><em>correção absoluta O(ω³): ${api.sci(oc.correcao)} m, ou ${api.fmt(oc.razao * 100, 3)} % do desvio (relativa O(ω²))</em>`,
            metrics: [
              ["tempo de queda", `${api.fmt(t)} s`],
              ["desvio para leste", `${api.fmt(d * 100)} cm`],
              ["correção absoluta O(ω³)", `${api.sci(oc.correcao * 100)} cm`],
              ["correção relativa O(ω²)", `${api.fmt(oc.razao * 100, 3)} %`],
              ["Coriolis / peso a 10 m/s", api.sci(P.coriolisToWeight(10, w))]
            ],
            concept: "Coriolis dá um desvio de primeira ordem em ω; a centrífuga só corrige o resultado em segunda ordem relativa (O(ω²), absoluta O(ω³)): é essa diferença de ordem, e não um argumento vago de pequenez, que autoriza desprezar uma delas.",
            prompts: [
              "Confirme que dobrar h multiplica o desvio por 2√2, e explique de onde vem o expoente 3/2.",
              "Compare λ = +23° e λ = −23°. O sentido do desvio mudou?",
              "Triplique ω e verifique que o desvio triplica enquanto a correção fica 27 vezes maior."
            ],
            legend: [[api.C.ink, "latitude escolhida"], [api.C.green, "equador"], [api.C.red, "λ = 70°"]],
            secondaryTitle: "As duas ordens contra ω",
            secondarySubtitle: "verde ∝ ω, vermelha ∝ ω³ — inclinações diferentes em log-log",
            secondaryCaption: "A separação entre as curvas é a justificativa quantitativa do descarte."
          };
        }
      },

      {
        id: "foucault",
        tab: "Pêndulo de<br>Foucault",
        heading: "Precessão com ω senλ",
        equation: "taxa = ω senλ   ·   T = 2π/(ω senλ)",
        hint: "Vá do equador ao polo. Preveja onde o pêndulo não precessa.",
        controls: [
          { id: "parameter", label: "latitude λ", min: -89, max: 89, step: 1, value: 23, digits: 0, unit: "°" },
          { id: "secondary", label: "rotação ω / ω_Terra", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "tempo decorrido", min: 0, max: 48, step: 0.25, value: 12, digits: 2, unit: "h" }
        ],
        animate: { control: "tertiary", period: 8 },
        secondary: true,

        draw(api, v) {
          const w = v.secondary * P.OMEGA_TERRA;
          const taxa = P.foucaultRate(v.parameter, w);
          const ang = taxa * v.tertiary * 3600;
          const chart = api.axes(api.main, -1.4, 1.4, -1.4, 1.4, "", "", { xTicks: [], yTicks: [] });
          api.line(chart, api.param((t) => [Math.cos(t), Math.sin(t)], 0, api.TAU, 160), api.C.grid, [], 1.6);
          for (let k = 0; k < 12; k += 1) {
            const a0 = ang - k * 0.16;
            const alpha = 1 - k / 12;
            api.line(chart, [[-Math.cos(a0), -Math.sin(a0)], [Math.cos(a0), Math.sin(a0)]],
              k === 0 ? api.C.green : `rgba(97,155,96,${(alpha * 0.35).toFixed(2)})`, [], k === 0 ? 3 : 1.4);
          }
          api.line(chart, [[-1, 0], [1, 0]], api.C.grayLight, [5, 4], 1.6);
          api.label(chart, 1.05, 0, "plano inicial", api.C.grayLight, "left");
          api.dot(chart, 0, 0, api.C.ink, 4);
          api.label(chart, Math.cos(ang) * 1.12, Math.sin(ang) * 1.12, "agora", api.C.green, "center");

          const s = api.axes(api.second, -89, 89, 0, 200, "latitude λ (°)", "período de precessão (h)", { xTicks: [-90, -45, 0, 45, 90] });
          api.line(s, api.curve((l) => Math.min(200, P.foucaultPeriodHours(l, w)), -89, -1, 90), api.C.blue);
          api.line(s, api.curve((l) => Math.min(200, P.foucaultPeriodHours(l, w)), 1, 89, 90), api.C.blue);
          api.hline(s, 23.93 / v.secondary, api.C.gold, [5, 4], "dia sideral, no polo");
          api.dot(s, v.parameter, Math.min(200, P.foucaultPeriodHours(v.parameter, w)), api.C.red, 4.5);
        },

        text(v, api) {
          const w = v.secondary * P.OMEGA_TERRA;
          const taxa = P.foucaultRate(v.parameter, w);
          const Th = P.foucaultPeriodHours(v.parameter, w);
          const ang = ((taxa * v.tertiary * 3600 * 180) / Math.PI) % 360;
          return {
            title: "Precessão do plano de oscilação",
            subtitle: `λ = ${api.fmt(v.parameter, 0)}° · ω = ${api.fmt(v.secondary)} ω_Terra · t = ${api.fmt(v.tertiary)} h`,
            regime: Math.abs(v.parameter) < 2 ? ["não precessa", "alert"] : Math.abs(v.parameter) > 80 ? ["precessão máxima", "ok"] : ["precessão parcial", "warn"],
            caption: "Só a componente de ω ao longo da vertical local conta. No equador ela é nula e o plano fica parado; no polo o pêndulo dá uma volta por dia sideral.",
            prediction: "Em que latitude o pêndulo de Foucault não precessa?",
            calculation: `taxa = ω senλ = ${api.sci(w)}·sen${api.fmt(v.parameter, 0)}° = <b>${api.sci(taxa)} rad/s</b><br>T = 2π/(ω senλ) = <b>${Number.isFinite(Th) ? api.fmt(Th, 1) + " h" : "infinito"}</b><em>em ${api.fmt(v.tertiary)} h o plano girou ${api.fmt(ang, 1)}°</em>`,
            metrics: [
              ["taxa de precessão", `${api.sci(taxa)} rad/s`],
              ["período", Number.isFinite(Th) ? `${api.fmt(Th, 1)} h` : "∞"],
              ["giro acumulado", `${api.fmt(ang, 1)}°`],
              ["senλ", api.fmt(Math.sin(P.rad(v.parameter)))],
              ["período no polo", `${api.fmt(P.foucaultPeriodHours(90, w), 2)} h`]
            ],
            concept: "O pêndulo não sente a rotação como força: ele mantém seu plano, e é o laboratório que gira por baixo dele.",
            prompts: [
              "Ache a latitude em que o período de precessão vale exatamente 48 h.",
              "Compare o sentido da precessão nos dois hemisférios.",
              "Verifique que o período no polo é o dia sideral, e não as 24 h do dia solar."
            ],
            legend: [[api.C.green, "plano atual"], [api.C.grayLight, "plano inicial"]],
            secondaryTitle: "Período de precessão contra latitude",
            secondarySubtitle: "diverge no equador, mínimo nos polos",
            secondaryCaption: "A assíntota vertical em λ = 0 é a razão de Foucault ter escolhido Paris."
          };
        }
      },

      {
        id: "centrifuga",
        tab: "Centrífuga e<br>vertical local",
        heading: "Trocar g por ω²r",
        equation: "a_cf = ω²r   ·   ganho = ω²r/g",
        hint: "Compare o ganho com o que a Aula 6 previu para a sedimentação.",
        controls: [
          { id: "parameter", label: "rotação", min: 200, max: 15000, step: 100, value: 3000, digits: 0, unit: "rpm" },
          { id: "secondary", label: "raio do rotor r", min: 0.02, max: 0.3, step: 0.005, value: 0.1, digits: 3, unit: "m" },
          { id: "tertiary", label: "latitude para a vertical local", min: 0, max: 89, step: 1, value: 45, digits: 0, unit: "°" }
        ],
        secondary: true,

        draw(api, v) {
          const chart = api.axes(api.main, 200, 15000, 0, P.centrifugeGain(15000, 0.3) * 1.05, "rotação (rpm)", "ganho ω²r / g");
          [[0.05, "r = 5 cm"], [0.1, "r = 10 cm"], [0.2, "r = 20 cm"], [0.3, "r = 30 cm"]].forEach(([r, rot], i) => {
            const cor = [api.C.grayLight, api.C.green, api.C.blue, api.C.red][i];
            api.line(chart, api.curve((rpm) => P.centrifugeGain(rpm, r), 200, 15000, 120), cor,
              Math.abs(r - v.secondary) < 0.006 ? [] : [5, 4], Math.abs(r - v.secondary) < 0.006 ? 3 : 1.6);
            api.label(chart, 14800, P.centrifugeGain(15000, r), rot, cor, "right");
          });
          api.dot(chart, v.parameter, P.centrifugeGain(v.parameter, v.secondary), api.C.ink, 5.5);
          api.hline(chart, 1, api.C.gold, [4, 4], "1 g");

          const s = api.axes(api.second, 0, 89, 9.75, 9.81, "latitude λ (°)", "g efetiva (m/s²)");
          api.line(s, api.curve((l) => P.effectiveGravity(l), 0, 89, 90), api.C.green);
          api.hline(s, P.G, api.C.grayLight, [4, 4], "g sem rotação");
          api.dot(s, v.tertiary, P.effectiveGravity(v.tertiary), api.C.red, 4.5);
        },

        text(v, api) {
          const ganho = P.centrifugeGain(v.parameter, v.secondary);
          const w = P.rpmToRad(v.parameter);
          const gef = P.effectiveGravity(v.tertiary);
          const tilt = P.verticalTilt(v.tertiary);
          return {
            title: "Ganho de uma centrífuga",
            subtitle: `${api.fmt(v.parameter, 0)} rpm · r = ${api.fmt(v.secondary, 3)} m`,
            regime: ganho > 5000 ? ["alta velocidade (ultracentrífugas passam de 10⁵ g)", "alert"] : ganho > 500 ? ["centrífuga clínica", "warn"] : ["ganho modesto", "ok"],
            caption: "O ganho cresce com o quadrado da rotação e apenas linearmente com o raio: é por isso que se aumenta rpm antes de aumentar o rotor.",
            prediction: "Dobrar a rotação multiplica o ganho por quanto?",
            calculation: `ω = 2π·${api.fmt(v.parameter, 0)}/60 = <b>${api.fmt(w, 1)} rad/s</b><br>ganho = ω²r/g = ${api.fmt(w, 1)}²·${api.fmt(v.secondary, 3)}/9,8 = <b>${api.fmt(ganho, 0)} g</b><em>na Aula 6, v_T ∝ g: a sedimentação fica ${api.fmt(ganho, 0)} vezes mais rápida</em>`,
            metrics: [
              ["ω", `${api.fmt(w, 1)} rad/s`],
              ["aceleração centrífuga", `${api.sci(P.centrifugal(w, v.secondary))} m/s²`],
              ["ganho sobre g", `${api.fmt(ganho, 0)} ×`],
              ["g efetiva na latitude", `${api.fmt(gef, 4)} m/s²`],
              ["inclinação do prumo", `${api.fmt(tilt * 3600, 0)} arcsec`],
              ["redução no equador", `${api.fmt(P.equatorialReduction() * 100, 3)} %`]
            ],
            concept: "A centrífuga não é um truque: é a mesma força inercial que desloca a vertical aparente da Terra, usada com um ω milhões de vezes maior.",
            prompts: [
              "Verifique que dobrar a rotação quadruplica o ganho, mas dobrar o raio apenas dobra.",
              "Ache a rotação necessária para obter 10 000 g com r = 10 cm.",
              "Confirme que a redução de g no equador é de cerca de 0,35 % e explique por que ela não desvia um corpo em queda."
            ],
            legend: [[api.C.green, "raio escolhido"], [api.C.gold, "1 g"]],
            secondaryTitle: "Gravidade efetiva contra latitude",
            secondarySubtitle: "a centrífuga terrestre reduz g e inclina a vertical",
            secondaryCaption: "É esse efeito, e não um desvio lateral, que a centrífuga produz."
          };
        }
      }
    ]
  };
})();
