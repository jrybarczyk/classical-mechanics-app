(function () {
  "use strict";
  const P = window.LessonPhysics;

  const JUNTAS = [
    ["ombro", "esférica", 3], ["cotovelo", "dobradiça", 1], ["punho", "universal", 2]
  ];

  window.LessonScene = {
    id: "aula23",
    discipline: "Mecânica Clássica · Aula 22",
    title: "Princípio de Hamilton",
    subtitle: "A trajetória real minimiza a ação, ou apenas a torna estacionária?",

    stations: [
      {
        id: "acao",
        tab: "Ação<br>estacionária",
        heading: "S[q] para caminhos variados",
        equation: "S = ∫(½mq̇² − ½mω²q²)dt   ·   δS = 0",
        hint: "Aumente o intervalo t_f além de π/ω e observe o que acontece com a curvatura de S(ε).",
        controls: [
          { id: "parameter", label: "amplitude ε da variação", min: -0.4, max: 0.4, step: 0.01, value: 0.15, digits: 2 },
          { id: "secondary", label: "intervalo t_f", min: 0.3, max: 3.2, step: 0.02, value: 0.9, digits: 2, unit: "× π/ω" },
          { id: "tertiary", label: "modo n (meias-ondas da variação)", min: 1, max: 4, step: 1, value: 1, digits: 0 }
        ],
        animate: { control: "parameter", period: 7 },
        secondary: true,

        draw(api, v) {
          const m = 1, w = 2, A = 0.5;
          const T = v.secondary * P.conjugateTime(w);
          const chart = api.axes(api.main, 0, T, -A * 1.8, A * 1.8, "tempo t (s)", "q (m)");
          [-0.3, -0.15, 0.15, 0.3].forEach((e) => {
            api.line(chart, api.curve(P.variedPath(A, w, e, T, v.tertiary), 0, T, 200), "#d8e0d9", [], 1.4);
          });
          api.line(chart, api.curve((t) => P.truePath(t, A, w), 0, T, 200), api.C.green, [], 3.2);
          api.line(chart, api.curve(P.variedPath(A, w, v.parameter, T, v.tertiary), 0, T, 220), api.C.red, [], 2.6);
          api.dot(chart, 0, P.truePath(0, A, w), api.C.ink, 5.5);
          api.dot(chart, T, P.truePath(T, A, w), api.C.ink, 5.5);
          api.hline(chart, 0, "#b9c4bb", []);

          const S = (e) => P.action(P.variedPath(A, w, e, T, v.tertiary), T, m, w, 1200);
          const S0 = S(0);
          const vals = api.curve(S, -0.4, 0.4, 40);
          const ys = vals.map((p) => p[1]);
          const lo = Math.min(...ys), hi = Math.max(...ys);
          const pad = (hi - lo) * 0.15 + 1e-6;
          const s = api.axes(api.second, -0.4, 0.4, lo - pad, hi + pad, "ε", "S(ε)");
          api.line(s, vals, api.C.blue, [], 2.8);
          api.hline(s, S0, api.C.green, [5, 4], "S sobre a trajetória real");
          api.dot(s, 0, S0, api.C.green, 5);
          api.dot(s, v.parameter, S(v.parameter), api.C.red, 5);
        },

        text(v, api) {
          const m = 1, w = 2, A = 0.5;
          const T = v.secondary * P.conjugateTime(w);
          const S = (e) => P.action(P.variedPath(A, w, e, T, v.tertiary), T, m, w, 2000);
          const S0 = S(0);
          const Se = S(v.parameter);
          const dS = P.actionDifference(v.parameter, T, m, w, v.tertiary);
          const derivada = (S(1e-4) - S(-1e-4)) / 2e-4;
          const minimo = P.isMinimum(T, w, 1);          // mínimo × sela: decide o modo 1
          const sobe = P.isMinimum(T, w, v.tertiary);   // ΔS > 0 neste modo?
          return {
            title: "Ação sobre a família de caminhos",
            subtitle: `t_f = ${api.fmt(v.secondary)}·π/ω · ε = ${api.fmt(v.parameter)} · modo n = ${api.fmt(v.tertiary, 0)}`,
            regime: minimo ? ["ação mínima", "ok"] : ["ponto de sela: estacionária, não mínima", "alert"],
            caption: "A derivada em ε = 0 é nula em qualquer intervalo. Mas a curvatura troca de sinal no ponto conjugado: além dele, deformar a trajetória reduz a ação.",
            prediction: "A trajetória real sempre minimiza a ação? Teste com t_f maior que π/ω.",
            calculation: `ΔS = (ε²/2)(t_f/2)m[(nπ/t_f)² − ω²]<br>= (${api.fmt(v.parameter ** 2 / 2, 5)})(${api.fmt(T / 2, 4)})[${api.fmt((v.tertiary * Math.PI / T) ** 2, 4)} − ${api.fmt(w * w, 2)}] = <b>${api.sci(dS)}</b><em>medido: ${api.sci(Se - S0)} · derivada em ε=0: ${api.sci(derivada)}</em>`,
            metrics: [
              ["S(0)", api.fmt(S0, 5)],
              ["S(ε)", api.fmt(Se, 5)],
              ["ΔS medido (previsto)", `${api.sci(Se - S0)} (${api.sci(dS)})`],
              ["dS/dε em 0", api.sci(derivada)],
              ["1º ponto conjugado π/ω", `${api.fmt(P.conjugateTime(w, 1), 4)} s`],
              ["limiar do modo n, nπ/ω", `${api.fmt(P.conjugateTime(w, v.tertiary), 4)} s`]
            ],
            concept: "Por isso o nome correto é ação estacionária. “Mínima ação” é histórico e impreciso: além do primeiro ponto conjugado a trajetória real é um ponto de sela.",
            prompts: [
              "Com o modo n = 1, ache o t_f em que a curvatura de S(ε) troca de sinal e compare com π/ω.",
              "Com t_f = 1,6π/ω, passe ao modo n = 3: a ação cresce nessa direção, mas a trajetória continua sendo sela, porque o modo 1 a reduz.",
              "Confirme que a derivada em ε = 0 é nula em todos os casos."
            ],
            legend: [[api.C.green, "trajetória real"], [api.C.red, "caminho variado"], ["#d8e0d9", "outros da família"]],
            secondaryTitle: "Ação contra a amplitude da variação",
            secondarySubtitle: sobe ? "abre para cima: ΔS > 0 neste modo" : "abre para baixo: ΔS < 0 neste modo",
            secondaryCaption: "O vértice está sempre em ε = 0; o que muda é para que lado ele abre. Mínimo exige que abra para cima em todos os modos, o que só ocorre para t_f < π/ω."
          };
        }
      },

      {
        id: "graus",
        tab: "Graus de<br>liberdade",
        heading: "Duas contagens que devem fechar",
        equation: "n = 3N − k   ·   n = Σ(graus permitidos) = 6C − Σ(vínculos removidos)",
        hint: "Some os graus permitidos por junta e depois subtraia vínculos do total livre.",
        controls: [
          { id: "parameter", label: "graus do ombro", min: 1, max: 3, step: 1, value: 3, digits: 0 },
          { id: "secondary", label: "graus do cotovelo", min: 1, max: 3, step: 1, value: 1, digits: 0 },
          { id: "tertiary", label: "graus do punho", min: 1, max: 3, step: 1, value: 2, digits: 0 }
        ],

        draw(api, v) {
          const juntas = [v.parameter, v.secondary, v.tertiary];
          const { ctx, width, height } = api.main;
          const pontos = [[80, height * 0.28], [width * 0.36, height * 0.5], [width * 0.56, height * 0.68], [width * 0.68, height * 0.82]];
          const cores = [api.C.green, api.C.blue, api.C.gold];
          ctx.save();
          ctx.fillStyle = "#eef2ee"; ctx.strokeStyle = "#98a69b"; ctx.lineWidth = 1.6;
          ctx.fillRect(28, height * 0.13, 50, height * 0.36);
          ctx.strokeRect(28, height * 0.13, 50, height * 0.36);
          ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.fillText("tronco (fixo)", 24, height * 0.1);
          for (let i = 0; i < 3; i += 1) {
            ctx.strokeStyle = cores[i]; ctx.lineWidth = 7; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(...pontos[i]); ctx.lineTo(...pontos[i + 1]); ctx.stroke();
          }
          pontos.slice(0, 3).forEach((p, i) => {
            ctx.fillStyle = "#fff"; ctx.strokeStyle = "#4a5750"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, api.TAU); ctx.fill(); ctx.stroke();
            ctx.fillStyle = api.C.muted; ctx.font = "600 12px Ubuntu, system-ui, sans-serif";
            ctx.fillText(`${JUNTAS[i][0]}: ${juntas[i]}`, p[0] + 12, p[1] - 8);
          });
          const total = P.chainDOF(juntas);
          const porVinculos = P.chainByConstraints(3, juntas);
          const bx = width * 0.72;
          ctx.font = "13px Ubuntu, system-ui, sans-serif"; ctx.fillStyle = api.C.ink;
          ctx.fillText(`soma dos permitidos: ${juntas.join(" + ")} = ${total}`, bx, height * 0.28);
          ctx.fillText(`3 corpos livres: 3 × 6 = 18`, bx, height * 0.42);
          ctx.fillText(`vínculos removidos: ${juntas.map((j) => 6 - j).join(" + ")} = ${juntas.reduce((s, j) => s + 6 - j, 0)}`, bx, height * 0.52);
          ctx.fillText(`18 − ${juntas.reduce((s, j) => s + 6 - j, 0)} = ${porVinculos}`, bx, height * 0.62);
          ctx.fillStyle = total === porVinculos ? api.C.green : api.C.red;
          ctx.font = "600 15px Ubuntu, system-ui, sans-serif";
          ctx.fillText(total === porVinculos ? `n = ${total}  ✓ as duas contagens fecham` : "as contagens não fecham", bx, height * 0.78);
          ctx.restore();
        },

        text(v, api) {
          const juntas = [v.parameter, v.secondary, v.tertiary];
          const total = P.chainDOF(juntas);
          const porVinculos = P.chainByConstraints(3, juntas);
          return {
            title: "Modelo de cadeia articulada",
            subtitle: `ombro ${api.fmt(v.parameter, 0)} · cotovelo ${api.fmt(v.secondary, 0)} · punho ${api.fmt(v.tertiary, 0)}`,
            regime: total === porVinculos ? ["contagens consistentes", "ok"] : ["inconsistente", "alert"],
            caption: "Numa cadeia aberta como esta, somar os graus permitidos e subtrair vínculos do total livre dão o mesmo número por construção: 6C − Σ(6 − f) = Σf. O teste ganha conteúdo em laços fechados (critério de Grübler–Kutzbach), em que a soma das permissões superestima n.",
            prediction: "Numa cadeia aberta as duas contagens podem discordar? E num laço fechado, como um quadrilátero articulado?",
            calculation: `soma dos permitidos: ${juntas.join(" + ")} = <b>${total}</b><br>3 corpos livres: 18; vínculos removidos: ${juntas.map((j) => 6 - j).join(" + ")} = ${juntas.reduce((s, j) => s + 6 - j, 0)}<em>18 − ${juntas.reduce((s, j) => s + 6 - j, 0)} = <b>${porVinculos}</b></em>`,
            metrics: [
              ["graus permitidos", api.fmt(total, 0)],
              ["por subtração de vínculos", api.fmt(porVinculos, 0)],
              ["corpos rígidos", "3"],
              ["graus livres totais", "18"],
              ["vínculos removidos", api.fmt(juntas.reduce((s, j) => s + 6 - j, 0), 0)]
            ],
            concept: "Coordenadas generalizadas não precisam ser comprimentos: ângulos, arcos e combinações adimensionais servem, desde que sejam em número n, determinem a configuração e sejam independentes.",
            prompts: [
              "Monte a contagem para um modelo de perna: quadril esférico, joelho dobradiça, tornozelo de dois eixos.",
              "O braço humano real tem sete graus. O que a redundância permite?",
              "Quadrilátero articulado plano (3 barras móveis, 4 pinos): compare Σf = 4 com 3·3 − 4·2 = 1 (Grübler)."
            ],
            legend: [[api.C.green, "braço"], [api.C.blue, "antebraço"], [api.C.gold, "mão"]]
          };
        }
      },

      {
        id: "pendulo",
        tab: "Pêndulo com<br>suporte deslizante",
        heading: "Montando a lagrangiana",
        equation: "L = ½(M+m)Ẋ² + ½mℓ²θ̇² + mℓẊθ̇cosθ + mgℓcosθ",
        hint: "Procure o termo cruzado. Ele acopla as duas coordenadas e é a assinatura de T não diagonal.",
        controls: [
          { id: "parameter", label: "ângulo θ", min: -2.8, max: 2.8, step: 0.02, value: 0.6, digits: 2, unit: "rad" },
          { id: "secondary", label: "velocidade do bloco Ẋ", min: -3, max: 3, step: 0.05, value: 1, digits: 2, unit: "m/s" },
          { id: "tertiary", label: "razão de massas M/m", min: 0.2, max: 8, step: 0.1, value: 3, digits: 1 }
        ],
        secondary: true,

        draw(api, v) {
          const m = 1, M = v.tertiary * m, l = 1.2;
          const { ctx, width, height } = api.main;
          const y0 = height * 0.28;
          api.hatch(ctx, 40, y0, width - 40, y0, "#b6c0b7", 13, 9);
          const X = width * 0.45;
          ctx.save();
          ctx.fillStyle = "rgba(69,123,157,.18)"; ctx.strokeStyle = api.C.blue; ctx.lineWidth = 2;
          const bw = 30 + 8 * Math.log(1 + M);
          ctx.fillRect(X - bw / 2, y0 - 22, bw, 22);
          ctx.strokeRect(X - bw / 2, y0 - 22, bw, 22);
          const esc = 110;
          const bxp = X + esc * Math.sin(v.parameter);
          const byp = y0 + esc * Math.cos(v.parameter);
          ctx.strokeStyle = "#6f7171"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(bxp, byp); ctx.stroke();
          ctx.fillStyle = api.C.green;
          ctx.beginPath(); ctx.arc(bxp, byp, 13, 0, api.TAU); ctx.fill();
          ctx.setLineDash([4, 4]); ctx.strokeStyle = "#b9c4bb";
          ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y0 + esc * 1.25); ctx.stroke();
          ctx.setLineDash([]);
          api.vector(ctx, X, y0 - 34, X + v.secondary * 26, y0 - 34, api.C.blue, 2.4, 8);
          ctx.fillStyle = api.C.muted; ctx.font = "12px Ubuntu, system-ui, sans-serif";
          ctx.fillText("Ẋ", X + v.secondary * 26 + 6, y0 - 30);
          ctx.fillText("θ", X + 16, y0 + 26);
          ctx.fillText(`M = ${api.fmt(M, 1)}`, X - bw / 2, y0 - 28);
          ctx.fillText(`m = 1`, bxp + 18, byp + 4);
          ctx.restore();

          const s = api.axes(api.second, -2.8, 2.8, -3.8, 3.8, "ângulo θ (rad)", "termo cruzado mℓẊθ̇cosθ");
          api.line(s, api.curve((th) => m * l * v.secondary * 1 * Math.cos(th), -2.8, 2.8, 150), api.C.gold, [], 2.8);
          api.hline(s, 0, "#b9c4bb", []);
          api.dot(s, v.parameter, m * l * v.secondary * Math.cos(v.parameter), api.C.red, 4.5);
          api.vline(s, Math.PI / 2, api.C.grayLight, [4, 4], "θ = π/2: desacopla");
          api.vline(s, -Math.PI / 2, api.C.grayLight, [4, 4]);
        },

        text(v, api) {
          const m = 1, M = v.tertiary * m, l = 1.2;
          const thd = 1;
          const T = P.kinetic(M, m, v.secondary, thd, v.parameter, l);
          const U = P.potential(m, v.parameter, l);
          const cruzado = m * l * v.secondary * thd * Math.cos(v.parameter);
          const pX = P.momentumX(M, m, v.secondary, thd, v.parameter, l);
          return {
            title: "Lagrangiana do sistema acoplado",
            subtitle: `θ = ${api.fmt(v.parameter)} rad · Ẋ = ${api.fmt(v.secondary)} m/s · M/m = ${api.fmt(v.tertiary, 1)} · fixos: m = 1 kg, ℓ = 1,2 m, θ̇ = 1 rad/s`,
            regime: Math.abs(Math.cos(v.parameter)) < 0.05 ? ["momentaneamente desacoplado", "ok"] : ["acoplado", "warn"],
            caption: "Nem a tração da haste nem a normal do trilho aparecem: as coordenadas escolhidas já respeitam a geometria. O que aparece é o termo cruzado.",
            prediction: "Em que ângulo o termo cruzado se anula? O sistema fica desacoplado ali?",
            calculation: `|ṙ_m|² = Ẋ² + ℓ²θ̇² + 2ℓẊθ̇cosθ = ${api.fmt(P.bobSpeed2(v.secondary, thd, v.parameter, l), 4)}<br>termo cruzado = mℓẊθ̇cosθ = <b>${api.fmt(cruzado, 4)}</b><em>X não aparece em L, só Ẋ: p_X = (M+m)Ẋ + mℓθ̇cosθ = ${api.fmt(pX, 4)} conserva-se</em>`,
            metrics: [
              ["energia cinética T", api.fmt(T, 4)],
              ["energia potencial U", api.fmt(U, 4)],
              ["L = T − U", api.fmt(T - U, 4)],
              ["termo cruzado", api.fmt(cruzado, 4)],
              ["p_X conservado", api.fmt(pX, 4)],
              ["forças de vínculo em L", "nenhuma"]
            ],
            concept: "O princípio de Hamilton compara trajetórias com as mesmas extremidades no tempo e no espaço de configuração — não é um problema de valor inicial, embora as equações resultantes o sejam.",
            prompts: [
              "Ache o ângulo que anula o termo cruzado e diga se o acoplamento realmente some.",
              "Identifique a coordenada cíclica e a constante que ela produz.",
              "Compare o esforço com o tratamento newtoniano, que exigiria a tração e a normal."
            ],
            legend: [[api.C.blue, "bloco M"], [api.C.green, "massa m"]],
            secondaryTitle: "Termo cruzado contra o ângulo",
            secondarySubtitle: "anula-se em θ = ±π/2",
            secondaryCaption: "Anular-se em um instante não é desacoplar: a equação de movimento continua acoplada."
          };
        }
      }
    ]
  };
})();
