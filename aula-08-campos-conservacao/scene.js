(function () {
  "use strict";
  const P = window.LessonPhysics;
  const A = [0, 0], B = [2, 1.5];

  window.LessonScene = {
    id: "aula08",
    discipline: "Mecânica Clássica · Aula 8",
    title: "Campos, potenciais e conservação",
    subtitle: "O que separa um campo que admite potencial de um que não admite?",

    stations: [
      {
        id: "conservativo",
        tab: "Trabalho e<br>caminho",
        heading: "Campo de teste",
        equation: "F = (2xy + λy , x² − λx)   ∇×F|_z = −2λ",
        hint: "Em λ = 0 o campo é o do exemplo resolvido. Deforme o caminho antes de mexer em λ.",
        controls: [
          { id: "parameter", label: "parte rotacional λ", min: -1.2, max: 1.2, step: 0.02, value: 0, digits: 2 },
          { id: "secondary", label: "deformação do caminho", min: -2, max: 2, step: 0.05, value: 1.2, digits: 2 },
          { id: "tertiary", label: "densidade das setas", min: 6, max: 16, step: 1, value: 11, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const chart = api.axes(api.main, -0.6, 2.6, -0.9, 2.4, "x", "y");
          api.field(chart, (x, y) => P.field(x, y, v.parameter), "#c3d2c4", v.tertiary, Math.round(v.tertiary * 0.7), 0.6);
          api.line(chart, api.param((s) => P.path(s, A, B, 0), 0, 1, 90), api.C.blue, [], 3);
          api.line(chart, api.param((s) => P.path(s, A, B, v.secondary), 0, 1, 120), api.C.red, [], 3);
          api.dot(chart, A[0], A[1], api.C.ink, 5.5);
          api.dot(chart, B[0], B[1], api.C.ink, 5.5);
          api.label(chart, A[0] - 0.06, A[1] - 0.12, "A", api.C.ink, "right", "top");
          api.label(chart, B[0] + 0.07, B[1] + 0.05, "B", api.C.ink, "left");
          api.label(chart, 1, P.path(0.5, A, B, 0)[1] - 0.16, "C₁ reto", api.C.blue, "center", "top");
          api.label(chart, 1, P.path(0.5, A, B, v.secondary)[1] + 0.12, "C₂ deformado", api.C.red, "center");

          const s = api.axes(api.second, -1.2, 1.2, -5, 5, "λ", "circulação ∮F·dr");
          api.line(s, api.curve((l) => P.circulation(A, B, v.secondary, l, 120), -1.2, 1.2, 40), api.C.gold);
          api.hline(s, 0, "#b9c4bb", []);
          api.vline(s, 0, api.C.green, [4, 4], "conservativo");
          api.dot(s, v.parameter, P.circulation(A, B, v.secondary, v.parameter), api.C.red, 4.5);
        },

        text(v, api) {
          const w1 = P.work(A, B, 0, v.parameter);
          const w2 = P.work(A, B, v.secondary, v.parameter);
          const circ = w2 - w1;
          const dV = P.potential(A[0], A[1]) - P.potential(B[0], B[1]);
          const cons = Math.abs(v.parameter) < 1e-9;
          return {
            title: "Trabalho ao longo de dois caminhos",
            subtitle: `λ = ${api.fmt(v.parameter)} · deformação = ${api.fmt(v.secondary)}`,
            regime: cons ? ["conservativo", "ok"] : Math.abs(circ) < 0.05 ? ["quase conservativo", "warn"] : ["não conservativo", "alert"],
            caption: "Os dois caminhos ligam os mesmos pontos. Se o trabalho coincidir para qualquer deformação, existe potencial; se não, nenhuma função U pode ser construída.",
            prediction: "Deformar o caminho muda o trabalho? Decida antes de mover o controle.",
            calculation: `∇×F|_z = (2x − λ) − (2x + λ) = <b>−2λ = ${api.fmt(-2 * v.parameter)}</b><br>W(C₁) = ${api.fmt(w1, 4)} · W(C₂) = ${api.fmt(w2, 4)}<em>${cons ? `ambos iguais a U(A) − U(B) = ${api.fmt(dV, 4)}` : `circulação ∮ = ${api.fmt(circ, 4)} ≠ 0: não há potencial`}</em>`,
            metrics: [
              ["∇×F|_z", api.fmt(-2 * v.parameter)],
              ["W pelo caminho reto", api.fmt(w1, 4)],
              ["W pelo deformado", api.fmt(w2, 4)],
              ["circulação", api.fmt(circ, 4)],
              ["U(A) − U(B)", api.fmt(dV, 4)]
            ],
            concept: "O rotacional nulo é a condição local; a independência do caminho é a consequência global — e elas só são equivalentes em domínios simplesmente conexos.",
            prompts: [
              "Com λ = 0, teste três deformações diferentes e confirme que o trabalho não muda.",
              "Mostre que a circulação cresce proporcionalmente a λ e à área encerrada.",
              "Explique por que ∇×F = 0 não basta em um domínio com furo."
            ],
            legend: [[api.C.blue, "caminho reto"], [api.C.red, "caminho deformado"]],
            secondaryTitle: "Circulação contra λ",
            secondarySubtitle: "reta pela origem: a circulação é a integral do rotacional constante",
            secondaryCaption: "O zero em λ = 0 é o único ponto em que o potencial existe."
          };
        }
      },

      {
        id: "potencial",
        tab: "Potencial e<br>gradiente",
        heading: "U = −x²y e F = −∇U",
        equation: "Fₓ = −∂U/∂x = 2xy   F_y = −∂U/∂y = x²",
        hint: "As setas devem cruzar as curvas de nível perpendicularmente, apontando para U decrescente.",
        controls: [
          { id: "parameter", label: "posição x do ponto", min: -2.2, max: 2.2, step: 0.05, value: 1.2, digits: 2 },
          { id: "secondary", label: "posição y do ponto", min: -2.2, max: 2.2, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "número de curvas de nível", min: 5, max: 21, step: 2, value: 13, digits: 0 }
        ],

        draw(api, v) {
          const chart = api.axes(api.main, -2.4, 2.4, -2.4, 2.4, "x", "y");
          /* Curvas de nível de U = −x²y: para cada nível c, y = −c/x². */
          const niveis = [];
          const n = Math.floor(v.tertiary / 2);
          for (let i = -n; i <= n; i += 1) if (i !== 0) niveis.push(i * 0.8);
          niveis.forEach((c) => {
            const cor = c > 0 ? "#b9cfe4" : "#e4c9b9";
            for (const sinal of [1, -1]) {
              api.line(chart, api.curve((x) => -c / (x * x), sinal * 0.42, sinal * 2.4, 120), cor, [], 1.5);
            }
          });
          api.line(chart, [[-2.4, 0], [2.4, 0]], api.C.grayLight, [4, 4], 1.4);
          api.line(chart, [[0, -2.4], [0, 2.4]], api.C.grayLight, [4, 4], 1.4);
          api.field(chart, (x, y) => P.field(x, y, 0), "#a9bcaa", 13, 13, 0.55);

          const [Fx, Fy] = P.field(v.parameter, v.secondary, 0);
          const norm = Math.hypot(Fx, Fy) || 1;
          api.arrow(chart, v.parameter, v.secondary, v.parameter + (Fx / norm) * 0.8, v.secondary + (Fy / norm) * 0.8, api.C.red, 3.2, 10);
          api.dot(chart, v.parameter, v.secondary, api.C.ink, 5);
          api.label(chart, v.parameter + (Fx / norm) * 0.9, v.secondary + (Fy / norm) * 0.9, "F", api.C.red, "left");
        },

        text(v, api) {
          const [Fx, Fy] = P.field(v.parameter, v.secondary, 0);
          const U = P.potential(v.parameter, v.secondary);
          return {
            title: "Curvas de nível e o campo que delas deriva",
            subtitle: `ponto (${api.fmt(v.parameter)} ; ${api.fmt(v.secondary)}) · U = ${api.fmt(U)}`,
            caption: "As curvas são níveis de U = −x²y. A seta vermelha é −∇U no ponto: perpendicular ao nível e apontando para onde U decresce.",
            prediction: "Onde no plano a força se anula? É um ponto ou uma linha inteira?",
            calculation: `U(x,y) = −x²y = −(${api.fmt(v.parameter)})²·${api.fmt(v.secondary)} = <b>${api.fmt(U)}</b><br>F = (2xy , x²) = (<b>${api.fmt(Fx)}</b> , <b>${api.fmt(Fy)}</b>)<em>|F| = ${api.fmt(Math.hypot(Fx, Fy))}; F_y = x² nunca é negativo</em>`,
            metrics: [
              ["U no ponto", api.fmt(U)],
              ["Fₓ = 2xy", api.fmt(Fx)],
              ["F_y = x²", api.fmt(Fy)],
              ["|F|", api.fmt(Math.hypot(Fx, Fy))],
              ["∇×F", "0"]
            ],
            concept: "O potencial é escalar e soma-se sem componentes; o campo se recupera dele por uma derivada. É por isso que trabalhar com U costuma ser mais barato.",
            prompts: [
              "Ache toda a região em que F se anula e descreva-a geometricamente.",
              "Confirme que a seta é perpendicular à curva de nível em três pontos.",
              "Explique por que F_y não muda de sinal, embora Fₓ mude."
            ],
            legend: [["#b9cfe4", "U > 0"], ["#e4c9b9", "U < 0"], [api.C.red, "F = −∇U"]]
          };
        }
      },

      {
        id: "lorentz",
        tab: "Partícula<br>carregada",
        heading: "Campos E e B uniformes",
        equation: "F = q(E + v×B)   R = mv/|q|B   ω_c = |q|B/m",
        hint: "Comece com E = 0 e órbita fechada. Depois ligue E e veja o que aparece.",
        controls: [
          { id: "parameter", label: "campo magnético B", min: 0.3, max: 4, step: 0.05, value: 2, digits: 2, unit: "T" },
          { id: "secondary", label: "campo elétrico E", min: 0, max: 8, step: 0.1, value: 0, digits: 1, unit: "V/m" },
          { id: "tertiary", label: "rapidez inicial v₀", min: 0.5, max: 6, step: 0.1, value: 3, digits: 1, unit: "m/s" }
        ],
        secondary: true,

        draw(api, v) {
          const q = 1, m = 1;   /* q/m = 1 C/kg: ω_c = B (rad/s) e R = v/B (m) */
          const w = P.cyclotron(q, v.parameter, m);
          const T = (2 * Math.PI) / w;
          const R = P.gyroradius(m, v.tertiary, q, v.parameter);
          const d = P.driftSpeed(v.secondary, v.parameter);
          const tf = 3 * T;
          const xs = [];
          for (let i = 0; i <= 600; i += 1) xs.push(P.lorentzPath((tf * i) / 600, v.tertiary, 0, v.secondary, v.parameter, q, m));
          const xmax = Math.max(2 * R, d * tf) * 1.15 + R;
          const chart = api.axes(api.main, -R * 1.5, Math.max(xmax, R * 2), -2.6 * R, 1.2 * R, "x (m)", "y (m)");
          api.line(chart, xs, api.C.green, [], 2.6);
          if (v.secondary > 0) {
            api.line(chart, [[0, -R], [d * tf, -R]], api.C.gold, [6, 4], 2);
            api.label(chart, d * tf * 0.5, -R * 1.18, "deriva E/B", api.C.gold, "center", "top");
          }
          api.dot(chart, 0, 0, api.C.red, 5);
          api.label(chart, 0, R * 0.2, "início", api.C.red, "center");

          const s = api.axes(api.second, 0, tf, -v.tertiary * 1.3 - Math.abs(d), v.tertiary * 1.3 + Math.abs(d), "tempo t (s)", "velocidade (m/s)");
          const vx = api.curve((t) => d + (v.tertiary - d) * Math.cos(w * t), 0, tf, 200);
          const vy = api.curve((t) => -(v.tertiary - d) * Math.sin(w * t), 0, tf, 200);
          api.line(s, vx, api.C.blue);
          api.line(s, vy, api.C.red);
          api.line(s, api.curve((t) => Math.hypot(d + (v.tertiary - d) * Math.cos(w * t), -(v.tertiary - d) * Math.sin(w * t)), 0, tf, 200), api.C.gold, [5, 4], 2);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const q = 1, m = 1;   /* q/m = 1 C/kg: ω_c = B (rad/s) e R = v/B (m) */
          const w = P.cyclotron(q, v.parameter, m);
          const R = P.gyroradius(m, v.tertiary, q, v.parameter);
          const d = P.driftSpeed(v.secondary, v.parameter);
          const semE = v.secondary === 0;
          return {
            title: "Trajetória em campos uniformes",
            subtitle: `B = ${api.fmt(v.parameter)} T · E = ${api.fmt(v.secondary, 1)} V/m · v₀ = ${api.fmt(v.tertiary, 1)} m/s · q/m = 1 C/kg`,
            regime: semE ? ["órbita fechada", "ok"] : ["ciclóide com deriva", "warn"],
            caption: "Com E = 0 a trajetória fecha e a rapidez é constante — o campo magnético não realiza trabalho. Ligar E acrescenta uma deriva perpendicular a ambos os campos.",
            prediction: "Ligando E, a partícula acelera indefinidamente na direção de E?",
            calculation: `ω_c = |q|B/m = ${api.fmt(v.parameter)}/1 = <b>${api.fmt(w)} rad/s</b><br>R = mv/|q|B = ${api.fmt(v.tertiary, 1)}/${api.fmt(v.parameter)} = <b>${api.fmt(R)} m</b><em>deriva E/B = ${api.fmt(d)} m/s, perpendicular a E e a B</em>`,
            metrics: [
              ["ω_c", `${api.fmt(w)} rad/s`],
              ["período 2π/ω_c", `${api.fmt((2 * Math.PI) / w)} s`],
              ["raio R", `${api.fmt(R)} m`],
              ["deriva E/B", `${api.fmt(d)} m/s`],
              ["potência magnética", "0"]
            ],
            concept: "A frequência de cíclotron não depende da rapidez: é por isso que um cíclotron pode acelerar partículas com campo de radiofrequência fixo.",
            prompts: [
              "Confirme que ω_c não muda ao variar v₀, mas R muda.",
              "Ligue E e verifique que a deriva é perpendicular a E, e não paralela.",
              "Mostre que a rapidez é constante quando E = 0, e explique por quê."
            ],
            legend: [[api.C.green, "trajetória"], [api.C.gold, "deriva E/B"]],
            secondaryTitle: "Componentes da velocidade",
            secondarySubtitle: "a curva tracejada é a rapidez",
            secondaryCaption: semE ? "Com E = 0 a rapidez é rigorosamente constante." : "Com E ≠ 0 a rapidez oscila: é o campo elétrico que realiza trabalho."
          };
        }
      }
    ]
  };
})();
