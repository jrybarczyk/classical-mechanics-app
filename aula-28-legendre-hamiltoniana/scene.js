(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula28",
    discipline: "Mecânica Clássica · Aula 27",
    title: "Da lagrangiana à hamiltoniana",
    subtitle: "Trocar q̇ por p é apenas renomear, ou é uma operação com conteúdo?",

    stations: [
      {
        id: "legendre",
        tab: "Transformação<br>de Legendre",
        heading: "A curva pelas suas tangentes",
        equation: "g(p) = p·v(p) − f(v(p)),  com p = df/dv",
        hint: "Acompanhe onde a tangente corta o eixo vertical. Esse intercepto é −g(p).",
        controls: [
          { id: "parameter", label: "inclinação p", min: -6, max: 8, step: 0.1, value: 3, digits: 2 },
          { id: "secondary", label: "coeficiente quadrático a", min: 0.5, max: 4, step: 0.05, value: 2, digits: 2 },
          { id: "tertiary", label: "coeficiente quártico c", min: 0, max: 0.6, step: 0.01, value: 0, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const a = v.secondary, c = v.tertiary;
          const vp = P.vFromP(v.parameter, a, c);
          const gp = P.legendre(v.parameter, a, c);
          /* Eixo v cresce para conter o ponto de tangência v(p): com p = 8 e a = 0,5 ele
             está em v = 16 e o marcador saía do quadro (limite fixo antigo: 2,6). */
          const lim = Math.max(2.6, Math.abs(vp) * 1.2);
          const chart = api.axes(api.main, -lim, lim, -Math.max(3, gp * 1.4 + 1), Math.max(P.f(lim, a, c), v.parameter * vp) * 1.1, "v", "f(v)");
          api.line(chart, api.curve((x) => P.f(x, a, c), -lim, lim, 220), api.C.green, [], 3.2);
          /* Reta pv e tangente de inclinação p. */
          api.line(chart, api.curve((x) => v.parameter * x, -lim, lim, 2), api.C.grayLight, [3, 4], 1.6);
          api.line(chart, api.curve((x) => v.parameter * x - gp, -lim, lim, 2), api.C.red, [], 2.4);
          api.dot(chart, vp, P.f(vp, a, c), api.C.ink, 5.5);
          api.dot(chart, 0, -gp, api.C.gold, 5.5);
          api.label(chart, 0.12, -gp - 0.15, "−g(p)", api.C.gold, "left", "top");
          /* Distância vertical máxima entre pv e f, que é g(p). */
          api.arrow(chart, vp, P.f(vp, a, c), vp, v.parameter * vp, api.C.blue, 2.2, 8);
          api.label(chart, vp + 0.12, (P.f(vp, a, c) + v.parameter * vp) / 2, "g(p)", api.C.blue, "left");
          api.label(chart, lim * 0.92, v.parameter * lim * 0.92, "pv", api.C.grayLight, "right");

          const s = api.axes(api.second, -6, 8, 0, P.legendre(8, a, c) * 1.1, "p", "g(p)");
          api.line(s, api.curve((pp) => P.legendre(pp, a, c), -6, 8, 90), api.C.blue, [], 2.8);
          api.dot(s, v.parameter, gp, api.C.red, 5);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const a = v.secondary, c = v.tertiary;
          const vp = P.vFromP(v.parameter, a, c);
          const gp = P.legendre(v.parameter, a, c);
          const dg = P.dLegendre(v.parameter, a, c);
          const volta = P.doubleLegendre(vp, a, c);
          return {
            title: "Geometria da transformada",
            subtitle: `p = ${api.fmt(v.parameter)} · a = ${api.fmt(a)} · c = ${api.fmt(c)}`,
            caption: "Para cada inclinação existe um único ponto de tangência. Descrever a curva por seus pontos ou por suas tangentes é equivalente — e é isso que Legendre codifica.",
            prediction: "A transformada de uma parábola é o quê? E aplicar a operação duas vezes devolve o quê?",
            calculation: `p = f′(v) = av + 4cv³ ⟹ v(p) = <b>${api.fmt(vp, 4)}</b><br>g(p) = p·v − f(v) = ${api.fmt(v.parameter)}·${api.fmt(vp, 4)} − ${api.fmt(P.f(vp, a, c), 4)} = <b>${api.fmt(gp, 4)}</b><em>dg/dp = ${api.fmt(dg, 4)}, que é v(p): a operação é simétrica</em>`,
            metrics: [
              ["v(p)", api.fmt(vp, 4)],
              ["g(p)", api.fmt(gp, 4)],
              ["dg/dp", api.fmt(dg, 4)],
              ["intercepto da tangente", api.fmt(-gp, 4)],
              ["f após dupla Legendre", api.fmt(volta, 4)],
              ["f(v) original", api.fmt(P.f(vp, a, c), 4)]
            ],
            concept: "A transformação exige convexidade: sem ela a correspondência entre inclinação e ponto de tangência deixaria de ser um-para-um, e a inversão p ↔ q̇ falharia.",
            prompts: [
              "Com c = 0, confirme que g(p) = p²/2a.",
              "Verifique que aplicar Legendre duas vezes devolve f.",
              "Ligue o termo quártico e observe g deixar de ser parábola."
            ],
            legend: [[api.C.green, "f(v)"], [api.C.red, "tangente"], [api.C.blue, "g(p)"]],
            secondaryTitle: "A transformada g(p)",
            secondarySubtitle: "também convexa, como tem de ser",
            secondaryCaption: "Convexidade preservada é o que garante a involução."
          };
        }
      },

      {
        id: "hamiltoniana",
        tab: "Construindo<br>H",
        heading: "Força central em quatro passos",
        equation: "H = p_r²/2m + p_θ²/2mr² + U(r)",
        hint: "Confira o passo 4: nenhum q̇ pode sobrar na expressão final.",
        controls: [
          { id: "parameter", label: "raio r", min: 0.4, max: 4, step: 0.05, value: 1.5, digits: 2, unit: "m" },
          { id: "secondary", label: "momento radial p_r", min: -3, max: 3, step: 0.05, value: 0.8, digits: 2 },
          { id: "tertiary", label: "momento angular p_θ", min: 0, max: 5, step: 0.05, value: 2, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const m = 2, k = 3;
          const Vef = (r) => P.centrifugalTerm(v.tertiary, r, m) - k / r;
          const H = P.centralH(v.secondary, v.tertiary, v.parameter, m, -k / v.parameter);
          /* Janela vertical: parte de ±4 J e cresce até conter o marcador, H e U(r) no raio
             escolhido (com p_θ = 5 e r = 0,4 o potencial efetivo chega a ~31 J; com p_θ = 0
             o poço −k/r chega a −7,5 J). A barreira em r → 0 continua cortada de propósito. */
          const yAtual = [P.centrifugalTerm(v.tertiary, v.parameter, m) - k / v.parameter, H, -k / v.parameter];
          const yTopo = Math.max(4, Math.max(...yAtual) * 1.15), yBase = Math.min(-4, Math.min(...yAtual) * 1.15);
          const chart = api.axes(api.main, 0.2, 4, yBase, yTopo, "raio r (m)", "energia (J)");
          api.line(chart, api.curve((r) => -k / r, 0.2, 4, 200), api.C.grayLight, [5, 4], 1.8);
          api.line(chart, api.curve((r) => P.centrifugalTerm(v.tertiary, r, m), 0.2, 4, 200), "#c9d6e4", [2, 3], 1.8);
          api.line(chart, api.curve(Vef, 0.2, 4, 240), api.C.green, [], 3.2);
          api.hline(chart, H, api.C.red, [5, 4], "H = energia total");
          api.dot(chart, v.parameter, Vef(v.parameter), api.C.gold, 5.5);
          api.label(chart, 3.7, P.centrifugalTerm(v.tertiary, 3.7, m) + 0.35, "p_θ²/2mr²", "#7d99b5", "right");
          api.label(chart, 3.7, -k / 3.7 - 0.35, "U(r)", api.C.grayLight, "right", "top");

          const s = api.axes(api.second, -3, 3, 0, 3.4, "momento radial p_r", "p_r²/2m (J)");
          api.line(s, api.curve((pp) => (pp * pp) / (2 * m), -3, 3, 120), api.C.blue, [], 2.6);
          api.dot(s, v.secondary, (v.secondary * v.secondary) / (2 * m), api.C.red, 4.5);
        },

        text(v, api) {
          const m = 2, k = 3;
          const V = -k / v.parameter;
          const H = P.centralH(v.secondary, v.tertiary, v.parameter, m, V);
          const [rd, thd] = P.centralVelocities(m, v.parameter, v.secondary, v.tertiary);
          const T = 0.5 * m * (rd * rd + v.parameter ** 2 * thd * thd);
          return {
            title: "Hamiltoniana da força central",
            subtitle: `r = ${api.fmt(v.parameter)} m · p_r = ${api.fmt(v.secondary)} · p_θ = ${api.fmt(v.tertiary)}`,
            regime: H < 0 ? ["órbita ligada", "ok"] : ["não ligada", "warn"],
            caption: "O termo p_θ²/2mr² é a barreira centrífuga da Aula 18, agora surgindo automaticamente da construção — e não de uma manipulação feita à mão.",
            prediction: "Onde está a barreira centrífuga nesta expressão, e de onde ela veio?",
            calculation: `p_r = mṙ e p_θ = mr²θ̇ ⟹ ṙ = p_r/m = ${api.fmt(rd, 4)}, θ̇ = p_θ/mr² = ${api.fmt(thd, 4)}<br>H = Σpq̇ − L = <b>${api.fmt(H, 4)} J</b><em>conferindo: T + U = ${api.fmt(T, 4)} + ${api.fmt(V, 4)} = ${api.fmt(T + V, 4)} J — nenhum q̇ sobrou</em>`,
            metrics: [
              ["H", `${api.fmt(H, 4)} J`],
              ["p_r²/2m", `${api.fmt((v.secondary ** 2) / (2 * m), 4)} J`],
              ["barreira p_θ²/2mr²", `${api.fmt(P.centrifugalTerm(v.tertiary, v.parameter, m), 4)} J`],
              ["U(r) = −k/r", `${api.fmt(V, 4)} J`],
              ["ṙ recuperado", api.fmt(rd, 4)],
              ["θ̇ recuperado", api.fmt(thd, 4)]
            ],
            concept: "θ não aparece em H, logo p_θ é constante — e o problema se reduz a uma dimensão em r com o potencial efetivo, exatamente como na Aula 18. O formalismo não só reproduz o resultado: torna-o estrutural.",
            prompts: [
              "Zere p_θ e observe a barreira desaparecer.",
              "Confirme que H coincide com T + U neste caso, e diga por quê.",
              "Identifique a coordenada cíclica de H e a constante que ela produz."
            ],
            legend: [[api.C.green, "V"], ["#c9d6e4", "barreira"], [api.C.grayLight, "U(r)"], [api.C.red, "H"]],
            secondaryTitle: "Parcela radial da energia cinética",
            secondarySubtitle: "parábola em p_r, como no caso livre",
            secondaryCaption: "É a única parcela que muda quando o movimento radial muda."
          };
        }
      },

      {
        id: "termodinamica",
        tab: "A mesma operação<br>em termodinâmica",
        heading: "F = U − TS",
        equation: "T = ∂U/∂S   ·   F(T) = U − TS   ·   ∂F/∂T = −S",
        hint: "Compare com H = pq̇ − L: a estrutura é a mesma, mas o sinal global é o oposto — F = −g, por convenção da termodinâmica.",
        controls: [
          { id: "parameter", label: "temperatura T", min: 0.2, max: 6, step: 0.05, value: 3, digits: 2 },
          { id: "secondary", label: "coeficiente α de U(S) = αS²", min: 0.2, max: 2, step: 0.05, value: 0.5, digits: 2 },
          { id: "tertiary", label: "entropia S examinada", min: 0.2, max: 6, step: 0.05, value: 3, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const alpha = v.secondary;
          const S = v.parameter / (2 * alpha);
          const F = P.helmholtz(v.parameter, alpha);
          /* Eixo S cresce até conter S = T/2α: com T = 6 e α = 0,2 ele vale 15 e o marcador
             saía do quadro (limite fixo antigo: 6). */
          const lim = Math.max(6, S * 1.15);
          const chart = api.axes(api.main, 0, lim, -Math.max(6, -F * 1.5), P.U(lim, alpha) * 1.1, "entropia S", "energia");
          api.line(chart, api.curve((s) => P.U(s, alpha), 0, lim, 160), api.C.green, [], 3.2);
          api.line(chart, api.curve((s) => v.parameter * s + F, 0, lim, 2), api.C.red, [], 2.4);
          api.dot(chart, S, P.U(S, alpha), api.C.ink, 5.5);
          api.dot(chart, 0, F, api.C.gold, 5.5);
          api.label(chart, 0.14, F - 0.3, "F(T)", api.C.gold, "left", "top");
          api.label(chart, lim * 0.92, v.parameter * lim * 0.92 + F, "tangente de inclinação T", api.C.red, "right");
          api.hline(chart, 0, "#b9c4bb", []);
          /* S examinado: a distância vertical até a tangente é U(S) − TS − F ≥ 0. */
          const Sx = v.tertiary;
          api.dot(chart, Sx, P.U(Sx, alpha), api.C.blue, 4.5);
          api.arrow(chart, Sx, v.parameter * Sx + F, Sx, P.U(Sx, alpha), api.C.blue, 2, 7);
          api.label(chart, Sx + 0.12, (P.U(Sx, alpha) + v.parameter * Sx + F) / 2, "U − TS − F", api.C.blue, "left");

          const s2 = api.axes(api.second, 0.2, 6, P.helmholtz(6, alpha) * 1.1, 0.2, "temperatura T", "F(T)");
          api.line(s2, api.curve((tt) => P.helmholtz(tt, alpha), 0.2, 6, 120), api.C.blue, [], 2.8);
          api.dot(s2, v.parameter, F, api.C.red, 5);
          api.hline(s2, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const alpha = v.secondary;
          const S = v.parameter / (2 * alpha);
          const F = P.helmholtz(v.parameter, alpha);
          const dFdT = -(P.helmholtz(v.parameter + 1e-4, alpha) - P.helmholtz(v.parameter - 1e-4, alpha)) / 2e-4;
          return {
            title: "Energia livre de Helmholtz",
            subtitle: `T = ${api.fmt(v.parameter)} · α = ${api.fmt(alpha)}`,
            caption: "A construção é a da estação 1: tangente de inclinação T. Lá o intercepto era −g; aqui é +F — a termodinâmica adota o sinal global oposto, F = −g. A seta azul mostra que U(S) − TS ≥ F, com igualdade só em S(T).",
            prediction: "Por que trocar S por T, se as duas descrevem o mesmo sistema?",
            calculation: `T = ∂U/∂S = 2αS ⟹ S(T) = T/2α = <b>${api.fmt(S, 4)}</b><br>F = U − TS = ${api.fmt(P.U(S, alpha), 4)} − ${api.fmt(v.parameter)}·${api.fmt(S, 4)} = <b>${api.fmt(F, 4)}</b><em>∂F/∂T = −S = ${api.fmt(-dFdT, 4)} · compare com H = pq̇ − L e ∂H/∂p = q̇</em>`,
            metrics: [
              ["S(T)", api.fmt(S, 4)],
              ["U(S)", api.fmt(P.U(S, alpha), 4)],
              ["F = U − TS", api.fmt(F, 4)],
              ["−∂F/∂T", api.fmt(dFdT, 4)],
              ["análogos de p e q̇", "T e S"],
              [`U − TS em S = ${api.fmt(v.tertiary)}`, api.fmt(P.freeEnergyAt(v.tertiary, v.parameter, alpha), 4)]
            ],
            concept: "A razão de fazer a troca é a mesma nos dois casos: substituir uma variável difícil de controlar por sua conjugada, que é a que o experimento fixa.",
            prompts: [
              "Monte o dicionário completo: q̇ ↔ ?, p ↔ ?, L ↔ ?, H ↔ ?",
              "Verifique que ∂F/∂T = −S numericamente.",
              "Explique por que F = U − TS tem o sinal global oposto ao de H = pq̇ − L, e por que isso é só convenção."
            ],
            legend: [[api.C.green, "U(S)"], [api.C.red, "tangente"], [api.C.gold, "F"]],
            secondaryTitle: "F contra T",
            secondarySubtitle: "côncava, com inclinação −S",
            secondaryCaption: "Reconhecer estruturas repetidas é boa parte do que a mecânica analítica oferece."
          };
        }
      }
    ]
  };
})();
