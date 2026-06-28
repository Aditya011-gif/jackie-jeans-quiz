"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuiz } from "@/context/QuizContext";
import { getVoiceEngine } from "@/lib/voiceEngine";
import { ConversationEngine } from "@/lib/aiConversation";
import VoiceShader from "@/components/VoiceShader";

export default function VoicePage() {
  const router = useRouter();
  const { dispatch } = useQuiz();
  const [orbState, setOrbState] = useState("idle"); // idle, listening, speaking, thinking
  const [transcript, setTranscript] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const voiceEngineRef = useRef(null);
  const conversationRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // Set flow
  useEffect(() => {
    dispatch({ type: "SET_FLOW", payload: "voice" });
  }, [dispatch]);

  const addTranscript = useCallback((role, text) => {
    setTranscript((prev) => [...prev, { role, text, id: Date.now() }]);
  }, []);

  const speakAndListen = useCallback(
    async (text) => {
      const engine = voiceEngineRef.current;
      if (!engine) return;

      addTranscript("ai", text);
      setOrbState("speaking");

      await engine.speak(text);

      // Small delay before listening
      await new Promise((r) => setTimeout(r, 400));

      setOrbState("listening");
      engine.startListening();
    },
    [addTranscript]
  );

  // Initialize engines
  useEffect(() => {
    const engine = getVoiceEngine();
    voiceEngineRef.current = engine;

    if (!engine.supported) {
      setVoiceSupported(false);
      return;
    }

    const conversation = new ConversationEngine(
      // onAnswerCollected
      (questionId, value) => {
        dispatch({ type: "SET_ANSWER", questionId, value });
      },
      // onComplete
      () => {
        dispatch({ type: "COMPLETE" });
      }
    );
    conversationRef.current = conversation;

    // Set up voice engine callbacks
    engine.onResult = (text) => {
      setInterimText("");
      addTranscript("user", text);
      setOrbState("thinking");

      // Process the answer
      const result = conversation.processAnswer(text);
      setProgress(conversation.getProgressPercent());

      // Small thinking delay for natural feel
      setTimeout(() => {
        if (result.done) {
          // Quiz complete
          const fullResponse = result.response;
          addTranscript("ai", fullResponse);
          setOrbState("speaking");
          engine.speak(fullResponse).then(() => {
            setOrbState("idle");
            // Navigate to complete
            setTimeout(() => router.push("/complete"), 1500);
          });
        } else if (result.success) {
          const fullResponse = result.response + result.nextPrompt;
          speakAndListen(fullResponse);
        } else {
          speakAndListen(result.response);
        }
      }, 500);
    };

    engine.onInterim = (text) => {
      setInterimText(text);
    };

    engine.onError = (error) => {
      console.error("Voice error:", error);
      if (error === "not-allowed") {
        setVoiceSupported(false);
      }
    };

    engine.onListeningChange = (isListening) => {
      if (isListening) {
        setOrbState("listening");
      }
    };

    engine.onSpeakingChange = (isSpeaking) => {
      if (isSpeaking) {
        setOrbState("speaking");
      }
    };

    return () => {
      engine.destroy();
    };
  }, [dispatch, router, addTranscript, speakAndListen]);

  const handleStart = async () => {
    setStarted(true);
    const conversation = conversationRef.current;

    // Greeting
    const greeting = conversation.getGreeting();
    addTranscript("ai", greeting);
    setOrbState("speaking");

    const engine = voiceEngineRef.current;
    await engine.speak(greeting);

    // Small pause
    await new Promise((r) => setTimeout(r, 600));

    // First question
    const firstPrompt = conversation.getPromptForCurrentQuestion();
    await speakAndListen(firstPrompt);
  };

  const handleTapOrb = () => {
    const engine = voiceEngineRef.current;
    if (!engine) return;

    if (orbState === "listening") {
      engine.stopListening();
    } else if (orbState === "speaking") {
      engine.cancelSpeech();
      setOrbState("listening");
      engine.startListening();
    } else if (orbState === "idle" && started) {
      setOrbState("listening");
      engine.startListening();
    }
  };

  // Determine title text based on state
  const getStylistStatusText = () => {
    if (!started) return "Ready to talk?";
    switch (orbState) {
      case "listening":
        return "I'm listening...";
      case "speaking":
        return "Speaking...";
      case "thinking":
        return "Thinking...";
      default:
        return "Tap to talk";
    }
  };

  if (!voiceSupported) {
    return (
      <div className="bg-black text-[#e4e2e4] min-h-[100dvh] flex flex-col items-center justify-between font-body-md antialiased p-8 relative">
        <header className="w-full flex items-center justify-between h-16 absolute top-0 left-0 px-8">
          <Link
            href="/"
            className="w-12 h-12 flex items-center justify-center text-[#c3c6d1] hover:text-[#7DA3CA] transition-all rounded-full"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </Link>
        </header>
        <main className="flex-1 w-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <h1 className="font-display-lg text-2xl uppercase tracking-wider mb-4 font-bold">
            Voice Not Supported
          </h1>
          <p className="font-body-md text-sm text-[#c3c6d1] leading-relaxed mb-8">
            Your browser does not support speech recognition, or microphone access
            was denied. For the best experience, please use Google Chrome or Apple Safari on mobile/desktop.
          </p>
          <Link
            href="/quiz"
            className="w-full py-4 bg-[#e4e2e4] text-[#000000] font-label-caps text-xs rounded-sm hover:bg-[#7DA3CA] hover:text-[#e4e2e4] transition-all uppercase tracking-widest font-bold text-center"
          >
            Take the Written Fit Quiz
          </Link>
        </main>
      </div>
    );
  }

  // Get last AI utterance
  const lastAITalk = [...transcript].reverse().find((m) => m.role === "ai");
  const lastUserTalk = [...transcript].reverse().find((m) => m.role === "user");

  return (
    <div className="bg-black text-[#e4e2e4] h-screen w-screen flex flex-col items-center justify-between font-body-md antialiased relative overflow-hidden">
      <style jsx global>{`
        body {
          overflow: hidden;
          touch-action: none;
          background-color: #000000;
        }
        .pulse-ring {
          animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          75%,
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-spin-slow {
          animation: spin 25s linear infinite;
        }
      `}</style>

      {/* Top Header */}
      <header className="w-full flex items-center justify-between px-margin-mobile h-16 absolute top-0 left-0 z-50">
        <Link
          href="/"
          aria-label="Close Voice Stylist"
          className="w-12 h-12 flex items-center justify-center text-[#c3c6d1] hover:text-white transition-colors active:scale-90 rounded-full"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </Link>
        {started && (
          <div className="flex-1 max-w-[150px] mx-auto px-4 h-1 bg-[#2A2A2D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7DA3CA] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Immersive Canvas */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-margin-mobile relative z-10">
        {/* Status Heading */}
        <div className="absolute top-[18%] w-full text-center px-margin-mobile transition-all duration-500">
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#e4e2e4] tracking-tighter uppercase font-bold">
            {getStylistStatusText()}
          </h1>
          <p className="font-label-caps text-[10px] text-[#c3c6d1]/70 mt-2 tracking-widest font-mono">
            JACKIE JEANS AI STYLIST
          </p>
        </div>

        {/* Central Voice Visualization Orb */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Ambient Pulsing Rings */}
          {started && (orbState === "listening" || orbState === "speaking") && (
            <>
              <div
                className={`absolute inset-0 bg-[#4a6fa5]/20 rounded-full pulse-ring blur-xl`}
                style={{
                  animationDuration: orbState === "listening" ? "1.8s" : "2.4s",
                }}
              />
              <div
                className={`absolute inset-4 bg-[#4a6fa5]/15 rounded-full pulse-ring blur-md`}
                style={{
                  animationDelay: "0.6s",
                  animationDuration: orbState === "listening" ? "1.8s" : "2.4s",
                }}
              />
            </>
          )}

          {/* Central Microphone Button Anchor */}
          <button
            onClick={started ? handleTapOrb : handleStart}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border ${
              !started
                ? "bg-[#1f1f21] border-[#2A2A2D] hover:border-[#7DA3CA]"
                : orbState === "listening"
                ? "bg-[#4a6fa5]/20 border-[#7DA3CA] scale-105"
                : orbState === "speaking"
                ? "bg-[#7DA3CA]/10 border-[#7DA3CA]"
                : "bg-[#1f1f21] border-[#2A2A2D] opacity-80"
            }`}
          >
            <span
              className={`material-symbols-outlined text-4xl transition-colors duration-300 ${
                orbState === "listening"
                  ? "text-[#7DA3CA]"
                  : orbState === "speaking"
                  ? "text-white"
                  : "text-[#c3c6d1]"
              }`}
            >
              {orbState === "listening" ? "mic" : "hearing"}
            </span>
          </button>

          {/* WebGL Voice Wave Shader */}
          <div className="absolute inset-[-50%] w-[200%] h-[200%] pointer-events-none opacity-80 flex items-center justify-center">
            <VoiceShader active={started && (orbState === "listening" || orbState === "speaking")} />
          </div>
        </div>

        {/* Real-time Transcription/Utterance box */}
        <div className="absolute bottom-[20%] w-full px-margin-mobile max-w-sm mx-auto transition-all duration-300">
          {!started ? (
            <div className="bg-[#131315]/80 backdrop-blur-md border border-[#2A2A2D] rounded-xl p-4 text-center">
              <p className="font-body-md text-xs text-[#c3c6d1]">
                Tap the microphone to speak with our AI stylist, who will guide you to the perfect denim fit.
              </p>
            </div>
          ) : (
            <div className="bg-[#0e0e10]/95 backdrop-blur-lg border border-[#2A2A2D] rounded-xl p-4 text-center shadow-2xl">
              <p className="font-label-caps text-[9px] text-[#c3c6d1] uppercase tracking-wider mb-2 font-mono">
                {orbState === "listening"
                  ? "Listening for your reply"
                  : orbState === "speaking"
                  ? "Stylist Speaking"
                  : "Transcribing"}
              </p>
              <p className="font-body-lg text-sm text-white font-medium italic min-h-[24px]">
                {orbState === "listening"
                  ? interimText
                    ? `"${interimText}"`
                    : lastAITalk
                    ? `"${lastAITalk.text}"`
                    : "Say height..."
                  : orbState === "speaking"
                  ? lastAITalk
                    ? `"${lastAITalk.text}"`
                    : "Hello..."
                  : lastUserTalk
                  ? `"${lastUserTalk.text}"`
                  : "Processing..."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer link to Manual Switch */}
      <footer className="w-full px-margin-mobile pb-8 flex justify-center z-10">
        <Link
          href="/quiz"
          className="font-label-caps text-xs text-[#c3c6d1] uppercase border-b border-[#2A2A2D] hover:text-white hover:border-[#7DA3CA] transition-colors pb-1 font-bold"
        >
          Switch to Manual Quiz
        </Link>
      </footer>

      {/* Ambient background blur circles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1/2 bg-[#4a6fa5]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-1/3 bg-[#000000] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131315]/50 to-black"></div>
      </div>
    </div>
  );
}
