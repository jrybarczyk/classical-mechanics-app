(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula21",
    discipline: "Mecânica Clássica · Aula 20",
    title: "Cálculo variacional",
    subtitle: "O que significa uma curva tornar um funcional estacionário?",

    stations: [
      {
        id: "variacao",
        tab: "Curvas<br>variadas",
        heading: "Y = y + εη",
        equation: "J(ε) = ∫√(1 + Y′²) dx   ·   dJ/dε|₀ = 0",
        hint: "Mova ε nos dois sentidos. Preveja se J cresce, cai, ou faz as duas coisas.",
        controls: [
          { id: "parameter", label: "amplitude ε da variação", min: -0.6, max: 0.6, step: 0.01, value: 0.25, digits: 2 },
          { id: "secondary", label: "nós de η", min: 1, max: 4, step: 1, value: 1, digits: 0 },
          { id: "tertiary", label: "inclinação da curva base", min: -1.5, max: 1.5, step: 0.05, value: 0.7, digits: 2 }
        ],
        animate: { control: "parameter", period: 7 },
        secondary: true,

        draw(api, v) {
          const x1 = 0, x2 = 2;
          const base = (x) => 0.5 + v.tertiary * x;
          const chart = api.axes(api.main, -0.1, 2.1, Math.min(0, base(2)) - 0.9, Math.max(1, base(2)) + 0.9, "x", "y");
          [-0.4, -0.2, 0.2, 0.4].forEach((e) => {
            api.line(chart, api.curve(P.varied(base, e, x1, x2, v.secondary), x1, x2, 200), "#d8e0d9", [], 1.4);
          });
          api.line(chart, api.curve(base, x1, x2, 60), api.C.green, [], 3.2);
          api.line(chart, api.curve(P.varied(base, v.parameter, x1, x2, v.secondary), x1, x2, 220), api.C.red, [], 2.6);
          api.dot(chart, x1, base(x1), api.C.ink, 5.5);
          api.dot(chart, x2, base(x2), api.C.ink, 5.5);
          api.label(chart, x1 + 0.08, base(x1) - 0.16, "P₁", api.C.ink, "left", "top");
          api.label(chart, x2 - 0.08, base(x2) + 0.14, "P₂", api.C.ink, "right");
          const xm = (x1 + x2) / 2;
          api.arrow(chart, xm, base(xm), xm, base(xm) + v.parameter * P.variation(xm, x1, x2, v.secondary), api.C.gold, 2.2, 8);
          api.label(chart, xm + 0.07, base(xm) + v.parameter * 0.5, "εη", api.C.gold, "left");

          const J = (e) => P.functional(P.arcLength, P.varied(base, e, x1, x2, v.secondary), x1, x2, 300);
          const J0 = J(0), Jmax = J(0.6);
          const s2 = api.axes(api.second, -0.6, 0.6, J0 - (Jmax - J0) * 0.15, Jmax + (Jmax - J0) * 0.1, "ε", "J(ε)");
          api.line(s2, api.curve(J, -0.6, 0.6, 60), api.C.blue, [], 2.6);
          api.hline(s2, J0, api.C.green, [5, 4], "J(0), valor estacionário");
          api.dot(s2, v.parameter, J(v.parameter), api.C.red, 5);
          api.dot(s2, 0, J0, api.C.green, 5);
        },

        text(v, api) {
          const x1 = 0, x2 = 2;
          const base = (x) => 0.5 + v.tertiary * x;
          const J = (e) => P.functional(P.arcLength, P.varied(base, e, x1, x2, v.secondary), x1, x2, 400);
          const J0 = J(0);
          const Je = J(v.parameter);
          const derivada = (J(1e-4) - J(-1e-4)) / 2e-4;
          return {
            title: "A família de curvas concorrentes",
            subtitle: `ε = ${api.fmt(v.parameter)} · η com ${api.fmt(v.secondary, 0)} nó(s)`,
            caption: "Todas as curvas partem de P₁ e chegam a P₂. Fixado η, o funcional vira uma função ordinária de ε, com mínimo em ε = 0.",
            prediction: "Existe algum sinal de ε que reduza o comprimento? E se η tiver mais nós?",
            calculation: `J(0) = √(1 + ${api.fmt(v.tertiary ** 2, 4)})·2 = <b>${api.fmt(J0, 6)}</b><br>J(${api.fmt(v.parameter)}) = <b>${api.fmt(Je, 6)}</b><em>dJ/dε em ε = 0: ${api.sci(derivada)} — nulo dentro do erro numérico</em>`,
            metrics: [
              ["J(0)", api.fmt(J0, 6)],
              ["J(ε)", api.fmt(Je, 6)],
              ["J(ε) − J(0)", api.sci(Je - J0)],
              ["dJ/dε em 0", api.sci(derivada)],
              ["η nas extremidades", "0"],
              ["nós de η", api.fmt(v.secondary, 0)]
            ],
            concept: "Estacionário significa insensível em primeira ordem: a diferença J(ε) − J(0) começa em ε², e é isso que a curvatura do painel inferior mostra.",
            prompts: [
              "Verifique que J(ε) − J(0) quadruplica ao dobrar ε.",
              "Aumente os nós de η e confirme que a derivada em ε = 0 continua nula.",
              "Explique por que η precisa se anular nas extremidades."
            ],
            legend: [[api.C.green, "curva estacionária"], [api.C.red, "curva variada"], ["#d8e0d9", "outras da família"]],
            secondaryTitle: "O funcional como função de ε",
            secondarySubtitle: "parábola com vértice em ε = 0",
            secondaryCaption: "Derivada nula na origem: é toda a condição de estacionaridade."
          };
        }
      },

      {
        id: "euler",
        tab: "Resíduo de<br>Euler–Lagrange",
        heading: "∂f/∂y − d/dx(∂f/∂y′)",
        equation: "resíduo ≡ 0 sobre a curva estacionária",
        hint: "Deforme a curva e acompanhe o resíduo. Ele só some quando a deformação some.",
        controls: [
          { id: "parameter", label: "deformação da curva", min: -0.5, max: 0.5, step: 0.01, value: 0.3, digits: 2 },
          { id: "secondary", label: "nós da deformação", min: 1, max: 4, step: 1, value: 1, digits: 0 },
          { id: "tertiary", label: "ponto x examinado", min: 0.1, max: 1.9, step: 0.02, value: 1, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const x1 = 0, x2 = 2;
          const base = (x) => 0.5 + 0.7 * x;
          const y = P.varied(base, v.parameter, x1, x2, v.secondary);
          const chart = api.axes(api.main, 0.05, 1.95, -1.6, 1.6, "x", "resíduo de Euler–Lagrange");
          api.line(chart, api.curve((x) => Math.max(-1.6, Math.min(1.6, P.eulerResidual(P.arcLength, y, x))), 0.08, 1.92, 120), api.C.red, [], 3);
          api.line(chart, api.curve((x) => P.eulerResidual(P.arcLength, base, x), 0.08, 1.92, 60), api.C.green, [], 2.4);
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, v.tertiary, api.C.gold, [4, 4]);
          api.dot(chart, v.tertiary, Math.max(-1.6, Math.min(1.6, P.eulerResidual(P.arcLength, y, v.tertiary))), api.C.red, 5);
          api.label(chart, 1.9, 0.12, "reta: resíduo nulo", api.C.green, "right");

          const s = api.axes(api.second, 0.05, 1.95, -0.4, Math.max(1.9, base(2) + 0.4), "x", "y");
          api.line(s, api.curve(base, x1, x2, 60), api.C.green, [], 2.6);
          api.line(s, api.curve(y, x1, x2, 200), api.C.red, [], 2.2);
          api.dot(s, v.tertiary, y(v.tertiary), api.C.gold, 4.5);
        },

        text(v, api) {
          const x1 = 0, x2 = 2;
          const base = (x) => 0.5 + 0.7 * x;
          const y = P.varied(base, v.parameter, x1, x2, v.secondary);
          const res = P.eulerResidual(P.arcLength, y, v.tertiary);
          const resBase = P.eulerResidual(P.arcLength, base, v.tertiary);
          let maior = 0;
          for (let x = 0.1; x <= 1.9; x += 0.05) maior = Math.max(maior, Math.abs(P.eulerResidual(P.arcLength, y, x)));
          return {
            title: "Resíduo ao longo do intervalo",
            subtitle: `deformação = ${api.fmt(v.parameter)} · x = ${api.fmt(v.tertiary)}`,
            regime: Math.abs(v.parameter) < 1e-9 ? ["resíduo identicamente nulo", "ok"] : ["resíduo não nulo", "alert"],
            caption: "A curva verde é a reta: seu resíduo é nulo em todo ponto. Qualquer deformação produz resíduo, e é exatamente isso que a equação de Euler–Lagrange proíbe.",
            prediction: "Existe alguma deformação não nula com resíduo nulo em todo o intervalo?",
            calculation: `f = √(1 + y′²), logo ∂f/∂y = 0 e a equação vira<br>d/dx[y′/√(1+y′²)] = 0 ⟹ <b>y′ constante</b><em>resíduo em x = ${api.fmt(v.tertiary)}: ${api.sci(res)} na curva deformada, ${api.sci(resBase)} na reta</em>`,
            metrics: [
              ["resíduo em x", api.sci(res)],
              ["resíduo da reta", api.sci(resBase)],
              ["maior resíduo no intervalo", api.sci(maior)],
              ["y′ na reta", api.fmt(0.7, 4)],
              ["deformação", api.fmt(v.parameter)]
            ],
            concept: "O lema fundamental é o que converte a condição integral em equação diferencial: se a integral se anula para toda η, o colchete tem de ser nulo ponto a ponto.",
            prompts: [
              "Zere a deformação e confirme que o resíduo some em todo o intervalo.",
              "Aumente os nós e observe o resíduo oscilar mais rápido.",
              "Explique por que ∂f/∂y = 0 já entrega uma quantidade conservada."
            ],
            legend: [[api.C.green, "reta"], [api.C.red, "curva deformada"]],
            secondaryTitle: "As curvas correspondentes",
            secondarySubtitle: "mesma família da estação anterior",
            secondaryCaption: "Uma variável ausente de f produz imediatamente uma constante do movimento."
          };
        }
      },

      {
        id: "beltrami",
        tab: "Identidade<br>de Beltrami",
        heading: "f − y′∂f/∂y′ constante",
        equation: "área de revolução: f = y√(1 + y′²)",
        hint: "Compare o invariante na catenária e em uma parábola pelos mesmos pontos.",
        controls: [
          { id: "parameter", label: "parâmetro C da catenária", min: 0.85, max: 1.6, step: 0.01, value: 1, digits: 2 },
          { id: "secondary", label: "mistura com a parábola", min: 0, max: 1, step: 0.01, value: 0, digits: 2 },
          { id: "tertiary", label: "ponto x examinado", min: -0.95, max: 0.95, step: 0.02, value: 0.3, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const C = v.parameter;
          const cat = P.catenary(C, 0);
          const y1 = cat(-1), y2 = cat(1), y0 = cat(0);
          const parab = (x) => y0 + ((y2 - 2 * y0 + y1) * x * x) / 2 + ((y2 - y1) / 2) * x;
          const mix = (x) => (1 - v.secondary) * cat(x) + v.secondary * parab(x);

          const chart = api.axes(api.main, -1.05, 1.05, C * 0.5, Math.max(y1, y2) * 1.15, "x", "y");
          api.line(chart, api.curve(cat, -1, 1, 200), api.C.green, [5, 4], 2);
          api.line(chart, api.curve(parab, -1, 1, 200), api.C.grayLight, [3, 4], 1.8);
          api.line(chart, api.curve(mix, -1, 1, 200), api.C.red, [], 3);
          api.dot(chart, -1, y1, api.C.ink, 5); api.dot(chart, 1, y2, api.C.ink, 5);
          api.dot(chart, v.tertiary, mix(v.tertiary), api.C.gold, 4.5);
          api.label(chart, 0, cat(0) - C * 0.12, "catenária", api.C.green, "center", "top");

          const s = api.axes(api.second, -0.95, 0.95, 0, C * 1.6, "x", "f − y′∂f/∂y′");
          api.line(s, api.curve((x) => P.beltrami(P.revolutionArea, mix, x), -0.95, 0.95, 150), api.C.red, [], 2.8);
          api.hline(s, C, api.C.green, [5, 4], `constante C = ${api.fmt(C)}`);
          api.dot(s, v.tertiary, P.beltrami(P.revolutionArea, mix, v.tertiary), api.C.gold, 4.5);
        },

        text(v, api) {
          const C = v.parameter;
          const cat = P.catenary(C, 0);
          const y1 = cat(-1), y2 = cat(1), y0 = cat(0);
          const parab = (x) => y0 + ((y2 - 2 * y0 + y1) * x * x) / 2 + ((y2 - y1) / 2) * x;
          const mix = (x) => (1 - v.secondary) * cat(x) + v.secondary * parab(x);
          const sp = P.beltramiSpread(P.revolutionArea, mix, -0.95, 0.95);
          const Acat = P.functional(P.revolutionArea, cat, -1, 1, 600);
          const Amix = P.functional(P.revolutionArea, mix, -1, 1, 600);
          const puro = v.secondary < 1e-9;
          return {
            title: "O invariante ao longo da curva",
            subtitle: `C = ${api.fmt(C)} · mistura com parábola = ${api.fmt(v.secondary)}`,
            regime: puro ? ["invariante constante", "ok"] : sp.amplitude < 0.02 ? ["quase constante", "warn"] : ["não constante", "alert"],
            caption: "Na catenária o invariante é rigorosamente constante e vale C. As curvas vizinhas pelos mesmos pontos (a família mistura com a parábola) o fazem variar — e têm área maior. O slider fica no ramo raso (C ≥ 0,85, acima de x₂/1,1997 = 0,834): abaixo disso a catenária pelos mesmos extremos é a profunda, um ponto de sela, e não um mínimo.",
            prediction: "O invariante é constante em qualquer curva, ou só na solução?",
            calculation: `f = y√(1+y′²) ⟹ f − y′∂f/∂y′ = y/√(1+y′²)<br>na catenária y = C cosh(x/C): y′ = senh(x/C), √(1+y′²) = cosh(x/C) ⟹ <b>= C</b><em>amplitude medida do invariante: ${api.sci(sp.amplitude)}</em>`,
            metrics: [
              ["invariante em x", api.fmt(P.beltrami(P.revolutionArea, mix, v.tertiary), 5)],
              ["valor esperado C", api.fmt(C, 5)],
              ["amplitude do invariante", api.sci(sp.amplitude)],
              ["área/2π da catenária", api.fmt(Acat, 5)],
              ["área/2π da curva atual", api.fmt(Amix, 5)],
              ["excesso de área/2π", api.sci(Amix - Acat)]
            ],
            concept: "Quando x não aparece explicitamente em f, o problema perde uma ordem. Na Aula 25 essa mesma identidade reaparece com x → t e f → L, e a constante será a energia.",
            prompts: [
              "Zere a mistura e confirme que o invariante fica constante e igual a C.",
              "Suba a mistura e verifique que a área cresce junto com a variação do invariante.",
              "Refaça o rearranjo de Beltrami à mão, mostrando o cancelamento do termo em y″."
            ],
            legend: [[api.C.green, "catenária"], [api.C.grayLight, "parábola"], [api.C.red, "curva atual"]],
            secondaryTitle: "f − y′∂f/∂y′ ao longo de x",
            secondarySubtitle: "reta horizontal apenas sobre a solução",
            secondaryCaption: "É este achatamento que a identidade de Beltrami afirma."
          };
        }
      }
    ]
  };
})();
