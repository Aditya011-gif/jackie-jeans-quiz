/**
 * AI Conversation Engine for Voice Quiz
 * Scripted conversational logic that maps spoken answers to quiz options
 */

import { QUESTIONS, BRANDS, BRAND_SIZES } from "./quizData";

// Fuzzy matching utilities
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, "")
    .trim();
}

// Parse height from spoken text
function parseHeight(text) {
  const normalized = normalizeText(text);

  // Match patterns like "5 foot 6", "five foot six", "5'6", "five six", "5 6"
  const numberWords = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  };

  // Replace word numbers with digits
  let processed = normalized;
  Object.entries(numberWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, "g"), String(num));
  });

  // Try pattern: X foot/feet Y
  let match = processed.match(/(\d+)\s*(?:foot|feet|ft|')\s*(\d+)/);
  if (match) {
    return `${match[1]}'${match[2]}"`;
  }

  // Try pattern: just two numbers close together (like "5 6" meaning 5'6")
  match = processed.match(/(\d)\s+(\d{1,2})/);
  if (match && parseInt(match[1]) >= 4 && parseInt(match[1]) <= 6) {
    return `${match[1]}'${match[2]}"`;
  }

  return null;
}

// Parse weight from spoken text
function parseWeight(text) {
  const normalized = normalizeText(text);

  // Check for skip intent
  if (
    normalized.includes("skip") ||
    normalized.includes("pass") ||
    normalized.includes("rather not") ||
    normalized.includes("no thanks") ||
    normalized.includes("next")
  ) {
    return "SKIP";
  }

  const numberWords = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
    nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    hundred: 100, fifty: 50,
  };

  let processed = normalized;
  Object.entries(numberWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, "g"), String(num));
  });

  // "about 180 pounds", "one fifty", "180", etc.
  // Handle compound numbers like "1 50" -> 150
  let match = processed.match(/(\d{2,3})/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 80 && num <= 400) return String(num);
  }

  // Handle "1 50" or "2 20" patterns
  match = processed.match(/(\d)\s+(\d{2})/);
  if (match) {
    const combined = parseInt(match[1]) * 100 + parseInt(match[2]);
    if (combined >= 80 && combined <= 400) return String(combined);
  }

  return null;
}

// Parse measurement in inches
function parseMeasurement(text, min, max) {
  const normalized = normalizeText(text);

  const numberWords = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9,
  };

  let processed = normalized;
  Object.entries(numberWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, "g"), String(num));
  });

  // Handle compound spoken numbers like "30 2" -> 32
  let match = processed.match(/(\d{2})\s+(\d)/);
  if (match) {
    const combined = parseInt(match[1]) + parseInt(match[2]);
    if (combined >= min && combined <= max) return `${combined}"`;
  }

  // Simple number
  match = processed.match(/(\d{2,3})/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= min && num <= max) return `${num}"`;
  }

  return null;
}

// Parse fit preference options
function parseOption(text, options) {
  const normalized = normalizeText(text);

  // Direct match
  for (const option of options) {
    if (normalized.includes(normalizeText(option))) {
      return option;
    }
  }

  // Partial matching
  for (const option of options) {
    const words = normalizeText(option).split(" ");
    if (words.some((word) => word.length > 3 && normalized.includes(word))) {
      return option;
    }
  }

  return null;
}

// Parse brands from spoken text (multi-select)
function parseBrands(text) {
  const normalized = normalizeText(text);
  const found = [];

  for (const brand of BRANDS) {
    const brandNorm = normalizeText(brand);
    // Check full brand name
    if (normalized.includes(brandNorm)) {
      found.push(brand);
      continue;
    }
    // Check key words (e.g., "citizens" for "Citizens of Humanity")
    const keyWord = brandNorm.split(" ")[0];
    if (keyWord.length > 3 && normalized.includes(keyWord)) {
      found.push(brand);
    }
  }

  // Handle common aliases
  if (normalized.includes("levis") || normalized.includes("levi")) {
    if (!found.includes("Levi's")) found.push("Levi's");
  }
  if (normalized.includes("ae") || normalized.includes("aeo")) {
    if (!found.includes("American Eagle")) found.push("American Eagle");
  }
  if (normalized.includes("rag") && normalized.includes("bone")) {
    if (!found.includes("Rag & Bone")) found.push("Rag & Bone");
  }
  if (normalized.includes("7 for") || normalized.includes("seven for")) {
    if (!found.includes("7 For All Mankind")) found.push("7 For All Mankind");
  }

  return found;
}

// Parse a jeans size
function parseSize(text) {
  const normalized = normalizeText(text);

  const numberWords = {
    twenty: 20, thirty: 30, forty: 40,
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9,
  };

  let processed = normalized;
  Object.entries(numberWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, "g"), String(num));
  });

  // Handle compound like "30 2" -> 32
  let match = processed.match(/(\d{2})\s+(\d)/);
  if (match) {
    const combined = parseInt(match[1]) + parseInt(match[2]);
    const sizeStr = String(combined);
    if (BRAND_SIZES.includes(sizeStr)) return sizeStr;
  }

  match = processed.match(/(\d{2})/);
  if (match) {
    const sizeStr = match[1];
    if (BRAND_SIZES.includes(sizeStr)) return sizeStr;
  }

  return null;
}

// Conversation state machine
export class ConversationEngine {
  constructor(onAnswerCollected, onComplete) {
    this.questionIndex = 0;
    this.answers = {};
    this.currentBrandIndex = 0;
    this.selectedBrands = [];
    this.brandSizes = {};
    this.askingBrandSize = false;
    this.onAnswerCollected = onAnswerCollected;
    this.onComplete = onComplete;
  }

  getCurrentQuestion() {
    if (this.askingBrandSize) {
      const brand = this.selectedBrands[this.currentBrandIndex];
      return {
        ...QUESTIONS[8], // brandSizes question
        voicePrompt: `What size did you usually wear in ${brand}?`,
        _brand: brand,
      };
    }
    return QUESTIONS[this.questionIndex];
  }

  getGreeting() {
    return "Hey there! I'm your Jackie Jeans fit stylist. I'll ask you a few quick questions to find your perfect fit. Ready? Let's start!";
  }

  getPromptForCurrentQuestion() {
    const q = this.getCurrentQuestion();
    return q.voicePrompt;
  }

  getProgressPercent() {
    // Approximate progress: 10 questions + brand sizes
    const totalSteps = 10 + this.selectedBrands.length;
    const currentStep = this.questionIndex + (this.askingBrandSize ? this.currentBrandIndex : 0);
    return Math.min(Math.round((currentStep / totalSteps) * 100), 100);
  }

  processAnswer(spokenText) {
    const question = this.getCurrentQuestion();

    // Handle brand size sub-questions
    if (this.askingBrandSize) {
      return this._processBrandSize(spokenText);
    }

    switch (question.id) {
      case "height":
        return this._processHeight(spokenText);
      case "weight":
        return this._processWeight(spokenText);
      case "waist":
        return this._processWaist(spokenText);
      case "hip":
        return this._processHip(spokenText);
      case "waistFit":
      case "rise":
      case "thighFit":
      case "frustration":
        return this._processSelectOption(spokenText);
      case "brands":
        return this._processBrands(spokenText);
      default:
        return { success: false, response: "I didn't catch that. Could you try again?" };
    }
  }

  _processHeight(text) {
    const parsed = parseHeight(text);
    if (parsed) {
      this.answers.height = parsed;
      this.onAnswerCollected("height", parsed);
      this.questionIndex++;
      return {
        success: true,
        response: `Got it — ${parsed}. `,
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    return {
      success: false,
      response: "I didn't quite get that. Could you tell me your height? For example, five foot six.",
    };
  }

  _processWeight(text) {
    const parsed = parseWeight(text);
    if (parsed === "SKIP") {
      this.answers.weight = null;
      this.onAnswerCollected("weight", null);
      this.questionIndex++;
      return {
        success: true,
        response: "No problem, we'll skip that. ",
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    if (parsed) {
      this.answers.weight = parsed;
      this.onAnswerCollected("weight", parsed);
      this.questionIndex++;
      return {
        success: true,
        response: `Got it — ${parsed} pounds. `,
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    return {
      success: false,
      response: "Could you tell me your weight in pounds? Or just say 'skip' to move on.",
    };
  }

  _processWaist(text) {
    const parsed = parseMeasurement(text, 24, 52);
    if (parsed) {
      this.answers.waist = parsed;
      this.onAnswerCollected("waist", parsed);
      this.questionIndex++;
      return {
        success: true,
        response: `${parsed} waist — noted. `,
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    return {
      success: false,
      response: "I need your waist measurement in inches, between 24 and 52. What's yours?",
    };
  }

  _processHip(text) {
    const parsed = parseMeasurement(text, 32, 60);
    if (parsed) {
      this.answers.hip = parsed;
      this.onAnswerCollected("hip", parsed);
      this.questionIndex++;
      return {
        success: true,
        response: `${parsed} hips — perfect. `,
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    return {
      success: false,
      response: "I need your hip measurement in inches, between 32 and 60. What's yours?",
    };
  }

  _processSelectOption(text) {
    const question = this.getCurrentQuestion();
    const parsed = parseOption(text, question.options);
    if (parsed) {
      this.answers[question.id] = parsed;
      this.onAnswerCollected(question.id, parsed);
      this.questionIndex++;

      // Check if we've finished all questions
      if (this.questionIndex >= QUESTIONS.length) {
        return {
          success: true,
          response: `${parsed} — great choice! That's all the questions. Let me put your fit profile together.`,
          done: true,
        };
      }

      return {
        success: true,
        response: `${parsed} — great choice! `,
        nextPrompt: this.getPromptForCurrentQuestion(),
      };
    }
    return {
      success: false,
      response: `I didn't catch that. Your options are: ${question.options.join(", ")}. Which one?`,
    };
  }

  _processBrands(text) {
    const parsed = parseBrands(text);
    if (parsed.length > 0) {
      this.answers.brands = parsed;
      this.selectedBrands = parsed;
      this.onAnswerCollected("brands", parsed);

      // Move to brand sizes
      this.questionIndex++;
      this.askingBrandSize = true;
      this.currentBrandIndex = 0;
      this.brandSizes = {};

      const brandList = parsed.length === 1 ? parsed[0] : `${parsed.slice(0, -1).join(", ")} and ${parsed[parsed.length - 1]}`;

      return {
        success: true,
        response: `Nice — ${brandList}. Now let's figure out your sizes. `,
        nextPrompt: `What size did you usually wear in ${parsed[0]}?`,
      };
    }
    return {
      success: false,
      response: "Could you name some denim brands you've bought before? Like Levi's, Gap, Madewell, or any others.",
    };
  }

  _processBrandSize(text) {
    const parsed = parseSize(text);
    const brand = this.selectedBrands[this.currentBrandIndex];

    if (parsed) {
      this.brandSizes[brand] = parsed;
      this.currentBrandIndex++;

      if (this.currentBrandIndex >= this.selectedBrands.length) {
        // Done with brand sizes
        this.askingBrandSize = false;
        this.answers.brandSizes = { ...this.brandSizes };
        this.onAnswerCollected("brandSizes", this.brandSizes);

        // Move to next question (frustration)
        const nextQuestion = QUESTIONS[this.questionIndex];
        if (this.questionIndex < QUESTIONS.length) {
          return {
            success: true,
            response: `Size ${parsed} in ${brand} — got it! `,
            nextPrompt: this.getPromptForCurrentQuestion(),
          };
        } else {
          return {
            success: true,
            response: `Size ${parsed} in ${brand} — perfect! That's everything. Let me put your profile together.`,
            done: true,
          };
        }
      }

      const nextBrand = this.selectedBrands[this.currentBrandIndex];
      return {
        success: true,
        response: `Size ${parsed} in ${brand} — noted. `,
        nextPrompt: `And what about ${nextBrand}?`,
      };
    }

    return {
      success: false,
      response: `What size did you usually buy in ${brand}? Common sizes are 28, 30, 32, 34...`,
    };
  }

  isComplete() {
    return this.questionIndex >= QUESTIONS.length && !this.askingBrandSize;
  }
}
