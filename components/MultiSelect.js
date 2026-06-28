"use client";

import { useState } from "react";
import styles from "./components.module.css";

export default function MultiSelect({ value = [], onChange, options }) {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (option) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeChip = (option) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className={styles.multiSelectContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="🔍 Search brands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {value.length > 0 && (
        <div className={styles.selectedChips}>
          {value.map((v) => (
            <span key={v} className={styles.chip}>
              {v}
              <button
                className={styles.chipRemove}
                onClick={() => removeChip(v)}
                type="button"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={styles.brandGrid}>
        {filteredOptions.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`${styles.brandOption} ${
                isSelected ? styles.brandOptionSelected : ""
              }`}
              onClick={() => toggleOption(option)}
            >
              <div
                className={`${styles.brandCheckbox} ${
                  isSelected ? styles.brandCheckboxChecked : ""
                }`}
              >
                {isSelected && "✓"}
              </div>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
