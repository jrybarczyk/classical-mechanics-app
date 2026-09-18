/*
 * Motor visual compartilhado — aplicações de Mecânica Clássica
 * Instituto de Biociências de Botucatu / UNESP — Biocomplexity Lab
 *
 * Diferença em relação ao motor de Mecânica Quântica: lá cada aula tinha uma
 * função `drawAulaNN` dentro do próprio motor. Com trinta aulas isso não se
 * sustenta, então aqui a relação é invertida — cada aula declara em `scene.js`
 * um objeto `window.LessonScene`, e este arquivo constrói a interface inteira a
 * partir dessa declaração. O motor não conhece nenhuma aula em particular.
 *
 * Contrato de `window.LessonScene`:
 *
 *   id          identificador curto, por exemplo "aula11"
 *   discipline  "Mecânica Clássica · Aula 11"
 *   title       título da aplicação
 *   subtitle    uma frase com a pergunta central
 *   stations[]  de duas a cinco estações, cada uma com:
 *      id        usado em data-view / data-controls e na URL
 *      tab       rótulo curto da aba (pode conter <br>)
 *      heading   título do bloco de controles
 *      equation  fórmula em texto exibida acima dos controles (opcional)
 *      hint      orientação que diz o que manter fixo (opcional)
 *      controls  lista de 1 a 3 objetos {id,label,min,max,step,value,digits,unit}
 *                onde id ∈ {parameter, secondary, tertiary}
 *      animate   {control:"tertiary", speed:1, wrap:6.283} (opcional)
 *      secondary true para exibir o segundo canvas (opcional)
 *      draw(api, v)   desenha; v = {parameter, secondary, tertiary}
 *      text(v)        devolve os textos do painel direito
 */
function root_draw() {
  const D = (typeof window !== "undefined" && window.LessonDraw) || (typeof globalThis !== "undefined" && globalThis.LessonDraw);
  if (!D) throw new Error("carregue ../_shared/draw.js antes de dashboard.js");
  return D;
}

(function () {
  "use strict";

  const scene = window.LessonScene;
  if (!scene) throw new Error("scene.js precisa definir window.LessonScene antes de dashboard.js");

  const $ = (id) => document.getElementById(id);

  const D = root_draw();
  const { C, fmt } = D;

  /* ------------------------------------------------------------------ */
  /* Estado                                                              */
  /* ------------------------------------------------------------------ */

  const byId = Object.fromEntries(scene.stations.map((s) => [s.id, s]));
  const requested = new URLSearchParams(location.search).get("view");
  let view = byId[requested] ? requested : scene.stations[0].id;
  let playing = false;
  let animation = 0;
  let lastFrame = 0;

  const station = () => byId[view];
  const control = (id) => document.querySelector(`[data-controls="${view}"] [data-role="${id}"]`);
  const value = (id) => {
    const input = control(id);
    return input ? Number(input.value) : 0;
  };
  const values = () => ({ parameter: value("parameter"), secondary: value("secondary"), tertiary: value("tertiary") });

  /* ------------------------------------------------------------------ */
  /* Construção do DOM a partir da declaração                            */
  /* ------------------------------------------------------------------ */

  function buildShell() {
    $("eyebrow").textContent = scene.discipline;
    $("appTitle").textContent = scene.title;
    $("appSubtitle").textContent = scene.subtitle;
    document.title = `${scene.discipline} · ${scene.title}`;

    $("tabs").innerHTML = scene.stations
      .map((s, i) => `<button type="button" role="tab" data-view="${s.id}" aria-selected="${i === 0}"${i === 0 ? ' class="active"' : ""}><b>${String(i + 1).padStart(2, "0")}</b><span>${s.tab}</span></button>`)
      .join("");

    $("controlSections").innerHTML = scene.stations
      .map((s) => {
        const sliders = (s.controls || [])
          .map((c) => {
            const digits = c.digits ?? (Number(c.step) >= 1 ? 0 : 2);
            return `<label><span>${c.label}</span><output data-out="${c.id}"></output>` +
              `<input data-role="${c.id}" data-digits="${digits}" data-unit="${c.unit || ""}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></label>`;
          })
          .join("");
        return `<section class="view-controls" data-controls="${s.id}"><h3>${s.heading}</h3>` +
          (s.equation ? `<p class="equation">${s.equation}</p>` : "") +
          sliders +
          (s.hint ? `<p class="hint">${s.hint}</p>` : "") +
          `</section>`;
      })
      .join("");

    /* Link de salto e segundo canvas, criados aqui para manter o index.html curto. */
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#mainCanvas";
    skip.textContent = "Ir para a visualização";
    document.body.prepend(skip);

    const stage = document.querySelector(".stage");
    const secondary = document.createElement("article");
    secondary.className = "canvas-panel secondary-panel";
    secondary.id = "secondaryPanel";
    secondary.innerHTML =
      '<div class="chart-heading"><div><h2 id="secondaryTitle"></h2><p id="secondarySubtitle"></p></div></div>' +
      '<canvas id="secondaryCanvas" aria-label="Gráfico complementar"></canvas>' +
      '<p id="secondaryCaption" class="caption"></p>';
    stage.append(secondary);

    const bar = document.createElement("div");
    bar.className = "action-bar";
    bar.id = "actionBar";
    $("controlsPanel").append(bar);
  }

  /* ------------------------------------------------------------------ */
  /* Canvas (único ponto desta camada que toca o DOM)                    */
  /* ------------------------------------------------------------------ */

  function canvas(id) {
    const element = $(id);
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const width = element.clientWidth || 900;
    const height = Math.round(width * (id === "mainCanvas" ? 0.5 : 0.32));
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    element.style.height = `${height}px`;
    const ctx = element.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, width, height);
    return { ctx, width, height };
  }

  const api = { ...D, main: null, second: null };

  /* ------------------------------------------------------------------ */
  /* Textos                                                              */
  /* ------------------------------------------------------------------ */

  function renderText(data) {
    const s = (id, text) => { $(id).textContent = text ?? ""; };
    const h = (id, content) => { $(id).innerHTML = content ?? ""; };

    s("statusTitle", data.title);
    s("statusDetail", data.subtitle);
    h("mainTitle", `${data.title || ""}${data.regime ? `<span class="regime" data-tone="${data.regime[1] || "ok"}">${data.regime[0]}</span>` : ""}`);
    s("mainSubtitle", data.subtitle);
    s("caption", data.caption);
    s("prediction", data.prediction);
    h("calculation", data.calculation);
    h("metrics", (data.metrics || []).map((row) => `<div><dt>${row[0]}</dt><dd>${row[1]}</dd></div>`).join(""));
    s("conceptText", data.concept);
    h("prompts", (data.prompts || []).map((p) => `<li>${p}</li>`).join(""));
    h("legend", (data.legend || []).map((item) => `<span><i style="border-color:${item[0]}"></i>${item[1]}</span>`).join(""));

    const hasSecondary = Boolean(station().secondary);
    $("secondaryPanel").hidden = !hasSecondary;
    if (hasSecondary) {
      s("secondaryTitle", data.secondaryTitle);
      s("secondarySubtitle", data.secondarySubtitle);
      s("secondaryCaption", data.secondaryCaption);
    }
  }

  function updateOutputs() {
    document.querySelectorAll(`[data-controls="${view}"] input[data-role]`).forEach((input) => {
      const out = input.closest("label").querySelector("output");
      const digits = Number(input.dataset.digits);
      out.textContent = `${fmt(Number(input.value), digits)}${input.dataset.unit ? ` ${input.dataset.unit}` : ""}`;
    });
  }

  function updateActions() {
    const animate = station().animate;
    $("actionBar").innerHTML = animate
      ? `<button id="playBtn" type="button">${playing ? "❚❚ Pausar" : "▶ Animar"}</button><button id="zeroBtn" class="quiet" type="button">voltar a zero</button>`
      : "";
    if (!animate) return;
    $("playBtn").onclick = togglePlay;
    $("zeroBtn").onclick = () => {
      const input = control(animate.control || "tertiary");
      input.value = animate.from ?? input.min;
      draw();
    };
  }

  function togglePlay() {
    playing = !playing;
    lastFrame = performance.now();
    updateActions();
    if (playing) animation = requestAnimationFrame(tick);
    else cancelAnimationFrame(animation);
  }

  function tick(now) {
    if (!playing) return;
    const animate = station().animate;
    const input = control(animate.control || "tertiary");
    const from = Number(input.min), to = Number(input.max);
    const speed = animate.speed ?? 1;
    let next = Number(input.value) + ((now - lastFrame) * 0.001 * speed * (to - from)) / (animate.period ?? 6);
    if (next > to) next = animate.bounce ? to - (next - to) : from + ((next - to) % (to - from));
    input.value = next;
    lastFrame = now;
    draw();
    animation = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* Ciclo de desenho                                                    */
  /* ------------------------------------------------------------------ */

  function draw() {
    updateOutputs();
    const current = station();
    const v = values();
    const main = canvas("mainCanvas");
    const second = current.secondary ? canvas("secondaryCanvas") : null;
    const bound = { ...api, main, second };
    try {
      current.draw(bound, v);
      renderText(current.text(v, bound) || {});
    } catch (error) {
      console.error(`[${scene.id}/${view}]`, error);
      main.ctx.fillStyle = C.red;
      main.ctx.font = "13px Ubuntu, system-ui, sans-serif";
      main.ctx.fillText("Falha ao desenhar esta estação — ver console.", 24, 34);
    }
  }

  function switchView(next) {
    playing = false;
    cancelAnimationFrame(animation);
    view = next;
    document.querySelectorAll("[data-view]").forEach((button) => {
      const selected = button.dataset.view === view;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    document.querySelectorAll("[data-controls]").forEach((section) => {
      section.classList.toggle("active", section.dataset.controls === view);
    });
    try {
      const url = new URL(location.href);
      url.searchParams.set("view", view);
      history.replaceState(null, "", url);
    } catch (_) { /* file:// não aceita replaceState em alguns navegadores */ }
    updateActions();
    draw();
  }

  function resetAll() {
    playing = false;
    cancelAnimationFrame(animation);
    scene.stations.forEach((s) => {
      (s.controls || []).forEach((c) => {
        const input = document.querySelector(`[data-controls="${s.id}"] [data-role="${c.id}"]`);
        if (input) input.value = c.value;
      });
    });
    updateActions();
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Ligação                                                             */
  /* ------------------------------------------------------------------ */

  buildShell();

  document.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => switchView(button.dataset.view))
  );

  $("tabs").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...document.querySelectorAll("[data-view]")];
    const current = tabs.findIndex((tab) => tab.dataset.view === view);
    const index =
      event.key === "Home" ? 0
        : event.key === "End" ? tabs.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[index].focus();
    switchView(tabs[index].dataset.view);
  });

  document.querySelectorAll("input[data-role]").forEach((input) =>
    input.addEventListener("input", () => { playing = false; updateActions(); draw(); })
  );

  $("resetBtn").addEventListener("click", resetAll);

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 90);
  });

  switchView(view);
})();
