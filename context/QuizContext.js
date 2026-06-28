"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const QuizContext = createContext(null);

const initialState = {
  answers: {},
  currentStep: 0,
  completed: false,
  flow: null, // 'manual' or 'voice'
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SET_FLOW":
      return { ...state, flow: action.payload };

    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };

    case "SKIP_QUESTION":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: null },
        currentStep: state.currentStep + 1,
      };

    case "NEXT_STEP":
      return { ...state, currentStep: state.currentStep + 1 };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };

    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };

    case "COMPLETE":
      return { ...state, completed: true };

    case "RESET":
      return { ...initialState };

    case "RESTORE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && state.flow) {
      localStorage.setItem(
        "jackieJeansQuiz",
        JSON.stringify({
          answers: state.answers,
          currentStep: state.currentStep,
          flow: state.flow,
        })
      );
    }
  }, [state.answers, state.currentStep, state.flow]);

  // Restore from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jackieJeansQuiz");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: "RESTORE", payload: parsed });
        } catch (e) {
          // Invalid data, ignore
        }
      }
    }
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
