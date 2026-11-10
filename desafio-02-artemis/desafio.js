/* Desafio 2 — motor das fases encadeadas. Uma fase só abre quando todas as
   respostas da anterior estão certas; os valores validados são herdados. */
(function () {
  "use strict";
  const P = window.DesafioPhysics;
  const D = P.D, R = P.REAL, g = P.gabarito();
  const CHAVE = "desafio02-artemis";

  const f = (x, n = 3) => {
    if (!Number.isFinite(x)) return "—";
    const a = Math.abs(x);
    if (a !== 0 && (a < 1e-3 || a >= 1e6)) {
      const e = Math.floor(Math.log10(a));
      return (x / Math.pow(10, e)).toLocaleString("pt-BR", { maximumSignificantDigits: n }) + "·10" + window.LessonDraw.sup(e);
    }
    return x.toLocaleString("pt-BR", { maximumSignificantDigits: n, useGrouping: false });
  };
  /* Inteiros grandes com espaço fino entre milhares, só para leitura (nunca em campos). */
  /* Diferença percentual entre modelo e voo real, com um algarismo. */
  const pct = (modelo, real) => (100 * Math.abs(modelo - real) / real).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " %";
  const km = (x) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const FASES = [
    {
      id: "f1", aula: "Aula 19 · Problema de Kepler", titulo: "A órbita alta de espera",
      narrativa: "1º de abril de 2026, 22:35 UTC: o SLS decola do Centro Espacial Kennedy com a Orion e quatro astronautas. O estágio superior não manda a nave direto para a Lua: primeiro a deixa numa órbita alta e muito alongada em torno da Terra (HEO), com perigeu a 192 km e apogeu a 70 174 km de altitude, onde a tripulação passa cerca de um dia testando os sistemas. Trate a Terra como esfera (teorema da casca, Aula 16) e a nave como partícula: como m_nave ≪ M_⊕, a massa reduzida é a da nave e o foco da elipse é o centro da Terra. Cuidado: as altitudes são medidas da superfície, mas a elipse usa distâncias ao centro. Calcule o semieixo maior, a excentricidade e o período (terceira lei de Kepler, τ² = 4π²a³/GM).",
      dados: [["GM da Terra", "398 600 km³/s²"], ["Raio da Terra R_⊕", "6 371 km"], ["Altitude do perigeu", "192 km"], ["Altitude do apogeu", "70 174 km"]],
      herda: () => [],
      perguntas: [
        { id: "a", texto: "Semieixo maior a = (r_p + r_a)/2, com r = R_⊕ + altitude.", unidade: "km", certo: g.f1.a, tol: 0.01, dica: "r_p = 6 371 + 192 = 6 563 km e r_a = 6 371 + 70 174 = 76 545 km. Somar só as altitudes esquece o raio da Terra nas duas pontas." },
        { id: "eps", texto: "Excentricidade ε = (r_a − r_p)/(r_a + r_p).", unidade: "(adimensional)", certo: g.f1.eps, tol: 0.02, dica: "Use os raios (do centro da Terra), não as altitudes. Deve dar entre 0,8 e 0,9: elipse muito alongada." },
        { id: "tau", texto: "Período τ = 2π√(a³/GM).", unidade: "h", certo: g.f1.tauH, tol: 0.02, dica: "Com a em km e GM em km³/s², τ sai em segundos; divida por 3600." }
      ],
      fecho: () => `a = ${km(g.f1.a)} km, ε ≈ ${f(g.f1.eps)} e τ ≈ ${f(g.f1.tauH)} h, contra ${f(R.tauHEO)} h divulgadas: a terceira lei acerta em ${pct(g.f1.tauH, R.tauHEO)}. O resto está no arredondamento das altitudes e nas perturbações que o modelo ignora (achatamento da Terra, Lua, Sol).`
    },
    {
      id: "f2", aula: "Aulas 17 e 19 · Dois corpos, vis-viva", titulo: "Rápida embaixo, lenta em cima",
      narrativa: "A energia da órbita só depende de a (E = −GMm/2a), e a equação vis-viva, v² = GM(2/r − 1/a), dá a rapidez em qualquer ponto. Calcule-a no perigeu e no apogeu. Nesses dois pontos a velocidade é perpendicular ao raio, de modo que o momento angular por unidade de massa é simplesmente ℓ/m = r v. Confira que ele é o mesmo nos dois ápsides: é a lei das áreas, consequência de a força ser central (Aula 17).",
      dados: [["r_p (fase 1)", "6 563 km"], ["r_a (fase 1)", "76 545 km"]],
      herda: () => [["Semieixo a (fase 1)", km(g.f1.a) + " km"], ["Excentricidade ε (fase 1)", f(g.f1.eps)]],
      perguntas: [
        { id: "vp", texto: "Rapidez no perigeu, v_p.", unidade: "km/s", certo: g.f2.vp, tol: 0.01, dica: "v_p = √(GM(2/r_p − 1/a)) com r_p = 6 563 km e a da fase 1. Guarde quatro algarismos: a fase 3 subtrai dele um número próximo." },
        { id: "va", texto: "Rapidez no apogeu, v_a.", unidade: "km/s", certo: g.f2.va, tol: 0.02, dica: "Mesma fórmula com r_a = 76 545 km. Deve ser menor que 1 km/s." },
        { id: "ell", texto: "Momento angular por unidade de massa no perigeu, ℓ/m = r_p v_p.", unidade: "km²/s", certo: g.f2.ell, tol: 0.02, dica: "Produto de 6 563 km pela rapidez no perigeu. Faça também r_a v_a e compare." }
      ],
      fecho: () => `v_p ≈ ${f(g.f2.vp, 4)} km/s e v_a ≈ ${f(g.f2.va)} km/s; ℓ/m ≈ ${f(g.f2.ell / 1e4, 3)}·10⁴ km²/s nos dois ápsides. A razão v_p/v_a = r_a/r_p ≈ ${f(g.f2.vp / g.f2.va, 3)} = (1 + ε)/(1 − ε): a nave passa quase o dia inteiro longe e lenta e atravessa o perigeu como um raio.`
    },
    {
      id: "f3", aula: "Aula 19 · Energia orbital e transferências", titulo: "A injeção translunar",
      narrativa: "2 de abril, 23:49 UTC: no perigeu da órbita alta, o motor principal do módulo europeu de serviço (ESM) acende para a injeção translunar (TLI). Modelo mais simples: uma elipse de transferência com o mesmo perigeu r_p e apogeu na distância média da Lua, D = 384 400 km, ignorando a gravidade lunar até a nave chegar perto. A queima é tangente no perigeu, então só muda a rapidez. Compare com o que custaria partir de uma órbita circular a 192 km.",
      dados: [["Distância média Terra–Lua D", "384 400 km"], ["Perigeu r_p (fase 1)", "6 563 km"]],
      herda: () => [["v_p na órbita alta (fase 2)", f(g.f2.vp, 4) + " km/s"]],
      perguntas: [
        { id: "vTLI", texto: "Rapidez no perigeu da elipse translunar, v_TLI.", unidade: "km/s", certo: g.f3.vTLI, tol: 0.005, dica: "a_T = (r_p + D)/2 ≈ 195 482 km; vis-viva em r_p." },
        { id: "dv", texto: "Incremento de velocidade da injeção a partir da órbita alta, Δv = v_TLI − v_p.", unidade: "km/s", certo: g.f3.dv, tol: 0.05, dica: "Diferença de dois números próximos (≈ 10,93 − 10,58): use quatro algarismos em cada um." },
        { id: "dvc", texto: "Δv que seria necessário a partir de uma órbita circular a 192 km.", unidade: "km/s", certo: g.f3.dvCirc, tol: 0.02, dica: "Na órbita circular v_c = √(GM/r_p) ≈ 7,79 km/s." },
        { id: "porque", tipo: "escolha", texto: "Por que partir da órbita alta poupa tanto o motor da Orion?", opcoes: ["Porque na órbita alta a gravidade é mais fraca e a nave pesa menos durante a queima", "Porque a energia só depende de a, e a órbita alta já tem quase a energia da elipse translunar: o estágio superior pagou essa parte e, no perigeu, a nave já corre a 10,6 km/s", "Porque no perigeu o motor não precisa trabalhar contra a gravidade"], certo: g.f3.porque, erro: "Pense em E = −GMm/2a: quanto falta de energia partindo de cada órbita?", dica: "Compare −GM/2a para a circular (a = 6 563 km), a órbita alta (a = 41 554 km) e a translunar (a ≈ 195 482 km)." }
      ],
      fecho: () => `v_TLI ≈ ${f(g.f3.vTLI, 4)} km/s, Δv ≈ ${f(g.f3.dv)} km/s, contra ${f(g.f3.dvCirc)} km/s a partir da órbita circular. Por unidade de massa, a energia vai de −30,4 (circular) a −4,80 (órbita alta) e −1,02 km²/s² (translunar): o estágio superior entregou quase tudo. E queimar no perigeu, onde a nave é mais rápida, rende o maior ganho de energia por Δv (ΔE/m ≈ v Δv).`
    },
    {
      id: "f4", aula: "Aulas 4 e 9 · Newton e massa variável", titulo: "A queima do motor europeu",
      narrativa: "O sistema fechado é a nave mais o propelente ejetado em dt (Aula 9). Conservando o momento linear desse sistema chega-se a m dv/dt = −u dm/dt + F_ext, com u = I_sp g₀ a velocidade de exaustão relativa à nave. A queima dura minutos e, no perigeu, a gravidade é quase perpendicular à velocidade; despreze-a e integre: Δv = u ln(m₀/m_f) (Tsiolkovsky). Com empuxo F = u|ṁ| constante, a vazão é constante e a duração é t = m_p/|ṁ|. Os valores do motor e da massa são aproximados (catálogo do motor AJ10 e massa divulgada de ≈ 58 000 lb).",
      dados: [["Massa inicial m₀", "≈ 26 300 kg"], ["Empuxo F", "≈ 26,7 kN"], ["Impulso específico I_sp", "≈ 316 s"], ["g₀", "9,80665 m/s²"]],
      herda: () => [["Δv da injeção (fase 3)", f(g.f3.dv, 3) + " km/s"]],
      perguntas: [
        { id: "a0", texto: "Aceleração no início da queima, a₀ = F/m₀ (segunda lei).", unidade: "m/s²", certo: g.f4.a0, tol: 0.02, dica: "F em newtons (26 700 N) dividido por m₀ em kg." },
        { id: "mp", texto: "Massa de propelente consumida, m_p = m₀(1 − e^(−Δv/u)).", unidade: "kg", certo: g.f4.mp, tol: 0.05, dica: "u = 316 × 9,80665 ≈ 3 099 m/s; Δv em m/s (≈ 351 m/s)." },
        { id: "tq", texto: "Duração da queima, t = m_p/|ṁ| com |ṁ| = F/u.", unidade: "s", certo: g.f4.tq, tol: 0.05, dica: "|ṁ| = 26 700/3 099 ≈ 8,6 kg/s." }
      ],
      fecho: () => `a₀ ≈ ${f(g.f4.a0)} m/s² (cerca de 0,1 g, subindo a ${f(D.F / g.f4.mf)} m/s² no fim), m_p ≈ ${f(g.f4.mp / 1000, 2)} t e t ≈ ${f(g.f4.tq)} s, contra ≈ ${R.tQueima} s no voo. A queima real é mais longa porque (i) a nave varre ~30° de órbita durante a queima e o empuxo deixa de ser tangente (perda de queima finita); (ii) a trajetória de retorno livre pede um pouco mais que o Δv mínimo (≈ 0,36 km/s na simulação de três corpos da fase 10); (iii) empuxo, I_sp e massa são aproximados.`
    },
    {
      id: "f5", aula: "Aula 19 · Terceira lei e equação de Kepler", titulo: "Quanto tempo até a Lua?",
      narrativa: "Na elipse de transferência mínima, a nave vai do perigeu ao apogeu, em r = D, em meio período. E se a injeção desse um pouco mais de velocidade, com apogeu em 420 000 km? Aí r = D é atingido antes do apogeu e o tempo vem da equação de Kepler (dada aqui: a Aula 19 obtém o período, não o tempo até um ponto qualquer): r = a(1 − ε cos ψ) e t = (ψ − ε sin ψ)/n, com n = √(GM/a³) e ψ a anomalia excêntrica, em radianos, entre 0 e π.",
      dados: [["Apogeu alternativo", "420 000 km"], ["Perigeu r_p", "6 563 km"]],
      herda: () => [["a_T da elipse mínima (fase 3)", km(g.f3.aT) + " km"], ["v_TLI (fase 3)", f(g.f3.vTLI, 4) + " km/s"]],
      perguntas: [
        { id: "tmin", texto: "Tempo do perigeu até r = D na elipse mínima (meio período).", unidade: "h", certo: g.f5.tMinH, tol: 0.02, dica: "τ_T/2 = π√(a_T³/GM), com a_T da fase 3." },
        { id: "talt", texto: "Tempo do perigeu até r = D com apogeu em 420 000 km.", unidade: "h", certo: g.f5.tAltH, tol: 0.03, dica: "a = (6 563 + 420 000)/2, ε = (420 000 − 6 563)/(420 000 + 6 563) ≈ 0,969. cos ψ = (1 − D/a)/ε dá ψ ≈ 2,55 rad." },
        { id: "porque", tipo: "escolha", texto: "O voo real levou ≈ 95 h da injeção à maior aproximação da Lua. Por que menos que o tempo da elipse mínima?", opcoes: ["A nave partiu um pouco acima da velocidade mínima (apogeu do modelo além de D) e, no fim, a atração da Lua a acelerou", "O motor do ESM ficou ligado durante o cruzeiro, empurrando a nave", "A rotação da Terra arremessou a nave para a frente"], certo: g.f5.porque, erro: "Veja o que alguns metros por segundo a mais no perigeu fazem com o tempo de voo (pergunta 2).", dica: "Perto do apogeu a nave é lentíssima: qualquer energia extra encurta muito essa parte da viagem." }
      ],
      fecho: () => `${f(g.f5.tMinH)} h na elipse mínima e ${f(g.f5.tAltH)} h com apogeu em 420 000 km: só 8 m/s a mais no perigeu (10,936 contra 10,928 km/s) cortam ${f(g.f5.tMinH - g.f5.tAltH, 2)} h, porque perto do apogeu a nave quase para. O voo real levou ≈ ${f(R.tVoo)} h; a simulação de três corpos da fase 10, com a Lua incluída, dá ≈ 90 h.`
    },
    {
      id: "f6", aula: "Aulas 16 e 10 · Campo gravitacional e referenciais", titulo: "Onde a Lua passa a mandar",
      narrativa: "Ao longo da linha Terra–Lua, os campos GM_⊕/r² e GM_L/(D − r)² se igualam num ponto. Mas, para decidir qual corpo comanda a trajetória, a astrodinâmica usa a esfera de influência de Laplace, r_SOI = D(M_L/M_⊕)^(2/5) (fórmula dada). Ela é maior que a distância do ponto de equilíbrio à Lua porque, no referencial da Lua, que cai livremente em direção à Terra (Aula 10), a parte uniforme da atração terrestre se cancela: só a diferença (a maré da Terra) perturba a nave. Por fim, a chegada: no apogeu da elipse mínima a nave anda devagar, no mesmo sentido em que a Lua orbita (v_L ≈ √(GM_⊕/D)); no referencial da Lua, a nave chega com a velocidade relativa v_L − v_apogeu.",
      dados: [["M_L/M_⊕", "0,0123"], ["D", "384 400 km"]],
      herda: () => [["a_T da elipse mínima (fase 3)", km(g.f3.aT) + " km"]],
      perguntas: [
        { id: "req", texto: "Distância do centro da Terra ao ponto onde os dois campos se igualam, r_eq = D/(1 + √(M_L/M_⊕)).", unidade: "km", certo: g.f6.rEq, tol: 0.01, dica: "GM_⊕/r² = GM_L/(D − r)² ⇒ (D − r)/r = √(M_L/M_⊕) ≈ 0,111." },
        { id: "soi", texto: "Raio da esfera de influência da Lua, r_SOI = D(M_L/M_⊕)^(2/5).", unidade: "km", certo: g.f6.rSOI, tol: 0.02, dica: "0,0123^0,4 ≈ 0,172." },
        { id: "vapo", texto: "Rapidez da nave no apogeu da elipse mínima (r = D), no referencial da Terra.", unidade: "km/s", certo: g.f6.vApo, tol: 0.05, dica: "Vis-viva com r = D e a = a_T. É pequena (≈ 0,2 km/s); conserve algarismos em 2/D − 1/a_T." },
        { id: "vrel", texto: "Velocidade da nave relativa à Lua na chegada, v_L − v_apogeu.", unidade: "km/s", certo: g.f6.vRel, tol: 0.03, dica: "v_L = √(398 600/384 400) ≈ 1,018 km/s." }
      ],
      fecho: () => `r_eq ≈ ${km(g.f6.rEq)} km, ou seja, ${km(g.f6.dLua)} km da Lua; r_SOI ≈ ${km(g.f6.rSOI)} km. No referencial da Lua a nave chega a ≈ ${f(g.f6.vRel)} km/s: é a Lua que alcança a nave. Esse é o v∞ estimado do sobrevoo, que a fase 7 vai comparar com os dados do voo.`
    },
    {
      id: "f7", aula: "Aula 18 e complemento da Aula 19 · Potencial efetivo e órbitas abertas", titulo: "O sobrevoo: energia e forma",
      narrativa: "6 de abril, 23:00 UTC: maior aproximação, 6 545 km acima do lado oculto, a 1,403 km/s em relação à Lua; cerca de 40 min sem comunicação, com a Lua entre a nave e a Terra. Dentro da esfera de influência, trate o problema como dois corpos nave–Lua (M_nave ≪ M_L: a Lua é o centro de força). A energia por unidade de massa E/m = v²/2 − GM_L/r decide a cônica: no diagrama do potencial efetivo (Aula 18), E > 0 não tem ponto de retorno externo. Calcule-a no perilúnio, depois a velocidade “no infinito” relativa à Lua, v∞ (E/m = v∞²/2), e a excentricidade ε = 1 + r_p v∞²/GM_L.",
      dados: [["GM da Lua", "4 902,8 km³/s²"], ["Raio da Lua", "1 737,4 km"], ["Altitude do perilúnio", "6 545 km"], ["Rapidez no perilúnio (rel. à Lua)", "1,403 km/s"]],
      herda: () => [["v relativa estimada (fase 6)", f(g.f6.vRel) + " km/s"], ["r_SOI (fase 6)", km(g.f6.rSOI) + " km"]],
      perguntas: [
        { id: "E", texto: "Energia por unidade de massa relativa à Lua no perilúnio, E/m = v_p²/2 − GM_L/r_p.", unidade: "km²/s²", certo: g.f7.E, tol: 0.03, dica: "r_p = 1 737,4 + 6 545 = 8 282,4 km (do centro da Lua)." },
        { id: "conica", tipo: "escolha", texto: "Que cônica a nave descreve em relação à Lua?", opcoes: ["Elipse: a Lua capturou a nave", "Parábola: energia exatamente nula", "Hipérbole: E > 0, a nave passa e vai embora"], certo: g.f7.conica, erro: "Olhe o sinal de E/m.", dica: "E < 0 elipse, E = 0 parábola, E > 0 hipérbole." },
        { id: "vinf", texto: "Velocidade no infinito relativa à Lua, v∞ = √(v_p² − 2GM_L/r_p).", unidade: "km/s", certo: g.f7.vinf, tol: 0.03, dica: "É √(2E/m) com o valor da pergunta 1." },
        { id: "eps", texto: "Excentricidade da hipérbole, ε = 1 + r_p v∞²/GM_L.", unidade: "(adimensional)", certo: g.f7.epsH, tol: 0.03, dica: "Vem de r_p = a(ε − 1) com a = GM_L/v∞². Deve ser maior que 1." }
      ],
      fecho: () => `E/m ≈ +${f(g.f7.E)} km²/s² > 0: hipérbole. Sem queima de inserção, a Lua não captura a nave. v∞ ≈ ${f(g.f7.vinf)} km/s, perto da estimativa de ${f(g.f6.vRel)} km/s da fase 6 (a chegada real não foi exatamente pelo apogeu da elipse mínima), e ε ≈ ${f(g.f7.epsH)}. Conferência rápida: atrás do disco lunar a nave percorre ≈ 2R_L a ≈ ${D.vpL.toLocaleString("pt-BR")} km/s, ou seja, 2R_L/v_p ≈ ${Math.round(2 * D.RL / D.vpL / 60)} min, os ~40 min sem comunicação.`
    },
    {
      id: "f8", aula: "Complemento da Aula 19 · Espalhamento", titulo: "A Lua gira a velocidade",
      narrativa: "No complemento da Aula 19, o espalhamento por uma força 1/r² dá sin(θ/2) = 1/ε para o ângulo θ entre as velocidades de chegada e de saída, e b = (k/2E)cot(θ/2). No ramo atrativo vale o mesmo com k = GM_L m: b = (GM_L/v∞²)cot(θ/2), ou, conservando ℓ e E entre o infinito e o perilúnio, b = r_p√(1 + 2GM_L/(r_p v∞²)). A Lua não muda a rapidez relativa; ela gira o vetor velocidade. Calcule também quanto tempo a nave leva do perilúnio até sair da esfera de influência. Na hipérbole, r = a(ε cosh H − 1) e t = (ε sinh H − H)/n, com a = GM_L/v∞² e n = √(GM_L/a³) (equação de Kepler hiperbólica, dada).",
      dados: [["r_p (perilúnio)", "8 282,4 km"]],
      herda: () => [["v∞ (fase 7)", f(g.f7.vinf) + " km/s"], ["ε (fase 7)", f(g.f7.epsH)], ["r_SOI (fase 6)", km(g.f6.rSOI) + " km"]],
      perguntas: [
        { id: "theta", texto: "Ângulo de deflexão θ = 2 arcsen(1/ε).", unidade: "graus", certo: g.f8.thetaGraus, tol: 0.02, dica: "arcsen(1/2,325) ≈ 25,5°; não esqueça o fator 2." },
        { id: "b", texto: "Parâmetro de impacto b.", unidade: "km", certo: g.f8.b, tol: 0.03, dica: "Confira as duas fórmulas: (GM_L/v∞²)cot(θ/2) e r_p√(1 + 2GM_L/(r_p v∞²)). Também vale b v∞ = r_p v_p (ℓ conservado)." },
        { id: "tsoi", texto: "Tempo do perilúnio até r = r_SOI.", unidade: "h", certo: g.f8.tSOIH, tol: 0.03, dica: "a ≈ 6 250 km; cosh H = (r_SOI/a + 1)/ε ≈ 4,98, H ≈ 2,29; n ≈ 1,42·10⁻⁴ s⁻¹." }
      ],
      fecho: () => `θ ≈ ${f(g.f8.thetaGraus)}°, b ≈ ${km(g.f8.b)} km e ${f(g.f8.tSOIH)} h até a fronteira da esfera de influência, contra ${f(R.tSOI)} h no voo (saída em 7/4, 17:25 UTC; diferença de ${pct(g.f8.tSOIH, R.tSOI)}). Girar de ${f(g.f8.thetaGraus, 2)}° a velocidade relativa à Lua muda, no referencial da Terra, a direção e a rapidez da nave: é isso que a põe na rota de volta, sem queima. É a trajetória de retorno livre.`
    },
    {
      id: "f9", aula: "Aulas 16 e 10 · Maré e queda livre", titulo: "A maré no corpo do astronauta",
      narrativa: "Dentro da nave em queda livre, nave e astronauta caem com a mesma aceleração; no referencial da nave (Aula 10) sobra só a diferença entre a atração na cabeça e nos pés. Expandindo g(r) = GM/r² em primeira ordem, Δa ≈ |dg/dr| h = 2GMh/r³: é a aceleração de maré. Compare para um astronauta de 1,80 m alinhado com a direção radial (i) a 192 km da Terra (perigeu da fase 1) e (ii) no perilúnio, devido à Lua (fase 7). Use GM em m³/s² e distâncias em metros.",
      dados: [["Altura do astronauta h", "1,80 m"], ["GM_⊕", "3,986·10¹⁴ m³/s²"], ["GM_L", "4,9028·10¹² m³/s²"]],
      herda: () => [["r_p da órbita alta (fase 1)", km(g.f1.rp) + " km"], ["r_p do perilúnio (fase 7)", f(g.f7.rpL, 5) + " km"]],
      perguntas: [
        { id: "g", texto: "Campo gravitacional da Terra a 192 km de altitude, GM_⊕/r_p².", unidade: "m/s²", certo: g.f9.gLEO, tol: 0.02, dica: "r_p = 6,563·10⁶ m. Deve dar um pouco menos que 9,8 m/s²." },
        { id: "mLEO", texto: "Aceleração de maré cabeça–pés a 192 km, 2GM_⊕h/r_p³.", unidade: "m/s²", certo: g.f9.mareLEO, tol: 0.05, dica: "Da ordem de 10⁻⁶ m/s². Escreva como 5,1e-6." },
        { id: "mLua", texto: "Aceleração de maré devida à Lua no perilúnio, 2GM_L h/r_p³.", unidade: "m/s²", certo: g.f9.mareLua, tol: 0.05, dica: "r_p = 8,2824·10⁶ m; da ordem de 10⁻⁸ m/s²." },
        { id: "flutua", tipo: "escolha", texto: "Então por que o astronauta flutua a 192 km de altitude?", opcoes: ["Porque a 192 km a gravidade da Terra é praticamente nula", "Porque nave e astronauta caem juntos com a mesma aceleração: o piso não empurra o corpo (peso aparente nulo) e só resta a maré, ínfima", "Porque a força centrífuga cancela a gravidade no referencial inercial"], certo: g.f9.flutua, erro: "Compare o g da pergunta 1 com 9,8 m/s², e lembre que no referencial inercial não há força centrífuga.", dica: "Microgravidade é queda livre, não ausência de gravidade (Aula 10)." }
      ],
      fecho: () => `g ≈ ${f(g.f9.gLEO)} m/s² a 192 km (94 % do valor na superfície): a gravidade não sumiu. A maré vale ${f(g.f9.mareLEO, 2)} m/s² ali e ${f(g.f9.mareLua, 2)} m/s² no perilúnio, de 10⁻⁷ a 10⁻⁹ de g. O corpo flutua porque cai junto com a nave. O que muda a fisiologia não é a maré, é a falta do peso aparente: sem ele puxando os fluidos para as pernas, sangue e líquido intersticial se redistribuem em direção ao tórax e à cabeça (rosto inchado, pernas mais finas), e o sistema cardiovascular e os ossos se readaptam.`
    },
    {
      id: "f10", aula: "Aulas 5 e 19 · Energia e escape", titulo: "Volta para casa",
      narrativa: "Depois do sobrevoo a nave cai de volta para a Terra. Modelo: só a Terra, energia conservada (Aula 5, U = −GMm/r), partindo do ponto mais distante, r_max = 406 771 km (recorde: superou os 400 171 km da Apollo 13; tomado do centro da Terra), com velocidade desprezível ali, até a interface de reentrada a 122 km de altitude (400 000 ft). Compare com a velocidade de escape local e calcule a energia cinética que a atmosfera tem de dissipar, com a cápsula de ≈ 9 300 kg (massa na amerrissagem; a da reentrada é próxima).",
      dados: [["r_max", "406 771 km"], ["Altitude da interface", "122 km"], ["Massa da cápsula", "≈ 9 300 kg"]],
      herda: () => [["v_TLI na ida (fase 3)", f(g.f3.vTLI, 4) + " km/s"], ["E/m da elipse de ida (fase 3)", f(-D.GM / (2 * g.f3.aT), 3) + " km²/s²"]],
      perguntas: [
        { id: "vei", texto: "Rapidez na interface de reentrada, v = √(2GM(1/r_EI − 1/r_max)).", unidade: "km/s", certo: g.f10.vEI, tol: 0.01, dica: "r_EI = 6 371 + 122 = 6 493 km." },
        { id: "vesc", texto: "Velocidade de escape na interface, √(2GM/r_EI).", unidade: "km/s", certo: g.f10.vEsc, tol: 0.01, dica: "Mesmo r_EI. Deve sair um pouco acima da resposta anterior." },
        { id: "T", texto: "Energia cinética da cápsula na interface, T = ½mv².", unidade: "J", certo: g.f10.T, tol: 0.05, dica: "v em m/s (≈ 1,1·10⁴ m/s). Escreva como 5,6e11." }
      ],
      fecho: () => `v ≈ ${f(g.f10.vEI, 4)} km/s, contra ${f(R.vEI, 4)} km/s medidos (${pct(g.f10.vEI, R.vEI)}) e ${f(g.f10.vEsc, 4)} km/s de escape: a nave volta com ${f(100 * g.f10.razao, 3)} % da velocidade de escape. Na volta, E/m = −GM/r_max = ${f(-D.GM / D.rMax, 3)} km²/s², quase a da elipse de ida: em relação à Terra, a Lua mudou sobretudo a direção da nave, pouco a energia. A pequena diferença com o medido é plausível: a rapidez máxima divulgada pode ocorrer um pouco abaixo da interface, onde a gravidade ainda acelera a cápsula antes de o arrasto dominar (cair de 122 a ~80 km acrescenta ~35 m/s). T ≈ ${f(g.f10.T, 2)} J, cerca de ${Math.round(g.f10.T / 4.184e9)} t de TNT. A maior parte dessa energia vai para o ar aquecido na onda de choque; o escudo ablativo absorve uma fração pequena, mas suficiente para exigir proteção térmica. A animação mostra o voo inteiro calculado no problema de três corpos.`
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
        msg = v === "" ? "Escolha uma opção." : ok ? "Correto." : (q.erro || "Não é essa a opção.");
      } else {
        const v = P.lerNumero($(nome).value);
        ok = P.confere(v, q.certo, q.tol);
        if (!Number.isFinite(v)) msg = "Digite um número (vírgula ou ponto decimal; 5,1e-6 para notação científica).";
        else if (ok) msg = "Correto.";
        else {
          const razao = v / q.certo;
          if (razao > 8 || razao < 1 / 8) msg = "Ordem de grandeza diferente da esperada. Confira unidades (km ou m, s ou h) e a conversão pedida.";
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
    const tabela = sec("1 · Órbita alta de espera (HEO, 192 × 70 174 km)", [
      ["Semieixo maior · excentricidade", `${km(g.f1.a)} km · ${f(g.f1.eps)}`, "elipse com foco no centro da Terra"],
      ["Período", f(g.f1.tauH) + " h", `real ${f(R.tauHEO)} h (${pct(g.f1.tauH, R.tauHEO)})`],
      ["Rapidez no perigeu · no apogeu", `${f(g.f2.vp, 4)} · ${f(g.f2.va)} km/s`, `ℓ/m = ${f(g.f2.ell / 1e4, 3)}·10⁴ km²/s nos dois ápsides`]
    ]) + sec("2 · Injeção translunar (2/4, 23:49 UTC)", [
      ["Rapidez após a injeção", f(g.f3.vTLI, 4) + " km/s", "elipse com apogeu em D = 384 400 km"],
      ["Δv da órbita alta", f(g.f3.dv) + " km/s", `de órbita circular a 192 km seriam ${f(g.f3.dvCirc)} km/s`],
      ["Propelente · duração da queima", `${f(g.f4.mp / 1000, 2)} t · ${f(g.f4.tq)} s`, `real ≈ ${R.tQueima} s: perda de queima finita, Δv maior, dados aproximados`]
    ]) + sec("3 · Cruzeiro até a Lua", [
      ["Tempo na elipse mínima (τ/2)", f(g.f5.tMinH) + " h", `apogeu em 420 000 km: ${f(g.f5.tAltH)} h`],
      ["Tempo real (injeção → perilúnio)", f(R.tVoo) + " h", "energia acima da mínima e atração final da Lua; 3 corpos: ≈ 90 h"],
      ["Equilíbrio dos campos · esfera de influência", `${km(g.f6.rEq)} · ${km(g.f6.rSOI)} km`, `equilíbrio a ${km(g.f6.dLua)} km da Lua; SOI com raio maior (só a maré terrestre perturba)`]
    ]) + sec("4 · Sobrevoo do lado oculto (6/4, 23:00 UTC; 6 545 km, 1,403 km/s)", [
      ["Energia relativa à Lua · v∞", `+${f(g.f7.E)} km²/s² · ${f(g.f7.vinf)} km/s`, `hipérbole; estimativa pela chegada: ${f(g.f6.vRel)} km/s`],
      ["Excentricidade · deflexão", `${f(g.f7.epsH)} · ${f(g.f8.thetaGraus)}°`, "a Lua gira a velocidade relativa e devolve a nave à Terra"],
      ["Parâmetro de impacto · saída da SOI", `${km(g.f8.b)} km · ${f(g.f8.tSOIH)} h`, `real: saída 7/4, 17:25 UTC, ${f(R.tSOI)} h após o perilúnio`]
    ]) + sec("5 · Tripulação", [
      ["Campo a 192 km de altitude", f(g.f9.gLEO) + " m/s²", "94 % de g: microgravidade é queda livre"],
      ["Maré cabeça–pés (1,80 m)", `${f(g.f9.mareLEO, 2)} · ${f(g.f9.mareLua, 2)} m/s²`, "a 192 km da Terra · no perilúnio (Lua)"]
    ]) + sec("6 · Retorno (r_max = 406 771 km, recorde)", [
      ["Rapidez na interface (122 km)", f(g.f10.vEI, 4) + " km/s", `real ${f(R.vEI, 4)} km/s (${pct(g.f10.vEI, R.vEI)}); escape ${f(g.f10.vEsc, 4)} km/s`],
      ["Energia cinética a dissipar", f(g.f10.T, 2) + " J", `≈ ${Math.round(g.f10.T / 4.184e9)} t de TNT; cápsula de ≈ 9 300 kg`]
    ]);
    return `<section class="laudo" id="laudo">
      <div class="laudo-cab"><div><div class="laudo-titulo">Relatório de trajetória da missão</div><div class="laudo-sub">Mecânica Clássica · Desafio 2 · Artemis II · Aulas 4, 5, 9, 10, 16–19</div></div>
      <div class="laudo-meta">Artemis II · Orion + ESM<br>Voo: 1 a 11 de abril de 2026 (9 d 1 h 32 min)<br>Emitido em ${hoje}</div></div>
      <table class="relatorio"><thead><tr><th>Grandeza</th><th>Modelo</th><th>Comparação com o voo real · interpretação</th></tr></thead><tbody>${tabela}</tbody></table>
      <h4>Conclusões</h4>
      <ol>
        <li>Com cônicas de dois corpos e constantes de livro, o modelo reproduz o voo real em poucos por cento: período da órbita alta (${pct(g.f1.tauH, R.tauHEO)}), duração da queima (${pct(g.f4.tq, R.tQueima)}), saída da esfera de influência (${pct(g.f8.tSOIH, R.tSOI)}) e rapidez de reentrada (${pct(g.f10.vEI, R.vEI)}).</li>
        <li>A órbita alta é o que torna a missão possível com o motor da Orion: a injeção custa ${f(g.f3.dv)} km/s em vez de ${f(g.f3.dvCirc)} km/s, cerca de ${f(g.f4.mp / 1000, 2)} t de propelente.</li>
        <li>O sobrevoo é um espalhamento num potencial atrativo 1/r: com E > 0 a nave não é capturada, e a deflexão de ${f(g.f8.thetaGraus, 2)}° da velocidade relativa à Lua a devolve à Terra sem queima (retorno livre).</li>
        <li>A tripulação está em queda livre o tempo todo; a maré sobre o corpo é de 10⁻⁷ a 10⁻⁹ g. Os efeitos fisiológicos vêm da ausência de peso aparente, não da maré.</li>
        <li>A nave volta com ${f(100 * g.f10.razao, 3)} % da velocidade de escape; a atmosfera dissipa ≈ ${f(g.f10.T, 2)} J. Limites do modelo: a Lua em órbita circular, cônicas emendadas e a fronteira da esfera de influência tratada como nítida.</li>
      </ol>
      <div class="laudo-assin"><label>Analista(s): <input id="analistas" type="text" value="${esc(estado.analistas || "")}" placeholder="nomes da dupla"></label><span>Assinatura: ____________________</span></div>
      <div class="acoes"><button type="button" id="imprimir">Imprimir ou salvar o relatório em PDF</button><span class="msg">Só o relatório vai para a impressão.</span></div>
    </section>`;
  }

  function render() { renderFases(); renderCartao(); }

  $("reiniciar").addEventListener("click", () => {
    estado = { fase: 0, feitas: [], tentativas: {} }; salvar(); render();
  });

  carregar();
  if (!liberada(estado.fase)) estado.fase = estado.feitas.length;
  render();
  /* Exposto só para a verificação automática (fases e gabarito). */
  window.DesafioFases = FASES;
})();
