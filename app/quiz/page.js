"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuiz } from "@/context/QuizContext";
import { QUESTIONS, TOTAL_STEPS, validateAnswer } from "@/lib/quizData";

export default function QuizPage() {
  const router = useRouter();
  const { state, dispatch } = useQuiz();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state.flow) {
      dispatch({ type: "SET_FLOW", payload: "manual" });
    }
  }, [state.flow, dispatch]);

  const currentStep = state.currentStep;
  const question = QUESTIONS[currentStep];

  useEffect(() => {
    if (!QUESTIONS[currentStep]) {
      router.push("/complete");
    }
  }, [currentStep, router]);

  if (!question) {
    return null;
  }

  const currentAnswer = state.answers[question.id];

  const handleAnswer = (value) => {
    setError("");
    dispatch({ type: "SET_ANSWER", questionId: question.id, value });
  };

  const handleNext = () => {
    if (question.type === "brandSize") {
      const brands = state.answers.brands || [];
      const sizes = currentAnswer || {};
      const allFilled = brands.every((b) => sizes[b]);
      if (!allFilled) {
        setError("Please select a size for each brand");
        return;
      }
    } else {
      const validation = validateAnswer(question.id, currentAnswer);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    setError("");
    dispatch({ type: "NEXT_STEP" });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setError("");
      dispatch({ type: "PREV_STEP" });
    }
  };

  const handleSkip = () => {
    setError("");
    dispatch({ type: "SKIP_QUESTION", questionId: question.id });
  };

  const canProceed = () => {
    if (question.skippable) return true;
    if (question.type === "brandSize") {
      const brands = state.answers.brands || [];
      const sizes = currentAnswer || {};
      return brands.length > 0 && brands.every((b) => sizes[b]);
    }
    const validation = validateAnswer(question.id, currentAnswer);
    return validation.valid;
  };

  const renderInput = () => {
    switch (question.type) {
      case "dropdown":
        return (
          <div className="relative w-full">
            <select
              className="w-full bg-transparent border-0 border-b border-[#2A2A2D] text-white font-body-lg text-lg py-4 pl-0 pr-10 focus:ring-0 focus:border-[#7DA3CA] transition-colors duration-300"
              value={currentAnswer || ""}
              onChange={(e) => handleAnswer(e.target.value)}
            >
              <option value="" disabled className="bg-[#131315] text-[#666669]">
                Select an option...
              </option>
              {question.options.map((opt) => (
                <option key={opt} value={opt} className="bg-[#131315] text-white">
                  {opt}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#c3c6d1] pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        );

      case "number":
        return (
          <div className="w-full space-y-4">
            <input
              type="number"
              className="w-full bg-transparent border-0 border-b border-[#2A2A2D] text-white font-body-lg text-lg py-4 pl-0 pr-10 focus:ring-0 focus:border-[#7DA3CA] transition-colors duration-300"
              value={currentAnswer || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={question.placeholder || "Enter a number..."}
              min={question.min}
              max={question.max}
              inputMode="numeric"
            />
            {question.skippable && (
              <button
                className="w-full py-3 border-2 border-dashed border-[#2A2A2D] hover:border-[#7DA3CA] text-[#c3c6d1] hover:text-white rounded-md transition-all text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2"
                onClick={handleSkip}
                type="button"
              >
                ⏭️ Skip this step
              </button>
            )}
          </div>
        );

      case "select":
        return (
          <div className="flex flex-col gap-3 w-full">
            {question.options.map((option) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={`w-full py-4 px-6 rounded-lg text-left font-body-md border transition-all duration-300 flex items-center justify-between ${
                    isSelected
                      ? "border-[#7DA3CA] bg-[#7DA3CA]/10 text-white"
                      : "border-[#2A2A2D] bg-[#1f1f21]/30 text-[#c3c6d1] hover:border-[#7DA3CA]/50"
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  <span>{option}</span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#7DA3CA] bg-[#7DA3CA]"
                        : "border-[#666669]"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case "multiselect":
        return (
          <div className="w-full space-y-4">
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-[#2A2A2D] rounded-lg bg-[#1f1f21]/20">
              {question.options.map((option) => {
                const isSelected = (currentAnswer || []).includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`py-2 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                      isSelected
                        ? "bg-[#7DA3CA] text-white"
                        : "bg-[#1f1f21] text-[#c3c6d1] border border-[#2A2A2D] hover:border-[#7DA3CA]"
                    }`}
                    onClick={() => {
                      const prev = currentAnswer || [];
                      if (prev.includes(option)) {
                        handleAnswer(prev.filter((o) => o !== option));
                      } else {
                        handleAnswer([...prev, option]);
                      }
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {(currentAnswer || []).length > 0 && (
              <div className="text-xs text-[#7DA3CA] font-mono">
                Selected: {(currentAnswer || []).join(", ")}
              </div>
            )}
          </div>
        );

      case "brandSize":
        const brands = state.answers.brands || [];
        const sizes = currentAnswer || {};
        return (
          <div className="w-full flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-between border-b border-[#2A2A2D]/50 pb-2"
              >
                <span className="text-sm font-semibold text-[#e4e2e4]">
                  {brand}
                </span>
                <div className="relative w-28">
                  <select
                    className="w-full bg-transparent border-0 border-b border-[#2A2A2D] text-white text-sm py-2 pl-0 pr-8 focus:ring-0 focus:border-[#7DA3CA] transition-colors"
                    value={sizes[brand] || ""}
                    onChange={(e) =>
                      handleAnswer({ ...sizes, [brand]: e.target.value })
                    }
                  >
                    <option value="" disabled className="bg-[#131315] text-[#666669]">
                      Size
                    </option>
                    {[
                      "24", "25", "26", "27", "28", "29", "30", "31", "32",
                      "33", "34", "36", "38", "40", "42", "44",
                    ].map((sz) => (
                      <option key={sz} value={sz} className="bg-[#131315]">
                        {sz}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-xs text-[#c3c6d1] pointer-events-none">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#000000] text-[#e4e2e4] min-h-[100dvh] flex flex-col overflow-hidden antialiased relative">
      <style jsx global>{`
        body {
          background-color: #000000;
          color: #e4e2e4;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="w-full flex items-center justify-center px-margin-mobile h-16 shrink-0 relative z-10">
        <div className="absolute left-margin-mobile top-1/2 -translate-y-1/2">
          <span className="font-label-caps text-xs text-[#c3c6d1] uppercase tracking-widest font-mono">
            {String(question.number).padStart(2, "0")} / {String(TOTAL_STEPS).padStart(2, "0")}
          </span>
        </div>
        <h1 className="font-display-lg-mobile text-[16px] leading-[24px] uppercase tracking-[0.2em] font-bold text-[#e4e2e4] text-center w-full">
          JACKIE JEANS
        </h1>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col px-margin-mobile relative z-0 mt-6 max-w-lg mx-auto w-full">
        {/* Typography Section */}
        <div className="mb-8 mt-2 flex-shrink-0 flex flex-col items-start gap-2 w-full animate-[fadeInUpCustom_0.8s_ease_forwards]">
          <h2 className="font-display-lg text-2xl md:text-3xl text-[#e4e2e4] uppercase leading-tight font-bold">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="font-body-md text-sm text-[#c3c6d1] leading-relaxed">
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Input Section */}
        <div className="w-full flex-shrink-0 animate-[fadeInUpCustom_0.8s_ease_0.1s_forwards]">
          {renderInput()}

          {/* Technical Spec Decorator */}
          <div className="mt-6 flex items-center justify-between opacity-40">
            <span className="font-label-caps text-[10px] text-[#8d919a] font-mono uppercase">
              DATA_INPUT: {question.id.toUpperCase()}
            </span>
            <span className="font-label-caps text-[10px] text-[#8d919a] font-mono">
              REQ: {question.required ? "TRUE" : "FALSE"}
            </span>
          </div>

          {error && (
            <p className="text-red-400 text-xs mt-4 font-mono">{error}</p>
          )}
        </div>

        {/* Spacer to push bottom nav down */}
        <div className="flex-1"></div>

        {/* Background Atmospheric Element */}
        <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#131315]/40 via-[#000000] to-[#000000]"></div>
      </main>

      {/* Bottom Actions */}
      <footer className="w-full pb-8 pt-4 px-margin-mobile flex justify-between items-center shrink-0 border-t border-[#2A2A2D] bg-[#000000]/90 backdrop-blur-md">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="font-label-caps text-xs uppercase tracking-widest text-[#c3c6d1] hover:text-[#e4e2e4] transition-colors flex items-center gap-2 group font-bold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            BACK
          </button>
        ) : (
          <Link
            href="/"
            className="font-label-caps text-xs uppercase tracking-widest text-[#c3c6d1] hover:text-[#e4e2e4] transition-colors flex items-center gap-2 group font-bold"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            HOME
          </Link>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-[#4a6fa5] hover:bg-[#7DA3CA] disabled:bg-[#1f1f21] disabled:text-[#666669] disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-label-caps text-xs uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-[0.98] active:scale-95 font-bold"
          type="button"
        >
          {currentStep === TOTAL_STEPS - 1 ? "FINISH" : "NEXT"}
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </footer>
    </div>
  );
}
