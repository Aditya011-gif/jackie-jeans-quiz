"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useQuiz } from "@/context/QuizContext";
import {
  getRecommendations,
  buildRedirectUrl,
  getFitSummary,
} from "@/lib/recommendationEngine";

const REDIRECT_URL = "https://jackie-jeans.vercel.app/";
const REDIRECT_DELAY = 15; // seconds

export default function CompletePage() {
  const { state, dispatch } = useQuiz();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [activeCard, setActiveCard] = useState(0);
  const [revealStage, setRevealStage] = useState(0); // 0=calibrating, 1=match, 2=products, 3=ready
  const carouselRef = useRef(null);

  const answers = state.answers || {};
  const recommendations = getRecommendations(answers);
  const topPick = recommendations[0] || null;
  const redirectUrl = topPick
    ? buildRedirectUrl(answers, topPick)
    : REDIRECT_URL;

  // Staggered reveal animation
  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStage(1), 600),
      setTimeout(() => setRevealStage(2), 1400),
      setTimeout(() => setRevealStage(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-redirect countdown (only starts after reveal)
  useEffect(() => {
    if (revealStage < 3) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [revealStage, redirectUrl]);

  const handleRedirect = () => {
    window.location.href = redirectUrl;
  };

  const handleRetake = () => {
    dispatch({ type: "RESET" });
  };

  // Carousel scroll
  const scrollToCard = (index) => {
    setActiveCard(index);
    if (carouselRef.current) {
      const cards = carouselRef.current.children;
      if (cards[index]) {
        cards[index].scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  const fitSummary = getFitSummary(answers);

  // Determine recommended size display
  const getRecommendedSizeLabel = () => {
    if (!answers.waist) return "—";
    const waistNum = parseInt(answers.waist);
    // Cross-reference brand sizes
    if (answers.brandSizes) {
      const sizes = Object.values(answers.brandSizes).map(Number).filter(Boolean);
      if (sizes.length > 0) {
        const avg = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
        // If brand average differs from waist, use the brand average (more accurate)
        if (Math.abs(avg - waistNum) <= 2) return String(avg);
      }
    }
    return String(waistNum);
  };

  return (
    <div className="bg-[#000000] text-[#e4e2e4] min-h-[100dvh] flex flex-col font-body-md antialiased relative overflow-x-hidden">
      <style jsx global>{`
        body {
          background-color: #000000;
          color: #e4e2e4;
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes countPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .shimmer-bar {
          background: linear-gradient(
            90deg,
            rgba(125, 163, 202, 0.1) 0%,
            rgba(125, 163, 202, 0.4) 50%,
            rgba(125, 163, 202, 0.1) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .match-ring {
          background: conic-gradient(
            #7DA3CA var(--match-deg),
            #2A2A2D var(--match-deg)
          );
        }
        .card-shadow {
          box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.8),
                      0 0 0 1px rgba(42, 42, 45, 0.5);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px -12px rgba(125, 163, 202, 0.15),
                      0 0 0 1px rgba(125, 163, 202, 0.3);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Header */}
      <header className="w-full flex items-center justify-center h-16 shrink-0 relative z-10 border-b border-[#2A2A2D]/30">
        <h1 className="font-display-lg-mobile text-[16px] leading-[24px] uppercase tracking-[0.2em] font-bold text-[#e4e2e4] text-center w-full">
          JACKIE JEANS
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center max-w-2xl mx-auto relative z-10 px-4 md:px-6 py-6 pb-32">

        {/* ── Stage 0: Calibrating Animation ─────────────────────────────── */}
        {revealStage === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-2 border-[#7DA3CA] border-t-transparent animate-spin mb-6" />
            <p className="font-label-caps text-xs text-[#7DA3CA] uppercase tracking-widest font-mono animate-pulse">
              CALIBRATING YOUR FIT PROFILE...
            </p>
          </div>
        )}

        {/* ── Stage 1+: Animated Icon + Match Header ─────────────────────── */}
        {revealStage >= 1 && (
          <div className="w-full text-center mb-6" style={{ animation: "fadeInUp 0.6s ease forwards" }}>
            <div className="w-14 h-14 rounded-full bg-[#7DA3CA]/10 border border-[#7DA3CA] flex items-center justify-center text-[#7DA3CA] mx-auto mb-4"
              style={{ animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
              <span className="material-symbols-outlined text-2xl">done_all</span>
            </div>
            <span className="font-label-caps text-[10px] text-[#7DA3CA] uppercase tracking-widest font-mono">
              PROFILE CALIBRATED
            </span>
            <h1 className="font-display-lg text-2xl md:text-3xl text-[#e4e2e4] uppercase tracking-tight font-bold mt-1">
              YOUR PERFECT MATCHES
            </h1>
            <p className="font-body-md text-xs text-[#c3c6d1] max-w-md mx-auto mt-2 leading-relaxed">
              {fitSummary}
            </p>
          </div>
        )}

        {/* ── Stage 1+: Spec Summary Card ────────────────────────────────── */}
        {revealStage >= 1 && (
          <div className="w-full bg-[#131315] border border-[#2A2A2D] rounded-xl p-4 mb-6 card-shadow"
            style={{ animation: "fadeInUp 0.5s ease 0.2s forwards", opacity: 0 }}>
            <h2 className="font-label-caps text-[9px] text-[#8d919a] tracking-widest uppercase font-mono mb-3">
              FIT PROFILE SPEC
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <span className="block text-[9px] text-[#8d919a] uppercase font-mono mb-0.5">SIZE</span>
                <span className="text-base font-bold text-white">{getRecommendedSizeLabel()}</span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] text-[#8d919a] uppercase font-mono mb-0.5">FIT</span>
                <span className="text-xs font-semibold text-white">
                  {answers.thighFit === "Fitted" ? "Slim" : answers.thighFit === "Loose" ? "Relaxed" : "Straight"}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] text-[#8d919a] uppercase font-mono mb-0.5">RISE</span>
                <span className="text-xs font-semibold text-white">
                  {answers.rise ? answers.rise.split(" ")[0] : "Mid"}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] text-[#8d919a] uppercase font-mono mb-0.5">LENGTH</span>
                <span className="text-xs font-semibold text-white">
                  {topPick ? topPick.recommendedLength : "Regular"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Stage 2+: Product Recommendation Cards ─────────────────────── */}
        {revealStage >= 2 && recommendations.length > 0 && (
          <div className="w-full" style={{ animation: "fadeInUp 0.6s ease forwards" }}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-label-caps text-[10px] text-[#e4e2e4] tracking-widest uppercase font-bold">
                RECOMMENDED FOR YOU
              </h2>
              <span className="font-label-caps text-[9px] text-[#8d919a] font-mono">
                {recommendations.length} MATCHES
              </span>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
            >
              {recommendations.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => scrollToCard(index)}
                  className={`flex-shrink-0 w-[280px] snap-center bg-[#131315] border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 card-hover ${
                    activeCard === index
                      ? "border-[#7DA3CA]/60"
                      : "border-[#2A2A2D]"
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease ${0.1 * index}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Product Image */}
                  <div className="relative h-44 bg-[#0e0e10] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center opacity-90"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Match Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm border border-[#2A2A2D] rounded-full px-2.5 py-1">
                      <div
                        className="w-5 h-5 rounded-full match-ring flex items-center justify-center"
                        style={{ "--match-deg": `${(product.matchPercent / 100) * 360}deg` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#131315]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#7DA3CA] font-mono">
                        {product.matchPercent}%
                      </span>
                    </div>
                    {/* Top Pick Label */}
                    {index === 0 && (
                      <div className="absolute top-3 left-3 bg-[#7DA3CA] text-black px-2.5 py-0.5 rounded-full">
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          TOP PICK
                        </span>
                      </div>
                    )}
                    {/* Product Badge */}
                    {product.badge && index !== 0 && (
                      <div className="absolute top-3 left-3 bg-[#1f1f21]/90 border border-[#2A2A2D] text-[#c3c6d1] px-2 py-0.5 rounded-full">
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-display-lg text-sm text-white uppercase font-bold tracking-wide">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-[#8d919a] font-mono uppercase tracking-wider mt-0.5">
                        {product.tagline}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#c3c6d1] leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    {/* Match Reasons */}
                    {product.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.reasons.map((reason, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-[#7DA3CA]/10 text-[#7DA3CA] border border-[#7DA3CA]/20 px-2 py-0.5 rounded-full font-medium"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + Size */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2D]/50">
                      <span className="text-sm font-bold text-white">${product.price}</span>
                      <span className="text-[10px] text-[#8d919a] font-mono">
                        YOUR SIZE: {getRecommendedSizeLabel()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {recommendations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeCard === index
                      ? "bg-[#7DA3CA] w-4"
                      : "bg-[#2A2A2D] hover:bg-[#666669]"
                  }`}
                  aria-label={`Go to product ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Stage 2+: Brand Calibration Section ────────────────────────── */}
        {revealStage >= 2 && answers.brands && answers.brands.length > 0 && (
          <div className="w-full mt-6 bg-[#131315] border border-[#2A2A2D] rounded-xl p-4 card-shadow"
            style={{ animation: "fadeInUp 0.5s ease 0.3s forwards", opacity: 0 }}>
            <h3 className="font-label-caps text-[9px] text-[#8d919a] tracking-widest uppercase font-mono mb-3">
              CROSS-BRAND CALIBRATION
            </h3>
            <div className="flex flex-wrap gap-2">
              {answers.brands.map((brand) => (
                <span
                  key={brand}
                  className="text-[11px] bg-[#1f1f21] border border-[#2A2A2D] text-[#e4e2e4] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  {brand}
                  {answers.brandSizes && answers.brandSizes[brand] && (
                    <span className="text-[#7DA3CA] font-bold">
                      sz {answers.brandSizes[brand]}
                    </span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#666669] mt-3 font-mono">
              Size data from {answers.brands.length} brand{answers.brands.length > 1 ? "s" : ""} used to refine your Jackie Jeans size recommendation.
            </p>
          </div>
        )}

        {/* ── Stage 3: CTA + Auto Redirect ───────────────────────────────── */}
        {revealStage >= 3 && (
          <div className="w-full text-center mt-8 space-y-4"
            style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            <button
              onClick={handleRedirect}
              className="w-full py-4 bg-[#e4e2e4] text-[#000000] hover:bg-[#7DA3CA] hover:text-[#e4e2e4] font-label-caps text-xs rounded-full transition-all duration-300 uppercase tracking-widest font-bold text-center block"
              style={{ boxShadow: "0 0 40px -10px rgba(125, 163, 202, 0.25)" }}
            >
              SHOP YOUR RECOMMENDATIONS
            </button>
            <p className="text-[10px] text-[#666669] font-mono uppercase tracking-wider flex items-center justify-center gap-2">
              <span>Redirecting to Jackie Jeans in</span>
              <span
                className="inline-block text-[#7DA3CA] font-bold text-sm"
                style={{ animation: "countPulse 1s ease infinite" }}
              >
                {countdown}
              </span>
              <span>seconds</span>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#000000]/95 backdrop-blur-lg border-t border-[#2A2A2D] z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            onClick={handleRetake}
            className="font-label-caps text-[10px] text-[#c3c6d1] uppercase tracking-wider hover:text-white transition-colors font-bold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            RETAKE
          </Link>
          <button
            onClick={handleRedirect}
            className="bg-[#7DA3CA] text-black px-5 py-2 rounded-full font-label-caps text-[10px] uppercase tracking-wider font-bold hover:bg-white transition-colors flex items-center gap-1.5"
          >
            SHOP NOW
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
