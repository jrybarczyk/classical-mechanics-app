(function () {
  "use strict";
  const P = window.LessonPhysics;
  const deg = (d) => (d * Math.PI) / 180;
  const M_ALFA = 4.0026;   // massa da alfa em u

  window.LessonScene = {
    id: "aula20",
    discipline: "Mecânica Clássica · Aula 19 — complemento",
    title: "Espalhamento e aplicações de forças centrais",
    subtitle: "Por que subir de órbita aumenta a energia e reduz a rapidez?",

    stations: [
      {
        id: "transferencia",
        tab: "Transferência<br>e virial",
        heading: "O paradoxo do satélite",
        equation: "E = −k/2a   ·   ⟨T⟩ = −E   ·   v_c = √(k/μr)",
        hint: "Suba de órbita e acompanhe energia e rapidez ao mesmo tempo. As leituras de E e ⟨T⟩ são da órbita inicial r₁.",
        controls: [
          { id: "parameter", label: "raio inicial r₁", min: 1, max: 6, step: 0.05, value: 1, digits: 2 },
          { id: "secondary", label: "raio final r₂", min: 1, max: 12, step: 0.05, value: 3, digits: 2 },
          { id: "tertiary", label: "constante k", min: 0.5, max: 3, step: 0.05, value: 1, digits: 2 }
        ],
        secondary: true,

        draw(api, v) {
          const mu = 1, k = v.tertiary;
          const r1 = v.parameter, r2 = v.secondary;
          /* Teto do eixo: a rapidez circular √(k/r) passa de 1,15k quando k < 1. */
          const yTopo = Math.max(k * 1.15, P.circularSpeed(Math.min(r1, r2, 0.8 + 1e-9), k, mu) * 1.1);
          const chart = api.axes(api.main, 0.8, 12, -k / 1.4, yTopo, "raio r", "energia e rapidez");
          api.line(chart, api.curve((r) => -k / (2 * r), 0.8, 12, 200), api.C.green, [], 3);
          api.line(chart, api.curve((r) => P.circularSpeed(r, k, mu), 0.8, 12, 200), api.C.blue, [], 2.6);
          api.line(chart, api.curve((r) => k / (2 * r), 0.8, 12, 200), api.C.gold, [5, 4], 2);
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, r1, api.C.grayLight, [4, 4], "r₁");
          api.vline(chart, r2, api.C.red, [4, 4], "r₂");
          api.dot(chart, r1, -k / (2 * r1), api.C.green, 4.5);
          api.dot(chart, r2, -k / (2 * r2), api.C.green, 4.5);
          api.dot(chart, r1, P.circularSpeed(r1, k, mu), api.C.blue, 4.5);
          api.dot(chart, r2, P.circularSpeed(r2, k, mu), api.C.blue, 4.5);
          api.label(chart, 11.6, -k / 24 + k * 0.06, "E = −k/2r", api.C.green, "right");
          api.label(chart, 11.6, P.circularSpeed(11.6, k, mu) + k * 0.06, "v circular", api.C.blue, "right");
          api.label(chart, 11.6, k / 24 + k * 0.06, "⟨T⟩ = −E", api.C.gold, "right");

          /* Elipse de Hohmann tangente às duas circunferências (subida ou descida). */
          const h = P.hohmann(r1, r2, k, mu);
          /* A janela segue o maior raio: com r₂/r₁ > 1,86 a circunferência externa passava de 1,3a. */
          const meio = 1.15 * Math.max(r1, r2);
          const s = api.axes(api.second, -meio, meio, -meio, meio, "", "", { xTicks: [], yTicks: [] });
          api.line(s, api.param((t) => [r1 * Math.cos(t), r1 * Math.sin(t)], 0, api.TAU, 160), api.C.grayLight, [4, 4], 1.6);
          api.line(s, api.param((t) => [r2 * Math.cos(t), r2 * Math.sin(t)], 0, api.TAU, 160), api.C.red, [4, 4], 1.6);
          const e = Math.abs(r2 - r1) / (r2 + r1);
          const p = h.a * (1 - e * e);
          api.line(s, api.param((t) => { const r = p / (1 + e * Math.cos(t)); return [r * Math.cos(t), r * Math.sin(t)]; }, 0, Math.PI, 200), api.C.green, [], 3);
          api.dot(s, 0, 0, api.C.ink, 5);
        },

        text(v, api) {
          const mu = 1, k = v.tertiary;
          const r1 = v.parameter, r2 = v.secondary;
          const dE = P.transferEnergy(r1, r2, k);
          const v1 = P.circularSpeed(r1, k, mu);
          const v2 = P.circularSpeed(r2, k, mu);
          const E1 = -k / (2 * r1);
          const h = P.hohmann(r1, r2, k, mu);
          const igual = Math.abs(r2 - r1) < 1e-9;
          return {
            title: "Energia e rapidez em órbitas circulares",
            subtitle: `r₁ = ${api.fmt(r1)} · r₂ = ${api.fmt(r2)} · k = ${api.fmt(k)}`,
            regime: igual ? ["mesma órbita", "ok"] : r2 > r1 ? ["subindo de órbita", "warn"] : ["descendo de órbita", "warn"],
            caption: "As duas curvas se movem em sentidos opostos: subir aumenta E e diminui v. O teorema do virial explica por quê.",
            prediction: "Um satélite que perde energia por arrasto acelera ou desacelera?",
            calculation: `E₁ = −k/2r₁ = <b>${api.fmt(E1, 4)}</b> · ⟨T⟩₁ = −E₁ = <b>${api.fmt(-E1, 4)}</b><br>ΔE = (k/2)(1/r₁ − 1/r₂) = (${api.fmt(k)}/2)(1/${api.fmt(r1)} − 1/${api.fmt(r2)}) = <b>${api.fmt(dE, 4)}</b><br>v₁ = ${api.fmt(v1, 4)} → v₂ = <b>${api.fmt(v2, 4)}</b> (v₂ − v₁ = ${api.fmt(v2 - v1, 4)})<em>Hohmann: Δv₁ = ${api.fmt(h.dv1, 4)}, Δv₂ = ${api.fmt(h.dv2, 4)}. Virial: ⟨T⟩ = −E, então ganhar E significa perder T</em>`,
            metrics: [
              ["ΔE da transferência", api.fmt(dE, 4)],
              ["E na órbita r₁", api.fmt(E1, 4)],
              ["⟨T⟩ na órbita r₁", api.fmt(-E1, 4)],
              ["v na órbita r₁", api.fmt(v1, 4)],
              ["v na órbita r₂", api.fmt(v2, 4)],
              ["Δv total de Hohmann", api.fmt(h.total, 4)]
            ],
            concept: "O paradoxo do satélite não viola nada: ao perder |ΔE|, o satélite desce e libera |ΔU| = 2|ΔE|; metade vai para o trabalho do arrasto e metade aumenta T.",
            prompts: [
              "Confirme que ⟨T⟩ = −E em duas órbitas diferentes.",
              "Subindo (r₂ > r₁), calcule os dois impulsos de Hohmann e verifique que ambos são positivos. E descendo?",
              "Explique por que um satélite freado pelo arrasto acelera."
            ],
            legend: [[api.C.green, "energia"], [api.C.blue, "rapidez"], [api.C.gold, "cinética média"]],
            secondaryTitle: "Elipse de transferência de Hohmann",
            secondarySubtitle: "tangente às duas órbitas circulares",
            secondaryCaption: "Semieixo maior igual à média dos dois raios."
          };
        }
      },

      {
        id: "rutherford",
        tab: "Rutherford",
        heading: "Parâmetro de impacto e seção de choque",
        equation: "b = (k/2E)cot(θ/2)   ·   dσ/dΩ = (k/4E)²/sen⁴(θ/2)   (E e θ no CM)",
        hint: "E e θ das fórmulas são do referencial do centro de massa (Aula 9). O controle dá a energia da alfa no laboratório; a aplicação converte para o CM. Com alvo leve, θ_lab ≠ θ.",
        controls: [
          { id: "parameter", label: "ângulo de espalhamento θ (CM)", min: 2, max: 178, step: 1, value: 90, digits: 0, unit: "°" },
          { id: "secondary", label: "energia da alfa no laboratório", min: 1, max: 40, step: 0.1, value: 5, digits: 1, unit: "MeV" },
          { id: "tertiary", label: "número atômico do alvo Z₂", min: 6, max: 92, step: 1, value: 79, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const k = P.coulombK(2, v.tertiary);
          const A = P.massNumber(v.tertiary);
          const E = P.labToCM(v.secondary, M_ALFA, A);
          const { ctx, width, height } = api.main;
          const cx = width * 0.55, cy = height * 0.62;
          const b90 = P.impactParameter(deg(90), k, E);
          const escala = (height * 0.075) / b90;      // a geometria escala com k/2E

          /* Trajetórias relativas (ramo repulsivo), todas chegando paralelas ao feixe. */
          ctx.save();
          ctx.beginPath(); ctx.rect(0, 0, width, height - 30); ctx.clip();
          [0.4, 0.8, 1.5, 3, 6].forEach((mult, i) => {
            const b = b90 * mult;
            const pts = P.repulsiveTrajectory(b, k, E, 240, 0.995);
            ctx.strokeStyle = i === 2 ? api.C.green : "#b8c8ba";
            ctx.lineWidth = i === 2 ? 2.6 : 1.5;
            ctx.beginPath();
            pts.forEach(([x, y], j) => {
              const px = cx + x * escala, py = cy - y * escala;
              if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
            });
            ctx.stroke();
          });
          ctx.restore();
          ctx.fillStyle = api.C.red;
          ctx.beginPath(); ctx.arc(cx, cy, 5, 0, api.TAU); ctx.fill();
          ctx.fillStyle = api.C.muted;
          ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.fillText("núcleo", cx + 9, cy + 16);
          ctx.fillText("feixe incidente", 24, cy - 8);
          api.vector(ctx, 24, cy + 18, 120, cy + 18, api.C.blue, 2.2, 8);
          ctx.fillText(`b(θ) = ${api.fmt(P.impactParameter(deg(v.parameter), k, E), 1)} fm para θ = ${v.parameter}° (CM)`, 24, height - 12);

          const L10 = Math.log10;
          const s = api.axes(api.second, 2, 178, L10(P.rutherford(deg(178), k, E)), L10(P.rutherford(deg(2), k, E)),
            "ângulo θ no CM (°)", "log₁₀ dσ/dΩ", { xTicks: [45, 90, 135], yFormat: (t) => `10${api.sup(Math.round(t))}` });
          api.line(s, api.curve((d) => L10(P.rutherford(deg(d), k, E)), 2, 178, 200), api.C.green);
          api.dot(s, v.parameter, L10(P.rutherford(deg(v.parameter), k, E)), api.C.red, 4.5);
        },

        text(v, api) {
          const k = P.coulombK(2, v.tertiary);
          const A = P.massNumber(v.tertiary);
          const Elab = v.secondary;
          const E = P.labToCM(Elab, M_ALFA, A);
          const th = deg(v.parameter);
          const b = P.impactParameter(th, k, E);
          const sig = P.rutherford(th, k, E);
          const d = P.closestApproach(k, E);
          const Rn = P.nuclearRadius(A);
          const thLab = (P.thetaLabFromCM(th, M_ALFA, A) * 180) / Math.PI;
          return {
            title: "Geometria e probabilidade do espalhamento",
            subtitle: `θ = ${api.fmt(v.parameter, 0)}° (CM) · E_lab = ${api.fmt(Elab, 1)} MeV · Z₂ = ${api.fmt(v.tertiary, 0)} (A ≈ ${A})`,
            regime: d > Rn ? ["Coulomb puro válido", "ok"] : ["a partícula alcança o núcleo", "alert"],
            caption: "Trajetórias no movimento relativo: todas chegam paralelas ao feixe; b grande passa quase reto, b pequeno é desviado fortemente para trás. A queda em sen⁻⁴(θ/2) torna o retroespalhamento raríssimo.",
            prediction: "Quantas vezes menos provável é o espalhamento a 90° que a 10°?",
            calculation: `E = E_lab·A/(A + 4) = ${api.fmt(Elab, 1)}·${A}/${A + 4} = <b>${api.fmt(E, 3)} MeV</b> (CM)<br>k = Z₁Z₂e²/4πε₀ = 2·${api.fmt(v.tertiary, 0)}·1,44 = <b>${api.fmt(k, 1)} MeV·fm</b><br>b = (k/2E)cot(θ/2) = (${api.fmt(k, 1)}/${api.fmt(2 * E, 2)})·cot(${api.fmt(v.parameter / 2, 1)}°) = <b>${api.fmt(b, 2)} fm</b><em>d = k/E = ${api.fmt(d, 1)} fm, contra raio nuclear ≈ ${api.fmt(Rn, 1)} fm · no laboratório, θ_lab = ${api.fmt(thLab, 1)}°</em>`,
            metrics: [
              ["parâmetro de impacto b", `${api.fmt(b, 2)} fm`],
              ["dσ/dΩ", `${api.sci(sig)} fm²/sr`],
              ["d frontal = k/E", `${api.fmt(d, 1)} fm`],
              ["raio nuclear", `${api.fmt(Rn, 1)} fm`],
              ["σ(θ)/σ(10°)", api.sci(sig / P.rutherford(deg(10), k, E))],
              ["E no CM", `${api.fmt(E, 3)} MeV`]
            ],
            concept: "A fórmula é clássica e coincide com o resultado quântico para Coulomb. Foi a raridade prevista do retroespalhamento, e sua observação, que levou Rutherford ao núcleo.",
            prompts: [
              "Reproduza o exemplo das notas: alfas de 5 MeV em ouro dão d ≈ 45,5 fm (46,4 fm com a energia no CM).",
              "Confirme que a razão σ(90°)/σ(10°) vale cerca de 2,3·10⁻⁴.",
              "Com ouro (Z₂ = 79), ache a energia no laboratório em que d se iguala ao raio nuclear e diga o que acontece ali."
            ],
            legend: [[api.C.green, "trajetória destacada"], [api.C.red, "núcleo"]],
            secondaryTitle: "Seção de choque diferencial",
            secondarySubtitle: "escala logarítmica: a queda cobre muitas ordens",
            secondaryCaption: "A divergência em θ → 0 torna a seção total infinita — a blindagem eletrônica a corta."
          };
        }
      },

      {
        id: "protons",
        tab: "Prótons e<br>penumbra",
        heading: "Espalhamento múltiplo",
        equation: "θ₀ = (13,6/βcp)·z·√(x/X₀)·[1 + 0,038 ln(x/X₀)]",
        hint: "Cada desvio é minúsculo. O acúmulo de muitos é que fixa a borda do campo. As curvas param no alcance do próton (Bragg–Kleeman, aproximado); a energia é tratada como constante ao longo do percurso.",
        controls: [
          { id: "parameter", label: "energia do próton", min: 60, max: 250, step: 5, value: 200, digits: 0, unit: "MeV" },
          { id: "secondary", label: "profundidade x", min: 0.5, max: 25, step: 0.5, value: 10, digits: 1, unit: "cm" },
          { id: "tertiary", label: "comprimento de radiação X₀", min: 10, max: 40, step: 0.5, value: 36.08, digits: 2, unit: "cm" }
        ],
        secondary: true,

        draw(api, v) {
          const X0 = v.tertiary;
          const xFim = (T) => Math.min(25, P.protonRangeWater(T));
          const REF = [[100, "#cfd8d0"], [150, api.C.blue], [250, api.C.gold]];
          const yMax = Math.max(...[100, 150, 200, 250, v.parameter].map((T) => P.lateralSpread(T, xFim(T), X0) * 10)) * 1.1;
          const chart = api.axes(api.main, 0, 25, 0, yMax, "profundidade x (cm)", "largura lateral (mm)");
          REF.forEach(([T, cor]) => {
            api.line(chart, api.curve((x) => P.lateralSpread(T, x, X0) * 10, 0.2, xFim(T), 140), cor, [5, 4], 1.6);
            api.label(chart, xFim(T), P.lateralSpread(T, xFim(T), X0) * 10, `${T} MeV`, cor, "right");
            if (P.protonRangeWater(T) < 25) api.dot(chart, xFim(T), P.lateralSpread(T, xFim(T), X0) * 10, cor, 3.5, true);
          });
          const Tsel = v.parameter;
          api.line(chart, api.curve((x) => P.lateralSpread(Tsel, x, X0) * 10, 0.2, xFim(Tsel), 140), api.C.green, [], 3);
          if (P.protonRangeWater(Tsel) < 25) api.vline(chart, P.protonRangeWater(Tsel), api.C.green, [4, 4], "alcance");
          if (v.secondary <= P.protonRangeWater(Tsel)) api.dot(chart, v.secondary, P.lateralSpread(Tsel, v.secondary, X0) * 10, api.C.red, 5.5);

          /* Painel secundário: o feixe alargando com a profundidade, até parar. */
          const { ctx, width, height } = api.second;
          const y0 = height / 2;
          const esc = (width - 60) / 25;
          const xf = xFim(Tsel);
          ctx.save();
          ctx.fillStyle = "rgba(97,155,96,.16)";
          ctx.beginPath();
          ctx.moveTo(40, y0 - 6);
          for (let x = 0; x <= xf; x += 0.25) ctx.lineTo(40 + x * esc, y0 - 6 - P.lateralSpread(Tsel, x, X0) * 90);
          for (let x = xf; x >= 0; x -= 0.25) ctx.lineTo(40 + x * esc, y0 + 6 + P.lateralSpread(Tsel, x, X0) * 90);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = api.C.green; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= xf; x += 0.25) {
            const px = 40 + x * esc, py = y0 - 6 - P.lateralSpread(Tsel, x, X0) * 90;
            if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.strokeStyle = "#b9c4bb"; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(40, y0); ctx.lineTo(width - 20, y0); ctx.stroke();
          ctx.setLineDash([]);
          const xm = 40 + v.secondary * esc;
          ctx.strokeStyle = api.C.red; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(xm, 12); ctx.lineTo(xm, height - 12); ctx.stroke();
          ctx.fillStyle = api.C.muted; ctx.font = "11px Ubuntu, system-ui, sans-serif";
          ctx.fillText("entrada colimada", 40, height - 6);
          ctx.fillText(`x = ${api.fmt(v.secondary, 1)} cm`, xm + 5, 20);
          ctx.restore();
        },

        text(v, api) {
          const th0 = P.highlandAngle(v.parameter, v.secondary, v.tertiary);
          const sig = P.lateralSpread(v.parameter, v.secondary, v.tertiary);
          const bcp = P.protonBetaCP(v.parameter);
          const R = P.protonRangeWater(v.parameter);
          const parou = v.secondary > R;
          return {
            title: "Alargamento lateral do feixe",
            subtitle: `T = ${api.fmt(v.parameter, 0)} MeV · x = ${api.fmt(v.secondary, 1)} cm · X₀ = ${api.fmt(v.tertiary, 2)} cm · alcance ≈ ${api.fmt(R, 1)} cm`,
            regime: parou ? ["além do alcance: o próton já parou", "alert"] : sig * 10 < 1 ? ["penumbra abaixo de 1 mm", "ok"] : sig * 10 < 3 ? ["penumbra de alguns mm", "warn"] : ["penumbra grande", "alert"],
            caption: "Cada colisão coulombiana desvia pouquíssimo, porque a seção de choque se concentra em ângulos pequenos. O acúmulo de milhares delas dá uma gaussiana. Energia tratada como constante: perto do fim do alcance o valor real é maior.",
            prediction: "A penumbra cresce proporcionalmente à profundidade, ou mais rápido?",
            calculation: `βcp = ${api.fmt(bcp, 1)} MeV<br>θ₀ = (13,6/${api.fmt(bcp, 1)})·√(${api.fmt(v.secondary, 1)}/${api.fmt(v.tertiary, 2)})·[1 + 0,038 ln(${api.fmt(v.secondary / v.tertiary, 4)})] = <b>${api.fmt(th0 * 1000, 2)} mrad</b><em>σ ≈ θ₀x/√3 = <b>${api.fmt(sig * 10, 2)} mm</b>${parou ? ` — mas x excede o alcance (≈ ${api.fmt(R, 1)} cm)` : ""}</em>`,
            metrics: [
              ["βcp", `${api.fmt(bcp, 1)} MeV`],
              ["θ₀", `${api.fmt(th0 * 1000, 2)} mrad`],
              ["largura lateral", `${api.fmt(sig * 10, 2)} mm`],
              ["largura em metade da profundidade", `${api.fmt(P.lateralSpread(v.parameter, v.secondary / 2, v.tertiary) * 10, 2)} mm`],
              ["razão entre as duas", api.fmt(sig / P.lateralSpread(v.parameter, v.secondary / 2, v.tertiary), 2)],
              ["alcance em água (aprox.)", `${api.fmt(R, 1)} cm`]
            ],
            concept: "É o espalhamento múltiplo que fixa a penumbra lateral — e ele é um processo distinto da perda de energia por ionização, que governa o alcance e o pico de Bragg.",
            prompts: [
              "Confirme que dobrar a profundidade mais que dobra o alargamento.",
              "Compare 150 e 250 MeV na mesma profundidade e explique a diferença.",
              "Diga qual processo governa o alcance em profundidade, e por que não é este."
            ],
            legend: [[api.C.green, "energia escolhida"], ["#cfd8d0", "100 MeV"], [api.C.blue, "150 MeV"], [api.C.gold, "250 MeV"]],
            secondaryTitle: "Envelope do feixe",
            secondarySubtitle: "entrada perfeitamente colimada, borda crescendo com a profundidade",
            secondaryCaption: "Nenhuma colimação na entrada evita a borda difusa na profundidade de tratamento."
          };
        }
      },

      {
        id: "apsidal",
        tab: "Ângulo<br>apsidal",
        heading: "Quando uma órbita fecha",
        equation: "ω_r/ω_θ = √(3 − n)   ·   Φ = π/√(3 − n)   (f = −k/rⁿ, órbita quase circular)",
        hint: "Órbita quase circular, na aproximação linear u = (1/r_c)[1 + ε cos(√(3−n) θ)]. Experimente n = 2, n = −1 e n = 2,56 ≈ 3 − (2/3)².",
        controls: [
          { id: "parameter", label: "expoente n da força", min: -2, max: 2.9, step: 0.01, value: 2.2, digits: 2 },
          { id: "secondary", label: "amplitude radial ε", min: 0.05, max: 0.3, step: 0.01, value: 0.2, digits: 2 },
          { id: "tertiary", label: "voltas desenhadas", min: 1, max: 12, step: 1, value: 6, digits: 0 }
        ],

        draw(api, v) {
          const n = v.parameter, eps = v.secondary;
          const beta = P.frequencyRatio(n);
          const lim = 1.45 / (1 - eps);
          const { width, height } = api.main;
          const asp = width / Math.max(1, height);
          const chart = api.axes(api.main, -lim * asp * 0.8, lim * asp * 0.8, -lim, lim, "x/r_c", "y/r_c");
          const voltas = Math.round(v.tertiary);
          api.line(chart, api.param((t) => { const r = 1 / (1 + eps * Math.cos(beta * t)); return [r * Math.cos(t), r * Math.sin(t)]; }, 0, voltas * api.TAU, 400 * voltas), api.C.green, [], 2);
          /* Pericentros sucessivos: θ = 2πm/β. */
          for (let m = 0; (2 * Math.PI * m) / beta <= voltas * api.TAU + 1e-9; m += 1) {
            const t = (2 * Math.PI * m) / beta, r = 1 / (1 + eps);
            api.dot(chart, r * Math.cos(t), r * Math.sin(t), api.C.red, 3.5);
          }
          api.dot(chart, 0, 0, api.C.ink, 5);
        },

        text(v, api) {
          const n = v.parameter;
          const beta = P.frequencyRatio(n);
          const Phi = P.apsidalAngle(n);
          const prec = (P.precessionPerOrbit(n) * 180) / Math.PI;
          const fecha = P.closesAfter(n);
          /* Número de voltas (até 12) em que um pericentro mais se aproxima da direção inicial. */
          let qMelhor = 1, desvio = Infinity;
          for (let q = 1; q <= 12; q += 1) {
            const d = Math.abs((360 * (Math.round(q * beta) - q * beta)) / beta);
            if (d < desvio - 1e-9) { desvio = d; qMelhor = q; }
          }
          return {
            title: "Órbita quase circular e ângulo apsidal",
            subtitle: `n = ${api.fmt(n)} · ω_r/ω_θ = ${api.fmt(beta, 4)} · Φ = ${api.fmt(Phi / Math.PI, 4)}π`,
            regime: fecha ? [`fecha após ${fecha.voltas} volta(s)`, "ok"] : ["precessa", "alert"],
            caption: "Os pontos vermelhos são os pericentros sucessivos. Se Φ/π = 1/√(3−n) for racional, a órbita quase circular fecha após um número inteiro de voltas; se for irracional, ela precessa e nunca fecha.",
            prediction: "Fora de n = 2 e n = −1, alguma órbita quase circular pode fechar?",
            calculation: `ω_r/ω_θ = √(3 − ${api.fmt(n)}) = <b>${api.fmt(beta, 4)}</b><br>Φ = π/${api.fmt(beta, 4)} = <b>${api.fmt((Phi * 180) / Math.PI, 2)}°</b><em>precessão por volta = 2Φ − 2π = ${api.fmt(prec, 2)}°</em>`,
            metrics: [
              ["ω_r/ω_θ", api.fmt(beta, 4)],
              ["Φ", `${api.fmt((Phi * 180) / Math.PI, 2)}°`],
              ["precessão por volta", `${api.fmt(prec, 2)}°`],
              ["fecha após", fecha ? `${fecha.voltas} volta(s), ${fecha.apsides} ápsides` : "não fecha em até 12 voltas"],
              ["mais perto de fechar", `${qMelhor} volta(s), pericentro deslocado ${api.fmt(desvio, 1)}°`]
            ],
            concept: "Para órbitas quase circulares, fechar exige √(3−n) racional — o que ocorre para infinitos expoentes. O teorema de Bertrand diz algo mais forte: só n = 2 e n = −1 fecham TODAS as órbitas ligadas, de qualquer amplitude.",
            prompts: [
              "Ponha n = 2 e n = −1: quantos pericentros por volta em cada caso?",
              "Ponha n = 2,56 ≈ 3 − (2/3)²: após quantas voltas a órbita (quase) fecha?",
              "Com n = 2,2, a linha das ápsides avança ou regride? E com n = 1,8?"
            ],
            legend: [[api.C.green, "órbita"], [api.C.red, "pericentros"]]
          };
        }
      }
    ]
  };
})();
