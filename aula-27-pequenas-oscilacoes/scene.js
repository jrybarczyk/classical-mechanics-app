(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula27",
    discipline: "Mecânica Clássica · Aula 26",
    title: "Pequenas oscilações",
    subtitle: "Por que o problema de autovalor é generalizado, e não o padrão?",

    stations: [
      {
        id: "autovalor",
        tab: "Autovalor<br>generalizado",
        heading: "Ortogonalidade na métrica de m",
        equation: "(A − ω²m)a = 0   ·   a⁽ˢ⁾ᵀ m a⁽ʳ⁾ = 0",
        hint: "Verifique os dois produtos: o usual e o com m. Só um deles se anula.",
        controls: [
          { id: "parameter", label: "razão de massas m₂/m₁", min: 0.1, max: 4, step: 0.05, value: 1, digits: 2 },
          { id: "secondary", label: "razão de comprimentos ℓ₂/ℓ₁", min: 0.2, max: 3, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "modo mostrado", min: 1, max: 2, step: 1, value: 1, digits: 0 }
        ],
        secondary: true,

        draw(api, v) {
          const { M, K } = P.doubleMatrices(1, v.parameter, 1, v.secondary);
          const s = P.solveGeneralised(M, K);
          const idx = Math.round(v.tertiary) - 1;
          const chart = api.axes(api.main, -1.4, 1.4, -1.4, 1.4, "componente 1", "componente 2");
          /* Elipse de norma unitária na métrica de m: os modos são ortogonais nela. */
          api.line(chart, api.param((t) => {
            const u = [Math.cos(t), Math.sin(t)];
            const n = Math.sqrt(P.massInner(M, u, u));
            return [u[0] / n, u[1] / n];
          }, 0, api.TAU, 240), api.C.grid, [4, 4], 1.6);
          api.line(chart, api.param((t) => [Math.cos(t), Math.sin(t)], 0, api.TAU, 160), "#e6ebe6", [2, 3], 1.2);
          s.vetores.forEach((a, i) => {
            const cor = i === idx ? (i === 0 ? api.C.green : api.C.red) : api.C.grayLight;
            api.arrow(chart, 0, 0, a[0], a[1], cor, i === idx ? 3.4 : 2, 10);
            api.label(chart, a[0] * 1.16, a[1] * 1.16, `modo ${i + 1}`, cor, "center");
          });
          api.hline(chart, 0, "#b9c4bb", []); api.vline(chart, 0, "#b9c4bb", []);
          api.label(chart, 0, -1.28, "elipse: norma unitária na métrica de m", api.C.muted, "center", "top");

          const sec = api.axes(api.second, 0.1, 4, 0, (() => { const d4 = P.doubleMatrices(1, 4, 1, v.secondary); return P.solveGeneralised(d4.M, d4.K).omegas[1] * 1.15; })(),
            "razão m₂/m₁", "frequências (rad/s)");
          api.line(sec, api.curve((r) => {
            const d = P.doubleMatrices(1, r, 1, v.secondary);
            return P.solveGeneralised(d.M, d.K).omegas[0];
          }, 0.1, 4, 110), api.C.green);
          api.line(sec, api.curve((r) => {
            const d = P.doubleMatrices(1, r, 1, v.secondary);
            return P.solveGeneralised(d.M, d.K).omegas[1];
          }, 0.1, 4, 110), api.C.red);
          api.dot(sec, v.parameter, s.omegas[0], api.C.green, 4.5);
          api.dot(sec, v.parameter, s.omegas[1], api.C.red, 4.5);
        },

        text(v, api) {
          const { M, K } = P.doubleMatrices(1, v.parameter, 1, v.secondary);
          const s = P.solveGeneralised(M, K);
          const emM = P.massInner(M, s.vetores[0], s.vetores[1]);
          const usual = P.euclideanInner(s.vetores[0], s.vetores[1]);
          const idx = Math.round(v.tertiary) - 1;
          return {
            title: "Modos normais e as duas ortogonalidades",
            subtitle: `m₂/m₁ = ${api.fmt(v.parameter)} · ℓ₂/ℓ₁ = ${api.fmt(v.secondary)} · modo ${api.fmt(v.tertiary, 0)}`,
            regime: P.massCoupling(M) < 1e-9 ? ["m diagonal", "ok"] : Math.abs(usual) < 1e-3 ? ["produto usual nulo por coincidência — m continua cheia", "warn"] : ["m cheia: só vale a métrica de m", "warn"],
            caption: "As duas setas parecem não perpendiculares — e não são, no produto escalar comum. Elas são ortogonais na métrica definida por m, cuja elipse de norma unitária está tracejada.",
            prediction: "Os modos normais são perpendiculares no sentido usual?",
            calculation: `det(A − ω²m) = 0 ⟹ ω = <b>${s.omegas.map((o) => api.fmt(o, 4)).join(" e ")}</b> rad/s<br>a⁽¹⁾ = (${s.vetores[0].map((x) => api.fmt(x, 3)).join("; ")}) · a⁽²⁾ = (${s.vetores[1].map((x) => api.fmt(x, 3)).join("; ")})<em>a⁽¹⁾ᵀ m a⁽²⁾ = ${api.sci(emM)} · produto usual = ${api.fmt(usual, 4)}</em>`,
            metrics: [
              ["ω do modo 1", `${api.fmt(s.omegas[0], 4)} rad/s`],
              ["ω do modo 2", `${api.fmt(s.omegas[1], 4)} rad/s`],
              ["produto na métrica de m", api.sci(emM)],
              ["produto escalar usual", api.fmt(usual, 4)],
              ["m fora da diagonal", api.fmt(M[0][1], 4)],
              ["A fora da diagonal", api.fmt(K[0][1], 4)]
            ],
            concept: "É porque m pode ser cheia que o problema é generalizado. Se m fosse múltiplo da identidade, as duas ortogonalidades coincidiriam e o problema seria o padrão.",
            prompts: [
              "Confirme que o produto na métrica de m é nulo e o usual não.",
              "Ache (m₂/m₁, ℓ₂/ℓ₁) em que o produto usual se anula por acaso (por exemplo, 1,25 e 1,8) e explique por que m continua cheia.",
              "Explique por que uma frequência nula corresponderia a translação rígida."
            ],
            legend: [[api.C.green, "modo 1"], [api.C.red, "modo 2"], [api.C.grid, "métrica de m"]],
            secondaryTitle: "Frequências contra a razão de massas",
            secondarySubtitle: "os dois ramos nunca se cruzam",
            secondaryCaption: "A separação entre eles é o que impede a degenerescência."
          };
        }
      },

      {
        id: "cadeia",
        tab: "Cadeia e<br>dispersão",
        heading: "De N massas ao contínuo",
        equation: "ω(q) = 2√(κ/m)|sen(qa/2)|   ·   c = a√(κ/m)",
        hint: "Compare a curva com a reta do limite contínuo. Onde elas se separam?",
        controls: [
          { id: "parameter", label: "número de onda qa", min: 0.05, max: 3.14, step: 0.01, value: 1, digits: 2, unit: "rad" },
          { id: "secondary", label: "constante da mola κ", min: 1, max: 20, step: 0.5, value: 4, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 4, step: 0.05, value: 1, digits: 2, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const a = 1, kappa = v.secondary, m = v.tertiary;
          const c = P.soundSpeedChain(a, kappa, m);
          const wmax = P.omegaMax(kappa, m);
          const chart = api.axes(api.main, 0, Math.PI, 0, wmax * 1.2, "qa (rad)", "ω (rad/s)", {
            xTicks: [0, Math.PI / 2, Math.PI],
            xFormat: (t) => (t < 0.01 ? "0" : Math.abs(t - Math.PI) < 0.01 ? "π" : "π/2")
          });
          api.line(chart, api.curve((qa) => P.dispersion(qa / a, a, kappa, m), 0, Math.PI, 200), api.C.green, [], 3.2);
          api.line(chart, api.curve((qa) => Math.min(wmax * 1.2, (c * qa) / a), 0, Math.PI, 60), api.C.blue, [5, 4], 2.2);
          api.hline(chart, wmax, api.C.gold, [4, 4], "ω_max = 2√(κ/m)");
          api.dot(chart, v.parameter, P.dispersion(v.parameter / a, a, kappa, m), api.C.red, 5.5);
          api.label(chart, 2.9, c * 2.9 * 0.85, "limite contínuo ω = cq", api.C.blue, "right");

          const s = api.axes(api.second, 0.05, 3.14, 0, c * 1.15, "qa (rad)", "velocidade (m/s)");
          api.line(s, api.curve((qa) => P.phaseVelocity(qa / a, a, kappa, m), 0.05, 3.14, 120), api.C.green);
          api.line(s, api.curve((qa) => P.groupVelocity(qa / a, a, kappa, m), 0.05, 3.14, 120), api.C.red);
          api.hline(s, c, api.C.grayLight, [4, 4], "c do limite contínuo");
          api.dot(s, v.parameter, P.phaseVelocity(v.parameter / a, a, kappa, m), api.C.green, 4.5);
          api.dot(s, v.parameter, P.groupVelocity(v.parameter / a, a, kappa, m), api.C.red, 4.5);
        },

        text(v, api) {
          const a = 1, kappa = v.secondary, m = v.tertiary;
          const c = P.soundSpeedChain(a, kappa, m);
          const w = P.dispersion(v.parameter / a, a, kappa, m);
          const linear = (c * v.parameter) / a;
          const desvio = (Math.abs(w - linear) / linear) * 100;
          return {
            title: "Relação de dispersão da cadeia",
            subtitle: `qa = ${api.fmt(v.parameter)} rad · κ = ${api.fmt(kappa, 1)} N/m · m = ${api.fmt(m)} kg`,
            regime: desvio < 2 ? ["regime contínuo", "ok"] : desvio < 15 ? ["dispersão perceptível", "warn"] : ["longe do contínuo", "alert"],
            caption: "Para comprimentos de onda longos a curva é reta e o meio se comporta como contínuo. Perto da borda da zona a discretização aparece e a velocidade de grupo cai a zero.",
            prediction: "A cadeia propaga qualquer frequência? Existe um teto?",
            calculation: `ω(q) = 2√(κ/m)|sen(qa/2)| = 2√(${api.fmt(kappa, 1)}/${api.fmt(m)})·sen(${api.fmt(v.parameter / 2, 3)}) = <b>${api.fmt(w, 4)} rad/s</b><br>limite contínuo: cq = <b>${api.fmt(linear, 4)} rad/s</b><em>desvio de ${api.fmt(desvio, 2)} % · c = a√(κ/m) = ${api.fmt(c, 4)} m/s</em>`,
            metrics: [
              ["ω(q)", `${api.fmt(w, 4)} rad/s`],
              ["cq linear", `${api.fmt(linear, 4)} rad/s`],
              ["desvio", `${api.fmt(desvio, 2)} %`],
              ["ω_max", `${api.fmt(P.omegaMax(kappa, m), 4)} rad/s`],
              ["velocidade de fase", `${api.fmt(P.phaseVelocity(v.parameter / a, a, kappa, m), 4)} m/s`],
              ["velocidade de grupo", `${api.fmt(P.groupVelocity(v.parameter / a, a, kappa, m), 4)} m/s`]
            ],
            concept: "Modos normais de sistemas discretos e ondas em meios contínuos são o mesmo problema de autovalor em dois regimes; a relação de dispersão é a ponte explícita.",
            prompts: [
              "Ache o qa em que o desvio do limite linear chega a 5 %.",
              "Explique por que a velocidade de grupo se anula na borda da zona.",
              "Confirme que c = √(Y/ρ_ℓ) com Y = κa e ρ_ℓ = m/a."
            ],
            legend: [[api.C.green, "cadeia"], [api.C.blue, "limite contínuo"], [api.C.gold, "ω_max"]],
            secondaryTitle: "Velocidades de fase e de grupo",
            secondarySubtitle: "coincidem em q → 0 e divergem na borda",
            secondaryCaption: "Quando as duas diferem, um pulso se deforma ao propagar."
          };
        }
      },

      {
        id: "ultrassom",
        tab: "Velocidade do<br>ultrassom",
        heading: "c = √(B/ρ) e o erro de profundidade",
        equation: "c = √(B/ρ)   ·   Z = ρc = √(Bρ)   ·   d = ct/2",
        hint: "O aparelho assume 1540 m/s. Meça o que isso custa ao atravessar gordura.",
        controls: [
          { id: "parameter", label: "módulo de compressão B", min: 1.4, max: 3.4, step: 0.01, value: 2.2, digits: 2, unit: "GPa" },
          { id: "secondary", label: "densidade ρ", min: 900, max: 1200, step: 1, value: 998, digits: 0, unit: "kg/m³" },
          { id: "tertiary", label: "espessura da camada", min: 0.5, max: 10, step: 0.1, value: 4, digits: 1, unit: "cm" }
        ],
        secondary: true,

        draw(api, v) {
          const B = v.parameter * 1e9;
          const c = P.soundSpeed(B, v.secondary);
          const chart = api.axes(api.main, 1.4, 3.4, 1000, 2000, "módulo de compressão B (GPa)", "velocidade c (m/s)");
          [[950, "#cfd8d0"], [998, api.C.green], [1100, api.C.blue]].forEach(([rho, cor]) => {
            api.line(chart, api.curve((kk) => P.soundSpeed(kk * 1e9, rho), 1.4, 3.4, 120), cor,
              Math.abs(rho - v.secondary) < 8 ? [] : [5, 4], Math.abs(rho - v.secondary) < 8 ? 3 : 1.6);
            api.label(chart, 3.35, P.soundSpeed(3.4e9, rho), `ρ = ${rho}`, cor, "right");
          });
          api.hline(chart, 1540, api.C.gold, [5, 4], "1540: valor assumido pelo aparelho");
          api.hline(chart, 1450, api.C.red, [3, 4], "gordura ≈ 1450");
          api.dot(chart, v.parameter, c, api.C.ink, 5.5);

          const eMax = 1.1 * Math.max(Math.abs(P.depthError(v.tertiary, 1000)), Math.abs(P.depthError(v.tertiary, 2000)));
          const s = api.axes(api.second, 1000, 2000, -eMax, eMax, "c real do meio (m/s)", "erro de profundidade (cm)");
          api.line(s, api.curve((cc) => P.depthError(v.tertiary, cc), 1000, 2000, 160), api.C.red, [], 2.8);
          api.hline(s, 0, "#b9c4bb", []);
          api.vline(s, 1540, api.C.gold, [4, 4], "sem erro");
          api.vline(s, 1450, api.C.grayLight, [3, 4], "gordura");
          api.dot(s, c, P.depthError(v.tertiary, c), api.C.ink, 4.5);
        },

        text(v, api) {
          const B = v.parameter * 1e9;
          const c = P.soundSpeed(B, v.secondary);
          const Z = P.impedance(B, v.secondary);
          const reportada = P.reportedDepth(v.tertiary, c);
          const erro = P.depthError(v.tertiary, c);
          return {
            title: "Velocidade do som e erro de posição",
            subtitle: `B = ${api.fmt(v.parameter)} GPa · ρ = ${api.fmt(v.secondary, 0)} kg/m³`,
            regime: Math.abs(c - 1540) < 20 ? ["compatível com o assumido", "ok"] : Math.abs(c - 1540) < 90 ? ["desvio moderado", "warn"] : ["desvio grande", "alert"],
            caption: "A mesma fórmula da cadeia, escrita com grandezas macroscópicas. Todo o equipamento de imagem assume 1540 m/s, e um desvio dessa hipótese vira erro de posição.",
            prediction: "Atravessando gordura, o aparelho superestima ou subestima a profundidade?",
            calculation: `c = √(B/ρ) = √(${api.sci(B)}/${api.fmt(v.secondary, 0)}) = <b>${api.fmt(c, 1)} m/s</b><br>d reportada = d·(1540/c) = ${api.fmt(v.tertiary, 1)}·(1540/${api.fmt(c, 0)}) = <b>${api.fmt(reportada, 3)} cm</b><em>erro = ${api.fmt(erro * 10, 2)} mm em ${api.fmt(v.tertiary, 1)} cm de camada</em>`,
            metrics: [
              ["velocidade c", `${api.fmt(c, 1)} m/s`],
              ["impedância Z = √(Bρ)", api.sci(Z)],
              ["profundidade real", `${api.fmt(v.tertiary, 1)} cm`],
              ["profundidade reportada", `${api.fmt(reportada, 3)} cm`],
              ["erro", `${api.fmt(erro * 10, 2)} mm`],
              ["erro relativo", `${api.fmt((erro / v.tertiary) * 100, 2)} %`]
            ],
            concept: "Rigidez e inércia são as duas grandezas que fixam qualquer velocidade de onda mecânica. A elastografia mapeia outra rigidez, o módulo de cisalhamento G, que varia muito mais que B entre tecidos.",
            prompts: [
              "Reproduza c = 1485 m/s para a água (B = 2,2 GPa, ρ = 998).",
              "Com ρ = 1060 kg/m³, ajuste B até c ≈ 1450 m/s (gordura) e confirme o erro de 2,5 mm em 4 cm.",
              "Com ρ = 1060 kg/m³, ache o B que dá 1540 m/s."
            ],
            legend: [[api.C.green, "densidade escolhida"], [api.C.gold, "1540 m/s"], [api.C.red, "gordura"]],
            secondaryTitle: "Erro de profundidade contra a velocidade real",
            secondarySubtitle: "cruza zero exatamente em 1540 m/s",
            secondaryCaption: "Meios mais lentos que a hipótese aparecem mais fundos do que estão."
          };
        }
      }
    ]
  };
})();
