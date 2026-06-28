"use client";

import styles from "./components.module.css";

export default function QuestionCard({ number, total, title, subtitle, children }) {
  return (
    <div className={styles.questionCard} key={`q-${number}`}>
      <div className={styles.questionNumber}>
        Question {number} of {total}
      </div>
      <h2 className={styles.questionTitle}>{title}</h2>
      {subtitle && <p className={styles.questionSubtitle}>{subtitle}</p>}
      {children}
    </div>
  );
}
