"use client";

import styles from "./components.module.css";

export default function DropdownSelect({ value, onChange, options, placeholder }) {
  return (
    <div className={styles.dropdownContainer}>
      <select
        className={styles.dropdown}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder || "Select an option"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className={styles.dropdownArrow}>▾</span>
    </div>
  );
}
