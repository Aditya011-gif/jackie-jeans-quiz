"use client";

import { BRAND_SIZES } from "@/lib/quizData";
import styles from "./components.module.css";

export default function BrandSizeEntry({ brands, value = {}, onChange }) {
  const handleSizeChange = (brand, size) => {
    onChange({ ...value, [brand]: size });
  };

  return (
    <div className={styles.brandSizeList}>
      {brands.map((brand, index) => (
        <div
          key={brand}
          className={styles.brandSizeItem}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <span className={styles.brandSizeLabel}>{brand}</span>
          <select
            className={styles.brandSizeSelect}
            value={value[brand] || ""}
            onChange={(e) => handleSizeChange(brand, e.target.value)}
          >
            <option value="" disabled>
              Size
            </option>
            {BRAND_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
