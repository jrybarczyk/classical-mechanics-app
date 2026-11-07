/* Aula 10 — referenciais não inerciais. Funções puras.
   O fio condutor é a ordem em ω: Coriolis é O(ω) e centrífuga é O(ω²). É isso
   que justifica desprezar uma e não a outra em cada situação. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;
  const OMEGA_TERRA = 2 * Math.PI / 86164;   // dia sideral, não solar
  const R_TERRA = 6.371e6;
  const rad = (g) => (g * Math.PI) / 180;

  const fallTime = (h, g = G) => Math.sqrt((2 * h) / g);
  const centrifugalRaw = (omega = OMEGA_TERRA) => omega * omega * R_TERRA;

  /**
   * Desvio para leste de um corpo em queda livre.
   * a_C = 2ωgt cosλ ⟹ integrando duas vezes, d = (1/3)ωg t³ cosλ.
   * Não depende do sinal de λ: o desvio é para leste nos dois hemisférios.
   */
  const eastwardDeflection = (h, latDeg, omega = OMEGA_TERRA, g = G) => {
    const t = fallTime(h, g);
    return (1 / 3) * omega * g * t ** 3 * Math.cos(rad(latDeg));
  };

  /** Forma fechada equivalente: (1/3)ω cosλ √(8h³/g). */
  const eastwardClosed = (h, latDeg, omega = OMEGA_TERRA, g = G) =>
    (1 / 3) * omega * Math.cos(rad(latDeg)) * Math.sqrt((8 * h ** 3) / g);

  /**
   * Gravidade efetiva: a centrífuga não produz desvio horizontal porque já está
   * absorvida na definição de vertical local — ela reduz g e inclina o fio de
   * prumo. É esse o efeito físico, e não um arrasto lateral do corpo em queda.
   */
  const effectiveGravity = (latDeg, omega = OMEGA_TERRA, g = G) =>
    g - centrifugalRaw(omega) * Math.cos(rad(latDeg)) ** 2;

  /** Inclinação do fio de prumo em relação ao raio geocêntrico, em graus. */
  const verticalTilt = (latDeg, omega = OMEGA_TERRA, g = G) => {
    const c = centrifugalRaw(omega);
    const num = c * Math.sin(rad(latDeg)) * Math.cos(rad(latDeg));
    return (Math.atan2(num, g - c * Math.cos(rad(latDeg)) ** 2) * 180) / Math.PI;
  };

  /**
   * Comparação de ordens, que é o argumento da aula.
   * Como d ∝ g^{−1/2}, trocar g por g_ef muda o desvio em Δd/d = ½·ω²R cos²λ/g:
   * uma correção genuinamente de ordem ω², contra o desvio de ordem ω.
   */
  const orderComparison = (h, latDeg, omega = OMEGA_TERRA, g = G) => {
    const primeira = eastwardDeflection(h, latDeg, omega, g);
    const comEfetiva = eastwardDeflection(h, latDeg, omega, effectiveGravity(latDeg, omega, g));
    return {
      primeira,
      correcao: Math.abs(comEfetiva - primeira),
      razao: primeira === 0 ? 0 : Math.abs(comEfetiva - primeira) / primeira
    };
  };

  const coriolisToWeight = (v, omega = OMEGA_TERRA, g = G) => (2 * omega * v) / g;

  /** Taxa de precessão do pêndulo de Foucault e período correspondente. */
  const foucaultRate = (latDeg, omega = OMEGA_TERRA) => omega * Math.sin(rad(latDeg));
  const foucaultPeriodHours = (latDeg, omega = OMEGA_TERRA) => {
    const r = Math.abs(foucaultRate(latDeg, omega));
    return r === 0 ? Infinity : (2 * Math.PI) / r / 3600;
  };

  /** Aceleração centrífuga e redução do g aparente no equador. */
  const centrifugal = (omega, r) => omega * omega * r;
  const equatorialReduction = (omega = OMEGA_TERRA, g = G) => centrifugal(omega, R_TERRA) / g;

  const rpmToRad = (rpm) => (rpm * 2 * Math.PI) / 60;
  /** Ganho de uma centrífuga: quantas vezes ω²r supera g. */
  const centrifugeGain = (rpm, r, g = G) => centrifugal(rpmToRad(rpm), r) / g;

  return { G, OMEGA_TERRA, R_TERRA, rad, fallTime, centrifugalRaw, eastwardDeflection, eastwardClosed, effectiveGravity, verticalTilt, orderComparison, coriolisToWeight, foucaultRate, foucaultPeriodHours, centrifugal, equatorialReduction, rpmToRad, centrifugeGain };
});
