(function () {
  "use strict";
  const P = window.LessonPhysics;

  window.LessonScene = {
    id: "aula24",
    discipline: "Mecânica Clássica · Aula 23",
    title: "Equações de Lagrange",
    subtitle: "Se as forças de vínculo somem, como recuperá-las quando são a resposta?",

    stations: [
      {
        id: "polares",
        tab: "A Aula 3 em<br>duas linhas",
        heading: "Aceleração polar por Lagrange",
        equation: "L = ½m(ṙ² + r²θ̇²) − U(r)",
        hint: "Instantâneo com r̈ = 0 (força central que neste instante vale f = −mrθ̇²). Compare o esforço com o da Aula 3, que exigiu derivar a base móvel.",
        controls: [
          { id: "parameter", label: "raio r", min: 0.3, max: 4, step: 0.05, value: 2, digits: 2, unit: "m" },
          { id: "secondary", label: "velocidade radial ṙ", min: -2, max: 2, step: 0.05, value: 0.5, digits: 2, unit: "m/s" },
          { id: "tertiary", label: "velocidade angular θ̇", min: -3, max: 3, step: 0.05, value: 1.5, digits: 2, unit: "rad/s" }
        ],

        draw(api, v) {
          const m = 1;
          const th = 0.6;
          const L = P.angularMomentum(m, v.parameter, v.tertiary);
          const thdd = P.angularEOM(v.parameter, v.secondary, v.tertiary, m);
          const [ar] = P.polarAcceleration(v.parameter, v.secondary, 0, v.tertiary, thdd);   // r̈ = 0 neste instante
          const rthdd = v.parameter * thdd, cor = 2 * v.secondary * v.tertiary;
          const lim = 4.4;
          const chart = api.axes(api.main, -lim, lim, -lim, lim, "x (m)", "y (m)");
          api.line(chart, api.param((t) => [v.parameter * Math.cos(t), v.parameter * Math.sin(t)], 0, api.TAU, 200), api.C.grid, [4, 4], 1.5);
          const px = v.parameter * Math.cos(th), py = v.parameter * Math.sin(th);
          const er = [Math.cos(th), Math.sin(th)], et = [-Math.sin(th), Math.cos(th)];
          const esc = 0.9;
          api.arrow(chart, px, py, px + er[0] * esc, py + er[1] * esc, api.C.grayLight, 1.8, 7);
          api.arrow(chart, px, py, px + et[0] * esc, py + et[1] * esc, api.C.grayLight, 1.8, 7);
          api.label(chart, px + er[0] * esc * 1.2, py + er[1] * esc * 1.2, "e_r", api.C.gray, "center");
          api.label(chart, px + et[0] * esc * 1.2, py + et[1] * esc * 1.2, "e_θ", api.C.gray, "center");
          const ka = 0.7 / Math.max(0.4, Math.abs(ar), Math.abs(cor));
          api.arrow(chart, px, py, px + ar * er[0] * ka, py + ar * er[1] * ka, api.C.red, 3, 9);
          /* As duas parcelas de a_θ, desenhadas lado a lado: são iguais e opostas. */
          const d = 0.08;
          const qx = px + er[0] * d, qy = py + er[1] * d, sx = px - er[0] * d, sy = py - er[1] * d;
          api.arrow(chart, qx, qy, qx + cor * et[0] * ka, qy + cor * et[1] * ka, api.C.blue, 3, 9);
          api.arrow(chart, sx, sy, sx + rthdd * et[0] * ka, sy + rthdd * et[1] * ka, api.C.gold, 3, 9);
          api.line(chart, [[0, 0], [px, py]], api.C.grayLight, [4, 4], 1.4);
          api.dot(chart, px, py, api.C.ink, 5);
          api.label(chart, px + ar * er[0] * ka * 1.15, py + ar * er[1] * ka * 1.15, "a_r", api.C.red, "center");
          if (Math.abs(cor) > 1e-9) {
            api.label(chart, qx + cor * et[0] * ka * 1.2, qy + cor * et[1] * ka * 1.2, "2ṙθ̇", api.C.blue, "center");
            api.label(chart, sx + rthdd * et[0] * ka * 1.2, sy + rthdd * et[1] * ka * 1.2, "rθ̈", api.C.gold, "center");
          }
        },

        text(v, api) {
          const m = 1;
          const L = P.angularMomentum(m, v.parameter, v.tertiary);
          const thdd = P.angularEOM(v.parameter, v.secondary, v.tertiary, m);
          const [ar, at] = P.polarAcceleration(v.parameter, v.secondary, 0, v.tertiary, thdd);   // r̈ = 0 neste instante
          const rthdd = v.parameter * thdd, cor = 2 * v.secondary * v.tertiary;
          return {
            title: "Componentes da aceleração",
            subtitle: `m = 1 kg · r = ${api.fmt(v.parameter)} m · ṙ = ${api.fmt(v.secondary)} m/s · θ̇ = ${api.fmt(v.tertiary)} rad/s · r̈ = 0 neste instante`,
            caption: "As mesmas componentes da Aula 3, obtidas sem derivar nenhum versor. Força central com r̈ = 0 neste instante: a_r = −rθ̇². Em a_θ, a parcela rθ̈ imposta pela conservação de L_z cancela exatamente 2ṙθ̇, e a_θ = 0 para qualquer ṙ.",
            prediction: "O termo 2ṙθ̇ aparece aqui por qual mecanismo, se ninguém derivou a base?",
            calculation: `∂L/∂ṙ = mṙ e ∂L/∂r = mrθ̇² − U′(r) ⟹ <b>m(r̈ − rθ̇²) = f(r)</b><br>θ ausente de L ⟹ d/dt(mr²θ̇) = 0 ⟹ <b>L_z = ${api.fmt(L, 4)} constante</b><em>d/dt(mr²θ̇) = mr(rθ̈ + 2ṙθ̇): a componente θ de Newton, multiplicada por r</em>`,
            metrics: [
              ["a_r = r̈ − rθ̇² (r̈ = 0)", api.fmt(ar, 4)],
              ["L_z = mr²θ̇", api.fmt(L, 4)],
              ["θ̈ imposto por L_z", api.fmt(thdd, 4)],
              ["rθ̈", api.fmt(rthdd + 0, 4)],
              ["termo de Coriolis 2ṙθ̇", api.fmt(cor, 4)],
              ["a_θ = rθ̈ + 2ṙθ̇", api.fmt(Math.abs(at) < 1e-12 ? 0 : at, 4)]
            ],
            concept: "Em Newton os termos extras vinham da rotação da base e era preciso lembrar disso. Em Lagrange eles vêm da dependência de T em r, e ninguém precisa lembrar de nada.",
            prompts: [
              "Com ṙ ≠ 0, confira que rθ̈ cancela 2ṙθ̇: a_θ = 0 sempre, para força central. Zere ṙ e veja as duas parcelas sumirem juntas.",
              "Verifique que L_z não muda quando r e θ̇ variam mantendo r²θ̇ fixo.",
              "Compare o número de linhas com a dedução da Aula 3."
            ],
            legend: [[api.C.red, "a_r (= aceleração total)"], [api.C.blue, "2ṙθ̇"], [api.C.gold, "rθ̈"]]
          };
        }
      },

      {
        id: "dissipacao",
        tab: "Dissipação<br>de Rayleigh",
        heading: "Forças fora do potencial",
        equation: "ℱ = ½bẋ²   ·   Q = −∂ℱ/∂ẋ = −bẋ",
        hint: "Recupere a Aula 12 dentro do formalismo. Compare a envoltória com e^{−βt}.",
        controls: [
          { id: "parameter", label: "coeficiente b", min: 0, max: 3, step: 0.02, value: 0.3, digits: 2, unit: "kg/s" },
          { id: "secondary", label: "constante k", min: 1, max: 16, step: 0.2, value: 4, digits: 1, unit: "N/m" },
          { id: "tertiary", label: "massa m", min: 0.3, max: 3, step: 0.05, value: 1, digits: 2, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const serie = P.integrate(1, 0, v.tertiary, v.parameter, v.secondary, 14, 1400);
          const beta = v.parameter / (2 * v.tertiary);
          const chart = api.axes(api.main, 0, 14, -1.15, 1.25, "tempo t (s)", "x (m)");
          api.line(chart, serie, api.C.green, [], 2.4);
          api.line(chart, api.curve((t) => Math.exp(-beta * t), 0, 14, 120), api.C.gold, [5, 4], 1.8);
          api.line(chart, api.curve((t) => -Math.exp(-beta * t), 0, 14, 120), api.C.gold, [5, 4], 1.8);
          api.hline(chart, 0, "#b9c4bb", []);
          api.label(chart, 13.6, Math.exp(-beta * 13.6) + 0.09, "e^{−βt}", api.C.gold, "right");

          const s = api.axes(api.second, 0, 14, 0, 0.5 * v.secondary * 1.15, "tempo t (s)", "energia mecânica (J)");
          const E = serie.map(([t, x, vv]) => [t, P.mechanicalEnergy(x, vv, v.tertiary, v.secondary)]);
          api.line(s, E, api.C.blue, [], 2.2);
          api.line(s, api.curve((t) => 0.5 * v.secondary * Math.exp(-2 * beta * t), 0, 14, 120), api.C.red, [5, 4], 2);
          api.label(s, 13.6, 0.5 * v.secondary * Math.exp(-2 * beta * 13.6) + 0.5 * v.secondary * 0.07, "e^{−2βt}", api.C.red, "right");
        },

        text(v, api) {
          const beta = v.parameter / (2 * v.tertiary);
          const w0 = Math.sqrt(v.secondary / v.tertiary);
          const serie = P.integrate(1, 0, v.tertiary, v.parameter, v.secondary, 14, 1400);
          const fim = serie[serie.length - 1];
          const conserva = v.parameter < 1e-9;
          const Efim = P.mechanicalEnergy(fim[1], fim[2], v.tertiary, v.secondary);
          return {
            title: "Oscilador amortecido recuperado por Lagrange",
            subtitle: `b = ${api.fmt(v.parameter)} kg/s · k = ${api.fmt(v.secondary, 1)} N/m · m = ${api.fmt(v.tertiary)} kg`,
            regime: conserva ? ["sem dissipação", "ok"] : Math.abs(beta - w0) < 1e-3 * w0 ? ["crítico", "warn"] : beta < w0 ? ["subamortecido", "warn"] : ["supercrítico", "alert"],
            caption: "A força de arrasto não deriva de potencial e por isso não cabe em L. A função de Rayleigh a reintroduz sem quebrar o formalismo.",
            prediction: "A envoltória da posição e a da energia decaem com a mesma taxa?",
            calculation: `ℱ = ½bẋ² ⟹ Q = −∂ℱ/∂ẋ = <b>−bẋ</b><br>d/dt(∂L/∂ẋ) − ∂L/∂x = Q ⟹ <b>mẍ + bẋ + kx = 0</b><em>β = b/2m = ${api.fmt(beta, 4)} s⁻¹ e ω₀ = √(k/m) = ${api.fmt(w0, 4)} rad/s</em>`,
            metrics: [
              ["β = b/2m", `${api.fmt(beta, 4)} s⁻¹`],
              ["ω₀", `${api.fmt(w0, 4)} rad/s`],
              ["β/ω₀", api.fmt(beta / w0, 4)],
              ["x em t = 14 s", api.fmt(fim[1], 5)],
              ["E inicial", `${api.fmt(0.5 * v.secondary, 4)} J`],
              ["E em t = 14 s", `${api.fmt(Efim, 5)} J`]
            ],
            concept: "O formalismo lagrangiano não se limita a sistemas conservativos: forças generalizadas o estendem, e a função de dissipação organiza o caso viscoso.",
            prompts: [
              "Zere b e confirme que a energia passa a se conservar.",
              "Verifique que a posição decai como e^{−βt} e a energia como e^{−2βt}.",
              "Escreva ℱ para dois osciladores acoplados com arrasto em cada massa."
            ],
            legend: [[api.C.green, "x(t)"], [api.C.gold, "envoltória e^{−βt}"]],
            secondaryTitle: "Energia mecânica",
            secondarySubtitle: "decai com o dobro da taxa da amplitude",
            secondaryCaption: "A diferença de fator 2 entre as duas taxas é a mesma da Aula 12."
          };
        }
      },

      {
        id: "vinculo",
        tab: "Forças de<br>vínculo",
        heading: "Recuperando com multiplicador",
        equation: "λ = −mℓθ̇² − mg cosθ   ·   N = mg(3cosθ − 2cosθ₀)",
        hint: "O método não perde a força de vínculo: guarda-a em λ, disponível quando se pede.",
        controls: [
          { id: "parameter", label: "ângulo θ", min: 0, max: 1.55, step: 0.01, value: 0.5, digits: 2, unit: "rad" },
          { id: "secondary", label: "ângulo de soltura θ₀", min: 0, max: 1.5, step: 0.01, value: 0, digits: 2, unit: "rad" },
          { id: "tertiary", label: "massa m", min: 0.2, max: 5, step: 0.1, value: 2, digits: 1, unit: "kg" }
        ],
        secondary: true,

        draw(api, v) {
          const m = v.tertiary, l = 1.5;
          const thDesc = P.detachAngle(v.secondary);
          const nMin = Math.min(-0.6, 3 * Math.cos(1.6) - 2 * Math.cos(v.secondary)) * 1.08;
          const chart = api.axes(api.main, 0, 1.6, m * P.G * nMin, m * P.G * 1.35, "ângulo θ (rad)", "força (N)");
          api.line(chart, api.curve((th) => P.sphereNormal(m, th, v.secondary), v.secondary, 1.6, 200), api.C.green, [], 3);
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, thDesc, api.C.red, [5, 4], `desprende em ${api.fmt((thDesc * 180) / Math.PI, 1)}°`);
          api.dot(chart, thDesc, 0, api.C.red, 5.5);
          api.dot(chart, Math.max(v.parameter, v.secondary), P.sphereNormal(m, Math.max(v.parameter, v.secondary), v.secondary), api.C.ink, 5);
          api.area(chart, api.curve((th) => Math.min(0, P.sphereNormal(m, th, v.secondary)), thDesc, 1.6, 80), "rgba(198,92,75,.12)", 0);
          if (thDesc < 1.5) api.label(chart, (thDesc + 1.6) / 2, m * P.G * nMin * 0.5, "N < 0: sem sentido físico", api.C.red, "center");

          const s = api.axes(api.second, 0, 1.55, 0, m * P.G * 3.4, "ângulo θ (rad)", "tração no fio (N)");
          const th0 = Math.max(v.secondary, 0.05);
          api.line(s, api.curve((th) => P.pendulumTension(m, l, th, P.pendulumOmega(l, th, th0)), 0, th0, 120), api.C.blue, [], 2.8);
          api.hline(s, m * P.G, api.C.grayLight, [4, 4], "peso mg");
          api.dot(s, Math.min(v.parameter, th0), P.pendulumTension(m, l, Math.min(v.parameter, th0), P.pendulumOmega(l, Math.min(v.parameter, th0), th0)), api.C.red, 4.5);
        },

        text(v, api) {
          const m = v.tertiary, l = 1.5;
          const th0 = Math.max(v.secondary, 0.05);
          const th = Math.min(v.parameter, th0);
          const w = P.pendulumOmega(l, th, th0);
          const lam = P.pendulumLambda(m, l, th, w);
          const thDesc = P.detachAngle(v.secondary);
          const N = P.sphereNormal(m, Math.max(v.parameter, v.secondary), v.secondary);
          return {
            title: "Normal na esfera e tração no fio",
            subtitle: `θ = ${api.fmt(v.parameter)} rad · θ₀ = ${api.fmt(v.secondary)} rad · m = ${api.fmt(m, 1)} kg · ℓ = 1,5 m · pêndulo em θ = ${api.fmt(th)} rad (θ ≤ θ₀)`,
            regime: N > 0 ? ["ainda em contato", "ok"] : ["já se desprendeu", "alert"],
            caption: "O mesmo θ₀ serve aos dois sistemas: no pêndulo é medido a partir da vertical inferior, na esfera a partir do topo. A normal zera em um ângulo bem definido, e depois dele a fórmula devolveria valor negativo — sinal de que o vínculo unilateral deixou de valer.",
            prediction: "Um vínculo que só empurra pode produzir força negativa? O que isso significa?",
            calculation: `equação em r sem impor r = ℓ: mr̈ − mrθ̇² − mg cosθ = λ<br>impondo r = ℓ, ṙ = r̈ = 0: <b>λ = −mℓθ̇² − mg cosθ = ${api.fmt(lam, 3)} N</b><em>tração = |λ| = ${api.fmt(Math.abs(lam), 3)} N; o sinal negativo diz que aponta para o centro</em>`,
            metrics: [
              ["λ (pêndulo)", `${api.fmt(lam, 3)} N`],
              ["tração |λ|", `${api.fmt(Math.abs(lam), 3)} N`],
              ["peso mg", `${api.fmt(m * P.G, 3)} N`],
              ["normal na esfera", `${api.fmt(N, 3)} N`],
              ["ângulo de desprendimento", `${api.fmt((thDesc * 180) / Math.PI, 2)}°`],
              ["θ̇ do pêndulo", `${api.fmt(w, 3)} rad/s`]
            ],
            concept: "O formalismo elimina as forças de vínculo por conveniência, não por incapacidade: mantendo a coordenada redundante, o multiplicador devolve exatamente a força que se procurava.",
            prompts: [
              "Confirme que, partindo do topo, o desprendimento ocorre em cosθ = 2/3.",
              "Verifique que a tração no fundo vale mg(3 − 2cosθ₀).",
              "Explique o sinal negativo de λ e o que ele diz sobre a direção da força."
            ],
            legend: [[api.C.green, "normal na esfera"], [api.C.red, "desprendimento"]],
            secondaryTitle: "Tração no fio ao longo da oscilação",
            secondarySubtitle: "máxima no ponto mais baixo",
            secondaryCaption: "Ela ultrapassa o peso porque inclui o termo centrípeto mℓθ̇²."
          };
        }
      }
    ]
  };
})();
