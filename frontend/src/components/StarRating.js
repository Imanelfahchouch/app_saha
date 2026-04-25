import React from 'react';

export default function StarRating({ rating, interactive = false, onChange, size = "md" }) {
  const stars = [1, 2, 3, 4, 5];
  const iconSize = size === "sm" ? "0.8rem" : size === "lg" ? "1.4rem" : "1rem";
  return (
    <div className={interactive ? "interactive-rating" : "star-rating"} style={{ gap: 2 }}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= Math.round(rating) ? "filled" : ""}`}
          style={{ fontSize: iconSize, cursor: interactive ? "pointer" : "default" }}
          onClick={() => interactive && onChange && onChange(s)}
        >
          <i className="bi bi-star-fill" />
        </span>
      ))}
    </div>
  );
}