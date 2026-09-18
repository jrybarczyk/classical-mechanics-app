(function () {
  "use strict";
  const P = window.LessonPhysics;
  const L10 = Math.log10;

  /* Sistemas de referência marcados na estação de escalas: [rótulo, L(m), v(m/s)] */
  const SISTEMAS = [
    ["bactéria", 2e-6, 2e-5],
    ["hemácia", 8e-6, 1e-3],
    ["capilar", 8e-6, 5e-4],
    ["gota de névoa", 2e-5, 1e-2],
    ["aorta", 2.5e-2, 0.3],
    ["nadador", 1.8, 1.2],
    ["bola de tênis", 6.7e-2, 30]
  ];

  window.LessonScene = {
    id: "aula01",
    discipline: "Mecânica Clássica · Aula 1",
    title: "Modelos, escalas e dimensões",
    subtitle: "O que decide qual modelo mecânico é o certo para uma pergunta?",

    stations: [
      /* ------------------------------------------------------------- */
      {
        id: "escalas",
        tab: "Escalas<br>e regimes",
        heading: "Número de Reynolds",
        equation: "Re = ρvL/η",
        hint: "Fixe o fluido e varie o tamanho. Antes de mover, decida onde a hemácia deve cair.",
        controls: [
          { id: "parameter", label: "velocidade v (log₁₀ m/s)", min: -6, max: 2, step: 0.05, value: -3, digits: 2 },
          { id: "secondary", label: "viscosidade η", min: 0.3e-3, max: 5e-3, step: 0.05e-3, value: 1.2e-3, digits: 4, unit: "Pa·s" },
          { id: "tertiary", label: "densidade ρ", min: 800, max: 1300, step: 5, value: 1025, digits: 0, unit: "kg/m³" }
        ],

        draw(api, v) {
          const vel = Math.pow(10, v.parameter);
          const chart = api.axes(api.main, -7, 1, -8, 7, "tamanho L (m)", "log₁₀ Re", {
            xFormat: (t) => `10${api.sup(Math.round(t))}`,
            yFormat: (t) => `10${api.sup(Math.round(t))}`
          });

          /* Faixas de regime: abaixo de Re=1 domina a viscosidade. */
          api.area(chart, [[-7, 0], [1, 0]], "rgba(97,155,96,.07)", -8);
          api.hline(chart, 0, api.C.green, [6, 4], "Re = 1  ·  arrasto linear abaixo");
          api.hline(chart, 3, api.C.red, [6, 4], "Re = 10³  ·  arrasto quadrático acima");

          /* Re é linear em L, portanto uma reta de inclinação 1 no gráfico log-log. */
          api.line(chart, api.curve((lx) => L10(P.reynolds(v.tertiary, vel, Math.pow(10, lx), v.secondary)), -7, 1, 80), api.C.blue);

          /* Cheio: cada sistema à velocidade do controle (todos sobre a reta).
             Vazado: cada sistema à sua velocidade típica — o Re que ele tem de fato. */
          SISTEMAS.forEach(([nome, L, vTipica], k) => {
            const yProprio = L10(P.reynolds(v.tertiary, vTipica, L, v.secondary));
            if (yProprio >= -8 && yProprio <= 7) api.dot(chart, L10(L), yProprio, api.C.gold, 4.5, true);
            const y = L10(P.reynolds(v.tertiary, vel, L, v.secondary));
            if (y < -8 || y > 7) return;
            api.dot(chart, L10(L), y, api.C.gold, 4);
            api.label(chart, L10(L), y + (k % 2 ? -0.55 : 0.45), nome, api.C.muted, "center", k % 2 ? "top" : "bottom");
          });
        },

        text(v, api) {
          const vel = Math.pow(10, v.parameter);
          const Re = P.reynolds(v.tertiary, vel, 8e-6, v.secondary);
          const L1 = P.reynoldsLength(1, v.tertiary, vel, v.secondary);
          const L1000 = P.reynoldsLength(1000, v.tertiary, vel, v.secondary);
          const regime = P.dragRegime(Re);
          const rotulo = { linear: ["viscosidade domina", "ok"], transicao: ["regime de transição", "warn"], quadratico: ["inércia domina", "alert"] }[regime];
          return {
            title: "Reynolds contra tamanho",
            subtitle: `v = ${api.sci(vel)} m/s · η = ${api.sci(v.secondary)} Pa·s`,
            regime: rotulo,
            caption: "Re é proporcional a L, logo uma reta de inclinação 1 neste gráfico. O que muda com o fluido é a altura da reta, não sua inclinação.",
            prediction: "Uma hemácia (8 μm, 1 mm/s) e uma bola de tênis diferem em quantas ordens de grandeza de Re?",
            calculation: `Re = ρvL/η = ${api.sci(v.tertiary, 0)}·${api.sci(vel)}·8,0·10⁻⁶ / ${api.sci(v.secondary)}<br><b>= ${api.sci(Re)}</b><em>invertendo a expressão: L(Re = 1) = η/(ρv) = ${api.sci(L1)} m</em>`,
            metrics: [
              ["Re da hemácia", api.sci(Re)],
              ["Re do nadador", api.sci(P.reynolds(v.tertiary, vel, 1.8, v.secondary))],
              ["razão entre eles", api.sci(1.8 / 8e-6, 0)],
              ["L para Re = 1", `${api.sci(L1)} m`],
              ["L para Re = 10³", `${api.sci(L1000)} m`],
              ["regime de arrasto", regime === "linear" ? "linear" : regime === "quadratico" ? "quadrático" : "transição"]
            ],
            concept: "O número adimensional, e não o tamanho ou a velocidade isoladamente, decide quais termos o modelo pode descartar. Inverter Re mostra onde a troca de modelo ocorre para as condições atuais.",
            prompts: [
              "Ache o tamanho em que a reta cruza Re = 1 para a velocidade atual.",
              "Aumente η até levar a bola de tênis ao regime linear. O valor obtido é fisicamente plausível?",
              "Os pontos vazados usam a velocidade típica de cada sistema. Bactéria e aorta: quantas ordens de grandeza de Re os separam?",
              "Explique por que dois sistemas com o mesmo Re obedecem à mesma equação adimensional."
            ],
            legend: [[api.C.blue, "Re(L) à velocidade do controle"], [api.C.gold, "vazado: Re à velocidade típica"], [api.C.green, "Re = 1"], [api.C.red, "Re = 10³"]]
          };
        }
      },

      /* ------------------------------------------------------------- */
      {
        id: "dimensional",
        tab: "Análise<br>dimensional",
        heading: "Queda: t = C·hᵃ·g^b",
        equation: "[hᵃg^b] = L^(a+b) · T^(−2b)",
        hint: "Procure o par (a,b) que zera o erro dimensional. Só então compare com a conta dinâmica.",
        controls: [
          { id: "parameter", label: "expoente a de h", min: -1, max: 1.5, step: 0.05, value: 1, digits: 2 },
          { id: "secondary", label: "expoente b de g", min: -1.5, max: 1, step: 0.05, value: 0, digits: 2 },
          { id: "tertiary", label: "altura h", min: 0.5, max: 120, step: 0.5, value: 20, digits: 1, unit: "m" }
        ],
        secondary: true,

        draw(api, v) {
          const d = P.fallDimensions(v.parameter, v.secondary);

          /* Painel principal: expoentes obtidos contra os expoentes exigidos. */
          const chart = api.axes(api.main, 0, 2, -2, 2.2, "", "expoente", { xTicks: [] });
          api.hline(chart, 0, "#b9c4bb", []);
          api.bars(chart, [
            ["expoente de L — obtido", d.L, Math.abs(d.L) < 1e-9 ? api.C.green : api.C.red],
            ["expoente de T — obtido", d.T, Math.abs(d.T - 1) < 1e-9 ? api.C.green : api.C.red]
          ], api.C.blue);
          api.hline(chart, 1, api.C.gold, [6, 4], "alvo do expoente de T");
          api.label(chart, 0.5, -1.7, "alvo do expoente de L = 0", api.C.gold, "center");
          api.hline(chart, 0, api.C.gold, [2, 3]);

          /* Painel secundário: o erro dimensional ao longo de b, com a fixo. */
          const s = api.axes(api.second, -1.5, 1, 0, 3.2, "expoente b", "erro dimensional");
          api.line(s, api.curve((b) => Math.min(3.2, P.dimensionError(-b, b)), -1.5, 1, 160), api.C.green);
          api.dot(s, v.secondary, Math.min(3.2, P.dimensionError(-v.secondary, v.secondary)), api.C.red, 5);
          api.vline(s, -0.5, api.C.gold, [5, 4], "b = −½");
        },

        text(v, api) {
          const d = P.fallDimensions(v.parameter, v.secondary);
          const erro = P.dimensionError(v.parameter, v.secondary);
          const t = P.fallTime(v.tertiary, 9.8);
          const aTarget = 0.5, bTarget = -0.5;
          const ok = erro < 1e-9;
          return {
            title: "Homogeneidade dimensional",
            subtitle: `a = ${api.fmt(v.parameter)} · b = ${api.fmt(v.secondary)}`,
            regime: ok ? ["dimensionalmente consistente", "ok"] : ["inconsistente", "alert"],
            caption: "A exigência de homogeneidade é um sistema linear nos expoentes. Ele tem solução única aqui — e é isso que dá poder ao método.",
            prediction: "Antes de mexer: quantos pares (a,b) você espera que zerem o erro?",
            calculation: `[hᵃg^b] = L^(a+b)·T^(−2b) = L^(${api.fmt(d.L)})·T^(${api.fmt(d.T)})<br><b>${ok ? "= T ✓" : "≠ T ✗"}</b><em>a+b=0 e −2b=1 ⇒ (a,b)=(${api.fmt(aTarget)}, ${api.fmt(bTarget)}); a dinâmica fixa C=√2 e t=${api.fmt(t)} s</em>`,
            metrics: [
              ["expoente de L", api.fmt(d.L)],
              ["expoente de T", api.fmt(d.T)],
              ["erro dimensional", api.fmt(erro)],
              ["distância até (½, −½)", api.fmt(Math.hypot(v.parameter - aTarget, v.secondary - bTarget))],
              ["t = √(2h/g)", `${api.fmt(t)} s`],
              ["C obtido pela dinâmica", api.fmt(Math.SQRT2)]
            ],
            concept: "A análise dimensional fixa a forma da resposta e nunca o fator numérico: C vem da equação de movimento e das condições iniciais.",
            prompts: [
              "Mostre que a+b = 0 e −2b = 1 têm solução única.",
              "Encontre um par (a,b) com erro pequeno mas não nulo e explique por que ele é inaceitável.",
              "A massa poderia entrar em t? Justifique só com dimensões."
            ],
            legend: [[api.C.green, "consistente"], [api.C.red, "inconsistente"], [api.C.gold, "alvo"]],
            secondaryTitle: "Erro ao longo de b, com a = −b",
            secondarySubtitle: "corte do espaço de expoentes que mantém L cancelado",
            secondaryCaption: "Mesmo restringindo a busca à reta a = −b, só um ponto zera o erro."
          };
        }
      },

      /* ------------------------------------------------------------- */
      {
        id: "validade",
        tab: "Tubo de raios X<br>clássico × relativístico",
        heading: "Quando Newton basta",
        equation: "β_cl = √(2T/mc²)  ·  β_rel = √(1 − (1+T/mc²)⁻²)",
        hint: "Suba a tensão do tubo e veja as duas velocidades se separarem. A tolerância é decisão sua.",
        controls: [
          { id: "parameter", label: "tensão do tubo V_ac", min: 10, max: 300, step: 1, value: 100, digits: 0, unit: "kV" },
          { id: "secondary", label: "tolerância aceita", min: 0.001, max: 0.2, step: 0.001, value: 0.01, digits: 3 },
          { id: "tertiary", label: "escala L da pergunta (log₁₀ m)", min: -11, max: -1, step: 0.1, value: -2, digits: 1 }
        ],
        secondary: true,

        draw(api, v) {
          const T = v.parameter;                       // keV: 1 elétron · 1 kV = 1 keV
          const mc2 = P.MC2_ELECTRON_KEV;
          const xMax = 0.65;

          /* Principal: a figura da aula — β contra T/mc², clássica ultrapassa c, relativística satura. */
          const chart = api.axes(api.main, 0, xMax, 0, 1.25, "T/mc²  (energia cinética em unidades da energia de repouso)", "β = v/c");
          api.hline(chart, 1, api.C.red, [6, 4], "v = c");
          api.line(chart, api.curve((x) => P.betaClassical(x, 1), 0, xMax, 160), api.C.blue);
          api.line(chart, api.curve((x) => P.betaRelativistic(x, 1), 0, xMax, 160), api.C.green);

          const x = T / mc2;
          const bc = P.betaClassical(T), br = P.betaRelativistic(T);
          api.vline(chart, x, api.C.gold, [4, 4], `${api.fmt(T, 0)} keV`);
          api.line(chart, [[x, br], [x, Math.min(bc, 1.25)]], api.C.red, [], 3);
          api.dot(chart, x, Math.min(bc, 1.25), api.C.blue, 5.5);
          api.dot(chart, x, br, api.C.green, 5.5);
          api.label(chart, x + 0.012, br - 0.02, `β_rel = ${api.fmt(br)}`, api.C.green, "left", "top");
          if (bc < 1.2) api.label(chart, x + 0.012, bc + 0.02, `β_cl = ${api.fmt(bc)}`, api.C.blue, "left", "bottom");

          /* Secundário: o erro newtoniano ao longo de muitas ordens de grandeza de v,
             com os marcadores do curso e o elétron do tubo. */
          const s = api.axes(api.second, 0, 9, -18, 1, "velocidade v (m/s)", "log₁₀ do erro em ½mv²", {
            xFormat: (t) => `10${api.sup(Math.round(t))}`,
            yFormat: (t) => `10${api.sup(Math.round(t))}`
          });
          api.line(s, api.curve((lv) => {
            const e = P.kineticError(Math.pow(10, lv));
            return e <= 0 ? -18 : Math.max(-18, L10(e));
          }, 0, 8.45, 220), api.C.blue);
          api.hline(s, L10(v.secondary), api.C.gold, [6, 4], "tolerância aceita");
          api.vline(s, L10(P.C_LIGHT), api.C.red, [4, 4], "c");
          const marcas = [["automóvel", 30], ["satélite baixo", 7660], ["próton de 200 MeV", 1.7e8]];
          marcas.forEach(([nome, vel]) => {
            const y = Math.max(-18, L10(P.kineticError(vel)));
            api.dot(s, L10(vel), y, api.C.gold, 4);
            api.label(s, L10(vel) - 0.1, y + 0.6, nome, api.C.muted, "right", "bottom");
          });
          const vEl = br * P.C_LIGHT;
          const yEl = Math.max(-18, L10(P.kineticError(vEl)));
          api.dot(s, L10(vEl), yEl, api.C.red, 5.5);
          api.label(s, L10(vEl) - 0.1, yEl - 3.2, `elétron ${api.fmt(T, 0)} keV`, api.C.red, "right", "top");
        },

        text(v, api) {
          const T = v.parameter;
          const mc2 = P.MC2_ELECTRON_KEV;
          const bc = P.betaClassical(T), br = P.betaRelativistic(T);
          const gamma = 1 + T / mc2;
          const erro = P.betaError(T);
          const p = P.electronMomentum(T);
          const lambda = P.deBroglie(p);
          const L = Math.pow(10, v.tertiary);
          const S = P.actionRatio(p, L);
          const dentro = erro < v.secondary;
          const quantico = S < 10;
          return {
            title: "Elétron no tubo: velocidade clássica × relativística",
            subtitle: `V_ac = ${api.fmt(T, 0)} kV · T/mc² = ${api.fmt(T / mc2, 3)} · γ = ${api.fmt(gamma, 3)}`,
            regime: dentro ? ["newtoniano basta", "ok"] : quantico ? ["relativístico e ondulatório", "alert"] : ["já relativístico", "alert"],
            caption: "A curva clássica ultrapassa c; a relativística satura. Em radiologia diagnóstica o elétron já vive na região em que as duas se separam.",
            prediction: "Antes de mover: a 100 kV, a fórmula clássica erra a velocidade do elétron em 1 %, 10 % ou 50 %?",
            calculation: `β_cl = √(2T/mc²) = √(${api.fmt(2 * T / mc2, 3)}) = ${api.fmt(bc, 3)}<br>β_rel = √(1 − γ⁻²) = ${api.fmt(br, 3)} <b>erro = ${api.fmt(100 * erro, 1)} %</b><em>λ = h/p = ${api.sci(lambda)} m; contra L = ${api.sci(L)} m, S/ħ ~ pL/ħ = ${api.sci(S)}</em>`,
            metrics: [
              ["β clássico", api.fmt(bc, 3)],
              ["β relativístico", api.fmt(br, 3)],
              ["erro na velocidade", `${api.fmt(100 * erro, 2)} %`],
              ["v relativística", `${api.sci(br * P.C_LIGHT)} m/s`],
              ["λ de de Broglie", `${api.sci(lambda)} m`],
              ["S/ħ ~ pL/ħ", api.sci(S)]
            ],
            concept: "Uma teoria pode ser limitada e ainda assim extraordinariamente precisa dentro do seu domínio. E o domínio não é do objeto: o mesmo elétron é partícula clássica contra o percurso no tubo e onda contra o espaçamento atômico do alvo.",
            prompts: [
              "Ache a tensão em que o erro na velocidade atinge a tolerância escolhida.",
              "Leve L de 1 cm (percurso no tubo) a 10⁻¹⁰ m (rede do alvo). Em qual das duas perguntas o elétron difrata?",
              "No painel inferior, compare o erro do automóvel com o de uma medida experimental típica de 0,1 %.",
              "Um próton de terapia tem v ≈ 0,57c. O tratamento newtoniano do alcance seria aceitável?"
            ],
            legend: [[api.C.blue, "clássico"], [api.C.green, "relativístico"], [api.C.red, "v = c"], [api.C.gold, "tolerância / tensão atual"]],
            secondaryTitle: "Erro de ½mv² ao longo de oito ordens de grandeza",
            secondarySubtitle: "automóvel, satélite, próton de terapia e o elétron do tubo",
            secondaryCaption: "O erro cresce como (v/c)²: a mecânica newtoniana segue excelente por muitas décadas de v e falha de repente."
          };
        }
      },

      /* ------------------------------------------------------------- */
      {
        id: "galileu",
        tab: "Transformação<br>de Galileu",
        heading: "A gota de soro na maca",
        equation: "r = Vt + r'   ·   v = V + v'   ·   a = a'",
        hint: "Animar percorre o tempo. Compare os dois painéis: o que muda de um observador para o outro e o que não muda?",
        controls: [
          { id: "parameter", label: "velocidade da maca V", min: 0, max: 3, step: 0.05, value: 1, digits: 2, unit: "m/s" },
          { id: "secondary", label: "altura da gota h", min: 0.3, max: 2, step: 0.05, value: 1.2, digits: 2, unit: "m" },
          { id: "tertiary", label: "instante t", min: 0, max: 0.7, step: 0.005, value: 0.25, digits: 3, unit: "s" }
        ],
        animate: { control: "tertiary", period: 1.75 },   // 0,7 s de queda em 1,75 s de relógio: 2,5× mais lento que o tempo real
        secondary: true,

        draw(api, v) {
          const g = 9.8;
          const d = P.galileoDrop(v.tertiary, v.parameter, v.secondary, g);
          const alcance = P.galileoRange(v.parameter, v.secondary, g);
          const xMax = Math.max(1.6, alcance * 1.35);
          const yMax = v.secondary * 1.25;
          const escalaV = 0.12 * v.secondary;           // 1 m/s → 0,12·h no desenho
          const escalaA = 0.03 * v.secondary;           // 1 m/s² → 0,03·h

          /* ---- S: chão. A maca anda, a gota descreve uma parábola. ---- */
          const chart = api.axes(api.main, -0.25 * xMax, xMax, -0.12 * yMax, yMax, "x (m) — referencial do chão S", "y (m)");
          api.hline(chart, 0, "#b9c4bb", []);
          /* maca (retângulo) e haste do equipo, ambos em x = Vt */
          api.area(chart, [[d.x - 0.35, 0.08 * v.secondary], [d.x + 0.35, 0.08 * v.secondary]], "rgba(97,155,96,.35)", 0);
          api.line(chart, [[d.x + 0.3, 0], [d.x + 0.3, v.secondary]], api.C.grayLight, [], 2);
          api.line(chart, [[d.x + 0.3, v.secondary], [d.x, v.secondary]], api.C.grayLight, [], 2);
          api.dot(chart, 0, v.secondary, api.C.gold, 3.5, true);
          api.label(chart, 0, v.secondary + 0.05 * yMax, "solta aqui", api.C.muted, "center");
          /* trajetória em S: parábola de (0,h) a (V t_q, 0) */
          api.line(chart, api.param((t) => { const q = P.galileoDrop(t, v.parameter, v.secondary, g); return [q.x, q.y]; }, 0, d.tFall, 120), api.C.blue, [4, 4], 1.8);
          api.dot(chart, alcance, 0, api.C.blue, 3.5, true);
          /* gota, velocidade e aceleração */
          api.dot(chart, d.x, d.y, api.C.red, 6);
          if (Math.hypot(d.vx, d.vy) > 1e-6) api.arrow(chart, d.x, d.y, d.x + escalaV * d.vx, d.y + escalaV * d.vy, api.C.blue);
          api.arrow(chart, d.x, d.y, d.x, d.y + escalaA * d.ay, api.C.violet, 2.4, 7);
          api.label(chart, d.x + 0.02 * xMax, d.y + 0.35 * escalaV * d.vy, "v = V + v'", api.C.blue, "left", "middle");
          api.label(chart, d.x - 0.02 * xMax, d.y + escalaA * d.ay, "a = −g e_y", api.C.violet, "right", "top");

          /* ---- S': maca. A gota cai na vertical. ---- */
          const s = api.axes(api.second, -0.25 * xMax, xMax, -0.12 * yMax, yMax, "x' (m) — referencial da maca S'", "y' (m)");
          api.hline(s, 0, "#b9c4bb", []);
          api.area(s, [[-0.35, 0.08 * v.secondary], [0.35, 0.08 * v.secondary]], "rgba(97,155,96,.35)", 0);
          api.line(s, [[0.3, 0], [0.3, v.secondary]], api.C.grayLight, [], 2);
          api.line(s, [[0.3, v.secondary], [0, v.secondary]], api.C.grayLight, [], 2);
          api.line(s, [[0, v.secondary], [0, 0]], api.C.green, [4, 4], 1.8);
          api.dot(s, d.xPrime, d.yPrime, api.C.red, 6);
          if (Math.abs(d.vyPrime) > 1e-6) api.arrow(s, 0, d.yPrime, 0, d.yPrime + escalaV * d.vyPrime, api.C.green);
          api.arrow(s, 0.04 * xMax, d.yPrime, 0.04 * xMax, d.yPrime + escalaA * d.ay, api.C.violet, 2.4, 7);
          api.label(s, -0.015 * xMax, d.yPrime + 0.5 * escalaV * d.vyPrime, "v'", api.C.green, "right", "middle");
          api.label(s, 0.055 * xMax, d.yPrime + escalaA * d.ay, "a' = a", api.C.violet, "left", "top");
          /* o chão, visto da maca, passa para trás com velocidade −V */
          if (v.parameter > 0) {
            api.arrow(s, 0.7 * xMax, 0.5 * yMax, 0.7 * xMax - escalaV * v.parameter, 0.5 * yMax, api.C.grayLight, 2, 7);
            api.label(s, 0.7 * xMax, 0.55 * yMax, "chão visto de S': −V", api.C.muted, "center");
          }
        },

        text(v, api) {
          const g = 9.8;
          const d = P.galileoDrop(v.tertiary, v.parameter, v.secondary, g);
          const alcance = P.galileoRange(v.parameter, v.secondary, g);
          const modV = Math.hypot(d.vx, d.vy);
          return {
            title: "A mesma queda, dois observadores",
            subtitle: `V = ${api.fmt(v.parameter)} m/s · h = ${api.fmt(v.secondary)} m · t = ${api.fmt(d.t, 3)} s${d.landed ? " (gota na maca)" : ""}`,
            regime: d.landed ? ["queda concluída", "ok"] : ["em queda", "warn"],
            caption: "Trajetória e velocidade dependem de quem observa. A aceleração, não: derivar r = Vt + r' duas vezes mata o termo Vt porque V é constante.",
            prediction: "Antes de animar: vista do chão, a gota cai à frente, atrás ou exatamente sobre o ponto da maca de onde partiu?",
            calculation: `t_q = √(2h/g) = √(2·${api.fmt(v.secondary)}/9,8) <b>= ${api.fmt(d.tFall, 3)} s</b><em>em S a gota avança V·t_q = ${api.fmt(alcance, 3)} m — o mesmo que a maca; em S' ela não avança nada</em>`,
            metrics: [
              ["tempo de queda t_q", `${api.fmt(d.tFall, 3)} s`],
              ["avanço em S: V·t_q", `${api.fmt(alcance, 3)} m`],
              ["altura y = y'", `${api.fmt(d.y, 3)} m`],
              ["v' (maca)", `${api.fmt(Math.abs(d.vyPrime))} m/s ↓`],
              ["|v| (chão)", `${api.fmt(modV)} m/s`],
              ["a = a'", `${api.fmt(g)} m/s² ↓`]
            ],
            concept: "Dois referenciais inerciais concordam sobre a aceleração e, portanto, sobre a força. Se a maca acelerasse, apareceria um termo extra — é o assunto da Aula 10.",
            prompts: [
              "Ponha V = 0 e depois V = 3 m/s. O que muda em t_q? Por quê?",
              "Em que instante |v| em S é o dobro de |v'| em S'? Resolva à mão e confira.",
              "Um observador na maca pode decidir, só olhando a gota, se a maca está em movimento?",
              "Se a maca estivesse freando, os dois painéis continuariam mostrando a mesma aceleração?"
            ],
            legend: [[api.C.red, "gota"], [api.C.blue, "trajetória e v em S"], [api.C.green, "trajetória e v' em S'"], [api.C.violet, "aceleração"]],
            secondaryTitle: "Referencial da maca S'",
            secondarySubtitle: "queda vertical a partir do repouso",
            secondaryCaption: "Para quem vai na maca, a gota cai em linha reta e pousa onde se soltou. O chão é que passa para trás."
          };
        }
      },

      /* ------------------------------------------------------------- */
      {
        id: "frenagem",
        tab: "Frenagem da<br>ambulância",
        heading: "Distância de parada",
        equation: "v = v₀ − |a|t   ·   x_p = v₀²/(2|a|)",
        hint: "Responda à previsão antes de tocar em v₀. As duas ambulâncias cinzentas mostram o que aconteceria com 1,5·v₀ e 2·v₀.",
        controls: [
          { id: "parameter", label: "velocidade inicial v₀", min: 5, max: 40, step: 0.5, value: 20, digits: 1, unit: "m/s" },
          { id: "secondary", label: "desaceleração |a|", min: 1, max: 10, step: 0.1, value: 5, digits: 1, unit: "m/s²" },
          { id: "tertiary", label: "instante t", min: 0, max: 12, step: 0.05, value: 1.5, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 8 },
        secondary: true,

        draw(api, v) {
          const b = P.braking(v.tertiary, v.parameter, v.secondary);
          const tMax = Math.max(4, b.tStop * 1.15);

          /* Principal: v(t), com a área sob a curva até t = deslocamento. */
          const chart = api.axes(api.main, 0, tMax, 0, v.parameter * 1.15, "t (s)", "v (m/s)");
          api.area(chart, api.curve((t) => Math.max(0, v.parameter - v.secondary * t), 0, Math.min(v.tertiary, b.tStop), 60), "rgba(69,123,157,.18)", 0);
          api.line(chart, [[0, v.parameter], [b.tStop, 0], [tMax, 0]], api.C.blue);
          api.vline(chart, b.tStop, api.C.gold, [5, 4], `t_p = ${api.fmt(b.tStop)} s`);
          api.dot(chart, Math.min(v.tertiary, b.tStop), b.v, api.C.red, 5.5);
          api.label(chart, Math.max(0.12 * tMax, Math.min(v.tertiary, b.tStop) * 0.5), v.parameter * 0.06, `área = x(t) = ${api.fmt(b.x, 1)} m`, api.C.blue, "center", "bottom");

          /* Secundário: a pista. Três ambulâncias partem juntas em x = 0 com a mesma
             desaceleração: a real (v₀) e duas hipotéticas (1,5·v₀ e 2·v₀). Cada uma
             para na sua marca — é a razão 1 : 2,25 : 4 vista acontecer. */
          const xDobro = P.stopDistance(2 * v.parameter, v.secondary);
          const xMax = Math.max(60, xDobro * 1.24);
          const s = api.axes(api.second, -0.1 * xMax, xMax, 0, 1, "x (m)", "", { yTicks: [] });
          api.area(s, [[-0.1 * xMax, 0.95], [xMax, 0.95]], "#e3e8e2", 0.05);
          const w = 0.06 * xMax, hgt = 0.17;

          const ambulancia = (bb, yBase, cor, rotulo, fantasma) => {
            const corpo = fantasma ? "rgba(120,130,125,.35)" : cor;
            api.area(s, [[bb.x - w, yBase + hgt], [bb.x, yBase + hgt]], corpo, yBase);
            api.area(s, [[bb.x - w, yBase + hgt * 0.62], [bb.x - 0.3 * w, yBase + hgt * 0.62]], "#fff", yBase + hgt * 0.35);
            api.dot(s, bb.x - w * 0.8, yBase, fantasma ? api.C.grayLight : api.C.ink, 4);
            api.dot(s, bb.x - w * 0.2, yBase, fantasma ? api.C.grayLight : api.C.ink, 4);
            if (bb.v > 0.05) api.arrow(s, bb.x + 0.005 * xMax, yBase + hgt * 0.5, bb.x + 0.005 * xMax + (bb.v / (2 * v.parameter)) * 0.14 * xMax, yBase + hgt * 0.5, fantasma ? api.C.grayLight : api.C.blue);
            api.label(s, bb.x - w / 2, yBase + hgt + 0.03, rotulo, cor, "center");
            api.vline(s, bb.xStop, cor, fantasma ? [3, 5] : [5, 4]);
            api.label(s, bb.xStop + 0.008 * xMax, yBase + hgt * 0.5, `x_p = ${api.fmt(bb.xStop, 0)} m`, cor, "left", "middle");
          };

          const b15 = P.braking(v.tertiary, 1.5 * v.parameter, v.secondary);
          const b2 = P.braking(v.tertiary, 2 * v.parameter, v.secondary);
          ambulancia(b2, 0.68, api.C.ink, `2·v₀ = ${api.fmt(2 * v.parameter, 0)} m/s`, true);
          ambulancia(b15, 0.40, api.C.violet, `1,5·v₀ = ${api.fmt(1.5 * v.parameter, 0)} m/s`, true);
          ambulancia(b, 0.12, api.C.red, `v₀ = ${api.fmt(v.parameter, 0)} m/s · x = ${api.fmt(b.x, 1)} m`, false);
        },

        text(v, api) {
          const b = P.braking(v.tertiary, v.parameter, v.secondary);
          const x15 = P.stopDistance(1.5 * v.parameter, v.secondary);
          const x2 = P.stopDistance(2 * v.parameter, v.secondary);
          return {
            title: "Frenagem com desaceleração constante",
            subtitle: `v₀ = ${api.fmt(v.parameter, 1)} m/s (${api.fmt(3.6 * v.parameter, 0)} km/h) · |a| = ${api.fmt(v.secondary, 1)} m/s² · t = ${api.fmt(v.tertiary)} s`,
            regime: b.stopped ? ["parada", "ok"] : ["freando", "warn"],
            caption: "A área sob v(t) é o deslocamento: um triângulo de base v₀/|a| e altura v₀, logo x_p = v₀²/(2|a|). O quadrado é o que surpreende.",
            prediction: "Antes de mover v₀: se a velocidade dobrar, a distância de frenagem dobra, triplica ou quadruplica? E se subir 50 %?",
            calculation: `t_p = v₀/|a| = ${api.fmt(v.parameter, 1)}/${api.fmt(v.secondary, 1)} = ${api.fmt(b.tStop)} s<br>x_p = v₀²/(2|a|) <b>= ${api.fmt(b.xStop, 1)} m</b><em>com 1,5·v₀: ${api.fmt(x15, 1)} m (+125 %); com 2·v₀: ${api.fmt(x2, 1)} m (×4)</em>`,
            metrics: [
              ["tempo de parada t_p", `${api.fmt(b.tStop)} s`],
              ["distância de parada x_p", `${api.fmt(b.xStop, 1)} m`],
              ["v(t)", `${api.fmt(b.v)} m/s`],
              ["x(t)", `${api.fmt(b.x, 1)} m`],
              ["x_p com v₀ +50 %", `${api.fmt(x15, 1)} m`],
              ["x_p com v₀ dobrada", `${api.fmt(x2, 1)} m`]
            ],
            concept: "Mesma lei, condições iniciais diferentes, respostas muito diferentes: x_p não é linear em v₀. É esse par — lei de evolução mais condição inicial — que define o problema de valor inicial da Aula 4.",
            prompts: [
              "Deduza x_p = v₀²/(2|a|) pela área do triângulo e confira com a leitura.",
              "Com |a| fixa, que v₀ dobra x_p em relação ao valor atual? Não é 2v₀.",
              "Compare 72 km/h com 108 km/h em pista molhada (|a| ≈ 3 m/s²). Quantos metros a mais?",
              "Em t = t_p/2, que fração de x_p já foi percorrida? Explique pela área."
            ],
            legend: [[api.C.blue, "v(t) e deslocamento"], [api.C.red, "ambulância real, v₀"], [api.C.violet, "fantasma com 1,5·v₀"], [api.C.ink, "fantasma com 2·v₀"], [api.C.gold, "t_p"]],
            secondaryTitle: "A pista: três largadas, três paradas",
            secondarySubtitle: "a ambulância real e duas hipotéticas, com 1,5·v₀ e 2·v₀, freando com a mesma |a|",
            secondaryCaption: "As três partem juntas de x = 0. A de 1,5·v₀ para 125 % adiante; a de 2·v₀, quatro vezes mais longe. A real nunca chega lá — e é esse o ponto."
          };
        }
      }
    ]
  };
})();
