(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula18",
    discipline: "Mecânica Clássica · Aula 18",
    title: "Potencial efetivo e órbitas",
    subtitle: "Por que uma partícula com ℓ ≠ 0 nunca alcança o centro?",

    stations: [
      {
        id: "efetivo",
        tab: "Barreira<br>centrífuga",
        heading: "V = U + ℓ²/2μr²",
        equation: "V(r) = −k/r + ℓ²/2μr²",
        hint: "Suba ℓ e observe o mínimo se afastar. Preveja como r_c depende de ℓ.",
        controls: [
          { id: "parameter", label: "momento angular ℓ", min: 0.4, max: 2.4, step: 0.02, value: 1.4142, digits: 3 },
          { id: "secondary", label: "energia E / |E_c|", min: -1, max: 1.2, step: 0.01, value: -0.45, digits: 2 },
          { id: "tertiary", label: "constante k", min: 0.5, max: 4, step: 0.05, value: 2, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const mu = 1, k = v.tertiary, L = v.parameter;
          const rc = P.circularRadiusKepler(k, L, mu);
          const Ec = P.circularEnergy(k, L, mu);
          const E = v.secondary * Math.abs(Ec);
          const rmax = rc * 5.2;
          const chart = api.axes(api.main, 0, rmax, Ec * 2.4, Math.abs(Ec) * 1.9, "r", "energia");
          api.line(chart, api.curve((r) => P.potential(r, k, 2), rc * 0.28, rmax, 260), api.C.grayLight, [5, 4], 1.8);
          api.line(chart, api.curve((r) => P.centrifugal(r, L, mu), rc * 0.28, rmax, 260), "#c9d6e4", [2, 3], 1.8);
          api.line(chart, api.curve((r) => P.effective(r, k, L, mu, 2), rc * 0.28, rmax, 320), api.C.green, [], 3.2);
          api.hline(chart, E, api.C.red, [6, 4], `E = ${api.fmt(v.secondary)} |E_c|`);
          api.hline(chart, Ec, api.C.gold, [3, 4], "E_c");
          api.dot(chart, rc, Ec, api.C.gold, 5.5);
          P.turningPoints(E, k, L, mu).forEach((r) => api.dot(chart, r, E, api.C.red, 5));
          api.label(chart, rc * 0.45, Math.abs(Ec) * 1.2, "ℓ²/2μr² domina", "#7d99b5", "center");
          api.label(chart, rmax * 0.75, P.potential(rmax * 0.75, k, 2) - Math.abs(Ec) * 0.25, "−k/r domina", api.C.grayLight, "center", "top");

          const s = api.axes(api.second, 0.4, 2.4, 0, P.circularRadiusKepler(k, 2.4, mu) * 1.1, "momento angular ℓ", "raio circular r_c");
          api.line(s, api.curve((l) => P.circularRadiusKepler(k, l, mu), 0.4, 2.4, 120), api.C.blue);
          api.dot(s, L, rc, api.C.red, 4.5);
        },

        text(v, api) {
          const mu = 1, k = v.tertiary, L = v.parameter;
          const rc = P.circularRadiusKepler(k, L, mu);
          const Ec = P.circularEnergy(k, L, mu);
          const E = v.secondary * Math.abs(Ec);
          const t = P.turningPoints(E, k, L, mu);
          const ligada = P.bound(E);
          const circular = ligada && t.length === 1;
          return {
            title: "Potencial efetivo e pontos de retorno",
            subtitle: `ℓ = ${api.fmt(L, 3)} · k = ${api.fmt(k)} · E/|E_c| = ${api.fmt(v.secondary)}`,
            regime: circular ? ["órbita circular", "ok"] : ligada ? ["órbita ligada", "ok"] : ["órbita não ligada", "alert"],
            caption: "Perto da origem vence o termo repulsivo 1/r²; longe, vence o atrativo 1/r. O mínimo entre os dois organiza toda a classificação.",
            prediction: "Para U = −k/r, existe alguma energia finita que leve a partícula ao centro, com ℓ ≠ 0?",
            calculation: `μEr² + <b>μ</b>kr − ℓ²/2 = 0<br>Δ = (μk)² + 2μEℓ² = ${api.fmt((mu * k) ** 2 + 2 * mu * E * L * L, 4)}<em>${t.length === 2 ? `r_min = ${api.fmt(t[0], 4)} e r_max = ${api.fmt(t[1], 4)}` : circular ? `Δ = 0: raiz dupla r_min = r_max = r_c = ${api.fmt(t[0], 4)}, órbita circular` : t.length === 1 ? `só r_min = ${api.fmt(t[0], 4)}: a partícula escapa` : "nenhuma raiz: E abaixo do mínimo, movimento impossível"}</em>`,
            metrics: [
              ["r_c = ℓ²/μk", api.fmt(rc, 4)],
              ["E_c = −μk²/2ℓ²", api.fmt(Ec, 4)],
              ["E adotada", api.fmt(E, 4)],
              ["r_min", t.length ? api.fmt(t[0], 4) : "—"],
              ["r_max", t.length === 2 ? api.fmt(t[1], 4) : circular ? api.fmt(t[0], 4) : "não existe"],
              ["excentricidade", api.fmt(P.eccentricity(E, k, L, mu), 4)]
            ],
            concept: "O termo ℓ²/2μr² não é energia potencial de interação: é a energia cinética angular reescrita, transferida de lado na equação. Por isso ṙ = 0 não significa partícula parada.",
            prompts: [
              "Dobre ℓ e confirme que r_c quadruplica e |E_c| cai a um quarto.",
              "Ache a energia em que os dois pontos de retorno se encontram.",
              "Explique por que nenhuma energia finita leva a partícula a r = 0 quando ℓ ≠ 0."
            ],
            legend: [[api.C.green, "V"], [api.C.grayLight, "−k/r"], ["#c9d6e4", "ℓ²/2μr²"], [api.C.red, "energia"]],
            secondaryTitle: "Raio circular contra momento angular",
            secondarySubtitle: "r_c ∝ ℓ², e não ∝ ℓ",
            secondaryCaption: "É a barreira centrífuga que empurra o mínimo para fora."
          };
        }
      },

      {
        id: "estabilidade",
        tab: "Estabilidade<br>e o critério n < 3",
        heading: "V″(r_c) = k(3 − n)/r_c^{n+1}",
        equation: "f = −k/rⁿ   ·   ℓ² = μk r_c^{3−n}",
        hint: "Atravesse n = 3 e observe o mínimo virar máximo. Antes disso, preveja o que acontece.",
        controls: [
          { id: "parameter", label: "expoente n da força", min: -1.5, max: 4.5, step: 0.05, value: 2, digits: 2 },
          { id: "secondary", label: "momento angular ℓ", min: 0.5, max: 2, step: 0.02, value: 1, digits: 2 },
          { id: "tertiary", label: "constante k", min: 0.5, max: 3, step: 0.05, value: 1, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const mu = 1, k = v.tertiary, L = v.secondary;
          const n = v.parameter;
          /* Perto de n = 3 o raio circular diverge: ℓ² = μk r^{3−n} perde a
             dependência em r. Nesse caso desenha-se apenas o potencial, sem o
             marcador de órbita circular, que ali não existe. */
          const rcBruto = P.circularRadius(k, L, mu, n);
          const valido = Number.isFinite(rcBruto) && rcBruto > 1e-6 && rcBruto < 1e6;
          const rc = valido ? rcBruto : 1;
          const V0 = P.effective(rc, k, L, mu, n);
          const escala = Math.max(Math.abs(V0), 1) * 2.2;
          const chart = api.axes(api.main, 0, rc * 4, V0 - escala * 0.6, V0 + escala, "r", "V");
          api.line(chart, api.curve((r) => P.effective(r, k, L, mu, n), rc * 0.22, rc * 4, 320), api.C.green, [], 3);
          if (valido) {
            api.dot(chart, rc, V0, P.isStable(n) ? api.C.gold : api.C.red, 6, !P.isStable(n));
            api.label(chart, rc, V0 + escala * 0.12, P.isStable(n) ? "mínimo: estável" : "máximo: instável", P.isStable(n) ? api.C.gold : api.C.red, "center");
            api.hline(chart, V0, api.C.grayLight, [3, 4]);
          } else {
            api.label(chart, rc * 2, V0 + escala * 0.4, "n ≈ 3: não há órbita circular definida", api.C.red, "center");
          }

          const seguro = (nn) => {
            const val = P.d2AtCircular(k, L, mu, nn);
            return Number.isFinite(val) ? Math.max(-2, Math.min(5, val)) : null;
          };
          const s = api.axes(api.second, -1.5, 4.5, -2, 5, "expoente n", "V″(r_c)");
          api.line(s, api.curve(seguro, -1.5, 2.9, 120).filter((p) => p[1] !== null), api.C.green);
          api.line(s, api.curve(seguro, 3.1, 4.5, 60).filter((p) => p[1] !== null), api.C.red);
          api.hline(s, 0, "#b9c4bb", []);
          api.vline(s, 3, api.C.red, [5, 4], "n = 3");
          api.vline(s, 2, api.C.gold, [3, 4], "gravitação");
          api.vline(s, -1, api.C.blue, [3, 4], "Hooke");
          const marcador = seguro(n);
          if (marcador !== null) api.dot(s, n, marcador, api.C.ink, 5);
        },

        text(v, api) {
          const mu = 1, k = v.tertiary, L = v.secondary;
          const n = v.parameter;
          const rcBruto = P.circularRadius(k, L, mu, n);
          const marginal = !Number.isFinite(rcBruto) || rcBruto <= 1e-6 || rcBruto >= 1e6;
          const rc = marginal ? NaN : rcBruto;
          const V2 = marginal ? NaN : P.d2AtCircular(k, L, mu, n);
          const estavel = P.isStable(n);
          return {
            title: "Curvatura do potencial efetivo na órbita circular",
            subtitle: `n = ${api.fmt(n)} · ℓ = ${api.fmt(L)} · k = ${api.fmt(k)}`,
            regime: marginal ? ["n ≈ 3: caso marginal", "alert"] : estavel ? ["órbita circular estável", "ok"] : ["instável", "alert"],
            caption: "A troca de sinal em n = 3 é exata: acima dela nenhuma órbita circular sobrevive a uma perturbação, e a partícula cai no centro ou escapa.",
            prediction: "Existe um expoente acima do qual a órbita circular deixa de ser estável?",
            calculation: marginal
              ? `V′ = k/rⁿ − ℓ²/μr³ = 0 ⟹ <b>ℓ² = μk r_c^{3−n}</b><br>em n = 3 o expoente se anula e a condição vira <b>ℓ² = μk</b>, sem r<em>não há raio circular definido: o caso é marginal</em>`
              : `V′ = k/rⁿ − ℓ²/μr³ = 0 ⟹ <b>ℓ² = μk r_c^{3−n}</b>, com r_c = ${api.fmt(rc, 4)}<br>V″ = −nk/r^{n+1} + 3ℓ²/μr⁴ = <b>k(3−n)/r_c^{n+1} = ${api.fmt(V2, 4)}</b><em>${estavel ? "positivo: mínimo, órbita estável" : "negativo: máximo, órbita instável"}</em>`,
            metrics: [
              ["raio circular r_c", marginal ? "indefinido" : api.fmt(rc, 4)],
              ["V″(r_c)", marginal ? "—" : api.fmt(V2, 4)],
              ["fator (3 − n)", api.fmt(3 - n, 3)],
              ["ω_r", !marginal && estavel ? api.fmt(Math.sqrt(V2 / mu), 4) : "—"],
              ["ω_θ = ℓ/μr_c²", marginal ? "—" : api.fmt(L / (mu * rc * rc), 4)],
              ["estável?", estavel ? "sim" : "não"]
            ],
            concept: "A estabilidade não é um detalhe técnico: ela é a razão de leis de força mais duras que 1/r³ não sustentarem sistemas ligados.",
            prompts: [
              "Confirme que gravitação (n = 2) e Hooke (n = −1) estão bem dentro da região estável.",
              "Atravesse n = 3 e observe o mínimo virar máximo.",
              "Refaça V″ à mão e verifique o cancelamento que produz o fator (3 − n)."
            ],
            legend: [[api.C.green, "estável"], [api.C.red, "instável"], [api.C.gold, "n = 2"]],
            secondaryTitle: "V″(r_c) contra o expoente",
            secondarySubtitle: "cruza zero exatamente em n = 3",
            secondaryCaption: "O sinal, e não o valor, é o que decide a estabilidade."
          };
        }
      },

      {
        id: "perturbacao",
        tab: "Órbita<br>perturbada",
        heading: "ω_r/ω_θ = √(3 − n)",
        equation: "ω_r = √(V″/μ)   ·   ω_θ = ℓ/μr_c²",
        hint: "Quase-círculos fecham quando √(3 − n) é racional. Só n = 2 e n = −1 fecham TODAS as órbitas ligadas (Bertrand).",
        controls: [
          { id: "parameter", label: "expoente n da força", min: -1, max: 2.9, step: 0.002, value: 2, digits: 2 },
          { id: "secondary", label: "amplitude da perturbação", min: 0.01, max: 0.3, step: 0.005, value: 0.15, digits: 3 },
          { id: "tertiary", label: "voltas mostradas", min: 1, max: 8, step: 0.5, value: 3, digits: 1 }
        ],

        draw(api, v) {
          const mu = 1, n = v.parameter, k = 1, L = 1;
          const rc = P.circularRadius(k, L, mu, n);
          const razao = P.frequencyRatio(n);
          const lim = rc * (1 + v.secondary) * 1.25;
          const chart = api.axes(api.main, -lim, lim, -lim, lim, "x", "y");
          api.line(chart, api.param((t) => [rc * Math.cos(t), rc * Math.sin(t)], 0, api.TAU, 200), api.C.grayLight, [4, 4], 1.6);
          const voltas = v.tertiary * api.TAU;
          /* r = r_c(1 − a cos(√(3−n) θ)): θ = 0 é periélio. */
          api.line(chart, api.param((th) => {
            const r = rc * (1 - v.secondary * Math.cos(razao * th));
            return [r * Math.cos(th), r * Math.sin(th)];
          }, 0, voltas, 1200), api.C.green, [], 2.2);
          const rmin = rc * (1 - v.secondary), rmax = rc * (1 + v.secondary);
          api.line(chart, api.param((t) => [rmin * Math.cos(t), rmin * Math.sin(t)], 0, api.TAU, 160), "#dde5de", [], 1.2);
          api.line(chart, api.param((t) => [rmax * Math.cos(t), rmax * Math.sin(t)], 0, api.TAU, 160), "#dde5de", [], 1.2);
          api.dot(chart, 0, 0, api.C.ink, 5);
          /* Marca as ápsides sucessivas: o ângulo entre elas é Φ. */
          const Phi = Math.PI / razao;
          for (let m = 0; m * Phi <= voltas; m += 1) {
            const th = m * Phi;
            const r = rc * (1 - v.secondary * Math.cos(razao * th));
            api.dot(chart, r * Math.cos(th), r * Math.sin(th), m % 2 ? api.C.blue : api.C.red, 3.6);
          }
        },

        text(v, api) {
          const mu = 1, n = v.parameter, k = 1, L = 1;
          const rc = P.circularRadius(k, L, mu, n);
          const razao = P.frequencyRatio(n);
          const Phi = Math.PI / razao;
          const frac = P.rationalRatio(razao);   // ω_r/ω_θ = p/q ⟹ fecha após q voltas
          const fecha = frac !== null;
          const kepler = Math.abs(n - 2) < 1e-6, hooke = Math.abs(n + 1) < 1e-6;
          const leitura = kepler ? "n = 2: Φ = π, a elipse focal fecha após uma volta"
            : hooke ? "n = −1: Φ = π/2, o raio oscila duas vezes por volta e a elipse centrada fecha após uma volta"
            : fecha ? `razão = ${frac.p}/${frac.q}: Φ/π = ${frac.q}/${frac.p} é racional, a órbita fecha após ${frac.q} ${frac.q === 1 ? "volta" : "voltas"}`
            : "Φ/π não é racional de denominador pequeno: a linha das ápsides gira, a órbita precessa";
          return {
            title: "Órbita quase circular e ângulo apsidal",
            subtitle: `n = ${api.fmt(n)} · amplitude = ${api.fmt(v.secondary, 3)}`,
            regime: kepler ? ["Kepler: elipse fechada", "ok"] : hooke ? ["Hooke: elipse centrada fechada", "ok"] : fecha ? [`fecha após ${frac.q} voltas`, "warn"] : ["precessa", "alert"],
            caption: "Os pontos vermelhos e azuis são periélios e afélios sucessivos, separados pelo ângulo apsidal Φ. Se Φ/π for racional, a órbita fecha após algumas voltas; se não, a linha das ápsides gira sem parar.",
            prediction: "Para quais expoentes a órbita perturbada volta exatamente ao ponto de partida?",
            calculation: `ω_r/ω_θ = √(3 − n) = √(${api.fmt(3 - n, 3)}) = <b>${api.fmt(razao, 4)}</b><br>Φ = π/√(3−n) = <b>${api.fmt(Phi, 4)} rad = ${api.fmt((Phi * 180) / Math.PI, 2)}°</b><em>${leitura}</em>`,
            metrics: [
              ["raio circular r_c", api.fmt(rc, 4)],
              ["ω_r/ω_θ", api.fmt(razao, 4)],
              ["ângulo apsidal Φ", `${api.fmt((Phi * 180) / Math.PI, 2)}°`],
              ["Φ/π", api.fmt(Phi / Math.PI, 4)],
              ["fecha após", fecha ? `${frac.q} ${frac.q === 1 ? "volta" : "voltas"}` : "não fecha"],
              ["r_min / r_max", `${api.fmt(rc * (1 - v.secondary), 4)} / ${api.fmt(rc * (1 + v.secondary), 4)}`]
            ],
            concept: "A órbita quase circular fecha quando √(3−n) é racional (p/q: fecha após q voltas). Isso é raro — e o teorema de Bertrand mostra que apenas n = 2 e n = −1 fecham TODAS as órbitas ligadas, não só as quase circulares.",
            prompts: [
              "Ache um n ≠ 2, −1 com razão racional e conte quantas voltas ele leva para fechar.",
              "Verifique que a precessão do periélio some exatamente em n = 2.",
              "Explique por que a coincidência ω_r = ω_θ é a razão profunda de Kepler dar elipses."
            ],
            legend: [[api.C.green, "órbita perturbada"], [api.C.red, "periélios"], [api.C.blue, "afélios"]]
          };
        }
      }
    ]
  };
})();
