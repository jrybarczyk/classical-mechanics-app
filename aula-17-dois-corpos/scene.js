(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula17",
    discipline: "Mecânica Clássica · Aula 17",
    title: "Dois corpos e forças centrais",
    subtitle: "Por que seis incógnitas viram uma, e o que a lei das áreas realmente exige?",

    stations: [
      {
        id: "reducao",
        tab: "Redução a<br>um corpo",
        heading: "Órbitas semelhantes",
        equation: "μ = m₁m₂/(m₁+m₂)   ·   μr̈ = F(r)",
        hint: "Aumente a razão de massas e observe a órbita do corpo pesado encolher.",
        controls: [
          { id: "parameter", label: "razão de massas m₁/m₂", min: 0.1, max: 10, step: 0.05, value: 1, digits: 2 },
          { id: "secondary", label: "excentricidade ε", min: 0, max: 0.85, step: 0.01, value: 0.5, digits: 2 },
          { id: "tertiary", label: "ângulo θ", min: 0, max: 6.28, step: 0.02, value: 1, digits: 2, unit: "rad" }
        ],
        animate: { control: "tertiary", period: 8 },

        draw(api, v) {
          const m1 = v.parameter, m2 = 1, M = m1 + m2;
          const p = 0.9, e = v.secondary;
          const lim = (p / (1 - e * e)) * 1.35;
          const chart = api.axes(api.main, -lim, lim * 0.7, -lim * 0.75, lim * 0.75, "x", "y");

          const pos = (th) => {
            const r = P.conic(th, p, e);
            const rx = r * Math.cos(th), ry = r * Math.sin(th);
            return { r1: [(m2 / M) * rx, (m2 / M) * ry], r2: [-(m1 / M) * rx, -(m1 / M) * ry] };
          };
          api.line(chart, api.param((th) => pos(th).r1, 0, api.TAU, 300), api.C.green, [], 2.2);
          api.line(chart, api.param((th) => pos(th).r2, 0, api.TAU, 300), api.C.red, [], 2.2);
          const agora = pos(v.tertiary);
          api.line(chart, [agora.r1, agora.r2], api.C.grayLight, [4, 4], 1.5);
          /* Ponto maior para o corpo mais pesado. */
          api.dot(chart, agora.r1[0], agora.r1[1], api.C.green, 3.5 + 3 / (1 + m2 / m1));
          api.dot(chart, agora.r2[0], agora.r2[1], api.C.red, 3.5 + 3 / (1 + m1 / m2));
          api.dot(chart, 0, 0, api.C.ink, 4.5);
          api.label(chart, 0.06 * lim, -0.09 * lim, "CM", api.C.ink, "left", "top");
          api.label(chart, agora.r1[0], agora.r1[1] + 0.09 * lim, "m₁", api.C.green, "center");
          api.label(chart, agora.r2[0], agora.r2[1] + 0.09 * lim, "m₂", api.C.red, "center");
        },

        text(v, api) {
          const m1 = v.parameter, m2 = 1;
          const mu = P.reducedMass(m1, m2);
          const razao = P.orbitRatio(m1, m2);
          return {
            title: "As duas órbitas e o problema equivalente",
            subtitle: `m₁/m₂ = ${api.fmt(v.parameter)} · ε = ${api.fmt(v.secondary)}`,
            regime: v.parameter > 5 ? ["quase centro fixo", "ok"] : v.parameter < 0.2 ? ["m₁ leve, órbita grande", "warn"] : ["comparáveis", "warn"],
            caption: "As duas curvas têm a mesma forma e tamanhos na razão inversa das massas. O centro de massa ocupa um foco de ambas, e os corpos estão sempre em lados opostos.",
            prediction: "Se m₁ crescer muito, a órbita de qual corpo encolhe?",
            calculation: `μ = m₁m₂/(m₁+m₂) = ${api.fmt(m1)}·1/${api.fmt(m1 + m2)} = <b>${api.fmt(mu, 4)} m₂</b><br>tamanho da órbita de m₁ / de m₂ = m₂/m₁ = <b>${api.fmt(razao, 4)}</b><em>μ < min(m₁,m₂) sempre, e μ → m₁ quando m₂ ≫ m₁: é o limite do centro fixo</em>`,
            metrics: [
              ["massa reduzida μ", `${api.fmt(mu, 4)} m₂`],
              ["μ / m₁", api.fmt(mu / m1, 4)],
              ["μ / m₂", api.fmt(mu / m2, 4)],
              ["razão das órbitas", api.fmt(razao, 4)],
              ["excentricidade comum", api.fmt(v.secondary)]
            ],
            concept: "A massa reduzida não é a massa de nenhum objeto real, e a coordenada relativa não é a posição de nenhuma partícula: são um artifício exato, não uma aproximação.",
            prompts: [
              "Leve m₁/m₂ a 10 e confirme que μ se aproxima de m₂.",
              "Verifique que os dois corpos estão sempre alinhados com o CM e em lados opostos.",
              "Mostre que μ é menor que qualquer uma das duas massas, para qualquer razão."
            ],
            legend: [[api.C.green, "m₁"], [api.C.red, "m₂"], [api.C.ink, "centro de massa"]]
          };
        }
      },

      {
        id: "areas",
        tab: "Lei das<br>áreas",
        heading: "dA/dt = ℓ/2μ",
        equation: "ℓ = μr²θ̇ constante  ⟹  dA/dt constante",
        hint: "Compare o mesmo intervalo angular perto do periélio e do afélio. O tempo vem da equação de Kepler; compare área/tempo com ℓ/2μ.",
        controls: [
          { id: "parameter", label: "excentricidade ε", min: 0, max: 0.85, step: 0.01, value: 0.6, digits: 2 },
          { id: "secondary", label: "abertura angular Δθ", min: 0.1, max: 1.2, step: 0.02, value: 0.6, digits: 2, unit: "rad" },
          { id: "tertiary", label: "posição do setor θ", min: 0, max: 6.28, step: 0.02, value: 0, digits: 2, unit: "rad" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const p = 1, e = v.parameter, L = 1, mu = 1;
          const lim = (p / (1 - e * e)) * 1.2;
          const chart = api.axes(api.main, -lim, lim * 0.55, -lim * 0.7, lim * 0.7, "x", "y");
          api.line(chart, api.param((th) => { const r = P.conic(th, p, e); return [r * Math.cos(th), r * Math.sin(th)]; }, 0, api.TAU, 400), api.C.grayLight, [], 2);

          /* Setor no periélio e setor no ponto escolhido, com áreas iguais. */
          const setor = (th0, cor) => {
            const pts = [[0, 0]];
            for (let i = 0; i <= 60; i += 1) {
              const th = th0 + (v.secondary * i) / 60;
              const r = P.conic(th, p, e);
              pts.push([r * Math.cos(th), r * Math.sin(th)]);
            }
            pts.push([0, 0]);
            api.area(chart, pts, cor === api.C.green ? "rgba(97,155,96,.28)" : "rgba(198,92,75,.28)", 0);
            api.line(chart, pts, cor, [], 1.8);
          };
          setor(-v.secondary / 2, api.C.green);
          setor(v.tertiary - v.secondary / 2, api.C.red);   // setor móvel centrado em θ
          api.dot(chart, 0, 0, api.C.ink, 5);

          const h = v.secondary / 2;
          const tMax = P.sweptTime(Math.PI - h, Math.PI + h, p, e, L, mu);   // máximo: setor no afélio
          const s = api.axes(api.second, 0, 6.28, 0, tMax * 1.12, "posição do centro do setor θ (rad)", "tempo para varrer (s)");
          api.line(s, api.curve((th) => P.sweptTime(th - h, th + h, p, e, L, mu), 0, 6.28, 120), api.C.blue);
          api.dot(s, v.tertiary, P.sweptTime(v.tertiary - h, v.tertiary + h, p, e, L, mu), api.C.red, 4.5);
          api.hline(s, P.sweptTime(-v.secondary / 2, v.secondary / 2, p, e, L, mu), api.C.green, [5, 4], "no periélio");
        },

        text(v, api) {
          const p = 1, e = v.parameter, L = 1, mu = 1;
          const A1 = P.sweptArea(-v.secondary / 2, v.secondary / 2, p, e);
          const A2 = P.sweptArea(v.tertiary - v.secondary / 2, v.tertiary + v.secondary / 2, p, e);
          /* Tempos pela equação de Kepler (dinâmica), e não dividindo a área por ℓ/2μ. */
          const t1 = P.sweptTime(-v.secondary / 2, v.secondary / 2, p, e, L, mu);
          const t2 = P.sweptTime(v.tertiary - v.secondary / 2, v.tertiary + v.secondary / 2, p, e, L, mu);
          return {
            title: "Setores de mesma abertura angular",
            subtitle: `ε = ${api.fmt(e)} · Δθ = ${api.fmt(v.secondary)} rad · setor centrado em θ = ${api.fmt(v.tertiary)} rad`,
            caption: "Os dois setores têm a mesma abertura angular e áreas muito diferentes. A área vem da geometria (½r²dθ); o tempo, da equação de Kepler. O que sai igual é a área varrida por unidade de tempo, e igual a ℓ/2μ.",
            prediction: "Um mesmo Δθ perto do afélio leva mais ou menos tempo que perto do periélio?",
            calculation: `previsão: dA/dt = ℓ/2μ = ${api.fmt(L)}/(2·${api.fmt(mu)}) = <b>${api.fmt(P.arealVelocity(L, mu), 4)}</b><br>área verde = ${api.fmt(A1, 4)} em ${api.fmt(t1, 4)} s · área vermelha = ${api.fmt(A2, 4)} em ${api.fmt(t2, 4)} s (tempos pela equação de Kepler)<em>A/t medido: ${api.fmt(A1 / t1, 6)} e ${api.fmt(A2 / t2, 6)} — iguais entre si e a ℓ/2μ</em>`,
            metrics: [
              ["A/t no setor móvel", api.fmt(A2 / t2, 5)],
              ["área no periélio", api.fmt(A1, 4)],
              ["área no setor móvel", api.fmt(A2, 4)],
              ["tempo no periélio", `${api.fmt(t1, 4)} s`],
              ["tempo no setor móvel", `${api.fmt(t2, 4)} s`],
              ["razão dos tempos", api.fmt(t2 / t1, 3)]
            ],
            concept: "A segunda lei de Kepler não pressupõe nada sobre a forma de f(r): ela vale para qualquer força central, e é apenas a conservação do momento angular reescrita.",
            prompts: [
              "Confirme que a razão área/tempo é a mesma nos dois setores, para vários θ.",
              "Zere a excentricidade ε e explique por que a curva do painel inferior fica plana.",
              "Diga quais das três leis de Kepler exigem especificamente 1/r²."
            ],
            legend: [[api.C.green, "setor no periélio"], [api.C.red, "setor móvel"]],
            secondaryTitle: "Tempo para varrer Δθ, ao longo da órbita",
            secondarySubtitle: "mínimo no periélio, máximo no afélio",
            secondaryCaption: "A variação some quando ε → 0: o círculo é o único caso uniforme em θ."
          };
        }
      },

      {
        id: "espectroscopia",
        tab: "Massa reduzida<br>em espectroscopia",
        heading: "Molécula diatômica como mola",
        equation: "ω₀ = √(k/μ)   ·   ν̃ = ω₀/2πc",
        hint: "Troque o isótopo mantendo k. Preveja se a banda sobe ou desce.",
        controls: [
          { id: "parameter", label: "massa do primeiro átomo", min: 1, max: 40, step: 0.001, value: 12, digits: 3, unit: "u" },
          { id: "secondary", label: "massa do segundo átomo", min: 1, max: 40, step: 0.001, value: 15.995, digits: 3, unit: "u" },
          { id: "tertiary", label: "constante da ligação k", min: 200, max: 2600, step: 10, value: 1860, digits: 0, unit: "N/m" }
        ],
        secondary: true,

        draw(api, v) {
          const mu = P.reducedMass(v.parameter, v.secondary);
          const w = P.vibrationalOmega(v.tertiary, mu);
          const nu = P.waveNumber(w);
          const chart = api.axes(api.main, 1500, 2600, 0, 1.15, "número de onda ν̃ (cm⁻¹)", "intensidade relativa");
          const banda = (centro, cor, rot, alt = 1) => {
            api.line(chart, api.curve((x) => alt * Math.exp(-(((x - centro) / 9) ** 2)), 1500, 2600, 400), cor, [], 2.6);
            api.label(chart, centro, alt + 0.05, rot, cor, "center");
          };
          banda(2143, api.C.grayLight, "¹²C¹⁶O medido: 2143", 0.75);
          banda(2096, "#c9d6e4", "¹³C¹⁶O medido: 2096", 0.6);
          if (nu > 1500 && nu < 2600) banda(nu, api.C.green, `modelo: ${api.fmt(nu, 0)}`, 1);
          api.hline(chart, 0, "#b9c4bb", []);

          const s = api.axes(api.second, 1, 40, 0, 4000, "massa do primeiro átomo (u)", "ν̃ (cm⁻¹)");
          api.line(s, api.curve((m) => P.waveNumber(P.vibrationalOmega(v.tertiary, P.reducedMass(m, v.secondary))), 1, 40, 140), api.C.blue);
          api.dot(s, v.parameter, nu, api.C.red, 4.5);
          api.hline(s, 2143, api.C.gold, [5, 4], "CO medido");
        },

        text(v, api) {
          const mu = P.reducedMass(v.parameter, v.secondary);
          const w = P.vibrationalOmega(v.tertiary, mu);
          const nu = P.waveNumber(w);
          const mu13 = P.reducedMass(13.00335, v.secondary);
          const razao = P.isotopeShift(mu, mu13);
          return {
            title: "Banda de estiramento",
            subtitle: `μ = ${api.fmt(mu, 4)} u · k = ${api.fmt(v.tertiary, 0)} N/m`,
            regime: Math.abs(nu - 2143) < 40 ? ["compatível com CO medido", "ok"] : ["outra molécula", "warn"],
            caption: "A frequência depende da massa reduzida, e não das massas separadamente. É por isso que trocar um isótopo desloca a banda sem alterar a química.",
            prediction: "Trocando ¹²C por ¹³C, a banda sobe ou desce? Em quanto?",
            calculation: `μ = ${api.fmt(v.parameter, 3)}·${api.fmt(v.secondary, 3)}/${api.fmt(v.parameter + v.secondary, 3)} = <b>${api.fmt(mu, 4)} u = ${api.sci(mu * P.U)} kg</b><br>ω₀ = √(k/μ) = <b>${api.sci(w)} rad/s</b> ⟹ ν̃ = ω₀/2πc = <b>${api.fmt(nu, 1)} cm⁻¹</b><em>com ¹³C: ν̃′/ν̃ = √(μ/μ′) = ${api.fmt(razao, 4)} ⟹ ${api.fmt(nu * razao, 1)} cm⁻¹</em>`,
            metrics: [
              ["massa reduzida μ", `${api.fmt(mu, 4)} u`],
              ["ω₀", `${api.sci(w)} rad/s`],
              ["número de onda ν̃", `${api.fmt(nu, 1)} cm⁻¹`],
              ["razão isotópica", api.fmt(razao, 4)],
              ["ν̃ com ¹³C", `${api.fmt(nu * razao, 1)} cm⁻¹`],
              ["deslocamento", `${api.fmt(nu * (1 - razao), 1)} cm⁻¹`]
            ],
            concept: "Um modelo de duas massas e uma mola, com a massa reduzida no lugar certo, acerta a banda do CO em menos de 1 % — e prevê o deslocamento isotópico sem nenhum parâmetro novo.",
            prompts: [
              "Reproduza 2146 cm⁻¹ para ¹²C¹⁶O com k = 1860 N/m e compare com os 2143 medidos.",
              "Faça a substituição isotópica e confirme a queda de cerca de 48 cm⁻¹.",
              "Leve a massa do primeiro átomo a 40 u e explique por que a curva tende a saturar."
            ],
            legend: [[api.C.green, "modelo"], [api.C.grayLight, "valores medidos"]],
            secondaryTitle: "Número de onda contra a massa do primeiro átomo",
            secondarySubtitle: "tende a saturar: μ → massa do outro átomo quando o primeiro fica muito pesado",
            secondaryCaption: "Quando um átomo é muito pesado, só o leve vibra de fato."
          };
        }
      }
    ]
  };
})();
