"use client";

import styles from "./components.module.css";

export default function QuizProgress({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={styles.progressText}>
        {current} of {total}
      </span>
    </div>
  );
}
