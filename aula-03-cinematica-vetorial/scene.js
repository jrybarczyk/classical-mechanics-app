(function () {
  "use strict";
  const P = window.LessonPhysics;
  const rad = (g) => (g * Math.PI) / 180;

  /*
   * Esfera unitária em projeção ortográfica, partilhada pelas estações 3 e 4.
   * cfg: { t, tMax, ponto(s) → {th, ph}, th, ph, vel:[v_r,v_θ,v_φ], acc:[a_r,a_θ,a_φ] }.
   * Câmera elevada 38° acima do equador e girada de −50° em azimute, escolha que
   * separa e_r, e_θ e e_φ no ponto inicial padrão da estação 3.
   */
  function esfera(api, cfg) {
    const el = rad(38), az = rad(-50);
    const proj = (q) => {
      const x = q[0] * Math.cos(az) - q[1] * Math.sin(az);
      const y = q[0] * Math.sin(az) + q[1] * Math.cos(az);
      return { X: x, Y: q[2] * Math.cos(el) + y * Math.sin(el), depth: -y * Math.cos(el) + q[2] * Math.sin(el) };
    };
    /* Janela quadrada em pixels, centrada em (cx, cy), sem eixo zero cruzando a esfera. */
    const { width, height } = api.main;
    const L = 16, R = 12, Tp = 10, B = 14;
    const yr = 1.32;
    const xr = (yr * (width - L - R)) / (height - Tp - B);
    const cx = xr, cy = yr;
    const chart = api.axes(api.main, 0, 2 * xr, 0, 2 * yr, "", "", { xTicks: [], yTicks: [], left: L, right: R, top: Tp, bottom: B });
    const P2 = (q) => { const s = proj(q); return [cx + s.X, cy + s.Y]; };

    /* Polilinha 3D: trechos da frente cheios, os de trás tracejados e mais claros. */
    const poli3d = (pts, cor, corTras, larg, dash = [4, 4]) => {
      let run = [], front = null;
      const flush = () => {
        if (run.length > 1) api.line(chart, run, front ? cor : corTras, front ? [] : dash, front ? larg : Math.max(1, larg * 0.7));
        run = [];
      };
      pts.forEach((q) => {
        const s = proj(q);
        const f = s.depth >= 0;
        if (front !== null && f !== front) { run.push([cx + s.X, cy + s.Y]); flush(); }
        front = f; run.push([cx + s.X, cy + s.Y]);
      });
      flush();
    };

    /* Contorno, equador, meridiano φ = 0 e eixos z e x. */
    api.line(chart, api.param((u) => [cx + Math.cos(u), cy + Math.sin(u)], 0, api.TAU, 160), "#c9d3cb", [], 1.6);
    const circ = (fn) => Array.from({ length: 181 }, (_, k) => fn((k / 180) * api.TAU));
    poli3d(circ((u) => [Math.cos(u), Math.sin(u), 0]), "#b3bfb5", "#dfe6e0", 1.2);
    poli3d(circ((u) => [Math.sin(u), 0, Math.cos(u)]), "#c9d3cb", "#e6ece7", 1.0, [2, 4]);
    const zTop = P2([0, 0, 1.28]), zBot = P2([0, 0, -1.05]);
    api.line(chart, [P2([0, 0, -1]), zBot], "#c9d3cb", [2, 3], 1);
    api.arrow(chart, P2([0, 0, 1])[0], P2([0, 0, 1])[1], zTop[0], zTop[1], api.C.gray, 1.4, 6);
    api.label(chart, zTop[0], zTop[1] + 0.06, "z", api.C.gray, "center");
    const xEnd = P2([1.25, 0, 0]);
    api.arrow(chart, P2([1, 0, 0])[0], P2([1, 0, 0])[1], xEnd[0], xEnd[1], api.C.gray, 1.4, 6);
    api.label(chart, xEnd[0] + 0.05, xEnd[1], "x (φ = 0)", api.C.gray, "left");

    /* Trajetória: futuro em cinza, passado em azul. */
    const traj = (a, b, n) => Array.from({ length: n + 1 }, (_, k) => {
      const q = cfg.ponto(a + ((b - a) * k) / n);
      return P.sphericalBasis(q.th, q.ph).er;
    });
    const N = 480;
    poli3d(traj(cfg.t, cfg.tMax, N), "#b9c4bb", "#dfe6e0", 1.4);
    if (cfg.t > 0) poli3d(traj(0, cfg.t, Math.max(2, Math.round((N * cfg.t) / cfg.tMax))), api.C.blue, "#aac4d4", 2.6);

    /* Ponto, base local, velocidade e aceleração. */
    const { er, eth, eph } = P.sphericalBasis(cfg.th, cfg.ph);
    const pos = er;
    const comb = (c) => [0, 1, 2].map((i) => pos[i] + c[0] * er[i] + c[1] * eth[i] + c[2] * eph[i]);
    const o2 = P2(pos);
    const seta = (c, cor, larg, cabeca) => { const q = P2(comb(c)); api.arrow(chart, o2[0], o2[1], q[0], q[1], cor, larg, cabeca); return q; };
    const base = 0.3;
    const lr = seta([base, 0, 0], api.C.grayLight, 1.6, 6);
    const lt = seta([0, base, 0], api.C.grayLight, 1.6, 6);
    const lp = seta([0, 0, base], api.C.grayLight, 1.6, 6);
    /* Rótulos no prolongamento de cada seta, para não colidirem quando duas se projetam próximas. */
    const rotulo = (q, txt) => api.label(chart, q[0] + (q[0] - o2[0]) * 0.45, q[1] + (q[1] - o2[1]) * 0.45, txt, api.C.gray, "center", "middle");
    rotulo(lr, "e_r"); rotulo(lt, "e_θ"); rotulo(lp, "e_φ");
    const escala = (c, alvo) => { const m = Math.hypot(...c); const k = m > 1e-9 ? Math.min(alvo / m, 0.9) : 0; return c.map((x) => x * k); };
    seta(escala(cfg.vel, 0.5), api.C.green, 2.8, 9);
    seta(escala(cfg.acc, 0.5), api.C.red, 2.8, 9);
    api.dot(chart, o2[0], o2[1], api.C.ink, 4.5);
    api.line(chart, [P2([0, 0, 0]), o2], api.C.blue, [3, 3], 1);
  }

  window.LessonScene = {
    id: "aula03",
    discipline: "Mecânica Clássica · Aula 3",
    title: "Cinemática em bases móveis",
    subtitle: "De onde vêm os termos −rθ̇² e 2ṙθ̇, se não há força nova?",

    stations: [
      {
        id: "polar",
        tab: "Base polar<br>móvel",
        heading: "Espiral r = r₀e^{αt}",
        equation: "ė_r = θ̇ e_θ,  ė_θ = −θ̇ e_r<br>v = ṙ e_r + rθ̇ e_θ<br>a = (r̈ − rθ̇²) e_r + (rθ̈ + 2ṙθ̇) e_θ<br>espiral: ṙ = αr, r̈ = α²r<br>a_r = r(α² − ω²),  a_θ = 2αωr<br>tan ψ = v_θ/v_r = ω/α",
        hint: "Com θ̈ = 0, o termo transversal deveria sumir. Preveja se ele some antes de mover α.",
        controls: [
          { id: "parameter", label: "taxa radial α", min: -0.6, max: 0.6, step: 0.01, value: 0.25, digits: 2, unit: "1/s" },
          { id: "secondary", label: "velocidade angular ω", min: 0.3, max: 3, step: 0.05, value: 1.5, digits: 2, unit: "rad/s" },
          { id: "tertiary", label: "instante t", min: 0, max: 6, step: 0.02, value: 2, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 7 },

        draw(api, v) {
          const r0 = 1;
          const st = P.spiral(v.tertiary, r0, v.parameter, v.secondary);
          const rMax = Math.max(1.2, r0 * Math.exp(Math.max(0, v.parameter) * 6), st.r) * 1.15;
          const chart = api.axes(api.main, -rMax, rMax, -rMax, rMax, "x", "y");

          api.line(chart, api.param((t) => {
            const s = P.spiral(t, r0, v.parameter, v.secondary);
            return [s.r * Math.cos(s.theta), s.r * Math.sin(s.theta)];
          }, 0, 6, 400), api.C.grayLight, [], 1.8);

          const px = st.r * Math.cos(st.theta);
          const py = st.r * Math.sin(st.theta);
          const er = [Math.cos(st.theta), Math.sin(st.theta)];
          const et = [-Math.sin(st.theta), Math.cos(st.theta)];
          const esc = rMax * 0.24;

          /* Base móvel no ponto. */
          api.arrow(chart, px, py, px + er[0] * esc, py + er[1] * esc, api.C.grayLight, 2, 7);
          api.arrow(chart, px, py, px + et[0] * esc, py + et[1] * esc, api.C.grayLight, 2, 7);
          api.label(chart, px + er[0] * esc * 1.25, py + er[1] * esc * 1.25, "e_r", api.C.gray, "center");
          api.label(chart, px + et[0] * esc * 1.25, py + et[1] * esc * 1.25, "e_θ", api.C.gray, "center");

          /* Velocidade e aceleração, decompostas. */
          const kv = esc / Math.max(1e-6, Math.hypot(st.vr, st.vt)) * 1.5;
          const ka = esc / Math.max(1e-6, Math.hypot(st.ar, st.at)) * 1.5;
          api.arrow(chart, px, py, px + (st.vr * er[0] + st.vt * et[0]) * kv, py + (st.vr * er[1] + st.vt * et[1]) * kv, api.C.green, 3, 9);
          api.arrow(chart, px, py, px + (st.ar * er[0] + st.at * et[0]) * ka, py + (st.ar * er[1] + st.at * et[1]) * ka, api.C.red, 3, 9);
          api.line(chart, [[0, 0], [px, py]], api.C.blue, [4, 4], 1.6);
          api.dot(chart, px, py, api.C.ink, 4.5);
          api.label(chart, px * 0.5, py * 0.5, "r", api.C.blue, "center");
        },

        text(v, api) {
          const st = P.spiral(v.tertiary, 1, v.parameter, v.secondary);
          const circular = Math.abs(v.parameter) < 1e-9;
          return {
            title: "Velocidade e aceleração em base polar",
            subtitle: `α = ${api.fmt(v.parameter)} 1/s · ω = ${api.fmt(v.secondary)} rad/s · t = ${api.fmt(v.tertiary)} s`,
            regime: circular ? ["movimento circular", "ok"] : v.parameter > 0 ? ["espiral que se abre", "warn"] : ["espiral que fecha", "warn"],
            caption: "A seta vermelha é a aceleração total. Ela tem componente transversal mesmo com θ̈ = 0, porque a base gira enquanto o raio muda.",
            prediction: "Com θ̈ = 0, o termo 2ṙθ̇ desaparece? Decida antes de tirar α do zero.",
            calculation: `ṙ = αr = ${api.fmt(v.parameter)}·${api.fmt(st.r)} = ${api.fmt(st.vr)}<br>a_θ = rθ̈ + 2ṙθ̇ = 0 + 2·${api.fmt(st.vr)}·${api.fmt(v.secondary)} = <b>${api.fmt(st.at)}</b><em>a_r = r(α² − ω²) = ${api.fmt(st.r)}·(${api.fmt(v.parameter * v.parameter)} − ${api.fmt(v.secondary * v.secondary)}) = ${api.fmt(st.ar)}</em>`,
            metrics: [
              ["r", api.fmt(st.r)],
              ["v_r = ṙ", api.fmt(st.vr)],
              ["v_θ = rθ̇", api.fmt(st.vt)],
              ["a_r", api.fmt(st.ar)],
              ["a_θ", api.fmt(st.at)],
              ["rapidez |v| = r√(α² + ω²)", api.fmt(st.speed)],
              ["ângulo ψ entre v e e_r", `${api.fmt((Math.atan2(st.vt, st.vr) * 180) / Math.PI, 1)}°`],
              ["|a| = r(α² + ω²)", api.fmt(Math.hypot(st.ar, st.at))]
            ],
            concept: "Os termos extras vêm da derivada dos vetores da base, não de uma interação nova. Derivam-se as componentes e também os versores.",
            prompts: [
              "Zere α e confirme que a aceleração fica puramente radial e igual a −rω².",
              "Torne α negativo e explique o sinal de a_θ.",
              "Ache a condição sobre α e ω que anula a componente radial da aceleração.",
              "Varie t e confirme que o ângulo ψ entre v e e_r não muda: tan ψ = ω/α. É a propriedade que dá nome à espiral logarítmica."
            ],
            legend: [[api.C.green, "v"], [api.C.red, "a"], [api.C.blue, "r"]]
          };
        }
      },

      {
        id: "intrinseca",
        tab: "Tangencial<br>e normal",
        heading: "Parábola y = x²/4p",
        equation: "e_t = v/|v|,  ė_t = (|v|/ρ) e_n<br>a = (d|v|/dt) e_t + (|v|²/ρ) e_n<br>a_t = (v·a)/|v|,  a_n = |v×a|/|v|<br>parábola: ρ = 2p·√(1 + x²/4p²)³<br>x = ut: a_t = u⁴t/(4p²|v|),  a_n = u³/(2p|v|)<br>a_t = a_n em t = 2p/u",
        hint: "Percorra a curva com x = ut. No vértice a curvatura vale exatamente ρ = 2p — use isso como conferência.",
        controls: [
          { id: "parameter", label: "parâmetro p da parábola", min: 1, max: 12, step: 0.1, value: 5, digits: 1, unit: "m" },
          { id: "secondary", label: "rapidez horizontal u", min: 0.5, max: 6, step: 0.05, value: 3, digits: 2, unit: "m/s" },
          { id: "tertiary", label: "instante t", min: 0, max: 4, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "tertiary", period: 6 },
        secondary: true,

        draw(api, v) {
          const k = P.parabola(v.tertiary, v.secondary, v.parameter);
          const xMax = Math.max(4, v.secondary * 4) * 1.05;
          const yMax = (xMax * xMax) / (4 * v.parameter);
          const chart = api.axes(api.main, -xMax * 0.15, xMax, -yMax * 0.25, yMax * 1.15, "x (m)", "y (m)");

          api.line(chart, api.curve((x) => (x * x) / (4 * v.parameter), -xMax * 0.15, xMax, 200), api.C.grayLight, [], 2);

          /* Círculo osculador no ponto atual. */
          const sp = k.speed;
          const etx = k.vx / sp, ety = k.vy / sp;
          const enx = -ety, eny = etx;           // normal apontando para o centro da curvatura
          const cx = k.x + enx * k.rho, cy = k.y + eny * k.rho;
          if (Number.isFinite(k.rho) && k.rho < 400) {
            api.line(chart, api.param((t) => [cx + k.rho * Math.cos(t), cy + k.rho * Math.sin(t)], 0, api.TAU, 160), api.C.lime, [5, 4], 1.4);
            api.line(chart, [[cx, cy], [k.x, k.y]], api.C.lime, [3, 3], 1.2);
            api.dot(chart, cx, cy, api.C.lime, 3);
          }

          const esc = xMax * 0.16;
          api.arrow(chart, k.x, k.y, k.x + etx * esc, k.y + ety * esc, api.C.green, 2.8, 9);
          api.arrow(chart, k.x, k.y, k.x + enx * esc, k.y + eny * esc, api.C.blue, 2.8, 9);
          const ka = esc / Math.max(1e-6, Math.hypot(k.ax, k.ay)) * 1.1;
          api.arrow(chart, k.x, k.y, k.x + k.ax * ka, k.y + k.ay * ka, api.C.red, 3, 9);
          api.dot(chart, k.x, k.y, api.C.ink, 4.5);
          api.label(chart, k.x + etx * esc * 1.2, k.y + ety * esc * 1.2, "e_t", api.C.green, "center");
          api.label(chart, k.x + enx * esc * 1.2, k.y + eny * esc * 1.2, "e_n", api.C.blue, "center");

          const s = api.axes(api.second, 0, 4, 0, Math.max(P.parabola(4, v.secondary, v.parameter).rho, 2 * v.parameter) * 1.1, "tempo t (s)", "ρ (m)");
          api.line(s, api.curve((t) => P.parabola(t, v.secondary, v.parameter).rho, 0, 4, 160), api.C.lime);
          api.hline(s, 2 * v.parameter, api.C.gold, [5, 4], "ρ no vértice = 2p");
          api.dot(s, v.tertiary, k.rho, api.C.red, 4.5);
        },

        text(v, api) {
          const k = P.parabola(v.tertiary, v.secondary, v.parameter);
          const noVertice = v.tertiary < 1e-9;
          return {
            title: "Decomposição intrínseca da aceleração",
            subtitle: `p = ${api.fmt(v.parameter, 1)} m · u = ${api.fmt(v.secondary)} m/s · t = ${api.fmt(v.tertiary)} s`,
            regime: noVertice ? ["aceleração puramente normal", "ok"] : ["tangencial e normal", "warn"],
            caption: "A aceleração vermelha é constante e vertical. O que muda com o tempo é como ela se reparte entre a direção do movimento e a perpendicular.",
            prediction: "A aceleração é constante. Então a_t e a_n também são constantes?",
            calculation: `|v| = √(u² + u⁴t²/4p²) = ${api.fmt(k.speed)} m/s<br>a_n = |ẋÿ − ẏẍ|/|v| = <b>${api.fmt(k.an)} m/s²</b><em>ρ = |v|²/a_n = ${api.fmt(k.speed ** 2)}/${api.fmt(k.an)} = ${Number.isFinite(k.rho) ? api.fmt(k.rho) : "∞"} m — no vértice, 2p = ${api.fmt(2 * v.parameter)} m</em>`,
            metrics: [
              ["posição (x, y)", `(${api.fmt(k.x)}; ${api.fmt(k.y)}) m`],
              ["rapidez |v|", `${api.fmt(k.speed)} m/s`],
              ["a_t = (v·a)/|v|", `${api.fmt(k.at)} m/s²`],
              ["a_n = |v×a|/|v|", `${api.fmt(k.an)} m/s²`],
              ["|a| total", `${api.fmt(Math.hypot(k.ax, k.ay))} m/s²`],
              ["ângulo entre a e v", `${api.fmt((Math.acos(Math.min(1, k.at / Math.max(1e-9, Math.hypot(k.ax, k.ay)))) * 180) / Math.PI, 1)}°`],
              ["raio ρ = |v|²/a_n", Number.isFinite(k.rho) ? `${api.fmt(k.rho)} m` : "∞"],
              ["ρ analítico, 2p·√(1 + x²/4p²)³", `${api.fmt(P.parabolaCurvature(k.x, v.parameter))} m`],
              ["instante em que a_t = a_n, 2p/u", `${api.fmt((2 * v.parameter) / v.secondary)} s`]
            ],
            concept: "A rapidez pode crescer sem que a aceleração mude: o que varia é o ângulo entre a aceleração e a velocidade.",
            prompts: [
              "Confirme em t = 0 que a_t = 0 e que ρ vale 2p.",
              "Mude u e verifique que ρ no vértice não se altera — a curvatura é da curva, não do percurso.",
              "Ache o instante em que a_t e a_n ficam iguais e mostre que ele vale 2p/u: é quando v faz 45° com a horizontal.",
              "Confira ρ lido contra a fórmula 2p·√(1 + x²/4p²)³ em dois instantes distintos."
            ],
            legend: [[api.C.green, "e_t"], [api.C.blue, "e_n"], [api.C.red, "a"], [api.C.lime, "círculo osculador"]],
            secondaryTitle: "Raio de curvatura ao longo do movimento",
            secondarySubtitle: "mínimo no vértice, crescendo à medida que a curva se abre",
            secondaryCaption: "A linha tracejada é o alvo analítico ρ(0) = 2p."
          };
        }
      },

      {
        id: "esferica",
        tab: "Esféricas<br>sobre a esfera",
        heading: "Movimento sobre a esfera r = 1",
        equation: "v = θ̇ e_θ + φ̇ senθ e_φ<br>a_r = −θ̇² − φ̇² sen²θ<br>a_θ = θ̈ − φ̇² senθ cosθ<br>a_φ = φ̈ senθ + 2θ̇φ̇ cosθ<br>aqui θ = θ₀ + θ̇t, φ = φ̇t (θ̈ = φ̈ = 0)",
        hint: "Anime o tempo e veja a partícula percorrer a esfera. Com θ̇ = 0 e θ₀ = 90° ela fica no equador; com φ̇ = 0, num meridiano.",
        controls: [
          { id: "parameter", label: "colatitude inicial θ₀", min: 5, max: 175, step: 1, value: 55, digits: 0, unit: "°" },
          { id: "secondary", label: "θ̇", min: -1.5, max: 1.5, step: 0.05, value: 0.5, digits: 2, unit: "rad/s" },
          { id: "tertiary", label: "φ̇", min: -2, max: 2, step: 0.05, value: 1.2, digits: 2, unit: "rad/s" },
          { id: "quaternary", label: "instante t", min: 0, max: 12, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "quaternary", period: 18 },
        secondary: true,

        draw(api, v) {
          const T_MAX = 12;
          const t = v.quaternary;
          const th0 = rad(v.parameter);
          const th = th0 + v.secondary * t;
          const ph = v.tertiary * t;
          esfera(api, {
            t, tMax: T_MAX, th, ph,
            ponto: (s) => ({ th: th0 + v.secondary * s, ph: v.tertiary * s }),
            vel: P.sphericalVelocity(1, 0, th, v.secondary, v.tertiary),
            acc: P.sphericalAcceleration(1, 0, 0, th, v.secondary, 0, v.tertiary, 0)
          });

          /* Painel secundário: as três componentes contra a colatitude, com o instante atual marcado. */
          const acc = P.sphericalAcceleration(1, 0, 0, th, v.secondary, 0, v.tertiary, 0);
          const comp = (x) => P.sphericalAcceleration(1, 0, 0, x, v.secondary, 0, v.tertiary, 0);
          const lim = Math.max(1, ...[1, 45, 90, 135, 179].flatMap((g) => comp(rad(g)).map(Math.abs))) * 1.2;
          const s = api.axes(api.second, 0, 180, -lim, lim, "colatitude θ (°)", "componente de a", { xTicks: [0, 45, 90, 135, 180] });
          api.hline(s, 0, "#b9c4bb", []);
          api.line(s, api.curve((g) => comp(rad(g))[0], 1, 179, 180), api.C.green);
          api.line(s, api.curve((g) => comp(rad(g))[1], 1, 179, 180), api.C.blue);
          api.line(s, api.curve((g) => comp(rad(g))[2], 1, 179, 180), api.C.red);
          api.vline(s, 90, api.C.gold, [5, 4], "plano equatorial");
          const gEff = (() => { let g = ((th * 180) / Math.PI) % 360; if (g < 0) g += 360; return g > 180 ? 360 - g : g; })();
          api.dot(s, gEff, acc[0], api.C.green, 4.5);
          api.dot(s, gEff, acc[1], api.C.blue, 4.5);
          api.dot(s, gEff, acc[2], api.C.red, 4.5);
        },

        text(v, api) {
          const t = v.quaternary;
          const th = (v.parameter * Math.PI) / 180 + v.secondary * t;
          const ph = v.tertiary * t;
          const gTh = (th * 180) / Math.PI, gPh = (ph * 180) / Math.PI;
          const a = P.sphericalAcceleration(1, 0, 0, th, v.secondary, 0, v.tertiary, 0);
          const vel = P.sphericalVelocity(1, 0, th, v.secondary, v.tertiary);
          const polar = P.polarAcceleration(1, 0, 0, v.tertiary, 0);
          const noEquador = Math.abs(v.parameter - 90) < 0.5 && Math.abs(v.secondary) < 1e-9;
          const meridional = Math.abs(v.tertiary) < 1e-9;
          const paralelo = Math.abs(v.secondary) < 1e-9 && !noEquador;
          return {
            title: "Movimento sobre a esfera",
            subtitle: `θ₀ = ${api.fmt(v.parameter, 0)}° · θ̇ = ${api.fmt(v.secondary)} · φ̇ = ${api.fmt(v.tertiary)} rad/s · t = ${api.fmt(t)} s`,
            regime: noEquador ? ["equador: reduz-se à polar", "ok"] : meridional ? ["meridiano: movimento plano", "ok"] : paralelo ? ["paralelo θ = θ₀", "warn"] : ["caso geral", "warn"],
            caption: "A partícula (ponto) percorre a esfera unitária; azul é o caminho já percorrido, cinza o que vem. Na base local, verde é a velocidade e vermelho a aceleração. Trechos atrás da esfera aparecem tracejados.",
            prediction: "Com θ̇ = 0 e θ₀ ≠ 90° o movimento é um paralelo. A aceleração aponta para o centro da esfera?",
            calculation: `θ(t) = θ₀ + θ̇t = ${api.fmt(gTh, 1)}° · φ(t) = φ̇t = ${api.fmt(gPh, 1)}°<br>a_r = −θ̇² − φ̇²sen²θ = −${api.fmt(v.secondary ** 2)} − ${api.fmt(v.tertiary ** 2)}·${api.fmt(Math.sin(th) ** 2)} = <b>${api.fmt(a[0])}</b><br>a_θ = −φ̇²senθcosθ = <b>${api.fmt(a[1])}</b> · a_φ = 2θ̇φ̇cosθ = <b>${api.fmt(a[2])}</b><em>polar equatorial com θ̇ = 0: a_r = −rφ̇² = ${api.fmt(polar[0])}</em>`,
            metrics: [
              ["colatitude θ(t)", `${api.fmt(gTh, 1)}°`],
              ["azimute φ(t)", `${api.fmt(gPh, 1)}°`],
              ["v_θ = θ̇, v_φ = φ̇ senθ", `${api.fmt(vel[1])}, ${api.fmt(vel[2])}`],
              ["rapidez |v|", api.fmt(Math.hypot(vel[1], vel[2]))],
              ["a_r", api.fmt(a[0])],
              ["a_θ", api.fmt(a[1])],
              ["a_φ", api.fmt(a[2])],
              ["|a|", api.fmt(Math.hypot(a[0], a[1], a[2]))],
              ["−rφ̇² (polar, plano equatorial)", api.fmt(polar[0])]
            ],
            concept: "Os casos-limite valem mais que a memorização: uma fórmula longa só é confiável se reproduz a fórmula curta que já conhecemos. Sobre a esfera eles são curvas: equador, meridiano e paralelo.",
            prompts: [
              "Ponha θ̇ = 0 e θ₀ = 90°: a trajetória é o equador. Confirme que a_θ e a_φ se anulam e que a_r = −φ̇² é a centrípeta do círculo.",
              "Zere φ̇: a partícula segue um meridiano (círculo máximo) e sobra exatamente a aceleração polar em (r, θ).",
              "Com θ̇ = 0 e θ₀ = 55°, o caminho é um paralelo: mostre que a aceleração aponta para o eixo z, não para o centro, e que isso é a_θ ≠ 0.",
              "Com θ̇ e φ̇ não nulos, anime t e observe a_φ = 2θ̇φ̇cosθ trocar de sinal quando a partícula cruza o equador."
            ],
            legend: [[api.C.green, "v"], [api.C.red, "a"], [api.C.blue, "trajetória percorrida"], [api.C.grayLight, "base local e_r, e_θ, e_φ"]],
            secondaryTitle: "Componentes de a contra a colatitude",
            secondarySubtitle: "curvas para os θ̇ e φ̇ atuais; os pontos marcam a colatitude do instante t",
            secondaryCaption: "Nos casos-limite duas curvas se anulam e sobra a expressão polar da estação 1."
          };
        }
      },

      {
        id: "formiga",
        tab: "Formiga<br>sobre a bola",
        heading: "Fowles–Cassiday, Problema 1.22",
        equation: "r = b,  φ = ωt,  θ = (π/2)[1 + A cos(nωt)]<br>θ̇ = −(π/2)Anω sen(nωt),  θ̈ = −(π/2)An²ω² cos(nωt)<br>v = b√(θ̇² + ω² sen²θ)<br>a_θ = b(θ̈ − ω² senθ cosθ) — agora com θ̈ ≠ 0<br>enunciado: A = 1/2, n = 4",
        hint: "Uma formiga anda sobre uma bola com φ = ωt e colatitude oscilando em torno do equador. Que caminho ela faz, e qual é a sua rapidez? (b = 1.)",
        controls: [
          { id: "parameter", label: "velocidade angular ω", min: 0.2, max: 2, step: 0.05, value: 1, digits: 2, unit: "rad/s" },
          { id: "secondary", label: "amplitude A", min: 0, max: 0.9, step: 0.05, value: 0.5, digits: 2 },
          { id: "tertiary", label: "oscilações por volta n", min: 1, max: 6, step: 1, value: 4, digits: 0 },
          { id: "quaternary", label: "instante t", min: 0, max: 12, step: 0.02, value: 0, digits: 2, unit: "s" }
        ],
        animate: { control: "quaternary", period: 18 },
        secondary: true,

        draw(api, v) {
          const T_MAX = 12;
          const w = v.parameter, A = v.secondary, n = Math.round(v.tertiary), t = v.quaternary;
          const q = P.antOnBall(t, 1, w, A, n);
          esfera(api, {
            t, tMax: T_MAX, th: q.theta, ph: q.phi,
            ponto: (s) => { const u = P.antOnBall(s, 1, w, A, n); return { th: u.theta, ph: u.phi }; },
            vel: [0, q.vt, q.vp],
            acc: q.a
          });

          /* Painel secundário: rapidez contra o tempo, com a referência bω do equador. */
          const vMax = Math.max(1.2 * w, ...api.curve((s) => P.antOnBall(s, 1, w, A, n).speed, 0, T_MAX, 240).map((p) => p[1])) * 1.1;
          const s = api.axes(api.second, 0, T_MAX, 0, vMax, "tempo t (s)", "rapidez v (b = 1)");
          api.line(s, api.curve((u) => P.antOnBall(u, 1, w, A, n).speed, 0, T_MAX, 480), api.C.green);
          api.hline(s, w, api.C.gold, [5, 4], "bω (equador, A = 0)");
          api.dot(s, t, q.speed, api.C.red, 4.5);
        },

        text(v, api) {
          const w = v.parameter, A = v.secondary, n = Math.round(v.tertiary), t = v.quaternary;
          const q = P.antOnBall(t, 1, w, A, n);
          const gTh = (q.theta * 180) / Math.PI, gPh = (q.phi * 180) / Math.PI;
          const fase = n * w * t;
          const vMin = w * Math.sin((Math.PI / 2) * (1 + A)); // sen θ nos extremos da oscilação
          const vMax = w * Math.sqrt(((Math.PI / 2) * A * n) ** 2 + 1); // no equador, com |sen(nωt)| = 1
          return {
            title: "A formiga sobre a bola",
            subtitle: `ω = ${api.fmt(w)} rad/s · A = ${api.fmt(A)} · n = ${n} · t = ${api.fmt(t)} s`,
            regime: A < 1e-9 ? ["A = 0: equador, rapidez bω", "ok"] : [`ondulação com ${n} cristas por volta`, "warn"],
            caption: "A formiga (ponto) serpenteia em torno do equador: n oscilações de colatitude a cada volta em φ. Verde é a velocidade, vermelho a aceleração; azul é o caminho já percorrido.",
            prediction: "A rapidez é máxima quando a formiga cruza o equador ou quando está mais longe dele?",
            calculation: `θ = (π/2)[1 + ${api.fmt(A)}·cos(${api.fmt(fase)})] = ${api.fmt(gTh, 1)}° · φ = ${api.fmt(gPh, 1)}°<br>θ̇ = −(π/2)·${api.fmt(A)}·${n}·${api.fmt(w)}·sen(${api.fmt(fase)}) = ${api.fmt(q.thdot)} rad/s<br>v = b√(θ̇² + ω²sen²θ) = √(${api.fmt(q.thdot ** 2)} + ${api.fmt(w * w)}·${api.fmt(Math.sin(q.theta) ** 2)}) = <b>${api.fmt(q.speed)}</b><em>enunciado (A = ½, n = 4): v = bω√(π² sen²(4ωt) + sen²θ)</em>`,
            metrics: [
              ["colatitude θ(t)", `${api.fmt(gTh, 1)}°`],
              ["azimute φ(t)", `${api.fmt(gPh, 1)}°`],
              ["θ̇", `${api.fmt(q.thdot)} rad/s`],
              ["θ̈", `${api.fmt(q.thddot)} rad/s²`],
              ["rapidez v", api.fmt(q.speed)],
              ["v mínima, bω sen θ_extremo", api.fmt(vMin)],
              ["v máxima, bω√((πAn/2)² + 1)", api.fmt(vMax)],
              ["a_r", api.fmt(q.a[0])],
              ["a_θ = b(θ̈ − ω² senθ cosθ)", api.fmt(q.a[1])],
              ["a_φ", api.fmt(q.a[2])],
              ["|a|", api.fmt(Math.hypot(...q.a))]
            ],
            concept: "O problema é a fórmula esférica em uso: dado o movimento em (r, θ, φ), a rapidez e a aceleração saem sem nenhuma conta cartesiana. A parcela θ̈, ausente na estação 3, aqui domina a_θ.",
            prompts: [
              "Zere A: a formiga anda no equador com rapidez bω constante e aceleração só centrípeta.",
              "Volte a A = ½, n = 4 e localize os instantes de rapidez mínima e máxima no painel secundário. Mostre que são os extremos da oscilação (θ = 45° ou 135°, v = bω senθ) e os cruzamentos do equador (v = bω√(π² + 1)).",
              "Descreva o caminho: quantas cristas por volta? Mude n e A e confira na esfera.",
              "Compare a_θ com o da estação 3: qual é a parcela nova, e quando ela é máxima?"
            ],
            legend: [[api.C.green, "v"], [api.C.red, "a"], [api.C.blue, "trajetória percorrida"], [api.C.grayLight, "base local"]],
            secondaryTitle: "Rapidez da formiga contra o tempo",
            secondarySubtitle: "v = b√(θ̇² + ω² sen²θ); a linha tracejada é o valor no equador sem oscilação",
            secondaryCaption: "Os mínimos ocorrem nos extremos da oscilação em θ e os máximos ao cruzar o equador, onde θ̇ é maior e senθ = 1."
          };
        }
      }
    ]
  };
})();
