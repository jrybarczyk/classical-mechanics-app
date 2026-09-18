/*
 * Camada de desenho compartilhada — aplicações de Mecânica Clássica
 * Biocomplexity Lab · IB/UNESP
 *
 * Isolada de dashboard.js por dois motivos: mantém o motor focado em DOM e
 * estado, e torna as funções de desenho executáveis fora do navegador, o que
 * permite a verificar.js rodar draw() e text() das trinta aulas em node.
 * Nenhuma função aqui toca o DOM — todas recebem um alvo {ctx, width, height}.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonDraw = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TAU = 2 * Math.PI;

  /* Paleta institucional do Biocomplexity Lab, mais as cores de apoio usadas
     nos gráficos. Não altere as quatro primeiras sem razão de acessibilidade. */
  const C = {
    green: "#619b60", lime: "#83c44e", grayLight: "#aaaaab", gray: "#6f7171",
    red: "#c65c4b", gold: "#e9a23b", blue: "#457b9d", violet: "#7d6199",
    grid: "#dce5dc", ink: "#26312d", paper: "#fbfcfa", muted: "#66726d"
  };

  const fmt = (value, digits = 2) =>
    Number.isFinite(value)
      ? Number(value).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })
      : "—";

  const sci = (value, digits = 2) => {
    if (!Number.isFinite(value) || value === 0) return fmt(value, digits);
    const exp = Math.floor(Math.log10(Math.abs(value)));
    if (exp >= -2 && exp < 4) return fmt(value, digits);
    return `${fmt(value / Math.pow(10, exp), digits)}·10${sup(exp)}`;
  };

  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

  /* ------------------------------------------------------------------ */
  /* Utilidades de desenho                                               */
  /* ------------------------------------------------------------------ */

  /* Constrói um sistema de eixos e devolve o "chart", que carrega os
     mapeamentos X e Y de coordenadas físicas para pixels. */
  function axes(target, xMin, xMax, yMin, yMax, xLabel, yLabel, options = {}) {
    const { ctx, width, height } = target;
    const left = options.left ?? 58;
    const right = width - (options.right ?? 22);
    const top = options.top ?? 24;
    const bottom = height - (options.bottom ?? 42);
    const X = (x) => left + ((x - xMin) * (right - left)) / (xMax - xMin || 1);
    const Y = (y) => bottom - ((y - yMin) * (bottom - top)) / (yMax - yMin || 1);
    const chart = { ctx, width, height, left, right, top, bottom, xMin, xMax, yMin, yMax, X, Y };

    ctx.save();
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = C.gray;
    ctx.font = "11px Ubuntu, system-ui, sans-serif";

    const xTicks = options.xTicks || niceTicks(xMin, xMax, 6);
    const yTicks = options.yTicks || niceTicks(yMin, yMax, 5);

    xTicks.forEach((t) => {
      const px = X(t);
      if (px < left - 0.5 || px > right + 0.5) return;
      ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(options.xFormat ? options.xFormat(t) : trim(t), px, bottom + 7);
    });
    yTicks.forEach((t) => {
      const py = Y(t);
      if (py < top - 0.5 || py > bottom + 0.5) return;
      ctx.beginPath(); ctx.moveTo(left, py); ctx.lineTo(right, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(options.yFormat ? options.yFormat(t) : trim(t), left - 8, py);
    });

    /* Eixos zero destacados quando dentro da janela. */
    ctx.strokeStyle = "#b9c4bb";
    ctx.lineWidth = 1.4;
    if (yMin < 0 && yMax > 0) { ctx.beginPath(); ctx.moveTo(left, Y(0)); ctx.lineTo(right, Y(0)); ctx.stroke(); }
    if (xMin < 0 && xMax > 0) { ctx.beginPath(); ctx.moveTo(X(0), top); ctx.lineTo(X(0), bottom); ctx.stroke(); }

    ctx.strokeStyle = "#98a69b";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();

    ctx.fillStyle = C.muted;
    ctx.font = "600 11px Ubuntu, system-ui, sans-serif";
    ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.fillText(xLabel, right, bottom + 22);
    ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(yLabel, left - 46, top - 6);
    ctx.restore();
    return chart;
  }

  function niceTicks(min, max, count) {
    if (!(max > min)) return [min];
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
    const out = [];
    for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) out.push(Math.abs(t) < step * 1e-9 ? 0 : t);
    return out;
  }

  const trim = (v) => {
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return sci(v, 1);
    return Number(v.toFixed(6)).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
  };

  function clip(chart, draw) {
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.rect(chart.left, chart.top, chart.right - chart.left, chart.bottom - chart.top);
    ctx.clip();
    draw();
    ctx.restore();
  }

  /* points = [[x,y], ...] em coordenadas físicas */
  function line(chart, points, color, dash = [], width = 2.6) {
    if (!points.length) return;
    clip(chart, () => {
      const { ctx } = chart;
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      let pen = false;
      points.forEach((p) => {
        if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) { pen = false; return; }
        const px = chart.X(p[0]), py = chart.Y(p[1]);
        if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        pen = true;
      });
      ctx.stroke(); ctx.setLineDash([]);
    });
  }

  function area(chart, points, color, baseline = 0) {
    if (!points.length) return;
    clip(chart, () => {
      const { ctx } = chart;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(chart.X(points[0][0]), chart.Y(baseline));
      points.forEach((p) => ctx.lineTo(chart.X(p[0]), chart.Y(p[1])));
      ctx.lineTo(chart.X(points[points.length - 1][0]), chart.Y(baseline));
      ctx.closePath(); ctx.fill();
    });
  }

  /* Amostra y = fn(x) e devolve os pares prontos para line/area. */
  function curve(fn, from, to, amount = 260) {
    const out = [];
    for (let i = 0; i <= amount; i += 1) {
      const x = from + ((to - from) * i) / amount;
      out.push([x, fn(x)]);
    }
    return out;
  }

  /* Amostra uma curva paramétrica t → [x,y]. */
  function param(fn, from, to, amount = 320) {
    const out = [];
    for (let i = 0; i <= amount; i += 1) out.push(fn(from + ((to - from) * i) / amount));
    return out;
  }

  function dot(chart, x, y, color, radius = 4.2, hollow = false) {
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.arc(chart.X(x), chart.Y(y), radius, 0, TAU);
    if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = color; ctx.fill(); }
    ctx.restore();
  }

  /* Seta em coordenadas físicas. */
  function arrow(chart, x0, y0, x1, y1, color, width = 2.4, head = 8) {
    vector(chart.ctx, chart.X(x0), chart.Y(y0), chart.X(x1), chart.Y(y1), color, width, head);
  }

  /* Seta em pixels — usada em diagramas livres, sem eixos. */
  function vector(ctx, x0, y0, x1, y1, color, width = 2.4, head = 8) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 1e-6) return;
    const ux = dx / len, uy = dy / len;
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * head * 0.8, y1 - uy * head * 0.8); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * head - uy * head * 0.45, y1 - uy * head + ux * head * 0.45);
    ctx.lineTo(x1 - ux * head + uy * head * 0.45, y1 - uy * head - ux * head * 0.45);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function label(chart, x, y, text, color = C.muted, align = "left", baseline = "bottom", weight = "600") {
    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${weight} 11px Ubuntu, system-ui, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = baseline;
    ctx.fillText(text, chart.X(x), chart.Y(y));
    ctx.restore();
  }

  function hline(chart, y, color, dash = [5, 4], text = "") {
    line(chart, [[chart.xMin, y], [chart.xMax, y]], color, dash, 1.6);
    if (text) label(chart, chart.xMax, y, text, color, "right", "bottom");
  }

  function vline(chart, x, color, dash = [5, 4], text = "") {
    line(chart, [[x, chart.yMin], [x, chart.yMax]], color, dash, 1.6);
    if (text) label(chart, x, chart.yMax, text, color, "center", "top");
  }

  function bars(chart, items, color, options = {}) {
    const { ctx } = chart;
    const step = (chart.right - chart.left) / items.length;
    const pad = options.pad ?? step * 0.22;
    ctx.save();
    items.forEach((item, i) => {
      const v = Array.isArray(item) ? item[1] : item;
      const tone = (Array.isArray(item) && item[2]) || color;
      const x = chart.left + i * step + pad / 2;
      const y0 = chart.Y(0), y1 = chart.Y(v);
      ctx.fillStyle = tone;
      ctx.fillRect(x, Math.min(y0, y1), step - pad, Math.abs(y1 - y0));
      if (Array.isArray(item) && item[0] != null) {
        ctx.fillStyle = C.gray;
        ctx.font = "11px Ubuntu, system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(item[0], x + (step - pad) / 2, chart.bottom + 7);
      }
    });
    ctx.restore();
  }

  /* Mola helicoidal entre dois pontos, em pixels. */
  function spring(ctx, x0, y0, x1, y1, coils = 9, amplitude = 7, color = C.gray, width = 1.6) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 1e-6) return;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const lead = Math.min(12, len * 0.15);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x0, y0);
    const steps = coils * 12;
    for (let i = 0; i <= steps; i += 1) {
      const s = lead + ((len - 2 * lead) * i) / steps;
      const off = Math.sin((i / steps) * coils * TAU) * amplitude;
      ctx.lineTo(x0 + ux * s + nx * off, y0 + uy * s + ny * off);
    }
    ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  }

  /* Hachura de parede/solo, em pixels. */
  function hatch(ctx, x0, y0, x1, y1, color = "#b6c0b7", spacing = 9, depth = 9) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    for (let s = 0; s <= len; s += spacing) {
      const px = x0 + ux * s, py = y0 + uy * s;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - nx * depth - ux * depth * 0.7, py - ny * depth - uy * depth * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  /*
   * Matriz rotulada de valores discretos, no mesmo idioma visual de axes():
   * células com borda de grade, moldura em L, rótulos em 11px.
   * Serve para tabelas de índices — εᵢⱼₖ na Aula 2, {z_a,z_b} na Aula 30 —
   * em que o que importa é ver o padrão inteiro de uma vez, e não uma curva.
   * Devolve a caixa ocupada, para encadear várias lado a lado.
   */
  function matrix(target, opts) {
    const { ctx } = target;
    const rows = opts.rows, cols = opts.cols;
    const cell = opts.cell;
    const x0 = opts.x, y0 = opts.y;
    const valor = opts.value;
    const fmtCell = opts.format || ((v) => trim(v));
    const tom = opts.tone || ((v) => (Math.abs(v) < 1e-9 ? ["#eef2ee", "#9aa79c"] : v > 0 ? ["#dcecd4", C.green] : ["#f6e0da", C.red]));
    const w = cell * cols.length, h = cell * rows.length;

    ctx.save();
    for (let i = 0; i < rows.length; i += 1) {
      for (let j = 0; j < cols.length; j += 1) {
        const v = valor(i, j);
        const [fundo, tinta] = tom(v);
        const x = x0 + j * cell, y = y0 + i * cell;
        ctx.fillStyle = fundo;
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = C.grid;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        ctx.fillStyle = tinta;
        ctx.font = "11px Ubuntu, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fmtCell(v), x + cell / 2, y + cell / 2);
      }
    }
    /* Célula em foco, destacada por moldura e não por cor, para não competir
       com a codificação de sinal do fundo. */
    if (opts.selected) {
      const [si, sj] = opts.selected;
      if (si >= 0 && si < rows.length && sj >= 0 && sj < cols.length) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.2;
        ctx.strokeRect(x0 + sj * cell + 1.1, y0 + si * cell + 1.1, cell - 2.2, cell - 2.2);
      }
    }
    /* Moldura em L, igual à de axes(). */
    ctx.strokeStyle = "#98a69b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h);
    ctx.stroke();

    ctx.font = "11px Ubuntu, system-ui, sans-serif";
    ctx.fillStyle = C.gray;
    rows.forEach((r, i) => {
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(r, x0 - 6, y0 + i * cell + cell / 2);
    });
    cols.forEach((c, j) => {
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(c, x0 + j * cell + cell / 2, y0 + h + 6);
    });
    ctx.fillStyle = C.muted;
    ctx.font = "600 11px Ubuntu, system-ui, sans-serif";
    if (opts.title) {
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(opts.title, x0 + w / 2, y0 - 8);
    }
    if (opts.colLabel) {
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText(opts.colLabel, x0 + w, y0 + h + 20);
    }
    if (opts.rowLabel) {
      ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText(opts.rowLabel, x0 - 34, y0 - 8);
    }
    ctx.restore();
    return { x: x0, y: y0, width: w, height: h, right: x0 + w, bottom: y0 + h };
  }

  /* Campo de direções para retratos de fase. */
  function field(chart, fn, color = "#c3d2c4", cols = 17, rows = 11, scale = 0.62) {
    const { ctx } = chart;
    const dx = (chart.xMax - chart.xMin) / (cols + 1);
    const dy = (chart.yMax - chart.yMin) / (rows + 1);
    const px = ((chart.right - chart.left) / (cols + 1)) * scale;
    for (let i = 1; i <= cols; i += 1) {
      for (let j = 1; j <= rows; j += 1) {
        const x = chart.xMin + i * dx, y = chart.yMin + j * dy;
        const v = fn(x, y);
        const norm = Math.hypot(v[0], v[1]);
        if (!Number.isFinite(norm) || norm < 1e-9) continue;
        const sx = chart.X(x), sy = chart.Y(y);
        const ex = sx + (v[0] / norm) * px, ey = sy - (v[1] / norm) * px;
        vector(ctx, sx, sy, ex, ey, color, 1.1, 4.5);
      }
    }
  }

  return { C, TAU, fmt, sci, sup, axes, line, area, curve, param, dot, arrow, vector, label, hline, vline, bars, spring, hatch, field, matrix, clip, niceTicks };
});
