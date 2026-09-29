/* Aula 4 — leis de Newton e problemas de valor inicial. Funções puras. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LessonPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const G = 9.8;
  const rad = (g) => (g * Math.PI) / 180;

  /** Aceleração de descida no plano rugoso: a = g(senα − μ_k cosα). */
  const inclineAcceleration = (alphaDeg, mu, g = G) => {
    const a = rad(alphaDeg);
    return g * (Math.sin(a) - mu * Math.cos(a));
  };

  /** Normal projetada no eixo perpendicular ao plano. */
  const normalForce = (m, alphaDeg, g = G) => m * g * Math.cos(rad(alphaDeg));

  /** O bloco só desliza a partir do repouso se tanα > μ_s. */
  const slides = (alphaDeg, mu) => Math.tan(rad(alphaDeg)) > mu;

  /**
   * Atrito no plano, como componente ao longo do eixo que aponta plano ACIMA.
   * É sempre positivo: o atrito se opõe ao movimento (μ_k N, se desliza) ou à
   * tendência de movimento (mg senα, se fica em repouso).
   */
  const inclineFriction = (m, alphaDeg, mu, g = G) =>
    slides(alphaDeg, mu) ? mu * normalForce(m, alphaDeg, g) : m * g * Math.sin(rad(alphaDeg));

  /** Ângulo de repouso: onde o deslizamento começa. */
  const reposeAngle = (mu) => (Math.atan(mu) * 180) / Math.PI;

  /** Máquina de Atwood ideal: aceleração e tração. */
  const atwood = (m1, m2, g = G) => ({
    a: (g * (m1 - m2)) / (m1 + m2),
    T: (2 * m1 * m2 * g) / (m1 + m2)
  });

  /* --- tração ortopédica: estática com roldanas e atrito --- */
  /**
   * Roldana ideal (sem massa, sem atrito): a tração vale o peso pendurado em
   * qualquer geometria. A roldana muda a direção da força, não o módulo.
   */
  const pulleyTension = (m, g = G) => m * g;

  /**
   * Resultante de dois segmentos de corda simétricos em torno do eixo de tração,
   * separados por um ângulo θ. As componentes transversais se cancelam e sobra
   * R = 2T cos(θ/2): abrir o ângulo reduz a tração útil sem mudar a tração da corda.
   */
  const slingResultant = (T, thetaDeg) => 2 * T * Math.cos(rad(thetaDeg) / 2);

  /** Ângulo que entrega uma fração dada da tração máxima 2T. */
  const angleForFraction = (fracao) => (2 * Math.acos(Math.min(1, Math.max(0, fracao))) * 180) / Math.PI;

  /** Atrito estático máximo disponível entre o membro e o leito. */
  const frictionLimit = (mMembro, mu, g = G) => mu * mMembro * g;

  /**
   * Na tração de Russell a tipoia do joelho puxa o membro para cima com a mesma
   * tração T da corda, aliviando o apoio no leito: N = mg − T (nunca negativo).
   */
  const liftedNormal = (mMembro, T, g = G) => Math.max(0, mMembro * g - T);

  /** Atrito estático máximo com o joelho suspenso pela tipoia: μ(mg − T). */
  const frictionLimitLifted = (mMembro, mu, T, g = G) => mu * liftedNormal(mMembro, T, g);

  /** O membro escorrega se a tração útil vencer o atrito disponível. */
  const limbSlides = (R, mMembro, mu, g = G) => R > frictionLimit(mMembro, mu, g);

  /**
   * Inclinação da cabeceira que produz contratração pelo próprio peso do paciente:
   * sen β = R/(m g). Devolve NaN quando nem deitar o leito de pé resolveria.
   */
  const counterTractionTilt = (R, mPaciente, g = G) => {
    const s = R / (mPaciente * g);
    return s > 1 ? NaN : (Math.asin(s) * 180) / Math.PI;
  };

  /** Solução do PVI m ẍ = F₀ com x(0)=x₀ e ẋ(0)=v₀. */
  const position = (t, x0, v0, a) => x0 + v0 * t + 0.5 * a * t * t;
  const velocity = (t, v0, a) => v0 + a * t;

  /** Leitura de uma balança dentro de um elevador com aceleração A. */
  const scaleReading = (m, A, g = G) => m * (g + A);

  return { G, rad, inclineAcceleration, normalForce, slides, inclineFriction, reposeAngle, atwood, position, velocity, scaleReading, pulleyTension, slingResultant, angleForFraction, frictionLimit, liftedNormal, frictionLimitLifted, limbSlides, counterTractionTilt };
});
