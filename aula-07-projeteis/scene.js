(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula07",
    discipline: "Mecânica Clássica · Aula 7",
    title: "Projéteis com e sem arrasto",
    subtitle: "Por que o alcance horizontal é limitado mesmo em queda indefinida?",

    stations: [
      {
        id: "trajetoria",
        tab: "Trajetória<br>e assimetria",
        heading: "Lançamento com arrasto linear",
        equation: "x = τv₀ₓ(1 − e^{−t/τ})<br>y = −v_T t + τ(v₀ᵧ + v_T)(1 − e^{−t/τ})",
        hint: "Reduza τ e observe os dois ramos. Preveja qual fica mais íngreme.",
        controls: [
          { id: "parameter", label: "rapidez inicial v₀", min: 5, max: 40, step: 0.5, value: 20, digits: 1, unit: "m/s" },
          { id: "secondary", label: "ângulo α", min: 5, max: 85, step: 1, value: 45, digits: 0, unit: "°" },
          { id: "tertiary", label: "tempo de arrasto τ", min: 0.6, max: 20, step: 0.1, value: 4, digits: 1, unit: "s" }
        ],
        secondary: true,

        draw(api, v) {
          const a = P.rad(v.secondary);
          const v0x = v.parameter * Math.cos(a), v0y = v.parameter * Math.sin(a);
          const Rv = P.vacuumRange(v.parameter, v.secondary);
          const Tv = P.vacuumTime(v.parameter, v.secondary);
          const Td = P.flightTime(v.parameter, v.secondary, v.tertiary);
          const xm = Math.max(Rv, P.horizontalLimit(v0x, v.tertiary)) * 1.08;
          const ym = P.vacuumApex(v.parameter, v.secondary) * 1.25;
          const chart = api.axes(api.main, 0, xm, 0, Math.max(ym, 1), "alcance x (m)", "altura y (m)");

          api.line(chart, api.param((t) => [v0x * t, v0y * t - 0.5 * P.G * t * t], 0, Tv, 200), api.C.grayLight, [6, 4], 2);
          api.line(chart, api.param((t) => [P.dragX(t, v0x, v.tertiary), P.dragY(t, v0y, v.tertiary)], 0, Td, 260), api.C.green, [], 3);

          api.vline(chart, P.horizontalLimit(v0x, v.tertiary), api.C.red, [4, 4], "limite τv₀ₓ");
          api.dot(chart, Rv, 0, api.C.grayLight, 4.5);
          api.dot(chart, P.dragRange(v.parameter, v.secondary, v.tertiary), 0, api.C.green, 5);

          /* Ápice de cada trajetória, para tornar a assimetria mensurável. */
          const tApexD = v.tertiary * Math.log((v0y + P.G * v.tertiary) / (P.G * v.tertiary));
          api.dot(chart, P.dragX(tApexD, v0x, v.tertiary), P.dragY(tApexD, v0y, v.tertiary), api.C.gold, 4.5, true);
          api.dot(chart, v0x * Tv / 2, P.vacuumApex(v.parameter, v.secondary), api.C.grayLight, 4, true);

          const s = api.axes(api.second, 0, Td * 1.02, -P.G * v.tertiary * 1.1, Math.max(v0y, v0x) * 1.1, "tempo t (s)", "velocidade (m/s)");
          api.line(s, api.curve((t) => P.dragVx(t, v0x, v.tertiary), 0, Td, 160), api.C.blue);
          api.line(s, api.curve((t) => P.dragVy(t, v0y, v.tertiary), 0, Td, 160), api.C.red);
          api.hline(s, -P.G * v.tertiary, api.C.gold, [5, 4], "−v_T");
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const a = P.rad(v.secondary);
          const v0x = v.parameter * Math.cos(a), v0y = v.parameter * Math.sin(a);
          const Rv = P.vacuumRange(v.parameter, v.secondary);
          const Rd = P.dragRange(v.parameter, v.secondary, v.tertiary);
          const lim = P.horizontalLimit(v0x, v.tertiary);
          const vT = P.G * v.tertiary;
          return {
            title: "Trajetória com e sem arrasto",
            subtitle: `v₀ = ${api.fmt(v.parameter, 1)} m/s · α = ${api.fmt(v.secondary, 0)}° · τ = ${api.fmt(v.tertiary, 1)} s`,
            regime: v0y / vT < 0.15 ? ["arrasto fraco", "ok"] : v0y / vT < 0.5 ? ["arrasto moderado", "warn"] : ["arrasto forte", "alert"],
            caption: "A curva cinza é a parábola. A verde perde a simetria: o ramo descendente é mais íngreme, e no limite de tempo longo a queda vira vertical.",
            prediction: "Existe um alcance horizontal máximo mesmo se a queda continuasse para sempre?",
            calculation: `v_T = gτ = 9,8·${api.fmt(v.tertiary, 1)} = <b>${api.fmt(vT)} m/s</b><br>x_∞ = τv₀ₓ = ${api.fmt(v.tertiary, 1)}·${api.fmt(v0x)} = <b>${api.fmt(lim)} m</b><em>alcance real ${api.fmt(Rd)} m, contra ${api.fmt(Rv)} m no vácuo</em>`,
            metrics: [
              ["alcance no vácuo", `${api.fmt(Rv)} m`],
              ["alcance com arrasto", `${api.fmt(Rd)} m`],
              ["limite horizontal τv₀ₓ", `${api.fmt(lim)} m`],
              ["v_T", `${api.fmt(vT)} m/s`],
              ["v₀ᵧ / v_T", api.fmt(v0y / vT)],
              ["tempo de voo", `${api.fmt(P.flightTime(v.parameter, v.secondary, v.tertiary))} s`]
            ],
            concept: "Com arrasto linear as componentes continuam desacopladas; cada uma é o problema da Aula 6, e é a componente horizontal que satura.",
            prompts: [
              "Aumente τ até a curva verde encostar na cinza e explique o limite.",
              "Compare o tempo de subida com o de descida e diga qual é maior.",
              "Verifique que x nunca passa de τv₀ₓ, por mais que o voo dure."
            ],
            legend: [[api.C.green, "com arrasto"], [api.C.grayLight, "vácuo"], [api.C.red, "limite horizontal"]],
            secondaryTitle: "Componentes da velocidade",
            secondarySubtitle: "vₓ decai a zero; vᵧ satura em −v_T",
            secondaryCaption: "É por isso que a queda final é vertical e o alcance para de crescer."
          };
        }
      },

      {
        id: "alcance",
        tab: "Ângulo<br>ótimo",
        heading: "Alcance contra ângulo",
        equation: "R₀ = v₀²sen2α/g",
        hint: "Sem arrasto o máximo está em 45° e ângulos complementares empatam. Preveja o que o arrasto faz com cada uma dessas duas propriedades.",
        controls: [
          { id: "parameter", label: "rapidez inicial v₀", min: 5, max: 40, step: 0.5, value: 20, digits: 1, unit: "m/s" },
          { id: "secondary", label: "tempo de arrasto τ", min: 0.6, max: 30, step: 0.1, value: 4, digits: 1, unit: "s" },
          { id: "tertiary", label: "ângulo examinado α", min: 5, max: 85, step: 1, value: 45, digits: 0, unit: "°" }
        ],

        draw(api, v) {
          const Rmax = P.vacuumRange(v.parameter, 45) * 1.1;
          const chart = api.axes(api.main, 0, 90, 0, Rmax, "ângulo α (°)", "alcance R (m)", { xTicks: [0, 15, 30, 45, 60, 75, 90] });
          api.line(chart, api.curve((a) => P.vacuumRange(v.parameter, a), 0, 90, 120), api.C.grayLight, [6, 4], 2);
          api.line(chart, api.curve((a) => P.dragRange(v.parameter, Math.max(0.5, a), v.secondary), 0.5, 89.5, 100), api.C.green, [], 3);

          const ot = P.optimalAngle(v.parameter, v.secondary);
          api.vline(chart, 45, api.C.grayLight, [3, 4], "45°");
          api.vline(chart, ot.angulo, api.C.red, [5, 4], `ótimo ${api.fmt(ot.angulo, 1)}°`);
          api.dot(chart, ot.angulo, ot.alcance, api.C.red, 5.5);
          api.dot(chart, v.tertiary, P.dragRange(v.parameter, v.tertiary, v.secondary), api.C.gold, 5);

          /* Par complementar: no vácuo empatam, com arrasto não. */
          const comp = 90 - v.tertiary;
          api.dot(chart, comp, P.dragRange(v.parameter, comp, v.secondary), api.C.blue, 4.5, true);
          api.label(chart, comp, P.dragRange(v.parameter, comp, v.secondary) + Rmax * 0.04, "complementar", api.C.blue, "center");
        },

        text(v, api) {
          const ot = P.optimalAngle(v.parameter, v.secondary);
          const R = P.dragRange(v.parameter, v.tertiary, v.secondary);
          const comp = 90 - v.tertiary;
          const Rc = P.dragRange(v.parameter, comp, v.secondary);
          return {
            title: "Alcance contra ângulo de lançamento",
            subtitle: `v₀ = ${api.fmt(v.parameter, 1)} m/s · τ = ${api.fmt(v.secondary, 1)} s`,
            regime: ot.angulo > 43 ? ["quase sem arrasto", "ok"] : ot.angulo > 36 ? ["ótimo deslocado", "warn"] : ["ótimo muito abaixo de 45°", "alert"],
            caption: "A curva cinza é simétrica em torno de 45°. A verde não é: o arrasto penaliza mais os ângulos altos, porque eles gastam mais tempo de voo.",
            prediction: "O arrasto desloca o ângulo ótimo para cima ou para baixo de 45°?",
            calculation: `R₀(45°) = v₀²/g = ${api.fmt(v.parameter, 1)}²/9,8 = <b>${api.fmt(P.vacuumRange(v.parameter, 45))} m</b><br>ótimo com arrasto: <b>${api.fmt(ot.angulo, 1)}°</b>, alcance ${api.fmt(ot.alcance)} m<em>α = ${api.fmt(v.tertiary, 0)}° dá ${api.fmt(R)} m; o complementar ${api.fmt(comp, 0)}° dá ${api.fmt(Rc)} m</em>`,
            metrics: [
              ["ângulo ótimo", `${api.fmt(ot.angulo, 1)}°`],
              ["alcance ótimo", `${api.fmt(ot.alcance)} m`],
              ["R(α)", `${api.fmt(R)} m`],
              ["R(90°−α)", `${api.fmt(Rc)} m`],
              ["diferença entre complementares", `${api.fmt(Math.abs(R - Rc))} m`],
              ["R₀(45°) no vácuo", `${api.fmt(P.vacuumRange(v.parameter, 45))} m`]
            ],
            concept: "A simetria entre ângulos complementares é uma propriedade da parábola, não do lançamento; qualquer dissipação a destrói.",
            prompts: [
              "Aumente τ até o ótimo voltar a 45° e diga o que isso significa fisicamente.",
              "Meça a diferença entre 30° e 60° para τ = 2 s e para τ = 20 s.",
              "Explique por que a penalidade cresce com o ângulo."
            ],
            legend: [[api.C.green, "com arrasto"], [api.C.grayLight, "vácuo"], [api.C.red, "ótimo"]]
          };
        }
      },

      {
        id: "correcao",
        tab: "Correção de<br>primeira ordem",
        heading: "Até onde a expansão vale",
        equation: "R ≈ R₀(1 − 4v₀ᵧ/3v_T)",
        hint: "O parâmetro que controla o desvio é v₀ᵧ/v_T. Ache o valor em que a fórmula erra 5 %.",
        controls: [
          { id: "parameter", label: "rapidez inicial v₀", min: 5, max: 40, step: 0.5, value: 20, digits: 1, unit: "m/s" },
          { id: "secondary", label: "ângulo α", min: 5, max: 85, step: 1, value: 30, digits: 0, unit: "°" },
          { id: "tertiary", label: "tempo de arrasto τ", min: 0.8, max: 60, step: 0.2, value: 8, digits: 1, unit: "s" }
        ],
        secondary: true,

        draw(api, v) {
          const exato = (tau) => P.dragRange(v.parameter, v.secondary, tau);
          const aprox = (tau) => P.rangeFirstOrder(v.parameter, v.secondary, tau);
          const R0 = P.vacuumRange(v.parameter, v.secondary);
          const v0y = v.parameter * Math.sin(P.rad(v.secondary));
          const xr = (tau) => v0y / (P.G * tau);

          const chart = api.axes(api.main, 0, 0.9, -0.2 * R0, R0 * 1.15, "v₀ᵧ / v_T", "alcance R (m)");
          const pts = [];
          const pts2 = [];
          for (let r = 0.01; r <= 0.9; r += 0.01) {
            const tau = v0y / (P.G * r);
            pts.push([r, exato(tau)]);
            pts2.push([r, aprox(tau)]);
          }
          api.line(chart, pts, api.C.green, [], 3);
          api.line(chart, pts2, api.C.red, [6, 4], 2.4);
          api.hline(chart, R0, api.C.grayLight, [3, 4], "R₀ sem arrasto");
          api.hline(chart, 0, "#b9c4bb", []);
          api.dot(chart, xr(v.tertiary), exato(v.tertiary), api.C.green, 5.5);
          api.dot(chart, xr(v.tertiary), aprox(v.tertiary), api.C.red, 5);

          const s = api.axes(api.second, 0, 0.9, 0, 40, "v₀ᵧ / v_T", "erro da correção (%)");
          const err = [];
          for (let r = 0.01; r <= 0.9; r += 0.01) {
            const tau = v0y / (P.G * r);
            err.push([r, Math.min(40, (Math.abs(aprox(tau) - exato(tau)) / exato(tau)) * 100)]);
          }
          api.line(s, err, api.C.blue);
          api.hline(s, 5, api.C.gold, [5, 4], "5 %");
          api.dot(s, xr(v.tertiary), Math.min(40, (Math.abs(aprox(v.tertiary) - exato(v.tertiary)) / exato(v.tertiary)) * 100), api.C.red, 4.5);
        },

        text(v, api) {
          const R0 = P.vacuumRange(v.parameter, v.secondary);
          const Rex = P.dragRange(v.parameter, v.secondary, v.tertiary);
          const Rap = P.rangeFirstOrder(v.parameter, v.secondary, v.tertiary);
          const v0y = v.parameter * Math.sin(P.rad(v.secondary));
          const vT = P.G * v.tertiary;
          const erro = (Math.abs(Rap - Rex) / Rex) * 100;
          return {
            title: "Expansão de primeira ordem contra o alcance exato",
            subtitle: `v₀ᵧ/v_T = ${api.fmt(v0y / vT)} · τ = ${api.fmt(v.tertiary, 1)} s`,
            regime: erro < 1 ? ["expansão confiável", "ok"] : erro < 5 ? ["erro perceptível", "warn"] : ["fora do alcance da expansão", "alert"],
            caption: "A tracejada vermelha é a fórmula de primeira ordem. Ela acompanha o resultado exato à esquerda e o abandona à direita — inclusive prevendo alcance negativo.",
            prediction: "A fórmula linear é uma aproximação por cima ou por baixo do alcance real?",
            calculation: `R₀ = v₀²sen2α/g = <b>${api.fmt(R0)} m</b><br>R ≈ R₀(1 − 4v₀ᵧ/3v_T) = ${api.fmt(R0)}·(1 − 4·${api.fmt(v0y)}/(3·${api.fmt(vT)})) = <b>${api.fmt(Rap)} m</b><em>alcance exato: ${api.fmt(Rex)} m — erro de ${api.fmt(erro, 1)} %</em>`,
            metrics: [
              ["v₀ᵧ / v_T", api.fmt(v0y / vT)],
              ["R₀ (vácuo)", `${api.fmt(R0)} m`],
              ["R de primeira ordem", `${api.fmt(Rap)} m`],
              ["R exato", `${api.fmt(Rex)} m`],
              ["erro relativo", `${api.fmt(erro, 1)} %`]
            ],
            concept: "Uma expansão em série carrega o seu próprio domínio: o parâmetro pequeno é v₀ᵧ/v_T, e é ele — não v₀ nem τ isolados — que decide se a fórmula serve.",
            prompts: [
              "Ache o valor de v₀ᵧ/v_T em que o erro atinge 5 %.",
              "Mostre que dobrar v₀ e τ ao mesmo tempo mantém o erro inalterado.",
              "Explique por que a fórmula chega a prever alcance negativo, e o que isso revela."
            ],
            legend: [[api.C.green, "exato"], [api.C.red, "primeira ordem"], [api.C.grayLight, "R₀"]],
            secondaryTitle: "Erro relativo da correção",
            secondarySubtitle: "cresce como o quadrado do parâmetro pequeno",
            secondaryCaption: "A linha de 5 % marca o fim prático do domínio da fórmula."
          };
        }
      },

      {
        id: "goticula",
        tab: "Gotícula<br>ou aerossol",
        heading: "O mesmo arrasto, em escala micrométrica",
        equation: "τ = 2ρR²/9η   ·   alcance balístico = τ·v₀ₓ",
        hint: "Varie só o raio. Preveja como o alcance responde a dividir R por dez.",
        controls: [
          { id: "parameter", label: "raio da gotícula R", min: 1, max: 120, step: 1, value: 50, digits: 0, unit: "µm" },
          { id: "secondary", label: "velocidade de ejeção v₀", min: 1, max: 20, step: 0.5, value: 10, digits: 1, unit: "m/s" },
          { id: "tertiary", label: "ângulo de ejeção α", min: 0, max: 40, step: 1, value: 10, digits: 0, unit: "°" }
        ],
        secondary: true,

        draw(api, v) {
          const H = 1.5;                       /* altura da boca de um adulto sentado */
          const R = v.parameter * 1e-6;
          const tau = P.stokesTau(R);
          const v0x = v.secondary * Math.cos(P.rad(v.tertiary));
          const v0y = v.secondary * Math.sin(P.rad(v.tertiary));
          const tq = P.fallTime(H, v0y, tau);

          const chart = api.axes(api.main, 0, 2.5, 0, 2, "distância horizontal (m)", "altura (m)");
          /* Gotículas de referência, para o raio escolhido ter contra o que ser lido. */
          for (const rr of [10, 30, 60, 100]) {
            const t2 = P.stokesTau(rr * 1e-6);
            const tf = P.fallTime(H, v0y, t2);
            api.line(chart, api.param((t) => [P.dragX(t, v0x, t2), H + P.dragY(t, v0y, t2)], 0, tf, 300), "#cbd8cb", [], 1.5);
          }
          api.line(chart, api.param((t) => [P.dragX(t, v0x, tau), H + P.dragY(t, v0y, tau)], 0, tq, 400), api.C.green, [], 3.2);
          /* Sem arrasto nenhum, a mesma ejeção iria muito mais longe. */
          const tv = (v0y + Math.sqrt(v0y * v0y + 2 * P.G * H)) / P.G;
          api.line(chart, api.param((t) => [v0x * t, H + v0y * t - 0.5 * P.G * t * t], 0, tv, 200), api.C.grayLight, [5, 4], 1.6);
          api.vline(chart, P.horizontalLimit(v0x, tau), api.C.red, [4, 4], "limite τv₀ₓ");
          api.hline(chart, 0, "#8f9d91", []);
          api.dot(chart, 0, H, api.C.ink, 5);
          api.label(chart, 0.05, H + 0.1, "boca, 1,5 m", api.C.ink, "left");
          api.label(chart, 2.45, 1.85, "cinza: sem arrasto", api.C.grayLight, "right");

          /* Alcance e tempo de suspensão contra o raio, em log-log. */
          const s2 = api.axes(api.second, 0, 120, -4, 1.2, "raio R (µm)", "log₁₀ (m ou s)");
          api.line(s2, api.curve((r) => Math.log10(Math.max(1e-6, P.horizontalLimit(v0x, P.stokesTau(r * 1e-6)))), 1, 120, 200), api.C.blue, [], 2.6);
          api.line(s2, api.curve((r) => Math.log10(P.fallTime(H, v0y, P.stokesTau(r * 1e-6))), 1, 120, 120), api.C.violet, [4, 3], 2.4);
          api.vline(s2, v.parameter, api.C.ink, [3, 3]);
          api.hline(s2, 0, api.C.gold, [4, 3], "1 m · 1 s");
        },

        text(v, api) {
          const H = 1.5;
          const R = v.parameter * 1e-6;
          const tau = P.stokesTau(R);
          const vT = P.terminalSpeed(tau);
          const v0x = v.secondary * Math.cos(P.rad(v.tertiary));
          const v0y = v.secondary * Math.sin(P.rad(v.tertiary));
          const alc = P.horizontalLimit(v0x, tau);
          const tq = P.fallTime(H, v0y, tau);
          const est = P.settlingTime(H, vT);
          const balistica = alc > 0.5;
          return {
            title: "Trajetória de uma gotícula expelida",
            subtitle: `R = ${api.fmt(v.parameter, 0)} µm (diâmetro ${api.fmt(2 * v.parameter, 0)} µm) · v₀ = ${api.fmt(v.secondary, 1)} m/s`,
            regime: balistica ? ["gotícula: cai perto de quem falou", "warn"] : ["aerossol: fica suspenso", "alert"],
            caption: "A curva cinza é a mesma ejeção sem arrasto. Para gotícula grande as duas ainda se parecem; para gotícula fina o arrasto vence em milésimos de segundo e a trajetória vira uma queda vertical.",
            prediction: "Dividir o raio por dez divide o alcance por quanto?",
            calculation: `τ = 2ρR²/9η = 2·1000·(${api.sci(R, 2)})²/(9·1,8·10⁻⁵) = <b>${api.sci(tau, 3)} s</b><br>alcance balístico = τ·v₀ₓ = <b>${api.sci(alc, 3)} m</b><br>v_T = gτ = <b>${api.sci(vT, 3)} m/s</b><em>tempo para cair 1,5 m: ${api.fmt(tq, 2)} s (estimativa terminal h/v_T = ${api.fmt(est, 2)} s; no vácuo seriam 0,55 s)</em>`,
            metrics: [
              ["τ", `${api.sci(tau, 3)} s`],
              ["alcance balístico", `${api.sci(alc, 3)} m`],
              ["velocidade terminal", `${api.sci(vT, 3)} m/s`],
              ["tempo de queda exato", `${api.fmt(tq, 2)} s`],
              ["estimativa h/v_T", `${api.fmt(est, 2)} s`],
              ["alcance sem arrasto", `${api.fmt(P.vacuumRange(v.secondary, v.tertiary), 2)} m`]
            ],
            concept: "Como τ vai com R², dividir o raio por dez divide o alcance e a velocidade terminal por cem. É essa única potência que separa dois regimes de transmissão respiratória: gotículas de 100 µm de diâmetro caem em cerca de 5 s e a menos de meio metro, enquanto as de 10 µm levam oito minutos para descer 1,5 m e praticamente não avançam — ficam suspensas e são carregadas pelo ar da sala. A distância de segurança faz sentido contra as primeiras; contra as segundas, o que importa é ventilação.",
            prompts: [
              "Confirme que reduzir R de 50 µm para 5 µm divide o alcance por cem.",
              "Ache o raio em que o tempo de queda de 1,5 m passa de um minuto.",
              "Compare o tempo de queda exato com h/v_T e diga em que faixa de R a estimativa deixa de valer."
            ],
            legend: [[api.C.green, "gotícula escolhida"], ["#cbd8cb", "10, 30, 60 e 100 µm"], [api.C.grayLight, "sem arrasto"], [api.C.blue, "alcance"], [api.C.violet, "tempo de queda"]],
            secondaryTitle: "Alcance e tempo de queda contra o raio",
            secondarySubtitle: "escala logarítmica: as duas retas têm inclinação ±2",
            secondaryCaption: "A inclinação 2 é a assinatura de τ ∝ R², e é ela que separa gotícula de aerossol."
          };
        }
      },

      /* ---------------- Física médica 1: manchas de sangue ---------------- */
      {
        id: "manchas",
        tab: "Perícia:<br>manchas de sangue",
        heading: "Gota de sangue como projétil e a elipse da mancha",
        equation: "tan β = |v<sub>y</sub>|/v<sub>x</sub> no impacto · w/ℓ = sin β · h<sub>reta</sub> = d·tan β",
        hint: "Compare a altura reconstruída por linha reta com a altura real. Para lançamento horizontal a razão é exatamente 2.",
        controls: [
          { id: "parameter", label: "rapidez da gota v₀", min: 0.5, max: 8, step: 0.1, value: 1.5, digits: 1, unit: "m/s" },
          { id: "secondary", label: "altura de origem h", min: 0.2, max: 2, step: 0.05, value: 0.6, digits: 2, unit: "m" },
          { id: "tertiary", label: "ângulo de saída α", min: -30, max: 30, step: 1, value: 0, digits: 0, unit: "°" },
          { id: "quaternary", label: "diâmetro da gota", min: 1, max: 4, step: 0.1, value: 2, digits: 1, unit: "mm" }
        ],
        secondary: true,

        draw(api, v) {
          const r = P.bloodDrop(v.parameter, v.tertiary, v.secondary);
          const a = P.rad(v.tertiary), vx = v.parameter * Math.cos(a), vy = v.parameter * Math.sin(a);
          const hReta = P.stringingHeight(r.d, r.betaGraus);
          const xm = Math.max(r.d * 1.15, 0.5), ym = Math.max(hReta, v.secondary) * 1.15;
          const chart = api.axes(api.main, 0, xm, 0, ym, "distância horizontal (m)", "altura (m)");
          /* trajetória real (parábola) */
          api.line(chart, api.param((t) => [vx * t, v.secondary + vy * t - 0.5 * P.G * t * t], 0, r.t, 200), api.C.red, [], 3);
          /* linha reta do método pericial: do ponto de impacto, com ângulo β, até x = 0 */
          api.line(chart, [[r.d, 0], [0, hReta]], api.C.blue, [6, 4], 2);
          api.dot(chart, 0, v.secondary, api.C.red, 5);
          api.dot(chart, 0, hReta, api.C.blue, 5, true);
          api.dot(chart, r.d, 0, api.C.ink, 4);
          api.label(chart, 0.02 * xm, v.secondary, "origem real", api.C.red, "left", "bottom");
          api.label(chart, 0.02 * xm, hReta, "origem por linha reta", api.C.blue, "left", "bottom");
          api.label(chart, r.d, 0.03 * ym, `β = ${api.fmt(r.betaGraus, 0)}°`, api.C.ink, "right", "bottom");

          /* painel secundário: o padrão no anteparo (piso), visto de cima. Várias gotas
             partem da mesma origem com azimutes e rapidezes um pouco diferentes; cada
             mancha é uma elipse com w/ℓ = sin β, cauda para fora, e o eixo maior
             prolongado para trás converge na projeção da origem. */
          const s = api.second, ctx = s.ctx;
          ctx.save();
          ctx.fillStyle = "#fbfcfa"; ctx.fillRect(0, 0, s.width, s.height);
          const gotas = P.spatterPattern(v.parameter, v.tertiary, v.secondary, 26);
          const dmax = Math.max(...gotas.map((q) => q.d)) * 1.08;
          const ox = 26, oy = s.height / 2, esc = (s.width - 60) / dmax;
          const X = (q) => ox + q.d * Math.cos(q.phi) * esc, Y = (q) => oy + q.d * Math.sin(q.phi) * esc;
          /* linhas de convergência (prolongamento do eixo maior) */
          ctx.strokeStyle = "rgba(69,123,157,.35)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
          gotas.forEach((q) => { ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(q), Y(q)); ctx.stroke(); });
          ctx.setLineDash([]);
          /* manchas */
          const wpx = Math.max(7, 5 * v.quaternary);
          gotas.forEach((q) => {
            const L = wpx / Math.max(q.razaoWL, 0.08);
            ctx.save(); ctx.translate(X(q), Y(q)); ctx.rotate(q.phi);
            ctx.fillStyle = "rgba(160,30,30,.85)";
            ctx.beginPath(); ctx.ellipse(0, 0, L / 2, wpx / 2, 0, 0, 2 * Math.PI); ctx.fill();
            if (q.razaoWL < 0.95) { ctx.beginPath(); ctx.moveTo(L * 0.3, -wpx * 0.45); ctx.lineTo(L * 0.75, 0); ctx.lineTo(L * 0.3, wpx * 0.45); ctx.closePath(); ctx.fill(); }
            ctx.restore();
          });
          /* ponto de convergência e escala */
          ctx.fillStyle = api.C.blue; ctx.beginPath(); ctx.arc(ox, oy, 4, 0, 2 * Math.PI); ctx.fill();
          ctx.fillStyle = api.C.ink; ctx.font = "600 11px Ubuntu, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillText("ponto de convergência (projeção da origem)", ox + 8, 8);
          const barra = esc * (dmax > 2 ? 0.5 : dmax > 0.8 ? 0.2 : 0.1);
          ctx.strokeStyle = api.C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s.width - 20 - barra, s.height - 14); ctx.lineTo(s.width - 20, s.height - 14); ctx.stroke();
          ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(`${(barra / esc).toLocaleString("pt-BR")} m`, s.width - 20, s.height - 18);
          ctx.restore();
        },

        text(v, api) {
          const r = P.bloodDrop(v.parameter, v.tertiary, v.secondary);
          const hReta = P.stringingHeight(r.d, r.betaGraus);
          const vT = P.quadraticTerminal(v.quaternary * 1e-3 / 2);
          /* arrasto médio ao longo do voo, em unidades de g: ⟨v²⟩/v_T² com ⟨v²⟩ = v₀² + g²t²/3 */
          const arrasto = (v.parameter ** 2 + (P.G * r.t) ** 2 / 3) / (vT * vT);
          const Re = 1.2 * r.vImpacto * v.quaternary * 1e-3 / 1.8e-5;
          return {
            title: "Gota de sangue como projétil e a elipse da mancha",
            subtitle: `v₀ = ${api.fmt(v.parameter, 1)} m/s · h = ${api.fmt(v.secondary, 2)} m · α = ${api.fmt(v.tertiary, 0)}° · gota de ${api.fmt(v.quaternary, 1)} mm`,
            regime: arrasto < 0.15 ? ["arrasto desprezível: modelo ideal vale", "ok"] : arrasto < 0.4 ? ["arrasto já desvia alguns por cento", "warn"] : ["arrasto forte: só a geometria da mancha vale", "alert"],
            caption: "Vermelho: a trajetória real da gota. Azul tracejado: a linha reta que o perito traça a partir da mancha com o ângulo β medido na elipse. A linha reta chega a uma altura maior que a origem real.",
            prediction: "Para lançamento horizontal, quantas vezes a altura real é a altura reconstruída por linha reta?",
            calculation: `impacto: tan β = |v_y|/v_x = ${api.fmt(Math.tan(P.rad(r.betaGraus)), 2)} → β = <b>${api.fmt(r.betaGraus, 1)}°</b><br>mancha: w/ℓ = sin β = <b>${api.fmt(r.razaoWL, 2)}</b><br>linha reta: h_reta = d·tan β = ${api.fmt(r.d, 2)} × ${api.fmt(Math.tan(P.rad(r.betaGraus)), 2)} = <b>${api.fmt(hReta, 2)} m</b> (real: ${api.fmt(v.secondary, 2)} m)<em>arrasto médio em unidades de g: ⟨v²⟩/v_T² = ${api.fmt(arrasto, 2)} (v_T = ${api.fmt(vT, 1)} m/s; Re ≈ ${api.fmt(Re, 0)}, regime quadrático, não Stokes)</em>`,
            metrics: [
              ["distância horizontal d", `${api.fmt(r.d, 2)} m`],
              ["tempo de voo", `${api.fmt(r.t, 2)} s`],
              ["ângulo de impacto β", `${api.fmt(r.betaGraus, 1)}°`],
              ["w/ℓ da mancha", api.fmt(r.razaoWL, 2)],
              ["altura por linha reta", `${api.fmt(hReta, 2)} m`],
              ["razão h_reta/h", api.fmt(hReta / v.secondary, 2)],
              ["v_T da gota (quadrático)", `${api.fmt(vT, 1)} m/s`],
              ["⟨v²⟩/v_T² (arrasto médio / g)", api.fmt(arrasto, 2)],
              ["β no padrão (mais perto → mais longe)", `${api.fmt(P.spatterPattern(v.parameter, v.tertiary, v.secondary, 26).reduce((m, q) => Math.max(m, q.betaGraus), 0), 0)}° → ${api.fmt(P.spatterPattern(v.parameter, v.tertiary, v.secondary, 26).reduce((m, q) => Math.min(m, q.betaGraus), 90), 0)}°`]
            ],
            concept: "A mancha é uma elipse porque a gota, esférica em voo, atinge a superfície obliquamente: a largura w conserva o diâmetro e o comprimento ℓ é alongado por 1/sin β. Medir w/ℓ devolve o ângulo de impacto, e a direção da cauda devolve o sentido do movimento. Prolongando várias linhas retas até o ponto de convergência o perito estima a origem, mas a gota viaja numa parábola: a reta tangente no impacto passa acima da origem real. Para lançamento horizontal o erro é exato e grande, h_reta = 2h, porque tan β = gt/v₀ e d = v₀t dão d·tan β = gt² = 2h. O método é bom para a posição horizontal e sistematicamente alto para a altura; a perícia moderna corrige isso justamente com a parábola desta aula.",
            prompts: [
              "Com α = 0, varie v₀ e h e confirme que h_reta/h é sempre 2.",
              "Lance para cima (α > 0) e para baixo (α < 0): em qual caso a linha reta erra mais?",
              "No padrão do anteparo, compare as manchas perto e longe do ponto de convergência: qual é mais alongada, e por quê?",
              "Aumente v₀ ou h até o arrasto médio passar de 0,4 g e diga por que a mancha continua confiável mesmo quando a trajetória não."
            ],
            legend: [[api.C.red, "trajetória real"], [api.C.blue, "linha reta do perito"], [api.C.ink, "impacto"]],
            secondaryTitle: "O padrão no anteparo, visto de cima",
            secondarySubtitle: `26 gotas da mesma origem (azimutes em ±30°, rapidez entre 0,7 e 1,3 v₀); a gota escolhida tem w/ℓ = ${api.fmt(r.razaoWL, 2)}`,
            secondaryCaption: "Cada mancha é uma elipse com w/ℓ = sin β e cauda para fora; os eixos maiores prolongados para trás convergem na projeção da origem. Manchas mais distantes são mais alongadas (β menor)."
          };
        }
      },

      /* ---------------- Física médica 2: gotejamento e bomba de infusão ---------------- */
      {
        id: "infusao",
        tab: "Infusão:<br>gota e jato",
        heading: "O jato do cateter como projétil e o gotejamento do equipo",
        equation: "u = Q/A · x = u√(2H/g) · gotas/min = 20·Q[mL/h]/60",
        hint: "Compare a infusão lenta de uma bomba com um flush de seringa: a mesma água, velocidades cem vezes diferentes.",
        controls: [
          { id: "parameter", label: "vazão Q", min: 1, max: 400, step: 1, value: 20, digits: 0, unit: "mL/min" },
          { id: "secondary", label: "diâmetro interno do cateter", min: 0.4, max: 2.0, step: 0.02, value: 0.84, digits: 2, unit: "mm" },
          { id: "tertiary", label: "altura da saída H", min: 0.1, max: 1.5, step: 0.05, value: 1, digits: 2, unit: "m" }
        ],
        secondary: true,

        draw(api, v) {
          const Q = v.parameter * 1e-6 / 60, d = v.secondary * 1e-3, H = v.tertiary;
          const u = P.jetSpeed(Q, d), x = P.jetRange(u, H), t = P.freeFallTime(H);
          const xm = Math.max(x * 1.2, 0.3);
          const chart = api.axes(api.main, 0, xm, 0, H * 1.2, "distância horizontal (m)", "altura (m)");
          /* cateter */
          api.line(chart, [[0, H], [0.0, H]], api.C.gray, [], 6);
          api.line(chart, api.param((tt) => [u * tt, H - 0.5 * P.G * tt * tt], 0, t, 200), api.C.blue, [], 3.2);
          /* referências: 125 mL/h (bomba) e 300 mL/min (flush) com o mesmo cateter e altura */
          for (const [Qr, cor, rot] of [[125 / 60, "#cbd8cb", "bomba 125 mL/h"], [300, "#e7c9c3", "flush 10 mL em 2 s"]]) {
            const ur = P.jetSpeed(Qr * 1e-6 / 60, d), xr = P.jetRange(ur, H);
            if (xr < xm) { api.line(chart, api.param((tt) => [ur * tt, H - 0.5 * P.G * tt * tt], 0, t, 120), cor, [4, 4], 1.6); api.label(chart, xr, H * 1.02, rot, api.C.muted, "center", "bottom"); }
          }
          api.dot(chart, x, 0, api.C.blue, 5);
          api.label(chart, x, 0.08 * H, `x = ${api.fmt(x, 2)} m`, api.C.blue, "center", "bottom");

          /* secundário: gotas em queda na câmara do equipo, espaçadas pelo intervalo de gotejamento */
          const g = P.dripRate(v.parameter * 60), hc = 0.04, tq = P.freeFallTime(hc);
          const s = api.axes(api.second, 0, Math.max(3 * g.intervalo, 0.3), 0, hc * 1.1, "tempo (s)", "altura na câmara (m)", { left: 58 });
          const n = Math.ceil(s.xMax / g.intervalo) + 1;
          for (let k = 0; k < Math.min(n, 60); k++) {
            const t0 = k * g.intervalo;
            api.line(s, api.param((tt) => [t0 + tt, hc - 0.5 * P.G * tt * tt], 0, tq, 30), api.C.violet, [], 2);
          }
          api.hline(s, 0, api.C.gray, [], "fundo da câmara");
        },

        text(v, api) {
          const Q = v.parameter * 1e-6 / 60, d = v.secondary * 1e-3, H = v.tertiary;
          const u = P.jetSpeed(Q, d), x = P.jetRange(u, H), t = P.freeFallTime(H), Re = P.catheterReynolds(u, d);
          const g = P.dripRate(v.parameter * 60), tq = P.freeFallTime(0.04);
          return {
            title: "O jato do cateter como projétil e o gotejamento do equipo",
            subtitle: `Q = ${api.fmt(v.parameter, 0)} mL/min = ${api.fmt(v.parameter * 60, 0)} mL/h · d = ${api.fmt(v.secondary, 2)} mm · H = ${api.fmt(H, 2)} m`,
            regime: Re < 2000 ? ["escoamento laminar no cateter", "ok"] : Re < 4000 ? ["transição laminar–turbulento", "warn"] : ["turbulento: flush rápido", "alert"],
            caption: "Azul: o jato que sai horizontalmente do cateter e cai como projétil. Cinza e rosa: as referências de uma bomba de infusão (125 mL/h) e de um flush de seringa (10 mL em 2 s) com o mesmo cateter.",
            prediction: "Multiplicar a vazão por cem multiplica o alcance do jato por quanto?",
            calculation: `A = πd²/4 = ${api.sci(Math.PI * d * d / 4, 2)} m² → u = Q/A = <b>${api.fmt(u, 3)} m/s</b><br>queda de H: t = √(2H/g) = ${api.fmt(t, 2)} s → x = u·t = <b>${api.fmt(x, 3)} m</b><br>Re = ρud/η = <b>${api.fmt(Re, 0)}</b><em>equipo de macrogotas (20 gotas/mL): ${api.fmt(g.gotasPorMin, 1)} gotas/min, uma a cada ${api.fmt(g.intervalo, 2)} s; cada gota cai 4 cm em ${api.fmt(tq, 3)} s</em>`,
            metrics: [
              ["velocidade do jato u", `${api.fmt(u, 3)} m/s`],
              ["alcance x", `${api.fmt(x, 3)} m`],
              ["tempo de queda", `${api.fmt(t, 2)} s`],
              ["Reynolds no cateter", api.fmt(Re, 0)],
              ["gotas por minuto", api.fmt(g.gotasPorMin, 1)],
              ["intervalo entre gotas", `${api.fmt(g.intervalo, 2)} s`],
              ["gotas em voo ao mesmo tempo", api.fmt(tq / g.intervalo, 2)],
              ["Q recuperado de x (inverso)", `${api.fmt(P.flowFromRange(x, H, d) * 60e6, 1)} mL/min`]
            ],
            concept: "Um líquido que sai horizontalmente de um tubo é um projétil: cada elemento de fluido parte com a velocidade média u = Q/A e cai no tempo √(2H/g), independente de u. O alcance é linear em Q, e a mesma geometria serve de medidor de vazão: medir x e H devolve Q (o método do jato, usado antes dos medidores eletrônicos). Numa infusão por bomba o jato mal existe (centímetros por segundo); num flush de seringa o mesmo cateter lança soro a vários metros por segundo e o escoamento passa a turbulento, o que importa para o risco de respingo e para a hemólise em acessos finos. No equipo, o gotejamento é cinemática unidimensional: a gota percorre a câmara em décimos de segundo, muito menos que o intervalo entre gotas, por isso o contador vê uma gota de cada vez.",
            prompts: [
              "Ajuste Q até o alcance dobrar e confira que a velocidade também dobrou.",
              "Com Q fixa, troque o cateter de 0,84 mm por 2,0 mm: o alcance cai por qual fator?",
              "Em que vazão o número de gotas em voo ao mesmo tempo chega a 1? Que leitura o contador faria aí?"
            ],
            legend: [[api.C.blue, "jato escolhido"], ["#cbd8cb", "bomba 125 mL/h"], ["#e7c9c3", "flush 10 mL em 2 s"], [api.C.violet, "gotas na câmara"]],
            secondaryTitle: "Gotejamento na câmara do equipo",
            secondarySubtitle: `${api.fmt(g.gotasPorMin, 1)} gotas/min: cada parábola é uma gota caindo 4 cm`,
            secondaryCaption: "As gotas não se alcançam: o tempo de queda é bem menor que o intervalo entre elas."
          };
        }
      },

      /* ---------------- Física médica 3: elétron em campo uniforme ---------------- */
      {
        id: "eletron",
        tab: "Acelerador:<br>elétron defletido",
        heading: "O elétron entre placas é um projétil com g → eE/m",
        equation: "y = ½(eE/m)(L/v)² = U L²/(4 V d) · tan θ = 2y/L · r = mv/(eB)",
        hint: "Dobre a tensão aceleradora V: o elétron fica mais rápido e a deflexão cai pela metade, independentemente de e/m.",
        controls: [
          { id: "parameter", label: "tensão aceleradora V", min: 0.2, max: 5, step: 0.1, value: 1, digits: 1, unit: "kV" },
          { id: "secondary", label: "tensão nas placas U", min: -300, max: 300, step: 10, value: 100, digits: 0, unit: "V" },
          { id: "tertiary", label: "comprimento das placas L", min: 2, max: 10, step: 0.5, value: 5, digits: 1, unit: "cm" },
          { id: "quaternary", label: "campo magnético B", min: 0.2, max: 5, step: 0.1, value: 1, digits: 1, unit: "mT" }
        ],
        secondary: true,

        draw(api, v) {
          const V = v.parameter * 1e3, U = v.secondary, L = v.tertiary * 1e-2, d = 0.01, D = 0.20;
          const r = P.electrostaticDeflection(V, U, L, d, D);
          const xm = L + D, ym = Math.max(0.02, Math.abs(r.Y) * 1.2);
          const chart = api.axes(api.main, -0.01, xm * 1.02, -ym, ym, "distância ao longo do feixe (m)", "deflexão (m)");
          /* placas */
          api.line(chart, [[0, d / 2], [L, d / 2]], api.C.ink, [], 4);
          api.line(chart, [[0, -d / 2], [L, -d / 2]], api.C.ink, [], 4);
          api.label(chart, L / 2, d / 2, U >= 0 ? "+" : "−", api.C.ink, "center", "bottom");
          api.label(chart, L / 2, -d / 2 - 0.0, U >= 0 ? "−" : "+", api.C.ink, "center", "top");
          api.vline(chart, xm, api.C.gray, [], "tela");
          /* parábola dentro das placas e reta depois */
          api.line(chart, api.param((x) => [x, 0.5 * r.a * (x / r.v) ** 2], 0, L, 100), api.C.green, [], 3);
          api.line(chart, [[L, r.y], [xm, r.Y]], api.C.green, [], 3);
          api.line(chart, [[-0.01, 0], [xm, 0]], api.C.grayLight, [4, 4], 1.2);
          api.dot(chart, xm, r.Y, api.C.green, 5);
          api.label(chart, xm, r.Y, ` Y = ${api.fmt(r.Y * 1e3, 1)} mm`, api.C.green, "right", r.Y >= 0 ? "bottom" : "top");

          /* secundário: arco circular em B */
          const B = v.quaternary * 1e-3, rb = P.magneticRadius(r.v, B);
          const s = api.axes(api.second, -rb * 0.1, rb * 1.3, -rb * 0.1, rb * 1.3, "x (m)", "y (m)");
          api.line(s, api.param((ph) => [rb * Math.sin(ph), rb - rb * Math.cos(ph)], 0, Math.PI / 2 + 0.6, 120), api.C.violet, [], 3);
          api.line(s, [[0, 0], [0, rb]], api.C.grayLight, [4, 4], 1.4);
          api.dot(s, 0, rb, api.C.gray, 4, true);
          api.label(s, 0.01 * rb, rb / 2, `r = ${api.fmt(rb * 100, 1)} cm`, api.C.violet, "left", "middle");
          api.arrow(s, 0, 0, rb * 0.35, 0, api.C.green);
          api.label(s, rb * 0.36, 0, "v", api.C.green, "left", "bottom");
        },

        text(v, api) {
          const V = v.parameter * 1e3, U = v.secondary, L = v.tertiary * 1e-2, d = 0.01, D = 0.20;
          const r = P.electrostaticDeflection(V, U, L, d, D);
          const B = v.quaternary * 1e-3, rb = P.magneticRadius(r.v, B), ac = r.v * r.v / rb;
          return {
            title: "O elétron entre placas é um projétil com g → eE/m",
            subtitle: `V = ${api.fmt(v.parameter, 1)} kV · U = ${api.fmt(U, 0)} V (d = 1 cm) · L = ${api.fmt(v.tertiary, 1)} cm · B = ${api.fmt(v.quaternary, 1)} mT`,
            regime: r.v / P.C_LUZ < 0.1 ? ["clássico: v/c < 0,1", "ok"] : ["v/c > 0,1: início das correções relativísticas", "warn"],
            caption: "Verde: dentro das placas o elétron descreve uma parábola, exatamente como um projétil, e depois segue em linha reta até a tela. A tensão U faz o papel da gravidade; a tensão V, o da velocidade de lançamento.",
            prediction: "Se V dobrar, a deflexão na tela cai para quanto? Depende da carga ou da massa do elétron?",
            calculation: `v = √(2eV/m) = <b>${api.sci(r.v, 3)} m/s</b> (v/c = ${api.fmt(r.v / P.C_LUZ, 3)})<br>a = eE/m = eU/(md) = <b>${api.sci(r.a, 3)} m/s²</b> = ${api.sci(r.a / P.G, 2)} g<br>y = ½a(L/v)² = UL²/(4Vd) = <b>${api.fmt(r.y * 1e3, 2)} mm</b> · tan θ = 2y/L = ${api.fmt(r.tanTheta, 4)} · Y = y + D·tan θ = <b>${api.fmt(r.Y * 1e3, 1)} mm</b><em>no campo B: r = mv/(eB) = ${api.fmt(rb * 100, 2)} cm; a_c = v²/r = ${api.sci(ac, 2)} m/s²</em>`,
            metrics: [
              ["rapidez v", `${api.sci(r.v, 3)} m/s`],
              ["v/c", api.fmt(r.v / P.C_LUZ, 3)],
              ["aceleração eE/m", `${api.sci(r.a, 2)} m/s²`],
              ["tempo entre as placas", `${api.sci(L / r.v, 2)} s`],
              ["deflexão na saída y", `${api.fmt(r.y * 1e3, 2)} mm`],
              ["ângulo de saída θ", `${api.fmt(r.thetaGraus, 2)}°`],
              ["deflexão na tela (D = 20 cm)", `${api.fmt(r.Y * 1e3, 1)} mm`],
              ["raio em B", `${api.fmt(rb * 100, 2)} cm`]
            ],
            concept: "Um campo elétrico uniforme exerce força constante, logo o movimento do elétron é o do projétil desta aula com g substituído por eE/m: trajetória parabólica, componentes independentes, tempo de voo L/v fixado pela componente paralela. Como a energia cinética vem da mesma carga, ½mv² = eV, a razão e/m cancela e a deflexão y = UL²/(4Vd) só depende de geometria e tensões: é a física do tubo de raios catódicos e das placas de varredura. O campo magnético, ao contrário, faz força perpendicular à velocidade e não muda o módulo: o elétron descreve um círculo de raio r = p/(eB), e é esse o princípio do ímã defletor de 270° de um acelerador linear clínico, onde p é relativístico (6 MeV/c dá r ≈ 4 cm em 0,5 T) mas a cinemática polar da aula, a_c = v²/r, continua exata.",
            prompts: [
              "Dobre V e confirme que Y cai pela metade; dobre L e confirme que y quadruplica (e Y não).",
              "Inverta o sinal de U: o que muda na figura e o que não muda?",
              "Com V = 5 kV e B = 1 mT, meça r; depois estime r para um elétron de 6 MeV num ímã de 0,5 T usando p = 6,5 MeV/c."
            ],
            legend: [[api.C.green, "trajetória do elétron"], [api.C.ink, "placas defletoras"], [api.C.violet, "arco no campo B"]],
            secondaryTitle: "O mesmo elétron num campo magnético",
            secondarySubtitle: `r = mv/(eB) = ${api.fmt(rb * 100, 1)} cm · a_c = v²/r`,
            secondaryCaption: "Força perpendicular à velocidade: muda a direção, não o módulo. É o movimento circular do bloco polar da aula."
          };
        }
      }
    ]
  };
})();
