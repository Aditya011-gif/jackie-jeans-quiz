/**
 * Jackie Jeans Recommendation Engine
 *
 * Matches quiz answers against the Jackie Jeans product catalog to produce
 * personalized recommendations with match scores and explanations.
 */

// ── Jackie Jeans Product Catalog ──────────────────────────────────────────────
// Modeled from the four hero pairs + extended styles visible on the target site.
export const CATALOG = [
  {
    id: "the-standard",
    name: "The Standard",
    tagline: "Mid-rise · Straight · Indigo",
    price: 45,
    badge: "Bestseller",
    fit: "Straight",
    rise: "Mid rise",
    wash: "Indigo",
    lengthOptions: ["Petite", "Regular", "Tall"],
    sizeRange: [26, 42],
    stretch: "Light",
    thighProfile: "Relaxed",
    bestFor: ["Waist gap", "Rise issues"],
    image: "/images/standard.png",
    description: "Our most versatile silhouette. A true straight leg with a mid-rise waistband that sits comfortably at your natural waist. Built for everyday confidence.",
  },
  {
    id: "the-raw",
    name: "The Raw",
    tagline: "High-rise · Skinny · Selvedge",
    price: 60,
    badge: "Limited",
    fit: "Slim",
    rise: "High rise",
    wash: "Selvedge",
    lengthOptions: ["Cropped", "Regular", "Tall"],
    sizeRange: [24, 38],
    stretch: "None",
    thighProfile: "Fitted",
    bestFor: ["Hip tightness", "Thigh fit"],
    image: "/images/raw.png",
    description: "Premium Japanese selvedge denim with zero stretch. A high-rise skinny that hugs every curve. For the denim purist who demands authentic craft.",
  },
  {
    id: "the-relax",
    name: "The Relax",
    tagline: "Low-rise · Relaxed · Stonewash",
    price: 50,
    badge: "New",
    fit: "Relaxed",
    rise: "Low rise",
    wash: "Stonewash",
    lengthOptions: ["Regular", "Tall"],
    sizeRange: [28, 44],
    stretch: "Medium",
    thighProfile: "Loose",
    bestFor: ["Thigh fit", "Hip tightness"],
    image: "/images/relax.png",
    description: "Maximum freedom of movement with a vintage stonewash finish. Low-rise sits on the hips with a relaxed thigh that tapers gently to the ankle.",
  },
  {
    id: "the-black",
    name: "The Black",
    tagline: "Mid-rise · Bootcut · Coated",
    price: 55,
    badge: "Stretch",
    fit: "Straight",
    rise: "Mid rise",
    wash: "Coated",
    lengthOptions: ["Regular", "Tall"],
    sizeRange: [26, 40],
    stretch: "High",
    thighProfile: "Relaxed",
    bestFor: ["Wrong length", "Rise issues"],
    image: "/images/black.png",
    description: "Elevated evening denim with a coated finish that catches the light. High-stretch bootcut gives you sharp lines from waist to hem.",
  },
  {
    id: "the-tapered",
    name: "The Tapered",
    tagline: "High-rise · Slim Tapered · Dark Indigo",
    price: 52,
    badge: "Editor's Pick",
    fit: "Slim",
    rise: "High rise",
    wash: "Dark Indigo",
    lengthOptions: ["Petite", "Regular", "Tall"],
    sizeRange: [24, 40],
    stretch: "Light",
    thighProfile: "Fitted",
    bestFor: ["Waist gap", "Thigh fit"],
    image: "/images/tapered.png",
    description: "A modern slim-tapered silhouette with a high rise that eliminates waist gap. Dark indigo wash ages beautifully over time.",
  },
  {
    id: "the-wide",
    name: "The Wide",
    tagline: "High-rise · Wide Leg · Ecru",
    price: 58,
    badge: "Statement",
    fit: "Relaxed",
    rise: "High rise",
    wash: "Raw Ecru",
    lengthOptions: ["Regular", "Tall"],
    sizeRange: [24, 42],
    stretch: "None",
    thighProfile: "Loose",
    bestFor: ["Hip tightness", "Thigh fit"],
    image: "/images/wide.png",
    description: "Full wide-leg proportions in raw ecru denim. A dramatic silhouette with a high rise that balances volume with structure.",
  },
];

// ── Scoring Weights ───────────────────────────────────────────────────────────
const WEIGHTS = {
  fit: 30,        // Thigh fit preference → product fit/thigh profile
  rise: 25,       // Rise preference → product rise
  size: 20,       // Waist measurement → product size range
  length: 15,     // Height → inseam length
  frustration: 10, // Pain point alignment
};

// ── Fit Mapping ───────────────────────────────────────────────────────────────
// Maps user thigh preference to product thigh profiles with compatibility score
const FIT_COMPAT = {
  Fitted:  { Fitted: 1.0, Relaxed: 0.4, Loose: 0.1 },
  Relaxed: { Fitted: 0.3, Relaxed: 1.0, Loose: 0.6 },
  Loose:   { Fitted: 0.0, Relaxed: 0.5, Loose: 1.0 },
};

// Maps user waist preference to product fit type
const WAIST_FIT_BOOST = {
  Snug:              { Slim: 0.15, Straight: 0.05, Relaxed: -0.1 },
  "Slightly relaxed": { Slim: 0.0,  Straight: 0.15, Relaxed: 0.05 },
  Relaxed:           { Slim: -0.1, Straight: 0.05, Relaxed: 0.15 },
};

// ── Core Recommendation Function ──────────────────────────────────────────────
/**
 * Generate personalized product recommendations from quiz answers.
 *
 * @param {Object} answers - Quiz answers object
 * @returns {Array<Object>} Sorted array of recommendations with scores
 */
export function getRecommendations(answers) {
  if (!answers || !answers.waist) return [];

  const results = CATALOG.map((product) => {
    const scores = {};
    const reasons = [];

    // ── 1. Fit Score (thigh preference match) ─────────────────────────────
    const userThigh = answers.thighFit || "Relaxed";
    const compatMap = FIT_COMPAT[userThigh] || FIT_COMPAT.Relaxed;
    scores.fit = (compatMap[product.thighProfile] || 0.3) * WEIGHTS.fit;

    if (compatMap[product.thighProfile] >= 0.8) {
      reasons.push(`Perfect ${userThigh.toLowerCase()} thigh fit`);
    }

    // Waist fit boost
    const waistPref = answers.waistFit || "Slightly relaxed";
    const waistBoost = WAIST_FIT_BOOST[waistPref];
    if (waistBoost && waistBoost[product.fit] !== undefined) {
      scores.fit += waistBoost[product.fit] * WEIGHTS.fit;
    }

    // ── 2. Rise Score ─────────────────────────────────────────────────────
    const userRise = answers.rise || "Mid rise";
    if (product.rise.toLowerCase() === userRise.toLowerCase()) {
      scores.rise = WEIGHTS.rise;
      reasons.push(`${userRise} matches your preference`);
    } else {
      // Partial credit for adjacent rises
      const riseOrder = ["Low rise", "Mid rise", "High rise"];
      const userIdx = riseOrder.findIndex(
        (r) => r.toLowerCase() === userRise.toLowerCase()
      );
      const prodIdx = riseOrder.findIndex(
        (r) => r.toLowerCase() === product.rise.toLowerCase()
      );
      const distance = Math.abs(userIdx - prodIdx);
      scores.rise = distance === 1 ? WEIGHTS.rise * 0.4 : 0;
    }

    // ── 3. Size Score ─────────────────────────────────────────────────────
    const waistNum = parseInt(answers.waist);
    if (!isNaN(waistNum)) {
      const [minSize, maxSize] = product.sizeRange;
      if (waistNum >= minSize && waistNum <= maxSize) {
        scores.size = WEIGHTS.size;
        reasons.push(`Available in your size (${waistNum})`);
      } else {
        // Distance penalty
        const dist = waistNum < minSize ? minSize - waistNum : waistNum - maxSize;
        scores.size = Math.max(0, WEIGHTS.size * (1 - dist / 6));
      }
    } else {
      scores.size = WEIGHTS.size * 0.5; // neutral if no waist data
    }

    // ── 4. Length Score ───────────────────────────────────────────────────
    let recommendedLength = "Regular";
    if (answers.height) {
      const ftMatch = answers.height.match(/(\d+)'/);
      const inMatch = answers.height.match(/(\d+)"/);
      const ft = ftMatch ? parseInt(ftMatch[1]) : 5;
      const inch = inMatch ? parseInt(inMatch[1]) : 6;
      const totalInches = ft * 12 + inch;

      if (totalInches < 63) recommendedLength = "Petite";
      else if (totalInches >= 63 && totalInches < 65) recommendedLength = "Cropped";
      else if (totalInches >= 70) recommendedLength = "Tall";
    }

    if (product.lengthOptions.includes(recommendedLength)) {
      scores.length = WEIGHTS.length;
      reasons.push(`${recommendedLength} length available`);
    } else {
      scores.length = WEIGHTS.length * 0.3;
    }

    // ── 5. Frustration Score ─────────────────────────────────────────────
    const frustration = answers.frustration;
    if (frustration && product.bestFor.includes(frustration)) {
      scores.frustration = WEIGHTS.frustration;
      reasons.push(`Designed to address ${frustration.toLowerCase()}`);
    } else {
      scores.frustration = WEIGHTS.frustration * 0.2;
    }

    // ── Aggregate ─────────────────────────────────────────────────────────
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPossible = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    const matchPercent = Math.round((totalScore / maxPossible) * 100);

    return {
      ...product,
      matchPercent: Math.min(matchPercent, 99), // Cap at 99% — nothing is perfect
      reasons: reasons.slice(0, 3),
      recommendedSize: waistNum || 30,
      recommendedLength,
      scores,
    };
  });

  // Sort by match percent descending
  results.sort((a, b) => b.matchPercent - a.matchPercent);

  return results;
}

// ── Build Redirect URL ────────────────────────────────────────────────────────
/**
 * Build a deep link URL to the target site with fit profile parameters
 * and hash anchor to the customize section.
 */
export function buildRedirectUrl(answers, topRecommendation) {
  const base = "https://jackie-jeans.vercel.app/";
  const params = new URLSearchParams();

  // Core fit params
  if (answers.waist) params.set("waist", answers.waist.replace('"', ""));
  if (answers.rise) params.set("rise", answers.rise.split(" ")[0]); // Low/Mid/High
  if (answers.height) params.set("height", answers.height);

  // Fit preference
  if (answers.thighFit) {
    const fitMap = { Fitted: "Slim", Relaxed: "Straight", Loose: "Relaxed" };
    params.set("fit", fitMap[answers.thighFit] || "Straight");
  }

  // Length from recommendation
  if (topRecommendation) {
    params.set("length", topRecommendation.recommendedLength);
    params.set("style", topRecommendation.name);
  }

  // Brands for cross-calibration context
  if (answers.brands && answers.brands.length > 0) {
    params.set("brands", answers.brands.join(","));
  }
  if (answers.brandSizes) {
    params.set("brandSizes", JSON.stringify(answers.brandSizes));
  }

  // Frustration context
  if (answers.frustration) {
    params.set("frustration", answers.frustration);
  }

  return `${base}?${params.toString()}#customize`;
}

/**
 * Get a human-readable fit summary sentence.
 */
export function getFitSummary(answers) {
  const parts = [];

  if (answers.height) parts.push(`${answers.height} tall`);
  if (answers.waist) parts.push(`${answers.waist} waist`);
  if (answers.hip) parts.push(`${answers.hip} hip`);

  const prefs = [];
  if (answers.waistFit) prefs.push(`${answers.waistFit.toLowerCase()} waist fit`);
  if (answers.rise) prefs.push(answers.rise.toLowerCase());
  if (answers.thighFit) prefs.push(`${answers.thighFit.toLowerCase()} thigh`);

  let summary = "";
  if (parts.length) summary += `At ${parts.join(", ")}`;
  if (prefs.length) summary += ` preferring a ${prefs.join(", ")}`;
  summary += " — we've matched you to the ideal Jackie Jeans silhouettes.";

  return summary;
}
