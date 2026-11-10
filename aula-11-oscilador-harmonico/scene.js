(function () {
  "use strict";
  const P = window.LessonPhysics;

  /* Meio passo do controle de razão da estação de Lissajous: abaixo disso a razão
     mostrada e a racional mais próxima são indistinguíveis na tela. */
  const TOL_FECHA = 6e-4;

  window.LessonScene = {
    id: "aula11",
    discipline: "Mecânica Clássica · Aula 11",
    title: "Oscilador harmônico simples",
    subtitle: "Por que tantos sistemas diferentes obedecem à mesma equação?",

    stations: [
      {
        id: "condicoes",
        tab: "Amplitude<br>e fase",
        heading: "Do dado inicial à solução",
        equation: "x = A cos(ω₀t − δ)   A = √(x₀² + (v₀/ω₀)²)",
        hint: "Use x₀ e v₀ juntos para achar o quadrante de δ. Um só deles não basta.",
        controls: [
          { id: "parameter", label: "posição inicial x₀", min: -0.3, max: 0.3, step: 0.005, value: 0.1, digits: 3, unit: "m" },
          { id: "secondary", label: "velocidade inicial v₀", min: -1.5, max: 1.5, step: 0.01, value: 0.3, digits: 2, unit: "m/s" },
          { id: "tertiary", label: "constante k", min: 1, max: 24, step: 0.5, value: 8, digits: 1, unit: "N/m" }
        ],
        secondary: true,

        draw(api, v) {
          const m = 0.5;
          const w = P.omega0(v.tertiary, m);
          const A = P.amplitude(v.parameter, v.secondary, w);
          const T = P.period(w);
          const chart = api.axes(api.main, 0, 3 * T, -A * 1.25, A * 1.25, "tempo t (s)", "posição x (m)");
          api.line(chart, api.curve((t) => P.position(t, v.parameter, v.secondary, w), 0, 3 * T, 320), api.C.green);
          api.hline(chart, A, api.C.gold, [5, 4], "+A");
          api.hline(chart, -A, api.C.gold, [5, 4]);
          api.hline(chart, 0, "#b9c4bb", []);
          api.dot(chart, 0, v.parameter, api.C.red, 5.5);
          /* Tangente inicial: a inclinação é v₀. */
          api.line(chart, [[0, v.parameter], [T * 0.22, v.parameter + v.secondary * T * 0.22]], api.C.blue, [5, 4], 2);
          api.label(chart, T * 0.24, v.parameter + v.secondary * T * 0.22, "inclinação v₀", api.C.blue, "left");
          const tPico = P.phase(v.parameter, v.secondary, w) / w;
          const tp = tPico < 0 ? tPico + T : tPico;
          api.dot(chart, tp, A, api.C.gold, 4.5, true);
          api.label(chart, tp, A * 1.1, "δ/ω₀", api.C.gold, "center");

          const s = api.axes(api.second, -A * 1.3, A * 1.3, -A * w * 1.3, A * w * 1.3, "x (m)", "v (m/s)");
          api.line(s, api.param((t) => [P.position(t, v.parameter, v.secondary, w), P.velocity(t, v.parameter, v.secondary, w)], 0, T, 220), api.C.green);
          api.dot(s, v.parameter, v.secondary, api.C.red, 5);
          api.hline(s, 0, "#b9c4bb", []); api.vline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const m = 0.5;
          const w = P.omega0(v.tertiary, m);
          const A = P.amplitude(v.parameter, v.secondary, w);
          const delta = P.phase(v.parameter, v.secondary, w);
          return {
            title: "Solução determinada pelos dados iniciais",
            subtitle: `k = ${api.fmt(v.tertiary, 1)} N/m · m = 0,50 kg · ω₀ = ${api.fmt(w)} rad/s`,
            caption: "A elipse de fase é fechada: a energia não muda. O ponto vermelho é o estado inicial, e ele escolhe onde a elipse começa a ser percorrida.",
            prediction: "Dobrando v₀, a amplitude dobra? E se dobrar x₀?",
            calculation: `ω₀ = √(k/m) = √(${api.fmt(v.tertiary, 1)}/0,5) = <b>${api.fmt(w)} rad/s</b><br>A = √(x₀² + (v₀/ω₀)²) = √(${api.fmt(v.parameter ** 2, 4)} + ${api.fmt((v.secondary / w) ** 2, 4)}) = <b>${api.fmt(A, 4)} m</b><em>δ = atan2(v₀/ω₀ , x₀) = ${api.fmt(delta, 4)} rad</em>`,
            metrics: [
              ["ω₀", `${api.fmt(w)} rad/s`],
              ["período T", `${api.fmt(P.period(w))} s`],
              ["amplitude A", `${api.fmt(A, 4)} m`],
              ["fase δ", `${api.fmt(delta, 4)} rad`],
              ["energia E = ½kA²", `${api.fmt(P.energy(v.parameter, v.secondary, w, m), 4)} J`]
            ],
            concept: "Amplitude e fase não são propriedades do oscilador: são as duas constantes de integração que os dados iniciais fixam.",
            prompts: [
              "Reproduza o exemplo das notas: x₀ = 0,10 m, v₀ = 0,30 m/s, k = 8 N/m.",
              "Ache dois pares (x₀, v₀) diferentes com a mesma amplitude.",
              "Mude apenas o sinal de v₀ e explique o que acontece com δ."
            ],
            legend: [[api.C.green, "x(t)"], [api.C.gold, "±A"], [api.C.red, "estado inicial"]],
            secondaryTitle: "Retrato de fase",
            secondarySubtitle: "elipse fechada, percorrida no sentido horário",
            secondaryCaption: "Fechada porque E se conserva — na Aula 12 ela vira espiral."
          };
        }
      },

      {
        id: "energia",
        tab: "Partição<br>de energia",
        heading: "T e U ao longo do ciclo",
        equation: "E = ½mv² + ½kx² = ½kA²",
        hint: "Acompanhe onde cada parcela é máxima. Preveja a média temporal de cada uma.",
        controls: [
          { id: "parameter", label: "amplitude A", min: 0.02, max: 0.4, step: 0.005, value: 0.15, digits: 3, unit: "m" },
          { id: "secondary", label: "constante k", min: 1, max: 24, step: 0.5, value: 8, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "instante t", min: 0, max: 3, step: 0.01, value: 0.3, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 5 },

        draw(api, v) {
          const m = 0.5;
          const w = P.omega0(v.secondary, m);
          const T = P.period(w);
          const E = 0.5 * v.secondary * v.parameter ** 2;
          const chart = api.axes(api.main, 0, 2 * T, 0, E * 1.2, "tempo t (s)", "energia (J)");
          const K = (t) => P.kinetic(t, v.parameter, 0, w, m);
          const V = (t) => P.potential(t, v.parameter, 0, w, m);
          api.area(chart, api.curve(V, 0, 2 * T, 260), "rgba(69,123,157,.18)", 0);
          api.line(chart, api.curve(V, 0, 2 * T, 260), api.C.blue);
          api.line(chart, api.curve(K, 0, 2 * T, 260), api.C.red);
          api.line(chart, api.curve((t) => K(t) + V(t), 0, 2 * T, 120), api.C.green, [], 3);
          api.hline(chart, E / 2, api.C.gold, [5, 4], "média de cada parcela = E/2");
          const tt = Math.min(v.tertiary, 2 * T);
          api.dot(chart, tt, K(tt), api.C.red, 4.5);
          api.dot(chart, tt, V(tt), api.C.blue, 4.5);
        },

        text(v, api) {
          const m = 0.5;
          const w = P.omega0(v.secondary, m);
          const E = 0.5 * v.secondary * v.parameter ** 2;
          const K = P.kinetic(v.tertiary, v.parameter, 0, w, m);
          const V = P.potential(v.tertiary, v.parameter, 0, w, m);
          return {
            title: "Troca entre cinética e potencial",
            subtitle: `A = ${api.fmt(v.parameter, 3)} m · k = ${api.fmt(v.secondary, 1)} N/m · ω₀ = ${api.fmt(w)} rad/s`,
            caption: "As duas parcelas oscilam com o dobro da frequência do movimento e em oposição; a soma é a reta verde.",
            prediction: "As médias temporais de T e U são iguais? Quanto vale cada uma?",
            calculation: `E = ½kA² = ½·${api.fmt(v.secondary, 1)}·${api.fmt(v.parameter ** 2, 5)} = <b>${api.fmt(E, 5)} J</b><br>em t = ${api.fmt(v.tertiary)} s: K = ${api.fmt(K, 5)} J, V = ${api.fmt(V, 5)} J<em>soma = ${api.fmt(K + V, 5)} J, constante em todo instante</em>`,
            metrics: [
              ["energia total E", `${api.fmt(E, 5)} J`],
              ["T no instante", `${api.fmt(K, 5)} J`],
              ["U no instante", `${api.fmt(V, 5)} J`],
              ["T + U", `${api.fmt(K + V, 5)} J`],
              ["média de T = média de U", `${api.fmt(E / 2, 5)} J`],
              ["frequência da energia", `${api.fmt(2 * w)} rad/s`]
            ],
            concept: "A energia circula entre as duas formas com o dobro da frequência do movimento, e em média se reparte exatamente ao meio.",
            prompts: [
              "Localize os instantes em que T = U e relacione-os com x = ±A/√2.",
              "Dobre A e confirme que E quadruplica.",
              "Explique por que as parcelas oscilam com 2ω₀ e não com ω₀."
            ],
            legend: [[api.C.red, "cinética"], [api.C.blue, "potencial"], [api.C.green, "total"]]
          };
        }
      },

      {
        id: "respiratorio",
        tab: "Elastância<br>respiratória",
        heading: "Mola, massa e atrito são papéis",
        equation: "I V̈ + E_l V = 0   ω₀ = √(E_l/I)   E_l = 1/C",
        hint: "Compare com o oscilador mecânico: o que faz o papel de k, e o que faz o papel de m?",
        controls: [
          { id: "parameter", label: "complacência C", min: 0.02, max: 0.3, step: 0.005, value: 0.1, digits: 3, unit: "L/cmH₂O" },
          { id: "secondary", label: "inertância I", min: 0.002, max: 0.05, step: 0.001, value: 0.01, digits: 3, unit: "cmH₂O·s²/L" },
          { id: "tertiary", label: "instante t", min: 0, max: 1.2, step: 0.005, value: 0.3, digits: 3, unit: "s" }
        ],
        animate: { control: "tertiary", period: 5 },
        secondary: true,

        draw(api, v) {
          const w = P.respiratoryOmega(v.parameter, v.secondary);
          const T = P.period(w);
          const chart = api.axes(api.main, 0, Math.min(1.2, 4 * T), -1.2, 1.2, "tempo t (s)", "volume relativo V/V₀");
          api.line(chart, api.curve((t) => Math.cos(w * t), 0, Math.min(1.2, 4 * T), 400), api.C.green);
          api.hline(chart, 0, "#b9c4bb", []);
          api.dot(chart, Math.min(v.tertiary, 1.2), Math.cos(w * Math.min(v.tertiary, 1.2)), api.C.red, 5);
          api.vline(chart, T, api.C.gold, [5, 4], `T = ${api.fmt(T, 3)} s`);

          const s = api.axes(api.second, 0.02, 0.3, 0, 12, "complacência C (L/cmH₂O)", "frequência (Hz)");
          api.line(s, api.curve((c) => P.hertz(P.respiratoryOmega(c, v.secondary)), 0.02, 0.3, 120), api.C.blue);
          api.hline(s, 5, api.C.gold, [5, 4], "≈ 5 Hz: resultado do modelo livre");
          api.dot(s, v.parameter, P.hertz(w), api.C.red, 4.5);
        },

        text(v, api) {
          const w = P.respiratoryOmega(v.parameter, v.secondary);
          const f = P.hertz(w);
          const El = P.elastance(v.parameter);
          return {
            title: "Oscilação livre do sistema respiratório",
            subtitle: `C = ${api.fmt(v.parameter, 3)} L/cmH₂O · I = ${api.fmt(v.secondary, 3)} cmH₂O·s²/L`,
            regime: f > 3 && f < 8 ? ["modelo quase-estático (não é a Fres medida)", "ok"] : ["fora da faixa deste modelo", "warn"],
            caption: "A mesma equação do bloco e da mola, com volume no lugar de posição e pressão no lugar de força. A frequência natural cai em poucos hertz.",
            prediction: "Um pulmão mais complacente oscila mais rápido ou mais devagar?",
            calculation: `E_l = 1/C = 1/${api.fmt(v.parameter, 3)} = <b>${api.fmt(El, 2)} cmH₂O/L</b><br>ω₀ = √(E_l/I) = √(${api.fmt(El, 2)}/${api.fmt(v.secondary, 3)}) = <b>${api.fmt(w, 2)} rad/s</b><em>f = ω₀/2π = ${api.fmt(f, 2)} Hz — a base da técnica de oscilações forçadas</em>`,
            metrics: [
              ["elastância E_l", `${api.fmt(El, 2)} cmH₂O/L`],
              ["ω₀", `${api.fmt(w, 2)} rad/s`],
              ["frequência", `${api.fmt(f, 2)} Hz`],
              ["período", `${api.fmt(P.period(w), 3)} s`],
              ["papel de k", "elastância E_l"],
              ["papel de m", "inertância I"]
            ],
            concept: "Mola, massa e atrito são papéis em uma equação, não objetos: qualquer sistema que armazene energia de duas formas complementares oscila.",
            prompts: [
              "Confirme que aumentar a complacência abaixa a frequência natural.",
              "Ache o par (C, I) que dá exatamente 5,0 Hz.",
              "Diga o que ainda falta neste modelo para descrever o pulmão real — e em que aula ele entra."
            ],
            legend: [[api.C.green, "volume"], [api.C.gold, "período"]],
            secondaryTitle: "Frequência natural contra complacência",
            secondarySubtitle: "cai como 1/√C",
            secondaryCaption: "A Aula 12 acrescenta a resistência e a Aula 13 o forçamento, que transforma isto em medida clínica."
          };
        }
      },

      {
        id: "lissajous",
        tab: "Figuras<br>de Lissajous",
        heading: "Dois harmônicos perpendiculares",
        equation: "x = A cos(ω_x t)   ·   y = A cos(ω_y t + δ)",
        hint: "Pare em razões simples — 1, 2, 3/2, 4/3 — e conte as tangências antes de ler o valor.",
        controls: [
          { id: "parameter", label: "razão ω_y/ω_x", min: 0.5, max: 4, step: 0.001, value: 1.5, digits: 3 },
          { id: "secondary", label: "defasagem δ", min: 0, max: 360, step: 1, value: 90, digits: 0, unit: "°" },
          { id: "tertiary", label: "instante t", min: 0, max: 40, step: 0.05, value: 40, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 14 },
        secondary: true,

        draw(api, v) {
          const wx = 1, wy = v.parameter, d = (v.secondary * Math.PI) / 180;
          const [pn, qn, erro] = P.nearestRatio(wy / wx, 12);
          /* O controle anda de 0,001 em 0,001, então uma razão a menos de meio passo
             da racional mais próxima é, para todos os efeitos, aquela racional. */
          const fecha = erro < TOL_FECHA;
          /* Se a razão for (quase) racional, um período basta; senão a curva enche a caixa. */
          const Tfecha = P.lissajousPeriod(wx, pn, qn);
          const Tdesenho = fecha ? Tfecha : Math.max(Tfecha, 40);

          const chart = api.axes(api.main, -1.9, 1.9, -1.18, 1.18, "x / A", "y / A");
          /* Caixa envolvente: é nos seus lados que se contam as tangências. */
          api.line(chart, [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]], "#cbd8cb", [4, 4], 1.4);
          api.line(chart, api.param((t) => P.lissajous(t, 1, 1, wx, wy, d), 0, Tdesenho, 2400), "#cbd8cb", [], 1.6);
          api.line(chart, api.param((t) => P.lissajous(t, 1, 1, wx, wy, d), 0, Math.max(0.01, v.tertiary), 1600), api.C.green, [], 2.6);
          const [x, y] = P.lissajous(v.tertiary, 1, 1, wx, wy, d);
          api.dot(chart, x, y, api.C.red, 5.5);
          /* Projeções: cada eixo vê um harmônico simples e nada mais. */
          api.line(chart, [[x, -1.18], [x, y]], api.C.gold, [3, 3], 1.3);
          api.line(chart, [[-1.9, y], [x, y]], api.C.blue, [3, 3], 1.3);
          api.label(chart, 1.86, 1.06, fecha ? `${pn}:${qn} — curva fechada` : "razão irracional — não fecha", fecha ? api.C.green : api.C.gray, "right");

          const s = api.axes(api.second, 0, 40, -1.25, 1.25, "tempo t (s)", "x, y");
          api.line(s, api.curve((t) => Math.cos(wx * t), 0, 40, 900), api.C.gold, [], 2.2);
          api.line(s, api.curve((t) => Math.cos(wy * t + d), 0, 40, 900), api.C.blue, [4, 3], 2.2);
          api.vline(s, v.tertiary, api.C.red, [3, 3]);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const wx = 1, wy = v.parameter, d = (v.secondary * Math.PI) / 180;
          const [pn, qn, erro] = P.nearestRatio(wy / wx, 12);
          const fechada = erro < TOL_FECHA;
          const Tfecha = P.lissajousPeriod(wx, pn, qn);
          const [x, y] = P.lissajous(v.tertiary, 1, 1, wx, wy, d);
          return {
            title: "Composição de dois harmônicos",
            subtitle: `ω_y/ω_x = ${api.fmt(wy, 3)} · δ = ${api.fmt(v.secondary, 0)}° · t = ${api.fmt(v.tertiary)} s`,
            regime: fechada ? [`fecha em ${pn}:${qn}`, "ok"] : ["não fecha", "warn"],
            caption: "Cada eixo, isoladamente, vê um oscilador harmônico simples. A figura só existe porque olhamos os dois ao mesmo tempo — e ela codifica a razão das frequências e a defasagem.",
            prediction: "Antes de mover a razão: quantas vezes a curva vai tocar o lado de cima da caixa quando ω_y/ω_x = 3/2?",
            calculation: `ω_y/ω_x = ${api.fmt(wy, 3)} ≈ <b>${pn}/${qn}</b>, com erro ${api.sci(erro, 2)}<br>T de fechamento = 2πq/ω_x = 2π·${qn}/${api.fmt(wx, 0)} = <b>${api.fmt(Tfecha)} s</b><em>tangências: ${pn} no lado horizontal e ${qn} no vertical — a razão lida direto do desenho</em>`,
            metrics: [
              ["razão reduzida", `${pn} : ${qn}`],
              ["erro da aproximação", api.sci(erro, 2)],
              ["T de fechamento", fechada ? `${api.fmt(Tfecha)} s` : "não fecha"],
              ["tangências horizontais", String(pn)],
              ["tangências verticais", String(qn)],
              ["ponto (x,y)", `(${api.fmt(x)}; ${api.fmt(y)})`]
            ],
            concept: "Com ω_y = ω_x a figura é a elipse de fase da estação 1, e δ escolhe a sua abertura: 0° dá uma reta, 90° dá o círculo. As demais razões mostram que um movimento perfeitamente determinado pode parecer desordenado quando a razão das frequências é irracional — a curva nunca se repete e acaba preenchendo a caixa, sem que nada de aleatório exista nas equações.",
            prompts: [
              "Fixe a razão em 1 e varra δ de 0° a 180°: descreva a família de curvas obtida.",
              "Ache duas razões que produzam a mesma figura com defasagens diferentes.",
              "Ponha a razão em 1,414 e explique por que a curva não fecha, apesar de o movimento ser periódico em cada eixo."
            ],
            legend: [[api.C.green, "trecho percorrido"], ["#cbd8cb", "figura completa"], [api.C.gold, "x(t)"], [api.C.blue, "y(t)"]],
            secondaryTitle: "Os dois harmônicos separados",
            secondarySubtitle: "cada um é a estação 1, sem novidade nenhuma",
            secondaryCaption: "Toda a riqueza da figura vem da razão entre as frequências, não da complexidade de cada movimento."
          };
        }
      }
    ]
  };
})();
