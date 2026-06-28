"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useQuiz } from "@/context/QuizContext";
import { getRecommendations, buildRedirectUrl } from "@/lib/recommendationEngine";

const REDIRECT_URL = "https://jackie-jeans.vercel.app/";

export default function Home() {
  const { state, dispatch } = useQuiz();
  const heroRef = useRef(null);
  const gridItemsRef = useRef([]);

  const handleManual = () => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_FLOW", payload: "manual" });
  };

  const handleVoice = () => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_FLOW", payload: "voice" });
  };

  const handleRetake = () => {
    dispatch({ type: "RESET" });
  };

  // Check if user has completed the quiz
  const hasCompletedQuiz = state.answers && state.answers.height && state.answers.waist;

  // Calculate recommendation metrics
  const getRecommendation = () => {
    if (!hasCompletedQuiz) return null;

    const answers = state.answers;
    const recommendations = getRecommendations(answers);
    const topPick = recommendations[0] || null;

    if (!topPick) return null;

    const shopUrl = buildRedirectUrl(answers, topPick);

    return {
      size: String(topPick.recommendedSize),
      fit: topPick.name,
      rise: topPick.rise,
      length: `${topPick.recommendedLength} Inseam`,
      shopUrl,
      explanation: `Based on your profile, our models matched you with ${topPick.name} as your top pick with a ${topPick.matchPercent}% match score. ${topPick.description}`,
    };
  };

  const recommendation = getRecommendation();

  // Parallax & Reveal animations
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        heroRef.current.style.transform = `translateX(${x}px) translateY(${y}px) scale(1.05)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-10");
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      });
    }, observerOptions);

    gridItemsRef.current.forEach((el) => {
      if (el) {
        el.classList.add("opacity-0", "translate-y-10", "transition-all", "duration-700", "ease-out");
        observer.observe(el);
      }
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#000000] text-[#e4e2e4] min-h-[100dvh] flex flex-col font-body-md antialiased overflow-x-hidden relative">
      <style jsx global>{`
        body {
          background-color: #000000;
          color: #e4e2e4;
          -webkit-font-smoothing: antialiased;
        }
        .glass-effect {
          backdrop-filter: blur(20px);
          background-color: rgba(0, 0, 0, 0.7);
        }
        .indigo-glow {
          box-shadow: 0 0 40px -10px rgba(125, 163, 202, 0.3);
        }
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
        }
        .hero-gradient {
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.9) 80%,
            #000000 100%
          );
        }
        .stagger-in {
          animation: fadeInUpCustom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fadeInUpCustom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-1 {
          animation-delay: 0.1s;
        }
        .delay-2 {
          animation-delay: 0.2s;
        }
        .delay-3 {
          animation-delay: 0.3s;
        }
      `}</style>

      {/* TopAppBar Component */}
      <header className="fixed top-0 w-full z-50 bg-[#131315]/80 backdrop-blur-xl border-b border-[#2A2A2D]/30">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16">
          <div className="flex items-center">
            <button className="text-[#e4e2e4] hover:text-[#7DA3CA] transition-colors active:scale-95 transition-transform flex items-center justify-center">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-headline-md text-xl tracking-widest text-[#e4e2e4] uppercase font-bold">
              JACKIE JEANS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#e4e2e4] hover:text-[#7DA3CA] transition-colors hidden md:flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-[#e4e2e4] hover:text-[#7DA3CA] transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative min-h-[100dvh] pt-16 pb-16 flex flex-col items-center justify-between w-full">
        {/* Hero Section */}
        <section className="relative w-full flex-1 overflow-hidden flex flex-col justify-end pb-8">
          {/* High-end denim image */}
          <div className="absolute inset-0 z-0 scale-105 transform transition-transform duration-1000 ease-out grayscale">
            <img
              ref={heroRef}
              alt="Premium Denim Hero Image"
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvMnSgQGto_Xv2FN7H0vUguqKK2ZU7x73OyIrr0Iz6bRSVwOB98JAlrmL5QxjEFTmr5dW1pEogpWtIQt2rnVp7SeyQ81zYvOXxXtXN6qYd7BqiyF8QiuAAGGFFI1rWbUqiZZ1sxipVhoQg7Be1qMVsQCr1Tn2caYHin3aSqJLXlie6PDBtbv9jLiQV2E3GwiZeaz1SGbva1qONCZ61WXrqUO32R92WFdwiARz3Ry2fcOqCxxhBtfEfnonUeexQArnXUmp2V8ZNZ_4"
            />
            <div className="absolute inset-0 hero-gradient"></div>
          </div>

          {/* Conditional content based on quiz completion */}
          <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-center md:text-left">
            {hasCompletedQuiz && recommendation ? (
              <div className="max-w-xl space-y-6 animate-[fadeInUpCustom_0.8s_ease_forwards]">
                <div>
                  <span className="font-label-caps text-xs text-[#7DA3CA] uppercase tracking-widest font-mono">
                    YOUR PROFILE CALIBRATED
                  </span>
                  <h2 className="font-display-lg text-3xl md:text-4xl text-[#e4e2e4] uppercase leading-none font-bold mt-2">
                    WE FOUND YOUR FIT.
                  </h2>
                </div>

                {/* Calibrated spec card */}
                <div className="bg-[#131315]/90 border border-[#2A2A2D] rounded-xl p-5 shadow-2xl space-y-4 text-left backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="block text-[9px] text-[#8d919a] uppercase font-mono">
                        RECOMMENDED SIZE
                      </span>
                      <span className="text-sm font-semibold text-white">
                        Size {recommendation.size}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#8d919a] uppercase font-mono">
                        FIT SIHOUETTE
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {recommendation.fit}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#8d919a] uppercase font-mono">
                        WAIST RISE
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {recommendation.rise}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#8d919a] uppercase font-mono">
                        LENGTH INSEAM
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {recommendation.length}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#c3c6d1] border-t border-[#2A2A2D]/55 pt-3 leading-relaxed">
                    {recommendation.explanation}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={recommendation.shopUrl}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#e4e2e4] text-[#000000] font-label-caps text-[10px] rounded-sm hover:bg-[#7DA3CA] hover:text-[#e4e2e4] active:scale-95 transition-all duration-300 uppercase tracking-widest font-bold text-center"
                  >
                    SHOP YOUR FIT NOW
                  </a>
                  <button
                    onClick={handleRetake}
                    className="w-full sm:w-auto px-8 py-3.5 border border-[#e4e2e4] text-[#e4e2e4] font-label-caps text-[10px] rounded-sm hover:border-[#7DA3CA] hover:text-[#7DA3CA] active:scale-95 transition-all duration-300 uppercase tracking-widest font-bold text-center bg-transparent"
                  >
                    RETAKE QUIZ
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl space-y-4">
                <h2 className="font-display-lg text-4xl md:text-5xl stagger-in delay-1 text-[#e4e2e4] drop-shadow-lg uppercase leading-none break-words font-bold">
                  FIND
                  <br />
                  YOUR
                  <br />
                  PERFECT
                  <br />
                  FIT.
                </h2>
                <p className="font-body-lg text-sm stagger-in delay-2 text-[#c3c6d1] max-w-lg mx-auto md:mx-0 font-medium border-l-4 border-[#7DA3CA] pl-4 text-left">
                  A precise, direct assessment to replace the guesswork. We
                  engineer denim for exactly who you are.
                </p>
                <div className="flex flex-col md:flex-row items-center gap-3 pt-2 stagger-in delay-3">
                  <Link
                    href="/quiz"
                    onClick={handleManual}
                    className="w-full md:w-auto px-6 py-3 bg-[#e4e2e4] text-[#000000] font-label-caps text-[10px] rounded-sm hover:bg-[#7DA3CA] hover:text-[#e4e2e4] active:scale-95 transition-all duration-300 uppercase tracking-widest font-bold text-center"
                  >
                    START MANUAL QUIZ
                  </Link>
                  <Link
                    href="/voice"
                    onClick={handleVoice}
                    className="w-full md:w-auto px-6 py-3 border border-[#e4e2e4] text-[#e4e2e4] font-label-caps text-[10px] rounded-sm flex items-center justify-center gap-3 backdrop-blur-sm hover:border-[#7DA3CA] hover:text-[#7DA3CA] active:scale-95 transition-all duration-300 uppercase tracking-widest font-bold text-center"
                  >
                    <span className="material-symbols-outlined text-sm">mic</span>
                    TRY AI STYLING
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Value Propositions (Bento Style) */}
        <section className="w-full bg-[#000000] px-4 md:px-margin-desktop py-4 shrink-0 max-w-container-max mx-auto border-t border-[#2A2A2D]">
          <div className="grid grid-cols-3 gap-2">
            <div
              ref={(el) => (gridItemsRef.current[0] = el)}
              className="p-3 bg-[#1f1f21] rounded-lg border border-[#2A2A2D] flex flex-col items-center text-center gap-2 group hover:border-[#7DA3CA] transition-colors duration-500"
            >
              <div className="w-8 h-8 bg-[#000000] border border-[#2A2A2D] flex items-center justify-center text-[#e4e2e4] group-hover:text-[#7DA3CA] transition-colors duration-500 rounded-sm">
                <span className="material-symbols-outlined text-lg">
                  straighten
                </span>
              </div>
              <h3 className="font-headline-md text-[10px] text-[#e4e2e4] uppercase font-bold break-words leading-tight tracking-wider">
                ENGINEERED
                <br />
                PRECISION
              </h3>
              <p className="font-body-md text-xs text-[#c3c6d1] hidden md:block">
                Our algorithms analyze over 200 data points to find your exact
                match in our catalog. No compromises.
              </p>
            </div>
            <div
              ref={(el) => (gridItemsRef.current[1] = el)}
              className="p-3 bg-[#1f1f21] rounded-lg border border-[#2A2A2D] flex flex-col items-center text-center gap-2 group hover:border-[#7DA3CA] transition-colors duration-500"
            >
              <div className="w-8 h-8 bg-[#000000] border border-[#2A2A2D] flex items-center justify-center text-[#e4e2e4] group-hover:text-[#7DA3CA] transition-colors duration-500 rounded-sm">
                <span className="material-symbols-outlined text-lg">
                  texture
                </span>
              </div>
              <h3 className="font-headline-md text-[10px] text-[#e4e2e4] uppercase font-bold break-words leading-tight tracking-wider">
                RAW
                <br />
                MATERIALS
              </h3>
              <p className="font-body-md text-xs text-[#c3c6d1] hidden md:block">
                Sustainably sourced Japanese selvedge and organic Italian cotton,
                curated for absolute longevity and unyielding aesthetic.
              </p>
            </div>
            <div
              ref={(el) => (gridItemsRef.current[2] = el)}
              className="p-3 bg-[#1f1f21] rounded-lg border border-[#2A2A2D] flex flex-col items-center text-center gap-2 group hover:border-[#7DA3CA] transition-colors duration-500"
            >
              <div className="w-8 h-8 bg-[#000000] border border-[#2A2A2D] flex items-center justify-center text-[#e4e2e4] group-hover:text-[#7DA3CA] transition-colors duration-500 rounded-sm">
                <span className="material-symbols-outlined text-lg">
                  history_edu
                </span>
              </div>
              <h3 className="font-headline-md text-[10px] text-[#e4e2e4] uppercase font-bold break-words leading-tight tracking-wider">
                ICONIC
                <br />
                DESIGN
              </h3>
              <p className="font-body-md text-xs text-[#c3c6d1] hidden md:block">
                Silhouettes that respect traditional heritage. Built to age
                beautifully and define your style.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#000000]/90 backdrop-blur-lg border-t border-[#2A2A2D] rounded-t-xl shadow-lg">
        <div className="flex justify-around items-center h-16 px-4">
          <Link
            href="/quiz"
            onClick={handleManual}
            className="flex flex-col items-center justify-center text-[#e4e2e4] hover:text-[#7DA3CA] rounded-sm w-10 h-10 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">keyboard</span>
          </Link>
          <Link
            href="/voice"
            onClick={handleVoice}
            className="flex flex-col items-center justify-center text-[#e4e2e4] hover:text-[#7DA3CA] w-10 h-10 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">mic</span>
          </Link>
          <a
            href={hasCompletedQuiz && recommendation ? recommendation.shopUrl : "https://jackie-jeans.vercel.app/"}
            target={hasCompletedQuiz && recommendation ? "_self" : "_blank"}
            className="flex flex-col items-center justify-center text-[#e4e2e4] hover:text-[#7DA3CA] w-10 h-10 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">person</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
