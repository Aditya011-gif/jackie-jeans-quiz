"use client";

import styles from "./components.module.css";

export default function NumberInput({
  value,
  onChange,
  onSkip,
  placeholder,
  min,
  max,
  unit,
  skippable,
}) {
  return (
    <div className={styles.numberInputContainer}>
      <input
        type="number"
        className={styles.numberInput}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter a number"}
        min={min}
        max={max}
        inputMode="numeric"
      />
      {unit && <div className={styles.unitLabel}>{unit}</div>}
      {skippable && (
        <button className={styles.skipButton} onClick={onSkip} type="button">
          <span>⏭️</span>
          <span>Skip this question</span>
        </button>
      )}
    </div>
  );
}
