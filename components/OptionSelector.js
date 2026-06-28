"use client";

import styles from "./components.module.css";

export default function OptionSelector({ value, onChange, options }) {
  return (
    <div className={styles.optionsGrid}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            type="button"
            className={`${styles.optionCard} ${
              isSelected ? styles.optionCardSelected : ""
            }`}
            onClick={() => onChange(option)}
          >
            <div
              className={`${styles.optionRadio} ${
                isSelected ? styles.optionRadioSelected : ""
              }`}
            >
              <div
                className={`${styles.optionRadioDot} ${
                  isSelected ? styles.optionRadioDotVisible : ""
                }`}
              />
            </div>
            {option}
          </button>
        );
      })}
    </div>
  );
}
