/* Desafio 1 — motor das fases encadeadas. Uma fase só abre quando todas as
   respostas da anterior estão certas; os valores validados são herdados. */
(function () {
  "use strict";
  const P = window.DesafioPhysics;
  const D = P.D, g = P.gabarito();
  const CHAVE = "desafio01-centrifuga";

  const f = (x, n = 3) => {
    if (!Number.isFinite(x)) return "—";
    const a = Math.abs(x);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) {
      const e = Math.floor(Math.log10(a));
      return (x / Math.pow(10, e)).toLocaleString("pt-BR", { maximumSignificantDigits: n }) + "·10" + window.LessonDraw.sup(e);
    }
    return x.toLocaleString("pt-BR", { maximumSignificantDigits: n, useGrouping: false });
  };

  const FASES = [
    {
      id: "f1", aula: "Aula 1 · Grandezas e escalas", titulo: "Antes de ligar a centrífuga",
      narrativa: "Um tubo com 5 mL de sangue chega ao laboratório. Antes de qualquer protocolo, você estima em que regime uma hemácia se move no plasma quando deixada em repouso, sedimentando sob a gravidade. Trate a hemácia como esfera e use a velocidade terminal de Stokes, v_T = 2R²Δρg/(9η), para calcular o número de Reynolds Re = ρ_p v_T R/η.",
      dados: [["Raio da hemácia R", "3,5 µm"], ["Δρ (hemácia − plasma)", "80 kg/m³"], ["Densidade do plasma ρ_p", "1025 kg/m³"], ["Viscosidade do plasma η", "1,2·10⁻³ Pa·s"], ["g", "9,8 m/s²"]],
      herda: () => [],
      perguntas: [
        { id: "Re", texto: "Número de Reynolds da hemácia sedimentando sob g.", unidade: "(adimensional)", certo: g.f1.Re, tol: 0.05, dica: "Primeiro v_T = 2R²Δρg/(9η) ≈ 1,8·10⁻⁶ m/s; depois Re = ρ_p v_T R/η. Lembre que R = 3,5·10⁻⁶ m." },
        { id: "modelo", tipo: "escolha", texto: "Com esse Re, qual modelo de arrasto vale para a hemácia (Aula 6)?", opcoes: ["Arrasto linear, F = −bv (Stokes)", "Arrasto quadrático, F = −cv²", "Nenhum: o fluido é desprezível"], certo: 0, dica: "Re ≪ 1 significa que as forças viscosas dominam; o arrasto é proporcional à velocidade." }
      ],
      fecho: () => `Re ≈ ${f(g.f1.Re, 2)} ≪ 1: a hemácia vive no mundo viscoso. O arrasto linear da Aula 6 é o modelo correto e será usado em toda a sequência.`
    },
    {
      id: "f2", aula: "Aula 6 · Forças dependentes da velocidade", titulo: "Quanto tempo levaria sem a centrífuga?",
      narrativa: "Com o arrasto linear confirmado, a hemácia atinge quase instantaneamente a velocidade terminal v_T = 2R²Δρg/(9η). Converta essa velocidade para mm/h e estime quanto tempo ela levaria para percorrer os 2 cm do tubo só com a gravidade.",
      dados: [["Percurso no tubo L", "2,0 cm"]],
      herda: () => [["Reynolds (fase 1)", f(g.f1.Re, 2)], ["Modelo", "arrasto linear"]],
      perguntas: [
        { id: "vT", texto: "Velocidade terminal da hemácia sob g.", unidade: "mm/h", certo: g.f2.vTmmh, tol: 0.03, dica: "1 m/s = 3,6·10⁶ mm/h. Com os dados, v_T ≈ 1,78·10⁻⁶ m/s." },
        { id: "tGrav", texto: "Tempo para sedimentar os 2 cm apenas sob a gravidade.", unidade: "h", certo: g.f2.tGravH, tol: 0.03, dica: "t = L/v_T, em segundos; divida por 3600." }
      ],
      fecho: () => `v_T ≈ ${f(g.f2.vTmmh)} mm/h e t ≈ ${f(g.f2.tGravH)} h. Esperar três horas por amostra é inviável para um laboratório clínico: é por isso que se centrifuga.`
    },
    {
      id: "f3", aula: "Aula 3 · Cinemática", titulo: "O protocolo: 3000 rpm",
      narrativa: "O protocolo pede 3000 rpm com o tubo a 10 cm do eixo. Converta a rotação em velocidade angular e obtenha a aceleração centrípeta na posição da amostra, a velocidade tangencial do tubo e o fator RCF = a_c/g (a 'força g relativa' que os manuais de centrífuga anunciam).",
      dados: [["Rotação", "3000 rpm"], ["Raio efetivo r", "10 cm"]],
      herda: () => [["Tempo só com g (fase 2)", f(g.f2.tGravH) + " h"]],
      perguntas: [
        { id: "omega", texto: "Velocidade angular Ω do rotor.", unidade: "rad/s", certo: g.f3.omega, tol: 0.02, dica: "Ω = 2π·rpm/60." },
        { id: "ac", texto: "Aceleração centrípeta a_c = Ω²r na amostra.", unidade: "m/s²", certo: g.f3.ac, tol: 0.02, dica: "Use Ω em rad/s e r em metros." },
        { id: "rcf", texto: "RCF = a_c/g.", unidade: "(vezes g)", certo: g.f3.rcf, tol: 0.02, dica: "Divida a aceleração centrípeta por 9,8 m/s²." }
      ],
      fecho: () => `Ω ≈ ${f(g.f3.omega, 4)} rad/s, a_c ≈ ${f(g.f3.ac, 4)} m/s² e RCF ≈ ${f(g.f3.rcf, 4)} g. O tubo passa a ${f(g.f3.vtan)} m/s, mais de 110 km/h.`
    },
    {
      id: "f4", aula: "Aula 4 · Leis de Newton", titulo: "O que segura o tubo",
      narrativa: "O tubo (com o sangue) tem 20 g. No referencial do laboratório, a única força horizontal sobre ele é a normal do suporte do rotor, que faz o papel de força centrípeta. Calcule-a e compare com o peso do tubo.",
      dados: [["Massa do tubo com sangue m", "20 g"]],
      herda: () => [["Ω (fase 3)", f(g.f3.omega, 4) + " rad/s"], ["a_c (fase 3)", f(g.f3.ac, 4) + " m/s²"]],
      perguntas: [
        { id: "N", texto: "Força normal do suporte sobre o tubo, N = mΩ²r.", unidade: "N", certo: g.f4.N, tol: 0.02, dica: "m em kg (0,020) vezes a aceleração centrípeta da fase 3." },
        { id: "razao", texto: "Razão N/(mg).", unidade: "(adimensional)", certo: g.f4.razaoPeso, tol: 0.02, dica: "É o mesmo número que o RCF: a normal é 'RCF vezes' o peso." }
      ],
      fecho: () => `N ≈ ${f(g.f4.N, 4)} N, cerca de ${f(g.f4.razaoPeso, 4)} vezes o peso de 0,196 N. É esse número que dimensiona os suportes (e explica por que tubos trincados se partem).`
    },
    {
      id: "f5", aula: "Aula 2 · Vetores", titulo: "A gravidade efetiva dentro do tubo",
      narrativa: "No referencial do tubo, o sangue sente a gravidade real (vertical, 9,8 m/s²) e a aceleração centrífuga (horizontal, para fora, igual a a_c). Some os dois vetores: obtenha o módulo da gravidade efetiva e o ângulo que ela faz com a horizontal. Isso diz em que direção as hemácias realmente sedimentam.",
      dados: [["g (vertical)", "9,8 m/s²"], ["a_c (horizontal, para fora)", "da fase 3"]],
      herda: () => [["a_c (fase 3)", f(g.f3.ac, 4) + " m/s²"]],
      perguntas: [
        { id: "gef", texto: "Módulo da gravidade efetiva |g_ef| = √(g² + a_c²).", unidade: "m/s²", certo: g.f5.gef, tol: 0.02, dica: "Como a_c ≫ g, o módulo é praticamente a_c." },
        { id: "ang", texto: "Ângulo de g_ef com a horizontal.", unidade: "graus", certo: g.f5.angulo, tol: 0.10, dica: "tan θ = g/a_c; θ em graus é pequeno (menos de 0,1°)." }
      ],
      fecho: () => `|g_ef| ≈ ${f(g.f5.gef, 4)} m/s² inclinado só ${f(g.f5.angulo, 2)}° abaixo da horizontal. O sedimento forma-se praticamente no fundo radial do tubo; a gravidade real quase não conta.`
    },
    {
      id: "f6", aula: "Aula 10 · Referenciais não inerciais", titulo: "Coriolis atrapalha?",
      narrativa: "No referencial girante a hemácia sedimenta com a velocidade terminal escalada pela gravidade efetiva: v_sed = v_T · RCF. Movendo-se radialmente a essa velocidade, ela sofre a aceleração de Coriolis a_Cor = 2Ω v_sed. Calcule v_sed e a razão a_Cor/a_c para decidir se Coriolis desvia a sedimentação.",
      dados: [["v_T (fase 2)", f(g.f2.vT, 3) + " m/s"]],
      herda: () => [["RCF (fase 3)", f(g.f3.rcf, 4)], ["Ω (fase 3)", f(g.f3.omega, 4) + " rad/s"], ["a_c (fase 3)", f(g.f3.ac, 4) + " m/s²"]],
      perguntas: [
        { id: "vsed", texto: "Velocidade de sedimentação na centrífuga, v_sed = v_T · RCF.", unidade: "mm/s", certo: g.f6.vSedmms, tol: 0.03, dica: "1,78·10⁻⁶ m/s × 1007 ≈ 1,8·10⁻³ m/s; converta para mm/s." },
        { id: "aCor", texto: "Aceleração de Coriolis a_Cor = 2Ω v_sed.", unidade: "m/s²", certo: g.f6.aCor, tol: 0.03, dica: "Use v_sed em m/s." },
        { id: "razao", texto: "Razão a_Cor/a_c.", unidade: "(adimensional)", certo: g.f6.razaoCor, tol: 0.10, dica: "Deve dar da ordem de 10⁻⁴." }
      ],
      fecho: () => `v_sed ≈ ${f(g.f6.vSedmms)} mm/s e a_Cor/a_c ≈ ${f(g.f6.razaoCor, 2)}. Coriolis existe, mas é dez mil vezes menor que o termo centrífugo: o arrasto viscoso o anula sem efeito perceptível.`
    },
    {
      id: "f7", aula: "Aula 5 · Trabalho e energia", titulo: "A energia que o motor entrega",
      narrativa: "O rotor tem momento de inércia 0,05 kg·m² e leva 20 s para atingir 3000 rpm. Calcule a energia cinética de rotação acumulada e a potência média que o motor deve entregar, ignorando perdas.",
      dados: [["Momento de inércia I", "0,05 kg·m²"], ["Tempo de aceleração", "20 s"]],
      herda: () => [["Ω (fase 3)", f(g.f3.omega, 4) + " rad/s"]],
      perguntas: [
        { id: "Ek", texto: "Energia cinética de rotação, E = ½IΩ².", unidade: "J", certo: g.f7.Ek, tol: 0.02, dica: "½ × 0,05 × (314,16)²." },
        { id: "P", texto: "Potência média durante a aceleração.", unidade: "W", certo: g.f7.Pmed, tol: 0.02, dica: "P = E/Δt." }
      ],
      fecho: () => `E ≈ ${f(g.f7.Ek, 4)} J e P ≈ ${f(g.f7.Pmed, 3)} W. Essa energia é a mesma que vai virar calor na frenagem, e explica por que o rotor aquece a amostra em protocolos longos.`
    },
    {
      id: "f8", aula: "Aula 9 · Sistemas de partículas", titulo: "O tubo oposto ficou vazio",
      narrativa: "Alguém esqueceu de equilibrar o rotor: do lado oposto ao tubo de 20 g não há contrapeso. Modele o rotor (2,0 kg) como balanceado e o tubo como massa extra a 10 cm do eixo. Calcule o deslocamento do centro de massa e a força desbalanceada que gira com o rotor e sacode o eixo.",
      dados: [["Massa do rotor M", "2,0 kg"], ["Massa do tubo m", "20 g"], ["Raio r", "10 cm"]],
      herda: () => [["Ω (fase 3)", f(g.f3.omega, 4) + " rad/s"], ["N do tubo (fase 4)", f(g.f4.N, 4) + " N"]],
      perguntas: [
        { id: "e", texto: "Deslocamento do centro de massa, e = mr/M (tubo não incluído em M).", unidade: "mm", certo: g.f8.emm, tol: 0.05, dica: "0,020 × 0,10 / 2,0 em metros; converta para mm." },
        { id: "F", texto: "Força desbalanceada sobre o eixo, F = mrΩ².", unidade: "N", certo: g.f8.Fdes, tol: 0.05, dica: "É igual à normal da fase 4: ninguém faz força contrária no lado vazio." }
      ],
      fecho: () => `O CM sai apenas ${f(g.f8.emm, 2)} mm do eixo, mas a força de ${f(g.f8.Fdes, 4)} N gira 50 vezes por segundo: vibração, ruído e desgaste do mancal. Daí a regra de sempre equilibrar os tubos.`
    },
    {
      id: "f9", aula: "Aula 7 · Movimento em duas dimensões", titulo: "A tampa abriu",
      narrativa: "Suponha que, com o rotor a 3000 rpm, a tampa seja aberta e uma gota de sangue escape do tubo, saindo tangencialmente à altura de 80 cm do piso. Trate a gota como projétil sem arrasto: quanto tempo ela leva para cair e a que distância horizontal do ponto de saída ela atinge o chão?",
      dados: [["Altura do rotor h", "0,80 m"]],
      herda: () => [["Velocidade tangencial (fase 3)", f(g.f3.vtan) + " m/s"]],
      perguntas: [
        { id: "t", texto: "Tempo de queda da gota.", unidade: "s", certo: g.f9.tQueda, tol: 0.03, dica: "h = ½gt², logo t = √(2h/g)." },
        { id: "x", texto: "Distância horizontal percorrida até o chão.", unidade: "m", certo: g.f9.alcance, tol: 0.03, dica: "x = v_tan · t, com v_tan = Ωr da fase 3." }
      ],
      fecho: () => `t ≈ ${f(g.f9.tQueda)} s e x ≈ ${f(g.f9.alcance)} m. Uma gota de sangue a 12 m é um risco biológico real: a tampa travada durante a rotação não é burocracia.`
    },
    {
      id: "f10", aula: "Aulas 6 e 8 · Integração", titulo: "Fechando o laudo",
      narrativa: "Hora de fechar: com a velocidade de sedimentação da fase 6, quanto tempo a hemácia leva para percorrer os 2 cm do tubo na centrífuga? Compare com o tempo da fase 2, só com a gravidade. (Na prática os protocolos usam 10 min: hematócrito e agregados de células retardam a sedimentação real, mas a escala vem daqui.)",
      dados: [["Percurso L", "2,0 cm"]],
      herda: () => [["v_sed (fase 6)", f(g.f6.vSedmms) + " mm/s"], ["Tempo só com g (fase 2)", f(g.f2.tGravH) + " h"]],
      perguntas: [
        { id: "tc", texto: "Tempo de sedimentação na centrífuga, t = L/v_sed.", unidade: "s", certo: g.f10.tCentr, tol: 0.03, dica: "0,020 m dividido por v_sed em m/s." },
        { id: "razao", texto: "Razão entre o tempo sob g e o tempo na centrífuga.", unidade: "(adimensional)", certo: g.f10.razaoTempos, tol: 0.03, dica: "Deve ser igual ao RCF: a centrífuga multiplica g por esse fator." }
      ],
      fecho: () => `t ≈ ${f(g.f10.tCentr)} s, ${f(g.f10.razaoTempos, 4)} vezes mais rápido que sob a gravidade. O fator é exatamente o RCF da fase 3: todo o desafio se fecha nessa razão.`
    }
  ];

  /* ---- estado ---- */
  let estado = { fase: 0, feitas: [], tentativas: {} };
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem storage */ } };
  const carregar = () => {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && Array.isArray(s.feitas)) estado = { fase: s.fase | 0, feitas: s.feitas, tentativas: s.tentativas || {}, analistas: s.analistas || "" };
    } catch (e) { /* ignora */ }
  };
  const feita = (i) => estado.feitas.includes(FASES[i].id);
  const liberada = (i) => i === 0 || feita(i - 1);

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- navegação lateral ---- */
  function renderFases() {
    const nav = $("fases"); nav.innerHTML = "";
    FASES.forEach((F, i) => {
      const b = document.createElement("button"); b.type = "button";
      const cls = [i === estado.fase ? "ativa" : "", feita(i) ? "feita" : "", liberada(i) ? "" : "travada"].filter(Boolean).join(" ");
      b.className = cls; b.disabled = !liberada(i);
      b.innerHTML = `<span class="num">${feita(i) ? "✓" : i + 1}</span><span class="rot">${esc(F.titulo)}<small>${esc(F.aula)}</small></span>`;
      b.addEventListener("click", () => { if (liberada(i)) { estado.fase = i; salvar(); render(); } });
      nav.appendChild(b);
    });
    const n = estado.feitas.length;
    $("barra").style.width = (100 * n / FASES.length) + "%";
    $("statusTitle").textContent = n === FASES.length ? "Desafio concluído" : `Fase ${estado.fase + 1} de ${FASES.length}`;
    $("statusDetail").textContent = n === 0 ? "Nenhuma fase validada ainda" : `${n} de ${FASES.length} fases validadas`;
  }

  /* ---- cartão da fase ---- */
  function renderCartao() {
    const i = estado.fase, F = FASES[i], c = $("cartao");
    if (!liberada(i)) { c.innerHTML = `<div class="travado-aviso">Esta fase abre quando a fase ${i} for validada.</div>`; return; }
    const lista = (pares, cls) => pares.length ? `<div class="${cls}">${pares.map(([k, v]) => `<div><strong>${esc(k)}</strong>${esc(v)}</div>`).join("")}</div>` : "";
    let html = `<div class="aula">Fase ${i + 1} · ${esc(F.aula)}</div><h2>${esc(F.titulo)}</h2><p class="narrativa">${esc(F.narrativa)}</p>`;
    html += `<div class="animacao"><canvas id="anim" width="${window.DesafioAnimacao.W}" height="${window.DesafioAnimacao.H}" aria-label="animação da fase"></canvas><div class="legenda">${feita(i) ? "A animação agora mostra os valores validados." : "A animação ilustra a situação desta fase; os números aparecem nela quando a fase for validada."}</div></div>`;
    const herd = F.herda(g);
    if (herd.length) html += `<div class="bloco-titulo">Herdado das fases anteriores</div>${lista(herd, "herdado")}`;
    html += `<div class="bloco-titulo">Dados desta fase</div>${lista(F.dados, "dados")}`;
    html += `<div class="bloco-titulo">Perguntas</div>`;
    F.perguntas.forEach((q, k) => {
      const nome = `${F.id}-${q.id}`;
      let campo;
      if (q.tipo === "escolha") {
        campo = `<select id="${nome}" ${feita(i) ? "disabled" : ""}><option value="">Escolha…</option>${q.opcoes.map((o, j) => `<option value="${j}" ${feita(i) && j === q.certo ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
      } else {
        campo = `<input id="${nome}" type="text" inputmode="decimal" autocomplete="off" placeholder="valor" ${feita(i) ? `disabled value="${esc(f(q.certo, 4))}"` : ""}> <span class="unidade">${esc(q.unidade)}</span>`;
      }
      html += `<div class="pergunta ${feita(i) ? "certa" : ""}" id="${nome}-box"><p><b>${k + 1}.</b> ${esc(q.texto)}</p><div class="linha">${campo}</div><div class="retorno" id="${nome}-ret">${feita(i) ? "Validado." : ""}</div><div class="dica" id="${nome}-dica" hidden>${esc(q.dica || "")}</div></div>`;
    });
    if (feita(i)) {
      html += `<div class="concluida"><h3>Fase validada</h3><p>${esc(F.fecho(g))}</p>${i + 1 < FASES.length ? `<div class="acoes"><button type="button" id="proxima">Ir para a fase ${i + 2}</button></div>` : ""}</div>`;
    } else {
      html += `<div class="acoes"><button type="button" id="verificar">Verificar respostas</button><span class="msg" id="msg">${estado.tentativas[F.id] ? `Tentativas: ${estado.tentativas[F.id]}` : ""}</span></div>`;
    }
    if (feita(i) && i + 1 === FASES.length) html += laudo();
    c.innerHTML = html;
    const cv = $("anim"); if (cv) window.DesafioAnimacao.iniciar(cv, F.id, feita(i), g);
    const bi = $("imprimir"); if (bi) bi.addEventListener("click", () => window.print());
    const an = $("analistas"); if (an) an.addEventListener("input", () => { estado.analistas = an.value; salvar(); });
    const bv = $("verificar"); if (bv) bv.addEventListener("click", verificar);
    const bp = $("proxima"); if (bp) bp.addEventListener("click", () => { estado.fase = i + 1; salvar(); render(); window.scrollTo(0, 0); });
    c.querySelectorAll("input").forEach((inp) => inp.addEventListener("keydown", (e) => { if (e.key === "Enter") verificar(); }));
  }

  function verificar() {
    const i = estado.fase, F = FASES[i];
    estado.tentativas[F.id] = (estado.tentativas[F.id] || 0) + 1;
    let todas = true;
    F.perguntas.forEach((q) => {
      const nome = `${F.id}-${q.id}`, box = $(`${nome}-box`), ret = $(`${nome}-ret`), dica = $(`${nome}-dica`);
      let ok, msg;
      if (q.tipo === "escolha") {
        const v = $(nome).value;
        ok = v !== "" && Number(v) === q.certo;
        msg = v === "" ? "Escolha uma opção." : ok ? "Correto." : "Não é esse o regime. Reveja o valor de Re.";
      } else {
        const v = P.lerNumero($(nome).value);
        ok = P.confere(v, q.certo, q.tol);
        if (!Number.isFinite(v)) msg = "Digite um número (vírgula ou ponto decimal; 5,3e-6 para notação científica).";
        else if (ok) msg = "Correto.";
        else {
          const razao = v / q.certo;
          if (razao > 8 || razao < 1 / 8) msg = "Ordem de grandeza diferente da esperada. Confira unidades (m, kg, s) e a conversão pedida.";
          else msg = razao > 1 ? "Valor alto demais." : "Valor baixo demais.";
        }
      }
      box.classList.toggle("certa", ok); box.classList.toggle("errada", !ok);
      ret.textContent = msg;
      if (!ok && q.dica && estado.tentativas[F.id] >= 2) dica.hidden = false;
      if (!ok) todas = false;
    });
    if (todas) {
      if (!feita(i)) estado.feitas.push(F.id);
      salvar(); render();
    } else {
      $("msg").textContent = `Tentativas: ${estado.tentativas[F.id]}. A fase ${i + 2 <= FASES.length ? i + 2 : ""} continua travada até tudo estar certo.`;
      salvar(); renderFases();
    }
  }

  function laudo() {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const sec = (titulo, linhas) => `<tr class="sec"><th colspan="3">${esc(titulo)}</th></tr>` + linhas.map(([a, b, c]) => `<tr><td>${esc(a)}</td><td class="val">${esc(b)}</td><td>${esc(c)}</td></tr>`).join("");
    const tabela = sec("Amostra e regime de escoamento", [
      ["Raio da hemácia", "3,5 µm", "modelo de esfera rígida"],
      ["Número de Reynolds", f(g.f1.Re, 2), "Re ≪ 1: arrasto linear (Stokes)"],
      ["Velocidade terminal sob g", f(g.f2.vTmmh) + " mm/h", "2 cm em " + f(g.f2.tGravH) + " h: inviável"]
    ]) + sec("Protocolo de centrifugação", [
      ["Rotação", "3000 rpm", "Ω = " + f(g.f3.omega, 4) + " rad/s"],
      ["Raio efetivo", "10 cm", "v tangencial " + f(g.f3.vtan) + " m/s"],
      ["Aceleração centrípeta", f(g.f3.ac, 4) + " m/s²", "RCF = " + f(g.f3.rcf, 4) + " g"]
    ]) + sec("Forças e referencial", [
      ["Normal no tubo (20 g)", f(g.f4.N, 4) + " N", f(g.f4.razaoPeso, 4) + " vezes o peso"],
      ["Gravidade efetiva", f(g.f5.gef, 4) + " m/s²", f(g.f5.angulo, 2) + "° abaixo da horizontal"],
      ["Velocidade de sedimentação", f(g.f6.vSedmms) + " mm/s", "Coriolis/centrífugo = " + f(g.f6.razaoCor, 2) + ": desprezível"]
    ]) + sec("Energia e segurança", [
      ["Energia do rotor", f(g.f7.Ek, 4) + " J", "potência média " + f(g.f7.Pmed, 3) + " W em 20 s"],
      ["Rotor desbalanceado (1 tubo)", f(g.f8.Fdes, 4) + " N", "CM deslocado " + f(g.f8.emm, 2) + " mm; força gira a 50 Hz"],
      ["Gota que escapa com a tampa aberta", f(g.f9.alcance) + " m", "queda de 0,80 m em " + f(g.f9.tQueda) + " s"]
    ]) + sec("Resultado", [
      ["Tempo de sedimentação (2 cm)", f(g.f10.tCentr) + " s", f(g.f10.razaoTempos, 4) + " vezes mais rápido que sob g"]
    ]);
    return `<section class="laudo" id="laudo">
      <div class="laudo-cab"><div><div class="laudo-titulo">Laudo físico da amostra</div><div class="laudo-sub">Mecânica Clássica · Desafio 1 · Aulas 1 a 10</div></div>
      <div class="laudo-meta">Amostra: sangue total, 5 mL<br>Protocolo: 3000 rpm · r = 10 cm<br>Emitido em ${hoje}</div></div>
      <table class="relatorio"><thead><tr><th>Grandeza</th><th>Valor</th><th>Interpretação</th></tr></thead><tbody>${tabela}</tbody></table>
      <h4>Conclusões</h4>
      <ol>
        <li>A hemácia sedimenta em regime viscoso (Re ≪ 1), portanto a velocidade de sedimentação é proporcional à aceleração aplicada: a centrífuga multiplica g pelo fator RCF e divide o tempo pelo mesmo fator.</li>
        <li>Coriolis e a gravidade real são desprezíveis frente ao termo centrífugo; o sedimento forma-se no fundo radial do tubo.</li>
        <li>Os suportes recebem cerca de mil vezes o peso de cada tubo; um único tubo sem contrapeso gera ${f(g.f8.Fdes, 3)} N girantes no eixo. Equilibrar os tubos é obrigatório.</li>
        <li>Com a tampa aberta, uma gota alcança ${f(g.f9.alcance, 3)} m: a trava da tampa durante a rotação é medida de biossegurança.</li>
        <li>O tempo de ${f(g.f10.tCentr, 3)} s é o limite ideal para uma hemácia isolada; protocolos reais (≈10 min) compensam a sedimentação impedida pelo hematócrito e a compactação do sedimento.</li>
      </ol>
      <div class="laudo-assin"><label>Analista(s): <input id="analistas" type="text" value="${esc(estado.analistas || "")}" placeholder="nomes da dupla"></label><span>Assinatura: ____________________</span></div>
      <div class="acoes"><button type="button" id="imprimir">Imprimir ou salvar o laudo em PDF</button><span class="msg">Só o laudo vai para a impressão.</span></div>
    </section>`;
  }

  function render() { renderFases(); renderCartao(); }

  $("reiniciar").addEventListener("click", () => {
    estado = { fase: 0, feitas: [], tentativas: {} }; salvar(); render();
  });

  carregar();
  if (!liberada(estado.fase)) estado.fase = estado.feitas.length;
  render();
})();
