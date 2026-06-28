// All height options from 4'10" to 6'2"
const heightOptions = [];
for (let feet = 4; feet <= 6; feet++) {
  const startInch = feet === 4 ? 10 : 0;
  const endInch = feet === 6 ? 2 : 11;
  for (let inch = startInch; inch <= endInch; inch++) {
    heightOptions.push(`${feet}'${inch}"`);
  }
}

// Waist options 24" to 52"
const waistOptions = [];
for (let i = 24; i <= 52; i++) {
  waistOptions.push(`${i}"`);
}

// Hip options 32" to 60"
const hipOptions = [];
for (let i = 32; i <= 60; i++) {
  hipOptions.push(`${i}"`);
}

export const BRANDS = [
  "Levi's",
  "Wrangler",
  "Gap",
  "Old Navy",
  "American Eagle",
  "Madewell",
  "Everlane",
  "AGOLDE",
  "Citizens of Humanity",
  "7 For All Mankind",
  "True Religion",
  "Joe's Jeans",
  "AG Jeans",
  "Frame",
  "Paige",
  "Hudson",
  "DL1961",
  "Rag & Bone",
];

export const BRAND_SIZES = [
  "24", "25", "26", "27", "28", "29", "30", "31", "32",
  "33", "34", "36", "38", "40", "42", "44",
];

export const QUESTIONS = [
  {
    id: "height",
    number: 1,
    question: "What is your height?",
    subtitle: "This helps us recommend the right inseam length.",
    type: "dropdown",
    options: heightOptions,
    required: true,
    voicePrompt: "Let's start with your height. How tall are you?",
    voiceExamples: ["five foot six", "5'10", "five ten"],
  },
  {
    id: "weight",
    number: 2,
    question: "What is your weight?",
    subtitle: "Optional — helps calibrate fit. Feel free to skip.",
    type: "number",
    placeholder: "Enter weight in lbs",
    min: 80,
    max: 400,
    unit: "lbs",
    required: false,
    skippable: true,
    voicePrompt: "What's your weight in pounds? Totally fine to skip this one if you'd rather not say.",
    voiceExamples: ["one fifty", "about 180 pounds", "skip"],
  },
  {
    id: "waist",
    number: 3,
    question: "Waist measurement in inches",
    subtitle: "Measure at the narrowest point of your waist.",
    type: "dropdown",
    options: waistOptions,
    required: true,
    voicePrompt: "What's your waist measurement at the narrowest point, in inches?",
    voiceExamples: ["thirty inches", "32", "about 30"],
  },
  {
    id: "hip",
    number: 4,
    question: "Hip measurement in inches",
    subtitle: "Measure at the fullest point of your hips.",
    type: "dropdown",
    options: hipOptions,
    required: true,
    voicePrompt: "And your hip measurement at the fullest point?",
    voiceExamples: ["thirty-eight inches", "40", "about 36"],
  },
  {
    id: "waistFit",
    number: 5,
    question: "How do you like jeans to fit at the waist?",
    subtitle: "Same size, different feel.",
    type: "select",
    options: ["Snug", "Slightly relaxed", "Relaxed"],
    required: true,
    voicePrompt: "How do you like your jeans to fit at the waist — snug, slightly relaxed, or relaxed?",
    voiceExamples: ["snug", "slightly relaxed", "relaxed"],
  },
  {
    id: "rise",
    number: 6,
    question: "Where should the waistband sit?",
    subtitle: "This helps narrow down your ideal style.",
    type: "select",
    options: ["High rise", "Mid rise", "Low rise"],
    required: true,
    voicePrompt: "Where do you like the waistband to sit — high rise, mid rise, or low rise?",
    voiceExamples: ["high rise", "mid", "low rise"],
  },
  {
    id: "thighFit",
    number: 7,
    question: "How should jeans fit through the thighs?",
    subtitle: "One of the most common fit complaints.",
    type: "select",
    options: ["Fitted", "Relaxed", "Loose"],
    required: true,
    voicePrompt: "How about the thigh fit — do you prefer fitted, relaxed, or loose?",
    voiceExamples: ["fitted", "relaxed", "loose"],
  },
  {
    id: "brands",
    number: 8,
    question: "Which denim brands have you bought before?",
    subtitle: "Select all that apply — this helps calibrate sizing.",
    type: "multiselect",
    options: BRANDS,
    required: true,
    minSelections: 1,
    voicePrompt: "Which denim brands have you bought before? You can name as many as you'd like.",
    voiceExamples: ["Levi's and Wrangler", "I've worn Gap, Madewell, and AG Jeans"],
  },
  {
    id: "brandSizes",
    number: 9,
    question: "What size did you buy in those brands?",
    subtitle: "Tell us the size you wore — this is our best sizing signal.",
    type: "brandSize",
    required: true,
    dependsOn: "brands",
    voicePrompt: "What size did you usually buy in {brand}?",
    voiceExamples: ["32", "size 28", "I think a 30"],
  },
  {
    id: "frustration",
    number: 10,
    question: "Biggest fit frustration when buying jeans?",
    subtitle: "We'll use this to personalize your recommendation.",
    type: "select",
    options: [
      "Waist gap",
      "Hip tightness",
      "Wrong length",
      "Thigh fit",
      "Rise issues",
      "Other",
    ],
    required: true,
    voicePrompt: "Last one — what's your biggest frustration when buying jeans? Things like waist gap, hip tightness, wrong length, thigh fit, or rise issues?",
    voiceExamples: ["waist gap", "the length is always wrong", "hip tightness"],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

// Helper to get question by ID
export function getQuestionById(id) {
  return QUESTIONS.find((q) => q.id === id);
}

// Validate a single answer
export function validateAnswer(questionId, value) {
  const question = getQuestionById(questionId);
  if (!question) return { valid: false, error: "Unknown question" };

  if (question.skippable && (value === null || value === undefined || value === "")) {
    return { valid: true };
  }

  if (question.required && (value === null || value === undefined || value === "")) {
    return { valid: false, error: "This field is required" };
  }

  if (question.type === "number") {
    const num = Number(value);
    if (isNaN(num)) return { valid: false, error: "Please enter a valid number" };
    if (question.min && num < question.min) return { valid: false, error: `Minimum is ${question.min}` };
    if (question.max && num > question.max) return { valid: false, error: `Maximum is ${question.max}` };
  }

  if (question.type === "multiselect") {
    if (!Array.isArray(value) || value.length < (question.minSelections || 1)) {
      return { valid: false, error: "Please select at least one option" };
    }
  }

  if (question.type === "brandSize") {
    if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
      return { valid: false, error: "Please enter sizes for your selected brands" };
    }
  }

  return { valid: true };
}
