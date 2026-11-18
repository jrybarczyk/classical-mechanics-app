/* Aula 30 — estrutura hamiltoniana e síntese do curso.
   O motor ../_shared/dashboard.js constrói a interface a partir deste objeto. */
(function () {
  "use strict";
  const P = window.LessonPhysics;
  const M = 1, K = 1; /* massa e constante de acoplamento unitárias em todas as estações */

  /* Observáveis da estação 1, na ordem em que o controle os percorre. */
  const OBSERVAVEIS = [
    { nome: "x", simbolo: "x", f: () => (z) => z[0], cor: "#7d6199" },
    { nome: "p_x", simbolo: "p_x", f: () => (z) => z[3], cor: "#457b9d" },
    { nome: "ℓ_z", simbolo: "ℓ_z = xp_y − yp_x", f: () => P.angular(2), cor: "#619b60" },
    { nome: "H", simbolo: "H = p²/2m + U(r)", f: (n) => P.hamiltonian(M, K, n), cor: "#e9a23b" },
    { nome: "A_x", simbolo: "A_x = (p × ℓ − mk r̂)_x", f: () => P.runge(0, M, K), cor: "#c65c4b" }
  ];

  /* A órbita é integrada uma vez por expoente e reaproveitada entre draw e text:
     sem isso, cada quadro da animação refaria seiscentos passos de Runge–Kutta duas vezes. */
  const DT = 0.01, PASSOS = 600;
  let cache = { n: null, caminho: null };
  const orbita = (n) => {
    if (cache.n !== n) cache = { n, caminho: P.trajectory([1.4, 0, 0, 0, 0.75, 0], P.hamiltonian(M, K, n), DT, PASSOS) };
    return cache.caminho;
  };

  const EIXOS = ["x", "y", "z", "p_x", "p_y", "p_z"];
  const ANGULAR = ["ℓ_x", "ℓ_y", "ℓ_z"];

  /* Coloca uma matriz de parênteses centralizada no alvo, com a folga que os
     rótulos exigem. Reaproveita a ideia do mapa de índices da Aula 2: ver a
     tabela inteira de uma vez é o que torna a antissimetria óbvia. */
  function grade(api, alvo, rotulos, valor, sel, digitos) {
    const n = rotulos.length;
    const cell = Math.min((alvo.width - 130) / n, (alvo.height - 74) / n);
    api.matrix(alvo, {
      rows: rotulos, cols: rotulos,
      x: (alvo.width - cell * n) / 2 + 20,
      y: (alvo.height - cell * n) / 2 - 4,
      cell,
      value: valor,
      format: (v) => (Math.abs(v) < 5e-3 ? "0" : api.fmt(v, digitos)),
      selected: sel
    });
  }

  window.LessonScene = {
    id: "aula30",
    discipline: "Mecânica Clássica · Aula 29",
    title: "Parênteses de Poisson e síntese do curso",
    subtitle: "Uma única fórmula, ḟ = [f,H], gera as equações de movimento, as leis de conservação e o critério para reconhecê-las.",

    stations: [
      {
        id: "constantes",
        tab: "Constantes<br>de movimento",
        heading: "[f,H] = 0 é o critério",
        equation: "df/dt = [f,H] + ∂f/∂t",
        hint: "Escolha o observável e depois mova o expoente n. Repare em qual constante sobrevive fora de n = 1.",
        controls: [
          { id: "parameter", label: "observável f", min: 1, max: 5, step: 1, value: 3, digits: 0 },
          { id: "secondary", label: "expoente n de U = −k/rⁿ", min: 0.6, max: 1.8, step: 0.05, value: 1, digits: 2 },
          { id: "tertiary", label: "instante t", min: 0, max: 6, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 9 },
        secondary: true,

        draw(api, v) {
          const n = v.secondary;
          const H = P.hamiltonian(M, K, n);
          const dt = DT;
          const caminho = orbita(n);
          const obs = OBSERVAVEIS[Math.round(v.parameter) - 1];
          const f = obs.f(n);

          /* Órbita no plano do movimento; a razão 2:1 do canvas é compensada no eixo x. */
          const lim = 2.6;
          const chart = api.axes(api.main, -lim * 1.9, lim * 1.9, -lim, lim, "x (m)", "y (m)");
          api.line(chart, caminho.map((z) => [z[0], z[1]]), "#cbd8cb", [], 1.6);
          const ate = Math.max(2, Math.round(v.tertiary / dt));
          api.line(chart, caminho.slice(0, ate + 1).map((z) => [z[0], z[1]]), api.C.green, [], 3);
          const z = P.at(caminho, dt, v.tertiary);
          api.line(chart, [[0, 0], [z[0], z[1]]], api.C.blue, [4, 4], 1.5);
          api.dot(chart, z[0], z[1], api.C.ink, 5.5);
          api.dot(chart, 0, 0, api.C.gold, 6);
          api.label(chart, 0.12, -0.18, "centro de força", api.C.gold, "left", "top");
          api.hline(chart, 0, "#dfe6df", []);
          api.vline(chart, 0, "#dfe6df", []);

          /* O observável ao longo do tempo: reta horizontal exatamente quando [f,H] = 0. */
          const vals = caminho.map((s) => f(s));
          const lo = Math.min(...vals), hi = Math.max(...vals);
          const meio = (lo + hi) / 2, span = Math.max(hi - lo, Math.abs(meio) * 0.25, 0.4);
          const s = api.axes(api.second, 0, 6, meio - span * 0.85, meio + span * 0.85, "tempo t (s)", obs.nome);
          api.line(s, caminho.map((estado, i) => [i * dt, f(estado)]), obs.cor, [], 2.8);
          api.hline(s, f(caminho[0]), api.C.grayLight, [4, 3], "valor inicial");
          api.vline(s, v.tertiary, api.C.ink, [3, 3]);
          api.dot(s, v.tertiary, f(z), api.C.red, 4.5);
        },

        text(v, api) {
          const n = v.secondary;
          const H = P.hamiltonian(M, K, n);
          const dt = DT;
          const caminho = orbita(n);
          const obs = OBSERVAVEIS[Math.round(v.parameter) - 1];
          const f = obs.f(n);
          const z = P.at(caminho, dt, v.tertiary);
          const br = P.poisson(f, H, z);
          const vals = caminho.map((estado) => f(estado));
          const variacao = Math.max(...vals) - Math.min(...vals);
          const escala = Math.max(...vals.map(Math.abs), 1e-9);
          const constante = variacao / escala < 1e-3;
          return {
            title: `Evolução de ${obs.nome}`,
            subtitle: `U = −k/r^${api.fmt(n)} · t = ${api.fmt(v.tertiary)} s`,
            regime: constante ? ["constante de movimento", "ok"] : ["evolui no tempo", "warn"],
            caption: "A curva do segundo gráfico é a resposta visual do parêntese: reta horizontal significa [f,H] = 0, e nada mais precisa ser calculado.",
            prediction: "Antes de mover n: qual dos cinco observáveis continua constante em qualquer potencial central, e qual só sobrevive em 1/r?",
            calculation: `f = ${obs.simbolo}<br>[f,H] = Σ (∂f/∂qᵢ ∂H/∂pᵢ − ∂f/∂pᵢ ∂H/∂qᵢ) = <b>${api.fmt(br, 5)}</b><br>[ℓ_z,H] = y ∂U/∂x − x ∂U/∂y = (U′(r)/r)(yx − xy) = <b>0</b> para todo n<em>a conta mostra o porquê: U depende só de r, e é isso — e nada além disso — que conserva ℓ_z. Atenção: o critério é [f,H] = 0 em <b>todos</b> os pontos da órbita; um zero isolado (x ou A_x num ápside, por exemplo) não basta.</em>`,
            metrics: [
              ["[f,H] em t", api.fmt(br, 5)],
              ["f(0)", api.fmt(f(caminho[0]), 4)],
              ["f(t)", api.fmt(f(z), 4)],
              ["variação ao longo da órbita", api.fmt(variacao, 5)],
              ["[H,H]", api.fmt(P.poisson(H, H, z), 5)],
              ["[ℓ_z,H]", api.fmt(P.poisson(P.angular(2), H, z), 5)]
            ],
            concept: "A equação ḟ = [f,H] não é lei nova: é a dinâmica de Newton reescrita pela quarta vez. O que ela acrescenta é economia — o mesmo cálculo que fornece a equação de movimento fornece o critério de conservação. Com n ≠ 1 a órbita precessa, e o vetor de Laplace–Runge–Lenz, que apontava para o periélio, deixa de ser constante: é a razão profunda de o ângulo apsidal (complemento da Aula 19, material complementar de forças centrais) valer π apenas no potencial 1/r.",
            prompts: [
              "Ponha n = 1 e confirme que os cinco observáveis se dividem em três constantes e dois variáveis.",
              "Mova n para 1,4 e diga qual constante se perdeu e quais sobreviveram.",
              "Explique por que [H,H] = 0 é imediato, sem calcular nada."
            ],
            legend: [[api.C.green, "trecho percorrido"], ["#cbd8cb", "órbita completa"], [api.C.gold, "centro de força"], [api.C.blue, "vetor posição"]],
            secondaryTitle: `${obs.nome} ao longo da órbita`,
            secondarySubtitle: constante ? "reta horizontal — logo [f,H] = 0" : "curva — logo [f,H] ≠ 0",
            secondaryCaption: "Conservação deixou de ser um teorema a demonstrar e virou uma leitura de gráfico."
          };
        }
      },

      {
        id: "fundamentais",
        tab: "Parênteses<br>fundamentais",
        heading: "[qᵢ,pⱼ] = δᵢⱼ e a álgebra de ℓ",
        equation: "[qᵢ,qⱼ] = 0   ·   [pᵢ,pⱼ] = 0   ·   [qᵢ,pⱼ] = δᵢⱼ",
        hint: "Percorra a matriz célula a célula. Toda a mecânica hamiltoniana está codificada nela.",
        controls: [
          { id: "parameter", label: "linha a", min: 1, max: 6, step: 1, value: 1, digits: 0 },
          { id: "secondary", label: "coluna b", min: 1, max: 6, step: 1, value: 4, digits: 0 },
          { id: "tertiary", label: "giro φ do estado de fase", min: 0, max: 360, step: 1, value: 0, digits: 0, unit: "°" }
        ],
        secondary: true,

        draw(api, v) {
          const a = Math.round(v.parameter) - 1, b = Math.round(v.secondary) - 1;
          grade(api, api.main, EIXOS, (i, j) => P.fundamental(i, j, 3), [a, b], 0);

          const z = estado(v.tertiary);
          grade(api, api.second, ANGULAR,
            (i, j) => P.poisson(P.angular(i), P.angular(j), z), null, 2);
        },

        text(v, api) {
          const a = Math.round(v.parameter) - 1, b = Math.round(v.secondary) - 1;
          const z = estado(v.tertiary);
          const valor = P.fundamental(a, b, 3);
          const L = [0, 1, 2].map((i) => P.angular(i)(z));
          const xy = P.poisson(P.angular(0), P.angular(1), z);
          return {
            title: "A matriz dos parênteses fundamentais",
            subtitle: `[${EIXOS[a]}, ${EIXOS[b]}] = ${api.fmt(valor, 0)}`,
            regime: valor === 0 ? ["par que comuta", "ok"] : ["par conjugado", "warn"],
            caption: "Verde é +1, vermelho é −1, cinza é zero. A matriz é antissimétrica e só liga cada coordenada ao seu próprio momento: nada mais que isso define a estrutura simplética.",
            prediction: "Quantas das 36 células são diferentes de zero? E por que exatamente essas?",
            calculation: `[${EIXOS[a]}, ${EIXOS[b]}] = <b>${api.fmt(valor, 0)}</b><br>álgebra do momento angular: [ℓ_x,ℓ_y] = ${api.fmt(xy, 4)} e ℓ_z = <b>${api.fmt(L[2], 4)}</b><em>[ℓᵢ,ℓⱼ] = ε_ijk ℓ_k — o mesmo símbolo de Levi-Civita da Aula 2, agora gerando rotações</em>`,
            metrics: [
              ["ℓ_x", api.fmt(L[0], 4)],
              ["ℓ_y", api.fmt(L[1], 4)],
              ["ℓ_z", api.fmt(L[2], 4)],
              ["[ℓ_x,ℓ_y]", api.fmt(xy, 4)],
              ["[ℓ_y,ℓ_z] − ℓ_x", api.fmt(P.poisson(P.angular(1), P.angular(2), z) - L[0], 5)],
              ["|ℓ|", api.fmt(Math.hypot(...L), 4)]
            ],
            concept: "A ponte com a mecânica quântica é literal: [f,g] → [f̂,ĝ]/iħ transforma [x,p] = 1 em [x̂,p̂] = iħ, de onde sai o princípio de incerteza, e [ℓ_x,ℓ_y] = ℓ_z em [L̂_x,L̂_y] = iħL̂_z. A álgebra do momento angular já estava aqui, na mecânica clássica. Mas a correspondência é receita, não dedução: onde q e p aparecem multiplicados ela é ambígua, porque operadores não comutam.",
            prompts: [
              "Confirme a antissimetria comparando a célula (a,b) com a célula (b,a).",
              "Gire φ (em torno do eixo oblíquo (1,1,1)/√3) e verifique que ℓ_x, ℓ_y e ℓ_z mudam, |ℓ| não, e [ℓ_x,ℓ_y] = ℓ_z continua valendo.",
              "Escreva o análogo quântico de cada célula não nula da matriz."
            ],
            legend: [[api.C.green, "+1"], [api.C.red, "−1"], ["#9aa79c", "0"]],
            secondaryTitle: "Álgebra do momento angular",
            secondarySubtitle: `[ℓᵢ,ℓⱼ] avaliado em φ = ${api.fmt(v.tertiary, 0)}°`,
            secondaryCaption: "Compare a diagonal e a antidiagonal com a tabela de εᵢⱼₖ da Aula 2."
          };
        }
      },

      {
        id: "liouville",
        tab: "Equação<br>de Liouville",
        heading: "∂ρ/∂t = [H,ρ]",
        equation: "equilíbrio ⟺ [H,ρ] = 0 ⟺ ρ = ρ(H)",
        hint: "Comece com λ = 0. Cada ponto colorido é uma região onde a densidade está mudando.",
        controls: [
          { id: "parameter", label: "temperatura kT", min: 0.3, max: 4, step: 0.05, value: 1.5, digits: 2, unit: "J" },
          { id: "secondary", label: "desajuste λ de ρ ∝ e^(−H/kT + λq)", min: 0, max: 0.6, step: 0.01, value: 0, digits: 2 },
          { id: "tertiary", label: "frequência ω", min: 0.6, max: 2, step: 0.05, value: 1.2, digits: 2, unit: "rad/s" }
        ],
        secondary: true,

        draw(api, v) {
          const kT = v.parameter, lam = v.secondary, w = v.tertiary;
          const lim = 3;
          const chart = api.axes(api.main, -lim * 1.6, lim * 1.6, -lim, lim, "coordenada q (m)", "momento p (kg·m/s)");
          api.field(chart, (q, p) => [p / M, -M * w * w * q], "#dde5de");
          /* Curvas de nível de H: qualquer ρ(H) é constante sobre cada uma delas. */
          for (const E of [0.4, 1, 2, 3.2]) {
            const a = Math.sqrt((2 * E) / (M * w * w)), b = Math.sqrt(2 * M * E);
            api.line(chart, api.param((s) => [a * Math.cos(s), b * Math.sin(s)], 0, api.TAU, 200), "#c2d3c2", [3, 4], 1.4);
          }
          /* Mapa de ∂ρ/∂t: vazio no equilíbrio, dois lóbulos de sinais opostos fora dele. */
          let maxAbs = 1e-12;
          const amostras = [];
          for (let i = -12; i <= 12; i += 1) {
            for (let j = -8; j <= 8; j += 1) {
              const q = (i * lim * 1.6) / 12, p = (j * lim) / 8;
              const d = P.drhoDt([q, p], M, w, kT, lam);
              amostras.push([q, p, d]);
              maxAbs = Math.max(maxAbs, Math.abs(d));
            }
          }
          for (const [q, p, d] of amostras) {
            const r = (Math.abs(d) / maxAbs) * 7;
            if (r > 0.6) api.dot(chart, q, p, d > 0 ? api.C.red : api.C.blue, r);
          }
          api.hline(chart, 0, "#b9c4bb", []);
          api.vline(chart, 0, "#b9c4bb", []);

          /* Quanto o equilíbrio é violado, em função do desajuste. */
          const pico = (l) => P.maxDrhoDt(M, w, kT, l);
          const s = api.axes(api.second, 0, 0.6, 0, Math.max(pico(0.6) * 1.15, 1e-3), "desajuste λ", "máx |∂ρ/∂t|");
          api.line(s, api.curve(pico, 0, 0.6, 24), api.C.violet, [], 2.8);
          api.dot(s, lam, pico(lam), api.C.red, 5);
          api.hline(s, 0, "#b9c4bb", []);
        },

        text(v, api) {
          const kT = v.parameter, lam = v.secondary, w = v.tertiary;
          const z = [1.1, 0.8];
          const d = P.drhoDt(z, M, w, kT, lam);
          const Hz = P.oscHamiltonian(M, w)(z);
          const rho = P.density(M, w, kT, lam)(z);
          return {
            title: "Densidade no espaço de fase",
            subtitle: `kT = ${api.fmt(kT)} J · λ = ${api.fmt(lam)} · ω = ${api.fmt(w)} rad/s`,
            regime: lam === 0 ? ["equilíbrio — ρ = ρ(H)", "ok"] : ["fora do equilíbrio", "alert"],
            caption: "Com λ = 0 o mapa fica limpo: a densidade é constante sobre cada curva de nível, o fluxo a transporta ao longo dessas curvas e nada muda. Ligar λ quebra essa coincidência.",
            prediction: "Se ρ for constante sobre cada elipse de energia, o fluxo consegue mudá-la em algum ponto?",
            calculation: `[H,ρ] = ∂H/∂q ∂ρ/∂p − ∂H/∂p ∂ρ/∂q<br>com ρ = g(H): ∂ρ/∂p = g′H_p e ∂ρ/∂q = g′H_q ⟹ [H,ρ] = g′(H_q H_p − H_p H_q) = <b>0</b><br>medido em q = 1,10 e p = 0,80: ∂ρ/∂t = <b>${api.sci(d, 3)}</b><em>H = ${api.fmt(Hz, 4)} J · ρ = ${api.fmt(rho, 5)} — o zero acima não depende da forma de g, só de que g exista</em>`,
            metrics: [
              ["∂ρ/∂t no ponto", api.sci(d, 3)],
              ["H(q,p)", `${api.fmt(Hz, 4)} J`],
              ["ρ(q,p)", api.fmt(rho, 5)],
              ["e^(−H/kT)", api.fmt(Math.exp(-Hz / kT), 5)],
              ["máx |∂ρ/∂t| no mapa", api.sci(P.maxDrhoDt(M, w, kT, lam), 3)],
              ["ρ = ρ(H)? estacionária?", lam === 0 ? "sim · sim" : "não · não"]
            ],
            concept: "A exigência [H,ρ] = 0 é a origem dos ensembles: qualquer ρ que dependa de (q,p) apenas através de H serve, e as duas escolhas usuais são ρ ∝ δ(H − E), o microcanônico, e ρ ∝ e^(−H/kT), o canônico. O teorema de Liouville da Aula 28 e a mecânica estatística são, portanto, a mesma afirmação lida em duas direções.",
            prompts: [
              "Com λ = 0, varie kT e ω e confirme que o mapa continua vazio.",
              "Ligue λ = 0,3 e descreva a forma dos dois lóbulos: por que têm sinais opostos?",
              "Escreva outra ρ estacionária diferente da canônica e justifique."
            ],
            legend: [[api.C.red, "∂ρ/∂t > 0"], [api.C.blue, "∂ρ/∂t < 0"], ["#c2d3c2", "curvas de H"]],
            secondaryTitle: "Violação do equilíbrio",
            secondarySubtitle: "máx |∂ρ/∂t| contra o desajuste λ",
            secondaryCaption: "A curva encosta em zero num único ponto: λ = 0, onde ρ volta a ser função de H."
          };
        }
      }
    ]
  };

  /* Estado de fase da estação 2, girado de φ em torno do eixo oblíquo n = (1,1,1)/√3
     (fórmula de Rodrigues). Girar rigidamente r e p faz ℓ girar junto — as três
     componentes mudam, |ℓ| e a álgebra não. */
  function estado(phiGraus) {
    const a = (phiGraus * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const u = 1 / Math.sqrt(3);
    const gira = (v) => {
      const nv = u * (v[0] + v[1] + v[2]);
      const cr = [u * (v[2] - v[1]), u * (v[0] - v[2]), u * (v[1] - v[0])]; /* n × v */
      return v.map((x, i) => x * c + cr[i] * s + u * nv * (1 - c));
    };
    const r = gira([1.2, -0.6, 0.4]);
    const p = gira([0.3, 0.9, -0.2]);
    return [...r, ...p];
  }
})();
