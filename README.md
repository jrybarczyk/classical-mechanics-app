# Mecânica Clássica — aplicações interativas

Laboratórios de apoio à disciplina de Mecânica Clássica do curso de Física
Médica, Instituto de Biociências de Botucatu, UNESP. As aplicações entram no
ar à medida que as aulas acontecem.

Site publicado: <https://jrybarczyk.github.io/classical-mechanics-app/>

| # | Aplicação | Conteúdo |
|---:|---|---|
| 01 | [Aula 1 · Modelos, escalas e dimensões](aula-01-modelos-escalas/) | Reynolds, análise dimensional, tubo de raios X clássico × relativístico, transformação de Galileu e frenagem da ambulância. |
| 02 | [Aula 2 · Vetores, rotações e invariantes](aula-02-vetores-rotacoes/) | Rotação passiva de eixos, produtos escalar e vetorial, identidade BAC−CAB em notação indicial e o mapa das 27 células do símbolo de Levi-Civita. |
| 03 | [Aula 3 · Cinemática em bases móveis](aula-03-cinematica-vetorial/) | Base polar móvel na espiral, decomposição tangencial–normal na parábola, movimento sobre a esfera em coordenadas esféricas e a formiga sobre a bola. |
| 04 | [Aula 4 · Leis de Newton e valor inicial](aula-04-leis-newton/) | Plano inclinado com atrito, máquina de Atwood, família de soluções do problema de valor inicial e tração de Russell. |
| 05 | [Aula 5 · Paisagem de energia potencial](aula-05-energia-potencial/) | Paisagem de energia potencial: pontos de retorno, período por quadratura, linearização, equilíbrio estável, instável e metaestável, queda sobre o quadril e trabalho do coração. |
| 06 | [Aula 6 · Arrasto e velocidade terminal](aula-06-arrasto-sedimentacao/) | Arrasto linear e quadrático, velocidade terminal como atrator, projétil com arrasto pelo método de perturbação, sedimentação de Stokes, aerossóis inalados, centrifugação de sangue e integração numérica. |
| 07 | [Aula 7 · Projéteis com e sem arrasto](aula-07-projeteis/) | Lançamento com arrasto linear, alcance contra ângulo, limite da expansão perturbativa, arrasto em escala micrométrica, a elipse da mancha de sangue, o jato do cateter e o elétron entre placas. |
| 08 | [Aula 8 · Campos, potenciais e conservação](aula-08-campos-conservacao/) | Campo de teste e circulação, o par U = −x²y e F = −∇U, e o movimento de uma carga em campos E e B uniformes. |
| 09 | [Aula 9 · Centro de massa e colisões](aula-09-sistemas-particulas/) | Forças internas contra externas e o centro de massa, coeficiente de restituição, transformação do ângulo entre laboratório e centro de massa, e a colisão frontal como problema de blindagem. |
| 10 | [Aula 10 · Referenciais em rotação](aula-10-referenciais-nao-inerciais/) | Queda livre com desvio de Coriolis na latitude λ, precessão do pêndulo de Foucault com ω sen λ e a troca de g por ω²r na centrífuga. |
| 11 | [Aula 11 · Oscilador harmônico simples](aula-11-oscilador-harmonico/) | Do dado inicial à solução, partição entre energia cinética e potencial ao longo do ciclo, mola, massa e atrito como papéis (elastância e inertância respiratórias) e dois harmônicos perpendiculares. |
| 12 | [Aula 12 · Oscilações amortecidas](aula-12-oscilacoes-amortecidas/) | O discriminante β² − ω₀² e os três regimes, a elipse de fase que vira espiral, e o fator de qualidade Q como parâmetro de projeto. |
| 13 | [Aula 13 · Oscilações forçadas e ressonância](aula-13-ressonancia/) | Resposta estacionária em amplitude e fase, pontos de meia potência e largura de banda, e a distinção entre a ressonância em deslocamento e a em velocidade. |
| 14 | [Aula 14 · Osciladores acoplados e modos normais](aula-14-modos-normais/) | Modos simétrico e antissimétrico, a condição inicial com só uma massa deslocada, e o batimento: o que migra entre as massas e o que não migra. |
| D1 | [Desafio 1 · A amostra de sangue na centrífuga](desafio-01-centrifuga/) | Desafio integrador em dez fases travadas, das Aulas 1 a 10: regime de Reynolds da hemácia, sedimentação de Stokes, o protocolo de 3000 rpm, a normal no fundo do tubo, gravidade efetiva, peso relativo de Coriolis, energia do rotor, desbalanceamento e o laudo final. Cada fase só abre quando a anterior fecha. |

## Como usar

Tudo roda no navegador, sem instalação, sem dependências externas e sem enviar
dados para fora da máquina do usuário. Basta abrir o endereço acima e escolher
a aula. Cada aplicação mantém o mesmo ciclo didático: prever antes de medir,
alterar uma variável por vez, ler a conta aberta e registrar os resultados.

## Sobre este repositório

Esta pasta é **gerada**. As fontes, os testes numéricos, os guias didáticos e o
material de avaliação ficam em um repositório separado, e o conteúdo aqui é
produzido por `make publicar`. Correções devem ser feitas na origem, nunca
diretamente nestes arquivos.

O arquivo `.nojekyll` desativa o Jekyll no GitHub Pages. Sem ele a pasta
`_shared` seria ignorada por começar com sublinhado, e nenhuma aula carregaria.

## Licença

Este material está sob a licença [Creative Commons Atribuição-NãoComercial-
CompartilhaIgual 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br).
Você pode usar, copiar e redistribuir, e também adaptar, desde que dê o crédito
ao autor e ao IB/UNESP, não faça uso comercial e distribua as versões
modificadas sob esta mesma licença, indicando o que mudou. O texto completo
está em [`LICENSE`](LICENSE).

---

Prof. Assoc. José L. Rybarczyk-Filho · Depto. de Biofísica e Farmacologia · IB/UNESP
