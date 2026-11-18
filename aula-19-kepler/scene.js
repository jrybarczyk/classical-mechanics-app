(function () {
  "use strict";
  const P = window.LessonPhysics;

  /* Planetas para a terceira lei: [nome, a em UA, T em anos] */
  const PLANETAS = [
    ["Mercúrio", 0.387, 0.241], ["Vênus", 0.723, 0.615], ["Terra", 1.000, 1.000],
    ["Marte", 1.524, 1.881], ["Júpiter", 5.203, 11.862], ["Saturno", 9.537, 29.457],
    ["Urano", 19.19, 84.02], ["Netuno", 30.07, 164.8]
  ];

  window.LessonScene = {
    id: "aula19",
    discipline: "Mecânica Clássica · Aula 19",
    title: "O problema de Kepler",
    subtitle: "Duas órbitas de mesmo semieixo e formas diferentes têm a mesma energia?",

    stations: [
      {
        id: "conicas",
        tab: "As quatro<br>cônicas",
        heading: "r(θ) = α/(1 + ε cosθ)",
        equation: "ε = √(1 + 2Eℓ²/μk²) = √(1 − E/E_c)",
        hint: "Atravesse ε = 1 devagar. Preveja o que acontece com a órbita.",
        controls: [
          { id: "parameter", label: "energia E / |E_c|", min: -1, max: 1.5, step: 0.01, value: -0.5, digits: 2 },
          { id: "secondary", label: "momento angular ℓ", min: 0.5, max: 2, step: 0.02, value: 1, digits: 2 },
          { id: "tertiary", label: "ângulo θ percorrido", min: 0, max: 6.28, step: 0.02, value: 1.2, digits: 2, unit: "rad" }
        ],
        animate: { control: "tertiary", period: 8 },

        draw(api, v) {
          const mu = 1, k = 1, L = v.secondary;
          const Ec = -(mu * k * k) / (2 * L * L);
          const E = v.parameter * Math.abs(Ec);
          const p = P.semilatus(L, mu, k);
          const e = P.eccentricity(E, L, mu, k);
          const thMax = P.asymptoteAngle(e) * 0.985;
          /* Elipse: o afélio fica em −a(1+ε); com ε perto de 1 ele passava do limite
             antigo (1,5a + p) e a órbita saía do quadro. */
          const lim = e < 1 ? Math.max((p / (1 - e)) * 1.12, p * 1.6) : p * 6;
          const chart = api.axes(api.main, -lim, Math.max(lim * 0.6, 1.25 * p / (1 + e)), -lim * 0.65, lim * 0.65, "x (μ = k = 1)", "y");

          /* Família de referência: as quatro cônicas com o mesmo p. */
          [[0, "#dde5de"], [0.6, "#d4e0d5"], [1, "#e8ded0"], [1.6, "#e8d5d0"]].forEach(([ee, cor]) => {
            const tm = P.asymptoteAngle(ee) * 0.985;
            api.line(chart, api.param((th) => { const r = P.conic(th, p, ee); return [r * Math.cos(th), r * Math.sin(th)]; }, -tm, tm, 300), cor, [], 1.6);
          });
          api.line(chart, api.param((th) => { const r = P.conic(th, p, e); return [r * Math.cos(th), r * Math.sin(th)]; }, -thMax, thMax, 500),
            e < 1 ? api.C.green : e > 1 ? api.C.red : api.C.gold, [], 3.2);

          /* Nas órbitas abertas r → ∞ perto da assíntota: o marcador recua ao longo da
             curva até o ponto caber na janela, em vez de sair do quadro. */
          let th = Math.min(v.tertiary, thMax);
          const cabe = (t) => {
            const rr = P.conic(t, p, e), x = rr * Math.cos(t), y = rr * Math.sin(t);
            return x > -0.95 * lim && x < 0.92 * chart.xMax && Math.abs(y) < 0.92 * 0.65 * lim;
          };
          for (let i = 0; i < 600 && th > 0 && !cabe(th); i += 1) th *= 0.99;
          const r = P.conic(th, p, e);
          api.line(chart, [[0, 0], [r * Math.cos(th), r * Math.sin(th)]], api.C.blue, [4, 4], 1.6);
          api.dot(chart, r * Math.cos(th), r * Math.sin(th), api.C.ink, 5);
          api.dot(chart, 0, 0, api.C.ink, 6);
          api.label(chart, 0.05 * lim, -0.08 * lim, "foco", api.C.ink, "left", "top");
          api.dot(chart, P.conic(0, p, e), 0, api.C.gold, 4.5, true);
        },

        text(v, api) {
          const mu = 1, k = 1, L = v.secondary;
          const Ec = -(mu * k * k) / (2 * L * L);
          const E = v.parameter * Math.abs(Ec);
          const p = P.semilatus(L, mu, k);
          const e = P.eccentricity(E, L, mu, k);
          const nome = e < 1e-6 ? "circunferência" : e < 1 ? "elipse" : Math.abs(e - 1) < 0.01 ? "parábola" : "hipérbole";
          const a = E < 0 ? P.semiMajor(E, k) : Infinity;
          return {
            title: "Cônica com foco na origem",
            subtitle: `E/|E_c| = ${api.fmt(v.parameter)} · ℓ = ${api.fmt(L)} · E = ${api.fmt(E, 4)} · ε = ${api.fmt(e, 4)}`,
            regime: [nome, e < 1 ? "ok" : Math.abs(e - 1) < 0.01 ? "warn" : "alert"],
            caption: "As quatro curvas de fundo têm o mesmo semilatus rectum e excentricidades diferentes. Aumentar E abre a órbita; em ε = 1 ela deixa de se fechar. Atenção: o controle é E/|E_c|, e |E_c| = μk²/2ℓ² depende de ℓ.",
            prediction: "A excentricidade é um dado independente, ou está fixada por E e ℓ?",
            calculation: `α = ℓ²/μk = <b>${api.fmt(p, 4)}</b><br>ε = √(1 + 2Eℓ²/μk²) = √(1 + ${api.fmt(2 * E * L * L / (mu * k * k), 4)}) = <b>${api.fmt(e, 4)}</b><em>${E < 0 ? `a = −k/2E = ${api.fmt(a, 4)}, e a energia depende só de a` : "E ≥ 0: órbita não ligada, sem semieixo maior"}</em>`,
            metrics: [
              ["semilatus α", api.fmt(p, 4)],
              ["excentricidade ε", api.fmt(e, 4)],
              ["energia E", api.fmt(E, 4)],
              ["semieixo a", Number.isFinite(a) ? api.fmt(a, 4) : "∞"],
              ["periélio", api.fmt(P.conic(0, p, e), 4)],
              ["afélio", e < 1 ? api.fmt(P.conic(Math.PI, p, e), 4) : "∞"]
            ],
            concept: "A excentricidade não é uma condição inicial extra: ela é fixada por E e ℓ. Duas órbitas com os mesmos E e ℓ têm a mesma forma, ainda que orientadas diferentemente.",
            prompts: [
              "Mantenha E/|E_c| fixo e varie ℓ: ε muda? E muda? A órbita muda de forma ou só de escala?",
              "Ache o valor de E/|E_c| que dá exatamente uma parábola. Ele depende de ℓ?",
              "Anote E e a. Mude ℓ e reajuste E/|E_c| até E voltar (aproximadamente) ao valor anotado: a voltou? E ε?"
            ],
            legend: [[api.C.green, "elipse"], [api.C.gold, "parábola"], [api.C.red, "hipérbole"]]
          };
        }
      },

      {
        id: "terceira",
        tab: "Terceira<br>lei",
        heading: "τ² = 4π²μa³/k",
        equation: "em unidades solares: τ(anos)² = a(UA)³",
        hint: "Confira a reta de inclinação 3/2 com os oito planetas. Onde ela falharia?",
        controls: [
          { id: "parameter", label: "semieixo maior a", min: 0.2, max: 40, step: 0.1, value: 1, digits: 2, unit: "UA" },
          { id: "secondary", label: "razão de massas m/M☉", min: 0, max: 0.2, step: 0.001, value: 0, digits: 3 },
          { id: "tertiary", label: "excentricidade", min: 0, max: 0.9, step: 0.01, value: 0, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const L10 = Math.log10;
          const chart = api.axes(api.main, L10(0.2), L10(45), L10(0.05), L10(320), "semieixo a (UA)", "período τ (anos)", {
            xFormat: (t) => api.fmt(Math.pow(10, t), Math.pow(10, t) < 1 ? 1 : 0),
            yFormat: (t) => api.fmt(Math.pow(10, t), Math.pow(10, t) < 1 ? 1 : 0)
          });
          api.line(chart, api.curve((la) => 1.5 * la, L10(0.2), L10(45), 60), api.C.green, [], 2.6);
          PLANETAS.forEach(([nome, a, T]) => {
            api.dot(chart, L10(a), L10(T), api.C.gold, 4.5);
            api.label(chart, L10(a), L10(T) + 0.09, nome, api.C.muted, "center");
          });
          const Tcalc = Math.sqrt(v.parameter ** 3 / (1 + v.secondary));
          api.dot(chart, L10(v.parameter), L10(Tcalc), api.C.red, 5.5);
          const x0 = L10(1.2), y0 = 1.5 * L10(1.2);
          api.line(chart, [[x0, y0], [x0 + 0.5, y0], [x0 + 0.5, y0 + 0.75]], api.C.blue, [4, 4], 1.6);
          api.label(chart, x0 + 0.52, y0 + 0.38, "inclinação 3/2", api.C.blue, "left");

          const s = api.axes(api.second, 0, 0.2, 0.85, 1.02, "razão de massas m/M☉", "τ real / τ aproximado");
          api.line(s, api.curve((q) => 1 / Math.sqrt(1 + q), 0, 0.2, 100), api.C.red);
          api.hline(s, 1, api.C.grayLight, [4, 4], "limite m ≪ M☉");
          api.dot(s, v.secondary, 1 / Math.sqrt(1 + v.secondary), api.C.ink, 4.5);
        },

        text(v, api) {
          const T = Math.sqrt(v.parameter ** 3 / (1 + v.secondary));
          const Tideal = Math.sqrt(v.parameter ** 3);
          const desvio = (1 - T / Tideal) * 100;
          return {
            title: "Período contra semieixo maior",
            subtitle: `a = ${api.fmt(v.parameter)} UA · m/M☉ = ${api.fmt(v.secondary, 3)}`,
            regime: v.secondary < 0.002 ? ["terceira lei praticamente exata", "ok"] : v.secondary < 0.05 ? ["desvio pequeno", "warn"] : ["desvio apreciável", "alert"],
            caption: "Os oito planetas caem sobre a reta de inclinação 3/2. O período não depende da excentricidade — só do semieixo maior.",
            prediction: "Duas órbitas com o mesmo a e excentricidades muito diferentes têm o mesmo período?",
            calculation: `τ² = 4π²μa³/k, e com μ/k = 1/G(M☉+m):<br>τ = √(a³/(1 + m/M☉)) = √(${api.fmt(v.parameter ** 3, 3)}/${api.fmt(1 + v.secondary, 3)}) = <b>${api.fmt(T, 4)} anos</b><em>com m ≪ M☉ seria ${api.fmt(Tideal, 4)} anos: desvio de ${api.fmt(desvio, 3)} %</em>`,
            metrics: [
              ["semieixo a", `${api.fmt(v.parameter)} UA`],
              ["período τ", `${api.fmt(T, 4)} anos`],
              ["τ ideal (m ≪ M☉)", `${api.fmt(Tideal, 4)} anos`],
              ["desvio", `${api.fmt(desvio, 3)} %`],
              ["excentricidade", api.fmt(v.tertiary)],
              ["τ²/a³", api.fmt((T * T) / v.parameter ** 3, 5)]
            ],
            concept: "A terceira lei é rigorosamente válida só no limite m ≪ M☉: a correção exata substitui M☉ por M☉ + m, e é isso que a torna aproximada.",
            prompts: [
              "Mude a excentricidade ε e confirme que τ não se altera.",
              "Ache a razão de massas em que o desvio chega a 1 %.",
              "Verifique a terceira lei com dois planetas da tabela, à mão."
            ],
            legend: [[api.C.green, "τ² = a³"], [api.C.gold, "planetas"], [api.C.red, "caso examinado"]],
            secondaryTitle: "Correção de massa finita",
            secondarySubtitle: "τ real / τ aproximado = 1/√(1 + m/M☉)",
            secondaryCaption: "Para Júpiter (m/M☉ ≈ 0,001) o desvio é de apenas 0,05 %."
          };
        }
      },

      {
        id: "visviva",
        tab: "Vis-viva<br>e escape",
        heading: "Velocidade em qualquer ponto",
        equation: "v² = GM(2/r − 1/a)",
        hint: "Compare a velocidade no perigeu e no apogeu. Depois leve a ao infinito. Cuidado: o perigeu a(1 − ε) não pode ficar abaixo da superfície (6371 km).",
        controls: [
          { id: "parameter", label: "semieixo maior a", min: 6500, max: 60000, step: 1, value: 10000, digits: 0, unit: "km" },
          { id: "secondary", label: "excentricidade ε", min: 0, max: 0.85, step: 0.01, value: 0.3, digits: 2 },
          { id: "tertiary", label: "posição r", min: 6500, max: 100000, step: 1, value: 7000, digits: 0, unit: "km" }
        ],
        secondary: true,

        draw(api, v) {
          const a = v.parameter * 1000, e = v.secondary;
          const rp = P.perihelion(a, e), ra = P.aphelion(a, e);
          const RT = P.R_TERRA / 1000;
          const chart = api.axes(api.main, 0, 100000, 0, 12, "distância r (km)", "velocidade (km/s)");
          /* Só o trecho fora da Terra é fisicamente percorrido. */
          const rIni = Math.max(rp / 1000, RT);
          if (rIni < ra / 1000) api.line(chart, api.curve((rk) => P.visViva(rk * 1000, a, P.GM_TERRA) / 1000, rIni, Math.min(ra / 1000, 100000), 240), api.C.green, [], 3);
          api.line(chart, api.curve((rk) => P.circularSpeed(rk * 1000, P.GM_TERRA) / 1000, RT, 100000, 200), api.C.blue, [5, 4], 2);
          api.line(chart, api.curve((rk) => P.escapeSpeed(rk * 1000, P.GM_TERRA) / 1000, RT, 100000, 200), api.C.red, [5, 4], 2);
          api.vline(chart, RT, api.C.ink, [], "superfície");
          const corPerigeu = rp / 1000 < RT ? api.C.red : api.C.gold;
          api.vline(chart, rp / 1000, corPerigeu, [4, 4]);
          /* rótulo mais embaixo e do outro lado: perto da superfície colidiria com "superfície" */
          api.label(chart, rp / 1000, chart.yMin + (chart.yMax - chart.yMin) * 0.06, "perigeu", corPerigeu, rp / 1000 < RT ? "right" : "left", "bottom");
          if (ra / 1000 < 100000) {
            api.vline(chart, ra / 1000, api.C.gold, [4, 4]);
            api.label(chart, ra / 1000, chart.yMin + (chart.yMax - chart.yMin) * 0.14, "apogeu", api.C.gold, "left", "bottom");
          }
          const r = Math.min(Math.max(v.tertiary * 1000, rp, P.R_TERRA), ra, 100000e3);
          if (r <= ra) api.dot(chart, r / 1000, P.visViva(r, a, P.GM_TERRA) / 1000, api.C.ink, 5.5);
          api.label(chart, 96000, P.escapeSpeed(96000e3, P.GM_TERRA) / 1000 + 0.35, "escape", api.C.red, "right");
          api.label(chart, 96000, P.circularSpeed(96000e3, P.GM_TERRA) / 1000 - 0.45, "circular", api.C.blue, "right", "top");

          const s = api.axes(api.second, 0, 0.85, 0, 12, "excentricidade ε", "velocidade (km/s)");
          /* Só vale até eMax (perigeu na superfície); depois disso a velocidade de perigeu
             dispara e a curva saía do quadro. A parte impossível fica pontilhada. */
          const eMax = 1 - P.R_TERRA / a;
          const eFis = Math.max(0, Math.min(0.85, eMax));
          api.line(s, api.curve((ee) => P.visViva(P.perihelion(a, ee), a, P.GM_TERRA) / 1000, 0, eFis, 120), api.C.red);
          if (eFis < 0.85) api.line(s, api.curve((ee) => P.visViva(P.perihelion(a, ee), a, P.GM_TERRA) / 1000, eFis, 0.85, 60), api.C.grayLight, [2, 4], 1.6);
          api.line(s, api.curve((ee) => P.visViva(P.aphelion(a, ee), a, P.GM_TERRA) / 1000, 0, 0.85, 120), api.C.blue);
          if (eMax < 0.85) api.vline(s, eMax, api.C.ink, [4, 4], "perigeu na superfície");
          /* Órbita impossível (perigeu abaixo da superfície): o ponto vai ao teto, oco. */
          const vPer = P.visViva(rp, a, P.GM_TERRA) / 1000;
          if (vPer <= 12) api.dot(s, e, vPer, api.C.red, 4.5);
          else api.dot(s, e, 11.6, api.C.red, 4.5, true);
          api.dot(s, e, P.visViva(ra, a, P.GM_TERRA) / 1000, api.C.blue, 4.5);
        },

        text(v, api) {
          const a = v.parameter * 1000, e = v.secondary;
          const rp = P.perihelion(a, e), ra = P.aphelion(a, e);
          const dentro = rp < P.R_TERRA;
          const r = Math.min(Math.max(v.tertiary * 1000, rp, P.R_TERRA), ra);
          const vr = P.visViva(r, a, P.GM_TERRA);
          const vp = P.visViva(rp, a, P.GM_TERRA);
          const va = P.visViva(ra, a, P.GM_TERRA);
          const T = P.periodGM(a, P.GM_TERRA);
          return {
            title: "Velocidade orbital ao longo da órbita",
            subtitle: `a = ${api.fmt(v.parameter, 0)} km · ε = ${api.fmt(e)} · r = ${api.fmt(r / 1000, 0)} km · perigeu = ${api.fmt(rp / 1000, 0)} km`,
            regime: dentro ? ["perigeu abaixo da superfície: órbita impossível", "alert"] : ["órbita acima da superfície", "ok"],
            caption: "A curva verde é a órbita escolhida (só o trecho acima da superfície); as tracejadas são as referências circular e de escape. Conserva-se r·v_θ (o momento angular por unidade de massa); nos ápsides, onde v é perpendicular a r, isso dá r_p·v_p = r_a·v_a.",
            prediction: "Onde a velocidade é maior, no perigeu ou no apogeu? Em que razão?",
            calculation: `v² = GM(2/r − 1/a) = 3,986·10¹⁴·(2/${api.sci(r)} − 1/${api.sci(a)})<br>v = <b>${api.fmt(vr / 1000, 3)} km/s</b><em>perigeu ${api.fmt(vp / 1000, 3)} km/s · apogeu ${api.fmt(va / 1000, 3)} km/s · razão ${api.fmt(vp / va, 3)}${dentro ? " — mas o perigeu está dentro da Terra: reduza ε ou aumente a" : ""}</em>`,
            metrics: [
              ["v em r", `${api.fmt(vr / 1000, 3)} km/s`],
              ["v no perigeu", `${api.fmt(vp / 1000, 3)} km/s`],
              ["v no apogeu", `${api.fmt(va / 1000, 3)} km/s`],
              ["v circular em r", `${api.fmt(P.circularSpeed(r, P.GM_TERRA) / 1000, 3)} km/s`],
              ["v de escape em r", `${api.fmt(P.escapeSpeed(r, P.GM_TERRA) / 1000, 3)} km/s`],
              ["período", `${api.fmt(T / 60, 1)} min`]
            ],
            concept: "A vis-viva resume toda a dinâmica orbital em uma linha: a velocidade em cada ponto depende só de onde se está e de qual órbita se percorre.",
            prompts: [
              "Confirme que a razão v_perigeu/v_apogeu vale (1+ε)/(1−ε).",
              "Verifique que v_escape = √2 v_circular em qualquer raio.",
              "Reproduza os números da Estação Espacial: a = 6791 km dá 7,66 km/s e 92,8 min."
            ],
            legend: [[api.C.green, "órbita escolhida"], [api.C.blue, "circular"], [api.C.red, "escape"]],
            secondaryTitle: "Velocidades extremas contra excentricidade",
            secondarySubtitle: "com a fixo: o perigeu acelera, o apogeu desacelera",
            secondaryCaption: "As duas se encontram em ε = 0, onde a órbita é circular. À direita da linha vertical, o perigeu fica abaixo da superfície."
          };
        }
      }
    ]
  };
})();
