(function () {
  "use strict";
  const P = window.LessonPhysics;
  /* Índices 1–3 em subscrito (draw.js só oferece sobrescrito). */
  const sub = (n) => "₀₁₂₃₄₅₆₇₈₉"[Number(n)];

  /* Vetores fixos da estação de identidade vetorial. */
  const Bv = [0, 3, 2];
  const Cv = [-2, 1, 4];
  /* Vetor extra da estação indicial, escolhido para que nenhuma componente se anule. */
  const Av = [1, 2, -1];

  window.LessonScene = {
    id: "aula02",
    discipline: "Mecânica Clássica · Aula 2",
    title: "Vetores, rotações e invariantes",
    subtitle: "O que muda e o que permanece quando trocamos a base?",

    stations: [
      {
        id: "rotacao",
        tab: "Rotação<br>de eixos",
        heading: "Rotação passiva",
        equation: "a′₁ = a₁cosθ + a₂senθ<br>a′₂ = −a₁senθ + a₂cosθ",
        hint: "Gire os eixos e acompanhe as componentes. O vetor desenhado não deve se mexer.",
        controls: [
          { id: "parameter", label: "ângulo θ dos eixos", min: 0, max: 180, step: 1, value: 30, digits: 0, unit: "°" },
          { id: "secondary", label: "componente a₁", min: -5, max: 5, step: 0.1, value: 3, digits: 1 },
          { id: "tertiary", label: "componente a₂", min: -5, max: 5, step: 0.1, value: 4, digits: 1 }
        ],
        animate: { control: "parameter", period: 8 },

        draw(api, v) {
          const a = [v.secondary, v.tertiary];
          const th = P.rad(v.parameter);
          const chart = api.axes(api.main, -6, 6, -6, 6, "x₁", "x₂");
          const { ctx } = chart;

          /* Eixos girados: é a base que se move. */
          const eixo = (ang, rotulo, cor) => {
            const L = 5.6;
            api.line(chart, [[-L * Math.cos(ang), -L * Math.sin(ang)], [L * Math.cos(ang), L * Math.sin(ang)]], cor, [7, 5], 1.6);
            api.label(chart, L * Math.cos(ang) * 0.92, L * Math.sin(ang) * 0.92, rotulo, cor, "center");
          };
          eixo(th, "x′₁", api.C.red);
          eixo(th + Math.PI / 2, "x′₂", api.C.red);

          /* Projeções sobre a base nova. */
          const p = P.rotatePassive(a, th);
          const e1 = [Math.cos(th), Math.sin(th)];
          const e2 = [-Math.sin(th), Math.cos(th)];
          api.line(chart, [[p[0] * e1[0], p[0] * e1[1]], [a[0], a[1]]], api.C.grayLight, [3, 3], 1.4);
          api.line(chart, [[p[1] * e2[0], p[1] * e2[1]], [a[0], a[1]]], api.C.grayLight, [3, 3], 1.4);
          api.arrow(chart, 0, 0, p[0] * e1[0], p[0] * e1[1], api.C.gold, 2.4);
          api.arrow(chart, 0, 0, p[1] * e2[0], p[1] * e2[1], api.C.gold, 2.4);

          /* O vetor, que não se altera. */
          api.arrow(chart, 0, 0, a[0], a[1], api.C.green, 3.4, 10);
          api.label(chart, a[0], a[1] + 0.35, "a", api.C.green, "center");

          /* Círculo do módulo invariante. */
          const R = P.norm(a);
          api.line(chart, api.param((t) => [R * Math.cos(t), R * Math.sin(t)], 0, api.TAU, 120), api.C.grid, [], 1.4);
        },

        text(v, api) {
          const a = [v.secondary, v.tertiary];
          const th = P.rad(v.parameter);
          const p = P.rotatePassive(a, th);
          const R = P.norm(a);
          return {
            title: "Componentes em uma base girada",
            subtitle: `θ = ${api.fmt(v.parameter, 0)}° · a = (${api.fmt(a[0], 1)}; ${api.fmt(a[1], 1)})`,
            caption: "O vetor verde nunca se move. O que muda são os números que o representam, e a circunferência cinza mostra que o módulo não é um deles.",
            prediction: "Existe algum θ que anule a′₂? Se existe, quanto vale?",
            calculation: `a′₁ = ${api.fmt(a[0], 1)}·cos${api.fmt(v.parameter, 0)}° + ${api.fmt(a[1], 1)}·sen${api.fmt(v.parameter, 0)}° = <b>${api.fmt(p[0])}</b><br>a′₂ = −${api.fmt(a[0], 1)}·sen${api.fmt(v.parameter, 0)}° + ${api.fmt(a[1], 1)}·cos${api.fmt(v.parameter, 0)}° = <b>${api.fmt(p[1])}</b><em>a′₁² + a′₂² = ${api.fmt(p[0] ** 2 + p[1] ** 2)} = a₁² + a₂²</em>`,
            metrics: [
              ["a′₁", api.fmt(p[0])],
              ["a′₂", api.fmt(p[1])],
              ["|a′|", api.fmt(P.norm(p))],
              ["|a|", api.fmt(R)],
              ["diferença dos módulos", api.sci(Math.abs(P.norm(p) - R))]
            ],
            concept: "Vetor é o objeto geométrico; componentes são a sua representação. λᵀλ = I é exatamente a afirmação de que a representação preserva comprimentos.",
            prompts: [
              "Ache o θ que zera a′₂ e confirme que ele satisfaz tanθ = a₂/a₁.",
              "Compare a rotação de +30° dos eixos com a rotação de −30° do vetor.",
              "Verifique que a diferença dos módulos permanece na ordem do arredondamento para qualquer θ."
            ],
            legend: [[api.C.green, "vetor a"], [api.C.red, "base girada"], [api.C.gold, "componentes novas"]]
          };
        }
      },

      {
        id: "produtos",
        tab: "Produtos<br>escalar e vetorial",
        heading: "Projeção e área",
        equation: "a·b = ab cosθ   |a×b| = ab senθ",
        hint: "Mantenha os módulos e varie apenas o ângulo. Preveja onde cada produto se anula.",
        controls: [
          { id: "parameter", label: "ângulo entre a e b", min: 0, max: 180, step: 1, value: 55, digits: 0, unit: "°" },
          { id: "secondary", label: "módulo de a", min: 0.5, max: 4, step: 0.05, value: 3, digits: 2 },
          { id: "tertiary", label: "módulo de b", min: 0.5, max: 4, step: 0.05, value: 2, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const th = P.rad(v.parameter);
          const a = [v.secondary, 0, 0];
          const b = [v.tertiary * Math.cos(th), v.tertiary * Math.sin(th), 0];

          const chart = api.axes(api.main, -1, 5, -2.4, 4.4, "x", "y");
          /* Paralelogramo cuja área é |a×b|. */
          api.area(chart, [[0, 0], [a[0], 0], [a[0] + b[0], b[1]], [b[0], b[1]], [0, 0]], "rgba(131,196,78,.18)", 0);
          api.line(chart, [[a[0], 0], [a[0] + b[0], b[1]], [b[0], b[1]]], api.C.lime, [4, 4], 1.6);
          /* Projeção de b sobre a. */
          const proj = P.dot(a, b) / (v.secondary || 1);
          api.line(chart, [[proj, 0], [b[0], b[1]]], api.C.grayLight, [3, 3], 1.4);
          api.arrow(chart, 0, 0, proj, 0, api.C.gold, 4.2, 9);
          api.arrow(chart, 0, 0, a[0], 0, api.C.green, 3, 10);
          api.arrow(chart, 0, 0, b[0], b[1], api.C.blue, 3, 10);
          api.label(chart, a[0], -0.35, "a", api.C.green, "center", "top");
          api.label(chart, b[0], b[1] + 0.2, "b", api.C.blue, "center");
          api.label(chart, proj / 2, -0.9, "projeção de b sobre a", api.C.gold, "center", "top");

          const s = api.axes(api.second, 0, 180, -1, 1, "ângulo (°)", "produto / ab");
          api.line(s, api.curve((g) => Math.cos(P.rad(g)), 0, 180, 120), api.C.green);
          api.line(s, api.curve((g) => Math.sin(P.rad(g)), 0, 180, 120), api.C.blue);
          api.hline(s, 0, "#b9c4bb", []);
          api.dot(s, v.parameter, Math.cos(th), api.C.green, 4.5);
          api.dot(s, v.parameter, Math.sin(th), api.C.blue, 4.5);
        },

        text(v, api) {
          const th = P.rad(v.parameter);
          const escalar = v.secondary * v.tertiary * Math.cos(th);
          const vetorial = v.secondary * v.tertiary * Math.sin(th);
          return {
            title: "Projeção e área",
            subtitle: `|a| = ${api.fmt(v.secondary)} · |b| = ${api.fmt(v.tertiary)} · θ = ${api.fmt(v.parameter, 0)}°`,
            caption: "A área sombreada é |a×b| e o segmento laranja é a projeção que define a·b. Os dois se anulam em ângulos opostos.",
            prediction: "Em que ângulo o produto escalar se anula? E o vetorial? Eles podem se anular juntos?",
            calculation: `a·b = ${api.fmt(v.secondary)}·${api.fmt(v.tertiary)}·cos${api.fmt(v.parameter, 0)}° = <b>${api.fmt(escalar)}</b><br>|a×b| = ${api.fmt(v.secondary)}·${api.fmt(v.tertiary)}·sen${api.fmt(v.parameter, 0)}° = <b>${api.fmt(vetorial)}</b><em>(a·b)² + |a×b|² = ${api.fmt(escalar ** 2 + vetorial ** 2)} = (ab)²</em>`,
            metrics: [
              ["a·b", api.fmt(escalar)],
              ["|a×b|", api.fmt(vetorial)],
              ["projeção de b sobre a", api.fmt(v.tertiary * Math.cos(th))],
              ["área do paralelogramo", api.fmt(vetorial)],
              ["(ab)²", api.fmt((v.secondary * v.tertiary) ** 2)]
            ],
            concept: "Um produto mede alinhamento e o outro mede o quanto os vetores deixam de se alinhar; juntos esgotam a informação geométrica do par.",
            prompts: [
              "Confirme que (a·b)² + |a×b|² = (ab)² para três ângulos diferentes.",
              "Ache o ângulo em que os dois produtos têm o mesmo valor.",
              "Explique por que o produto vetorial é um pseudovetor e o escalar não."
            ],
            legend: [[api.C.green, "a e a·b"], [api.C.blue, "b e |a×b|"], [api.C.lime, "área"]],
            secondaryTitle: "Os dois produtos contra o ângulo",
            secondarySubtitle: "normalizados por ab, de modo que só a geometria aparece",
            secondaryCaption: "Cosseno e seno em quadratura: nunca se anulam no mesmo ângulo."
          };
        }
      },

      {
        id: "identidade",
        tab: "Notação<br>indicial",
        heading: "BAC menos CAB",
        equation: "a×(b×c) = b(a·c) − c(a·b)",
        hint: "b e c são fixos. Mova as componentes de a e observe o resíduo entre os dois lados.",
        controls: [
          { id: "parameter", label: "a₁", min: -4, max: 4, step: 0.1, value: 1, digits: 1 },
          { id: "secondary", label: "a₂", min: -4, max: 4, step: 0.1, value: 2, digits: 1 },
          { id: "tertiary", label: "a₃", min: -4, max: 4, step: 0.1, value: -1, digits: 1 }
        ],

        draw(api, v) {
          const a = [v.parameter, v.secondary, v.tertiary];
          const esq = P.doubleCross(a, Bv, Cv);
          const dir = P.bacCab(a, Bv, Cv);
          const lim = Math.max(6, ...esq.map(Math.abs)) * 1.2;

          const chart = api.axes(api.main, 0, 6, -lim, lim, "", "componente", { xTicks: [] });
          api.hline(chart, 0, "#b9c4bb", []);
          api.bars(chart, [
            ["[a×(b×c)]₁", esq[0], api.C.green], ["b(a·c)−c(a·b) |₁", dir[0], api.C.lime],
            ["[a×(b×c)]₂", esq[1], api.C.green], ["… |₂", dir[1], api.C.lime],
            ["[a×(b×c)]₃", esq[2], api.C.green], ["… |₃", dir[2], api.C.lime]
          ], api.C.green, { pad: 12 });
        },

        text(v, api) {
          const a = [v.parameter, v.secondary, v.tertiary];
          const esq = P.doubleCross(a, Bv, Cv);
          const dir = P.bacCab(a, Bv, Cv);
          const res = P.bacCabResidual(a, Bv, Cv);
          const ac = P.dot(a, Cv);
          const ab = P.dot(a, Bv);
          return {
            title: "Os dois lados da identidade",
            subtitle: `a = (${api.fmt(a[0], 1)}; ${api.fmt(a[1], 1)}; ${api.fmt(a[2], 1)}) · b = (0; 3; 2) · c = (−2; 1; 4)`,
            regime: res < 1e-9 ? ["barras coincidem", "ok"] : ["divergência", "alert"],
            caption: "As barras verdes vêm do produto duplo calculado diretamente; as claras, da identidade. Elas coincidem para qualquer a — é isso que εᵢⱼₖεᵢₗₘ = δⱼₗδₖₘ − δⱼₘδₖₗ garante.",
            prediction: "Existe algum a para o qual os dois lados discordem?",
            calculation: `a·c = ${api.fmt(ac)} · a·b = ${api.fmt(ab)}<br>b(a·c) − c(a·b) = <b>(${dir.map((d) => api.fmt(d)).join("; ")})</b><em>resíduo máximo entre os lados: ${api.sci(res)}</em>`,
            metrics: [
              ["a·b", api.fmt(ab)],
              ["a·c", api.fmt(ac)],
              ["[a×(b×c)]₁", api.fmt(esq[0])],
              ["resíduo máximo", api.sci(res)],
              ["a·(b×c)", api.fmt(P.tripleProduct(a, Bv, Cv))]
            ],
            concept: "Uma identidade vetorial não é um truque de memorização: ela é uma consequência algébrica da contração de dois símbolos de Levi-Civita.",
            prompts: [
              "Escolha a paralelo a b e explique por que o resultado fica perpendicular a b, dentro do plano de b e c.",
              "Ache um a que anule o produto duplo e diga o que isso significa geometricamente.",
              "Refaça a contração εᵢⱼₖεₖₗₘ à mão, usando εᵢⱼₖ = εₖᵢⱼ antes de aplicar a identidade."
            ],
            legend: [[api.C.green, "a×(b×c)"], [api.C.lime, "b(a·c) − c(a·b)"]]
          };
        }
      },

      {
        id: "levicivita",
        tab: "O símbolo<br>εᵢⱼₖ",
        heading: "As 27 combinações de índices",
        equation: "(a×b)ᵢ = εᵢⱼₖ aⱼ bₖ",
        hint: "Percorra i, j e k e leia o valor na célula destacada antes de conferir na conta.",
        controls: [
          { id: "parameter", label: "índice i", min: 1, max: 3, step: 1, value: 1, digits: 0 },
          { id: "secondary", label: "índice j", min: 1, max: 3, step: 1, value: 2, digits: 0 },
          { id: "tertiary", label: "índice k", min: 1, max: 3, step: 1, value: 3, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const i = Math.round(v.parameter), j = Math.round(v.secondary), k = Math.round(v.tertiary);
          const { width, height } = api.main;
          /* Três camadas 3×3, uma por i: o mapa inteiro cabe em uma olhada. */
          const cell = Math.min((width - 150) / 9, (height - 96) / 3);
          const vao = 44;
          const largura = cell * 9 + vao * 2;
          const x0 = (width - largura) / 2 + 16;
          const y0 = (height - cell * 3) / 2 + 4;
          for (let ii = 1; ii <= 3; ii += 1) {
            api.matrix(api.main, {
              rows: ["j=1", "j=2", "j=3"], cols: ["k=1", "k=2", "k=3"],
              x: x0 + (ii - 1) * (cell * 3 + vao), y: y0, cell,
              value: (a, b) => P.levi(ii, a + 1, b + 1),
              format: (e) => (e === 0 ? "0" : e > 0 ? "+1" : "−1"),
              selected: ii === i ? [j - 1, k - 1] : null,
              title: `i = ${ii}`,
              colLabel: ii === 3 ? "índice k" : "",
              rowLabel: ii === 1 ? "índice j" : ""
            });
          }

          /* As nove parcelas da componente i: sete zeros e duas sobreviventes. */
          const termos = P.crossTerms(Av, Bv, i);
          const lim = Math.max(1, ...termos.map((t) => Math.abs(t.term))) * 1.35;
          const s = api.axes(api.second, 0, 9, -lim, lim, "", "parcela εᵢⱼₖ aⱼ bₖ", { xTicks: [] });
          api.hline(s, 0, "#b9c4bb", []);
          api.bars(s, termos.map((t) => [`${t.j}${t.k}`, t.term, t.eps === 0 ? "#d7ded7" : t.term >= 0 ? api.C.green : api.C.red]), api.C.green, { pad: 8 });
        },

        text(v, api) {
          const i = Math.round(v.parameter), j = Math.round(v.secondary), k = Math.round(v.tertiary);
          const e = P.levi(i, j, k);
          const inv = P.inversions([i, j, k]);
          const termos = P.crossTerms(Av, Bv, i);
          const vivos = termos.filter((t) => t.eps !== 0);
          const soma = termos.reduce((acc, t) => acc + t.term, 0);
          const direto = P.cross(Av, Bv)[i - 1];
          const sinal = e === 0 ? "0" : e > 0 ? "+1" : "−1";
          return {
            title: "O símbolo de permutação",
            subtitle: `ε${sub(i)}${sub(j)}${sub(k)} = ${sinal} · a = (1; 2; −1) · b = (0; 3; 2)`,
            regime: e === 0 ? ["índice repetido", "warn"] : e > 0 ? ["permutação par", "ok"] : ["permutação ímpar", "ok"],
            caption: "Verde é +1, vermelho é −1, cinza é zero. Vinte e uma das vinte e sete células são nulas por terem índice repetido; das seis restantes, três são pares e três são ímpares.",
            prediction: "Das 27 células, quantas são diferentes de zero? E o que acontece se você trocar dois índices de lugar?",
            calculation: `(${i},${j},${k}) tem ${inv} par${inv === 1 ? "" : "es"} fora de ordem ⟹ ε = <b>${sinal}</b><br>(a×b)${sub(i)} = εᵢⱼₖ aⱼ bₖ = ${vivos.map((t) => `(${t.eps > 0 ? "+" : "−"}1)·${api.fmt(Av[t.j - 1], 0)}·${api.fmt(Bv[t.k - 1], 0)}`).join(" ")} = <b>${api.fmt(soma, 2)}</b><em>produto vetorial calculado direto: ${api.fmt(direto, 2)} — nove parcelas, duas sobrevivem</em>`,
            metrics: [
              [`ε${sub(i)}${sub(j)}${sub(k)}`, sinal],
              ["pares fora de ordem", String(inv)],
              [`ε${sub(j)}${sub(i)}${sub(k)} (i e j trocados)`, api.fmt(P.levi(j, i, k), 0)],
              ["células não nulas", "6 de 27"],
              [`(a×b)${sub(i)} pela soma`, api.fmt(soma, 2)],
              [`(a×b)${sub(i)} direto`, api.fmt(direto, 2)]
            ],
            concept: "A notação indicial não é abreviação: é o que torna cada identidade vetorial demonstrável em vez de decorável. A antissimetria de εᵢⱼₖ é a mesma propriedade que faz a×b trocar de sinal quando se invertem os fatores — e, na Aula 29, a mesma que aparece nos parênteses de Poisson do momento angular.",
            prompts: [
              "Troque i e j e confirme que o sinal inverte em todas as células não nulas.",
              "Explique por que 21 das 27 células são zero sem olhar o mapa.",
              "Reescreva o produto misto a·(b×c) em notação indicial e conte quantas parcelas sobrevivem."
            ],
            legend: [[api.C.green, "+1"], [api.C.red, "−1"], ["#9aa79c", "0"]],
            secondaryTitle: `As nove parcelas de (a×b)${sub(i)}`,
            secondarySubtitle: "rotuladas pelo par (j,k)",
            secondaryCaption: "Sete parcelas são zero antes de qualquer conta: é o símbolo que faz a seleção."
          };
        }
      }
    ]
  };
})();
