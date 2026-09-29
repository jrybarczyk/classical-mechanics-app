(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula04",
    discipline: "Mecânica Clássica · Aula 4",
    title: "Leis de Newton e valor inicial",
    subtitle: "A lei diz quais movimentos são possíveis; quem escolhe um deles?",

    stations: [
      {
        id: "plano",
        tab: "Plano<br>inclinado",
        heading: "Bloco em plano rugoso",
        equation: "a = g(senα − μ_k cosα)",
        hint: "Suba μ_k com α fixo e observe o instante em que o modelo de descida deixa de valer.",
        controls: [
          { id: "parameter", label: "inclinação α", min: 0, max: 75, step: 1, value: 30, digits: 0, unit: "°" },
          { id: "secondary", label: "coeficiente μ_k", min: 0, max: 1.2, step: 0.01, value: 0.25, digits: 2 },
          { id: "tertiary", label: "massa m", min: 0.2, max: 8, step: 0.1, value: 2, digits: 1, unit: "kg" }
        ],

        draw(api, v) {
          const { ctx, width, height } = api.main;
          const a = P.rad(v.parameter);
          const x0 = 70, y0 = height - 70, L = Math.min(width - 190, 520);
          const xf = x0 + L * Math.cos(a), yf = y0 - L * Math.sin(a);

          api.hatch(ctx, x0, y0, x0 + L, y0, "#c9d2ca", 14, 10);
          ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xf, yf); ctx.lineTo(x0 + L, y0); ctx.closePath(); ctx.stroke();
          api.hatch(ctx, x0, y0, xf, yf, "#b6c0b7", 16, 9);

          /* Bloco a meio caminho, com o diagrama de corpo livre. */
          const s = 0.55, bx = x0 + L * s * Math.cos(a), by = y0 - L * s * Math.sin(a);
          const w = 34, h = 24;
          ctx.save(); ctx.translate(bx, by); ctx.rotate(-a);
          ctx.fillStyle = "rgba(97,155,96,.16)"; ctx.strokeStyle = api.C.green; ctx.lineWidth = 2;
          ctx.fillRect(-w / 2, -h, w, h); ctx.strokeRect(-w / 2, -h, w, h);
          ctx.restore();

          const cx = bx - (h / 2) * Math.sin(a), cy = by - (h / 2) * Math.cos(a);
          const esc = 9 * v.tertiary;
          const N = P.normalForce(v.tertiary, v.parameter);
          const desliza = P.slides(v.parameter, v.secondary);
          const at = P.inclineAcceleration(v.parameter, v.secondary);
          const fat = P.inclineFriction(v.tertiary, v.parameter, v.secondary);

          /* O plano sobe para a direita: a descida é para a esquerda, ao longo de (−cosα, +senα)
             no canvas. A normal sai do plano ao longo de (−senα, −cosα) e o atrito se opõe ao
             movimento (ou à tendência de movimento), apontando plano acima, (+cosα, −senα). */
          const nx = -Math.sin(a), ny = -Math.cos(a);
          const ux = Math.cos(a), uy = -Math.sin(a);
          const kN = N * esc / 3, kF = fat * esc / 3, kP = v.tertiary * P.G * esc / 3;
          api.vector(ctx, cx, cy, cx + nx * kN, cy + ny * kN, api.C.blue, 2.6, 9);
          api.vector(ctx, cx, cy, cx, cy + kP, api.C.gold, 2.6, 9);
          api.vector(ctx, cx, cy, cx + ux * kF, cy + uy * kF, api.C.red, 2.6, 9);

          ctx.fillStyle = api.C.muted; ctx.font = "600 11px Ubuntu, system-ui, sans-serif";
          ctx.fillText("N", cx + nx * kN - 14, cy + ny * kN - 4);
          ctx.fillText("mg", cx + 7, cy + kP);
          ctx.fillText("f", cx + ux * kF + 5, cy + uy * kF - 4);
          ctx.fillText(`α = ${v.parameter}°`, x0 + 46, y0 - 9);
          ctx.fillStyle = desliza ? api.C.green : api.C.red;
          ctx.font = "600 13px Ubuntu, system-ui, sans-serif";
          ctx.fillText(desliza ? `desliza · a = ${api.fmt(at)} m/s²` : "permanece em repouso", 70, 32);
        },

        text(v, api) {
          const a = P.inclineAcceleration(v.parameter, v.secondary);
          const N = P.normalForce(v.tertiary, v.parameter);
          const desliza = P.slides(v.parameter, v.secondary);
          const rep = P.reposeAngle(v.secondary);
          return {
            title: "Diagrama de corpo livre",
            subtitle: `α = ${api.fmt(v.parameter, 0)}° · μ_k = ${api.fmt(v.secondary)} · m = ${api.fmt(v.tertiary, 1)} kg`,
            regime: desliza ? ["deslizando", "ok"] : ["estático", "alert"],
            caption: "N e mg atuam no mesmo corpo e por isso não formam par ação–reação. A reação ao peso está na Terra, fora do diagrama.",
            prediction: "Para que valor de μ_k o bloco para de deslizar com este α?",
            calculation: `N = mg cosα = ${api.fmt(v.tertiary, 1)}·9,8·cos${api.fmt(v.parameter, 0)}° = <b>${api.fmt(N)} N</b><br>a = g(senα − μ_k cosα) = 9,8(${api.fmt(Math.sin(P.rad(v.parameter)))} − ${api.fmt(v.secondary)}·${api.fmt(Math.cos(P.rad(v.parameter)))}) = <b>${api.fmt(a)} m/s²</b><em>${desliza ? `tanα = ${api.fmt(Math.tan(P.rad(v.parameter)))} > μ: o resultado descreve descida acelerada` : `tanα ≤ μ: a expressão daria a = ${api.fmt(a)}, sem sentido físico aqui`}</em>`,
            metrics: [
              ["normal N", `${api.fmt(N)} N`],
              ["peso mg", `${api.fmt(v.tertiary * P.G)} N`],
              ["aceleração a", `${api.fmt(a)} m/s²`],
              ["tanα", api.fmt(Math.tan(P.rad(v.parameter)))],
              ["ângulo de repouso", `${api.fmt(rep, 1)}°`]
            ],
            concept: "A normal não vale mg: seu valor sai da projeção da segunda lei somada ao vínculo de o bloco não deixar o plano.",
            prompts: [
              "Ache o ângulo de repouso para μ_k = 0,25 e confirme que a aceleração zera nele.",
              "Verifique que a aceleração não depende da massa e explique por quê.",
              "Faça μ_k = 0 e recupere a = g senα."
            ],
            legend: [[api.C.blue, "normal"], [api.C.gold, "peso"], [api.C.red, "atrito"]]
          };
        }
      },

      {
        id: "atwood",
        tab: "Máquina<br>de Atwood",
        heading: "Duas massas, um fio",
        equation: "a = g(m₁−m₂)/(m₁+m₂)   T = 2m₁m₂g/(m₁+m₂)",
        hint: "Aproxime as massas e observe a tração tender ao peso comum, não a zero.",
        controls: [
          { id: "parameter", label: "massa m₁", min: 0.2, max: 8, step: 0.1, value: 5, digits: 1, unit: "kg" },
          { id: "secondary", label: "massa m₂", min: 0.2, max: 8, step: 0.1, value: 2, digits: 1, unit: "kg" },
          { id: "tertiary", label: "instante t", min: 0, max: 3, step: 0.02, value: 1, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 4 },
        secondary: true,

        draw(api, v) {
          const { ctx, width, height } = api.main;
          const { a, T } = P.atwood(v.parameter, v.secondary);
          const d = 0.5 * a * v.tertiary * v.tertiary;          // m₁ desce d (m); m₂ sobe d

          /* A máquina: roldana fixa, fio inextensível, duas massas penduradas. */
          const cx = Math.round(width * 0.38), cyP = 46, rP = 26;
          const xL = cx - rP, xR = cx + rP;
          const yTopo = cyP + rP + 8;
          const dMax = Math.max(0.05, 0.5 * Math.abs(a) * 9);    // maior |d| no intervalo do slider
          const alcance = (height - yTopo - 120) / 2;
          const escD = Math.min(alcance / dMax, 60);            // px por metro, limitado
          const yMeio = yTopo + alcance + 30;
          const y1 = yMeio + d * escD, y2 = yMeio - d * escD;

          /* Suporte e roldana. */
          ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(cx, 6); ctx.lineTo(cx, cyP - rP); ctx.stroke();
          api.hatch(ctx, cx - 40, 6, cx + 40, 6, "#b6c0b7", 9, 7);
          ctx.beginPath(); ctx.moveTo(cx - 40, 6); ctx.lineTo(cx + 40, 6); ctx.stroke();
          ctx.fillStyle = "#e8ede8"; ctx.strokeStyle = api.C.gray; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cyP, rP, 0, api.TAU); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cyP, 4, 0, api.TAU); ctx.stroke();
          /* Fio: arco sobre a roldana e os dois ramos verticais. */
          ctx.strokeStyle = api.C.ink; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(cx, cyP, rP, Math.PI, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(xL, cyP); ctx.lineTo(xL, y1); ctx.moveTo(xR, cyP); ctx.lineTo(xR, y2); ctx.stroke();

          /* Massas: lado proporcional à raiz da massa, para a área acompanhar m. */
          const lado = (m) => 18 + 9 * Math.sqrt(m);
          const bloco = (x, y, m, cor, fundo, rotulo, lado2) => {
            const L = lado(m);
            ctx.fillStyle = fundo; ctx.strokeStyle = cor; ctx.lineWidth = 2;
            ctx.fillRect(x - L / 2, y, L, L); ctx.strokeRect(x - L / 2, y, L, L);
            ctx.fillStyle = cor; ctx.font = "600 12px Ubuntu, system-ui, sans-serif";
            ctx.textAlign = lado2 < 0 ? "right" : "left"; ctx.textBaseline = "middle";
            ctx.fillText(rotulo, x + lado2 * (L / 2 + 8), y + L / 2);
            return L;
          };
          const L1 = bloco(xL, y1, v.parameter, api.C.green, "rgba(97,155,96,.16)", `m₁ = ${api.fmt(v.parameter, 1)} kg`, -1);
          const L2 = bloco(xR, y2, v.secondary, api.C.blue, "rgba(69,123,157,.16)", `m₂ = ${api.fmt(v.secondary, 1)} kg`, 1);

          /* Forças em escala comum (a maior mede ~110 px): tração puxa o topo do bloco para
             cima, o peso sai da base para baixo. Rótulos do lado de fora da máquina. */
          const kF = 110 / Math.max(T, v.parameter * P.G, v.secondary * P.G, 1e-6);
          const forca = (x, y0f, val, cima, cor, txt, lado2) => {
            const y1f = cima ? y0f - val * kF : y0f + val * kF;
            api.vector(ctx, x, y0f, x, y1f, cor, 2.6, 9);
            ctx.fillStyle = cor; ctx.font = "600 11px Ubuntu, system-ui, sans-serif";
            ctx.textAlign = lado2 < 0 ? "right" : "left"; ctx.textBaseline = "middle";
            ctx.fillText(txt, x + lado2 * 12, (y0f + y1f) / 2);
          };
          forca(xL, y1, T, true, api.C.gold, `T = ${api.fmt(T, 1)} N`, -1);
          forca(xL, y1 + L1, v.parameter * P.G, false, api.C.red, `m₁g = ${api.fmt(v.parameter * P.G, 1)} N`, -1);
          forca(xR, y2, T, true, api.C.gold, `T = ${api.fmt(T, 1)} N`, 1);
          forca(xR, y2 + L2, v.secondary * P.G, false, api.C.red, `m₂g = ${api.fmt(v.secondary * P.G, 1)} N`, 1);

          /* Referência de partida e o deslocamento. */
          ctx.strokeStyle = "#b9c4bb"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(xL - 70, yMeio); ctx.lineTo(xR + 70, yMeio); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.textAlign = "left"; ctx.textBaseline = "bottom";
          ctx.fillStyle = a === 0 ? api.C.gray : api.C.green;
          ctx.font = "600 13px Ubuntu, system-ui, sans-serif";
          ctx.fillText(a === 0 ? "equilíbrio: a = 0" : `a = ${api.fmt(a)} m/s²`, 24, 30);
          ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.fillText(`t = ${api.fmt(v.tertiary)} s · m₁ ${a >= 0 ? "desceu" : "subiu"} ${api.fmt(Math.abs(d))} m · m₂ ${a >= 0 ? "subiu" : "desceu"} o mesmo`, 24, 48);

          /* Painel secundário: a tração satura em 2m₂g. */
          const s = api.axes(api.second, 0.2, 8, 0, 2 * 8 * P.G / 2, "massa m₁ (kg)", "tração T (N)");
          api.line(s, api.curve((m) => P.atwood(m, v.secondary).T, 0.2, 8, 140), api.C.gold);
          api.hline(s, 2 * v.secondary * P.G, api.C.red, [5, 4], "limite 2m₂g quando m₁→∞");
          api.dot(s, v.parameter, T, api.C.red, 4.5);
        },

        text(v, api) {
          const { a, T } = P.atwood(v.parameter, v.secondary);
          const M = v.parameter + v.secondary;
          return {
            title: "Aceleração e tração",
            subtitle: `m₁ = ${api.fmt(v.parameter, 1)} kg · m₂ = ${api.fmt(v.secondary, 1)} kg`,
            regime: Math.abs(a) < 1e-9 ? ["equilíbrio", "ok"] : ["acelerado", "warn"],
            caption: "O fio inextensível é o vínculo: o que m₁ desce, m₂ sobe (a linha tracejada é a posição inicial), e uma única aceleração descreve as duas massas. A tração é a mesma nos dois ramos; os pesos, não.",
            prediction: "Se m₁ crescer indefinidamente, a tração cresce sem limite ou satura?",
            calculation: `a = g(m₁−m₂)/(m₁+m₂) = 9,8·(${api.fmt(v.parameter, 1)}−${api.fmt(v.secondary, 1)})/${api.fmt(M, 1)} = <b>${api.fmt(a)} m/s²</b><br>T = 2m₁m₂g/(m₁+m₂) = <b>${api.fmt(T)} N</b><em>confira: m₂g + m₂a = ${api.fmt(v.secondary * P.G + v.secondary * a)} N, o mesmo valor</em>`,
            metrics: [
              ["aceleração", `${api.fmt(a)} m/s²`],
              ["tração T", `${api.fmt(T)} N`],
              ["peso de m₁", `${api.fmt(v.parameter * P.G)} N`],
              ["peso de m₂", `${api.fmt(v.secondary * P.G)} N`],
              ["deslocamento em t", `${api.fmt(0.5 * a * v.tertiary ** 2)} m`]
            ],
            concept: "Um vínculo transforma dois problemas em um: as duas equações de Newton mais o fio deixam apenas uma aceleração independente.",
            prompts: [
              "Confirme que T fica sempre entre os dois pesos.",
              "Faça m₂ tender a zero e recupere a queda livre.",
              "Mostre que T → 2m₂g quando m₁ cresce, e explique o fator 2."
            ],
            legend: [[api.C.green, "m₁"], [api.C.blue, "m₂"], [api.C.gold, "tração T"], [api.C.red, "pesos"]],
            secondaryTitle: "Tração contra m₁, com m₂ fixo",
            secondarySubtitle: "a saturação é o resultado que a previsão costuma errar",
            secondaryCaption: "A tração não diverge: satura em 2m₂g, o dobro do peso da massa leve."
          };
        }
      },

      {
        id: "pvi",
        tab: "Problema de<br>valor inicial",
        heading: "Uma lei, muitas soluções",
        equation: "mẍ = F₀,  x(0) = x₀,  ẋ(0) = v₀",
        hint: "A família cinza tem a mesma lei. Só as condições iniciais escolhem a curva verde.",
        controls: [
          { id: "parameter", label: "posição inicial x₀", min: -4, max: 8, step: 0.1, value: 0, digits: 1, unit: "m" },
          { id: "secondary", label: "velocidade inicial v₀", min: -8, max: 12, step: 0.1, value: 6, digits: 1, unit: "m/s" },
          { id: "tertiary", label: "aceleração a = F₀/m", min: -6, max: 3, step: 0.1, value: -2, digits: 1, unit: "m/s²" }
        ],

        draw(api, v) {
          const chart = api.axes(api.main, 0, 6, -12, 20, "tempo t (s)", "posição x (m)");
          /* Família de soluções da mesma equação, com dados iniciais variados. */
          for (let i = 0; i < 9; i += 1) {
            const v0 = -8 + i * 2.5;
            api.line(chart, api.curve((t) => P.position(t, v.parameter, v0, v.tertiary), 0, 6, 90), "#cfd8d0", [], 1.5);
          }
          for (let i = 0; i < 7; i += 1) {
            const x0 = -4 + i * 2;
            api.line(chart, api.curve((t) => P.position(t, x0, v.secondary, v.tertiary), 0, 6, 90), "#e0e6e1", [], 1.3);
          }
          api.line(chart, api.curve((t) => P.position(t, v.parameter, v.secondary, v.tertiary), 0, 6, 200), api.C.green, [], 3.2);
          api.dot(chart, 0, v.parameter, api.C.red, 5.5);
          api.hline(chart, 0, "#b9c4bb", []);
          /* Tangente inicial: a inclinação é v₀. */
          api.line(chart, [[0, v.parameter], [1.6, v.parameter + v.secondary * 1.6]], api.C.gold, [5, 4], 1.8);
          api.label(chart, 1.65, v.parameter + v.secondary * 1.6, "inclinação = v₀", api.C.gold, "left");
        },

        text(v, api) {
          const tApex = v.tertiary === 0 ? Infinity : -v.secondary / v.tertiary;
          const xApex = Number.isFinite(tApex) && tApex > 0 ? P.position(tApex, v.parameter, v.secondary, v.tertiary) : NaN;
          return {
            title: "A família de soluções e a escolhida",
            subtitle: `x₀ = ${api.fmt(v.parameter, 1)} m · v₀ = ${api.fmt(v.secondary, 1)} m/s · a = ${api.fmt(v.tertiary, 1)} m/s²`,
            caption: "Todas as curvas cinzas obedecem à mesma equação. O que distingue a verde não é física nova: são dois números.",
            prediction: "Quantos dados são necessários para escolher uma única curva? E se a equação fosse de primeira ordem?",
            calculation: `x(t) = x₀ + v₀t + ½at² = ${api.fmt(v.parameter, 1)} + ${api.fmt(v.secondary, 1)}t + ${api.fmt(0.5 * v.tertiary)}t²<br>x(2) = <b>${api.fmt(P.position(2, v.parameter, v.secondary, v.tertiary))} m</b><em>ẋ(0) = ${api.fmt(v.secondary, 1)} m/s é a inclinação da reta laranja</em>`,
            metrics: [
              ["x(2 s)", `${api.fmt(P.position(2, v.parameter, v.secondary, v.tertiary))} m`],
              ["v(2 s)", `${api.fmt(P.velocity(2, v.secondary, v.tertiary))} m/s`],
              ["instante de retorno", Number.isFinite(tApex) && tApex > 0 ? `${api.fmt(tApex)} s` : "não há"],
              ["x no retorno", Number.isFinite(xApex) ? `${api.fmt(xApex)} m` : "—"],
              ["curvatura ½a", api.fmt(0.5 * v.tertiary)]
            ],
            concept: "A condição inicial não é uma lei adicional: ela seleciona, entre as soluções permitidas, aquela que representa o experimento.",
            prompts: [
              "Mude x₀ e confirme que a família apenas se desloca verticalmente.",
              "Encontre duas condições iniciais diferentes que passem pelo mesmo ponto em t = 2 s.",
              "Explique por que todas as curvas têm a mesma segunda diferença."
            ],
            legend: [[api.C.green, "solução escolhida"], ["#cfd8d0", "mesma lei, outros dados"], [api.C.gold, "inclinação v₀"]]
          };
        }
      },

      {
        id: "tracao",
        tab: "Tração<br>ortopédica",
        heading: "Tração de Russell",
        equation: "T = mg em toda a corda<br>pé: R = 2T cos(θ/2)<br>joelho: N = mg − T",
        hint: "Uma corda só: a tipoia sob o joelho sobe até a roldana suspensa, segue pelo suporte, dá a volta na roldana presa ao pé e desce até o contrapeso. Abra θ com o contrapeso fixo e preveja o que muda.",
        controls: [
          { id: "parameter", label: "contrapeso pendurado", min: 0.5, max: 10, step: 0.1, value: 3, digits: 1, unit: "kg" },
          { id: "secondary", label: "ângulo θ entre os segmentos", min: 0, max: 150, step: 1, value: 90, digits: 0, unit: "°" },
          { id: "tertiary", label: "atrito membro–leito μ_s", min: 0, max: 0.6, step: 0.01, value: 0.35, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const { ctx, width, height } = api.main;
          const T = P.pulleyTension(v.parameter);
          const R = P.slingResultant(T, v.secondary);
          const meio = P.rad(v.secondary) / 2;
          const atrito = P.frictionLimitLifted(8, v.tertiary, T);
          const kF = Math.min(1.4, 100 / Math.max(T, R, atrito, 1e-6));   // px por newton, com teto
          const fonte = (peso, tam) => { ctx.font = `${peso} ${tam}px Ubuntu, system-ui, sans-serif`; };

          /* Leito e membro em vista lateral: quadril à esquerda, joelho fletido, pé à direita. */
          const yL = Math.round(height * 0.56);
          const xA = 64, xK = xA + 165, yK = yL - 66, xF = xK + 150, yF = yL - 18;
          api.hatch(ctx, xA - 40, yL + 12, xF + 40, yL + 12, "#b6c0b7", 11, 9);
          ctx.strokeStyle = "#9fb0a2"; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(xA - 40, yL + 12); ctx.lineTo(xF + 40, yL + 12); ctx.stroke();
          ctx.lineCap = "round"; ctx.strokeStyle = "#8f9a91";
          ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(xA, yL); ctx.lineTo(xK, yK); ctx.stroke();      // coxa
          ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(xK, yK); ctx.lineTo(xF, yF); ctx.stroke();      // perna
          ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(xF, yF); ctx.lineTo(xF + 6, yF + 15); ctx.stroke(); // pé
          ctx.lineCap = "butt";
          ctx.fillStyle = "#8f9a91"; ctx.beginPath(); ctx.arc(xA, yL, 10, 0, api.TAU); ctx.fill();      // quadril
          ctx.fillStyle = api.C.muted; fonte(600, 11); ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText("membro (8 kg) sobre o leito", (xA + xF) / 2, yL + 22);

          /* Placa no pé com a roldana móvel. */
          const xPe = xF + 22, rPe = 9;
          ctx.strokeStyle = api.C.gray; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(xF + 8, yF - 16); ctx.lineTo(xF + 8, yF + 16); ctx.stroke();
          ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xF + 8, yF); ctx.lineTo(xPe, yF); ctx.stroke();

          /* Suporte no pé do leito: roldana no alto, roldana P1 e roldana P2 simétricas em torno
             do eixo do pé; comprimento dos segmentos limitado para tudo caber no quadro. */
          const yTop = 24;
          const sen = Math.max(Math.sin(meio), 0.01);
          const Lseg = Math.min(170, (yF - yTop - 30) / sen, (height - yF - 96) / sen);
          const xS = xPe + Lseg * Math.cos(meio), xPost = xS + 12;
          const yAm = yF - Lseg * sen, yRo = yF + Lseg * sen;
          ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(xPost, 12); ctx.lineTo(xPost, height - 12); ctx.stroke();
          ctx.lineWidth = 1.6; ctx.strokeStyle = api.C.gray;
          for (const yy of [yAm, yRo]) { ctx.beginPath(); ctx.moveTo(xPost, yy); ctx.lineTo(xS, yy); ctx.stroke(); }
          /* Trilho superior com a roldana suspensa sobre o joelho. */
          ctx.strokeStyle = "#8a968c"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(xK - 40, yTop - 10); ctx.lineTo(xPost, yTop - 10); ctx.stroke();

          /* A corda: tipoia → roldana suspensa → roldana do suporte → P1 → roldana do pé → P2 → contrapeso. */
          const rRo = 9;
          ctx.strokeStyle = api.C.ink; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(xK, yK + 4, 13, 0.12 * Math.PI, 0.88 * Math.PI);                          // tipoia sob o joelho
          ctx.moveTo(xK, yK + 17); ctx.lineTo(xK, yTop + rRo);                                // sobe
          ctx.arc(xK, yTop, rRo, Math.PI / 2, -Math.PI / 2, true);                          // roldana suspensa
          ctx.lineTo(xPost - rRo, yTop - rRo);                                                // trilho até o suporte
          ctx.arc(xPost, yTop, rRo, -Math.PI / 2, 0, false);                                  // roldana do suporte
          ctx.lineTo(xPost + rRo, yAm - 2);                                                    // desce pelo suporte
          ctx.moveTo(xS, yAm);                                                                 // P1 (desvio até o pé)
          ctx.lineTo(xPe + rPe * Math.sin(meio), yF - rPe * Math.cos(meio));
          ctx.arc(xPe, yF, rPe, -Math.PI / 2 + meio, Math.PI / 2 - meio, true);              // roldana do pé
          ctx.lineTo(xS, yRo);                                                                 // P2
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(xPost + rRo, yAm - 2); ctx.lineTo(xS + rRo, yAm - 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(xS, yRo, rRo, -Math.PI / 2 - (Math.PI / 2 - meio), Math.PI / 2, false); ctx.stroke();
          const xPeso = xS + rRo, yPeso = Math.min(height - 64, yRo + 60);
          ctx.beginPath(); ctx.moveTo(xPeso, yRo); ctx.lineTo(xPeso, yPeso); ctx.stroke();
          const roldana = (x, y, r) => {
            ctx.fillStyle = "#e8ede8"; ctx.strokeStyle = api.C.gray; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(x, y, r, 0, api.TAU); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(x, y, 2, 0, api.TAU); ctx.stroke();
          };
          roldana(xK, yTop, rRo); roldana(xPost, yTop, rRo); roldana(xS, yAm, rRo); roldana(xS, yRo, rRo); roldana(xPe, yF, rPe);
          ctx.fillStyle = "#dcecd4"; ctx.strokeStyle = api.C.green; ctx.lineWidth = 2;
          ctx.fillRect(xPeso - 16, yPeso, 32, 24); ctx.strokeRect(xPeso - 16, yPeso, 32, 24);
          ctx.fillStyle = api.C.green; fonte(600, 11); ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText(`${api.fmt(v.parameter, 1)} kg`, xPeso, yPeso + 27);
          ctx.fillStyle = api.C.muted; fonte(400, 11); ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText("roldana suspensa", xK + 14, yTop + 16);
          ctx.fillText("tipoia", xK + 16, yK + 10);
          if (v.secondary > 8) { ctx.fillText("P₁", xPost + 8, yAm); ctx.fillText("P₂", xPost + 8, yRo); }
          else ctx.fillText("P₁ e P₂", xPost + 8, yRo);
          /* Ângulo θ no pé. */
          if (v.secondary > 4) {
            ctx.strokeStyle = api.C.blue; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(xPe, yF, 30, -meio, meio); ctx.stroke();
            ctx.fillStyle = api.C.blue; fonte(600, 11); ctx.textAlign = "left"; ctx.textBaseline = "bottom";
            ctx.fillText("θ", xPe + 34, yF - 6);
          }

          /* Forças sobre o membro: T para cima no joelho; T em cada segmento no pé, com
             resultante R ao longo do eixo; atrito do leito no apoio, contra R. */
          api.vector(ctx, xK, yK, xK, yK - T * kF, api.C.blue, 2.4, 8);
          ctx.fillStyle = api.C.blue; fonte(600, 11); ctx.textAlign = "right"; ctx.textBaseline = "middle";
          ctx.fillText(`T = ${api.fmt(T, 1)} N`, xK - 8, yK - (T * kF) / 2);
          const seg = (sinal, rotular) => {
            const ex = xPe + T * kF * Math.cos(sinal * meio), ey = yF - T * kF * Math.sin(sinal * meio);
            api.vector(ctx, xPe, yF, ex, ey, api.C.blue, 2.4, 8);
            if (!rotular) return;
            const mx = (xPe + ex) / 2 - 14 * Math.sin(meio), my = (yF + ey) / 2 - sinal * 14 * Math.cos(meio);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(v.secondary > 8 ? `T = ${api.fmt(T, 1)} N` : `T = ${api.fmt(T, 1)} N em cada segmento`, mx, my);
          };
          seg(1, true); seg(-1, v.secondary > 8);
          api.vector(ctx, xPe, yF, xPe + R * kF, yF, api.C.red, 3.2, 10);
          ctx.fillStyle = api.C.red; ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillText(`R = 2T cos(θ/2) = ${api.fmt(R, 1)} N`, xA + 110, yL + 40);
          api.vector(ctx, xA, yL, xA - atrito * kF, yL, api.C.gold, 3.2, 10);
          ctx.fillStyle = api.C.gold; ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillText(`atrito ≤ ${api.fmt(atrito, 1)} N`, 8, yL + 40);

          /* Tração útil contra o ângulo, com o teto de atrito. */
          const s2 = api.axes(api.second, 0, 150, 0, Math.max(2 * T, atrito) * 1.08, "ângulo θ (°)", "tração útil R (N)");
          api.line(s2, api.curve((t) => P.slingResultant(T, t), 0, 150, 160), api.C.blue, [], 2.8);
          api.hline(s2, atrito, api.C.gold, [5, 4], "atrito disponível");
          api.dot(s2, v.secondary, R, api.C.red, 5);
          api.vline(s2, 120, api.C.grayLight, [3, 4], "θ = 120°: R = T");
        },

        text(v, api) {
          const T = P.pulleyTension(v.parameter);
          const R = P.slingResultant(T, v.secondary);
          const atrito = P.frictionLimitLifted(8, v.tertiary, T);
          const escorrega = R > atrito;
          const tilt = P.counterTractionTilt(R, 70);
          return {
            title: "Tração de membro por contrapeso",
            subtitle: `${api.fmt(v.parameter, 1)} kg · θ = ${api.fmt(v.secondary, 0)}° · μ_s = ${api.fmt(v.tertiary)}`,
            regime: escorrega ? ["membro escorrega — precisa de contratração", "alert"] : ["em equilíbrio sobre o leito", "ok"],
            caption: "Uma só corda: da tipoia sob o joelho sobe à roldana suspensa, corre pelo trilho, desce pelo suporte (P₁), dá a volta na roldana presa ao pé e sai por P₂ até o contrapeso. Roldanas ideais mudam a direção da força, não o módulo: T = mg em todo o comprimento. A tipoia puxa o joelho para cima com T; os dois segmentos no pé puxam com T cada, e o ângulo entre eles decide quanto sobra ao longo do membro.",
            prediction: "Abrir o ângulo entre os dois segmentos aumenta ou diminui a tração da corda? E a tração útil?",
            calculation: `T = mg = ${api.fmt(v.parameter, 1)}·9,8 = <b>${api.fmt(T, 2)} N</b> — não depende de θ<br>R = 2T cos(θ/2) = 2·${api.fmt(T, 2)}·cos(${api.fmt(v.secondary / 2, 1)}°) = <b>${api.fmt(R, 2)} N</b><em>tipoia alivia o apoio: N = mg − T = ${api.fmt(8 * P.G, 1)} − ${api.fmt(T, 1)} = ${api.fmt(P.liftedNormal(8, T), 1)} N; atrito disponível μN = ${api.fmt(v.tertiary)}·${api.fmt(P.liftedNormal(8, T), 1)} = ${api.fmt(atrito, 2)} N ⟹ ${escorrega ? "insuficiente" : "suficiente"}</em>`,
            metrics: [
              ["tração da corda T", `${api.fmt(T, 2)} N`],
              ["tração útil R", `${api.fmt(R, 2)} N`],
              ["fração aproveitada R/2T", api.fmt(R / (2 * T), 3)],
              ["normal no leito, mg − T", `${api.fmt(P.liftedNormal(8, T), 2)} N`],
              ["atrito disponível μ(mg − T)", `${api.fmt(atrito, 2)} N`],
              ["θ para aproveitar metade", `${api.fmt(P.angleForFraction(0.5), 0)}°`],
              ["inclinação de contratração", Number.isFinite(tilt) ? `${api.fmt(tilt, 1)}°` : "impossível"]
            ],
            concept: "Três resultados da aula aparecem juntos em um aparelho real: a roldana ideal preserva o módulo da tração, componentes transversais se cancelam por simetria, e o equilíbrio só fecha se houver uma força de contratração. Quando o atrito não basta, a contratração vem de inclinar a cabeceira do leito — o peso do próprio paciente entra no diagrama de corpo livre.",
            prompts: [
              "Verifique que T não muda quando você abre θ, e explique por quê. Com θ = 0 a roldana do pé recebe 2T: é a vantagem mecânica da roldana móvel.",
              "Ache o ângulo em que a tração útil cai à metade do máximo e confirme que vale 120°.",
              "Com μ_s = 0,35, ache o contrapeso a partir do qual o membro escorregaria. Repare que aumentar o contrapeso age dos dois lados: sobe R e, pela tipoia, reduz o atrito disponível."
            ],
            legend: [[api.C.blue, "tração T (joelho e pé)"], [api.C.red, "resultante útil no pé"], [api.C.gold, "atrito do leito"], [api.C.green, "contrapeso"]],
            secondaryTitle: "Tração útil contra o ângulo",
            secondarySubtitle: "R = 2T cos(θ/2), com T fixo",
            secondaryCaption: "Acima da linha dourada o atrito não segura o membro e é preciso inclinar o leito."
          };
        }
      }
    ]
  };
})();
