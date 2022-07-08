import React from "react";
import styles from "./Board.module.scss";

export function Board(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <rect
        width="490"
        height="490"
        rx="0"
        ry="0"
        transform="translate(5 5)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="-245"
        y1="-245"
        x2="245"
        y2="245"
        transform="translate(250 250)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        x1="245"
        y1="-245"
        x2="-245"
        y2="245"
        transform="translate(250 250)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        x1="-245"
        y1="0"
        x2="245"
        y2="0"
        transform="translate(250 250)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        x1="0"
        y1="240"
        x2="0"
        y2="-250"
        transform="translate(250 255)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        id="left"
        x1="0"
        y1="0"
        x2="0"
        y2="495"
        transform="translate(5 2.5)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        id="right"
        x1="495"
        y1="0"
        x2="495"
        y2="495"
        transform="translate(0 2.5)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        id="top"
        x1="0"
        y1="0"
        x2="495"
        y2="0"
        transform="translate(2.5 5)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
      <line
        id="bottom"
        x1="0"
        y1="495"
        x2="495"
        y2="495"
        transform="translate(2.5 0)"
        fill="none"
        stroke="#000"
        strokeWidth="5"
      />
    </svg>
  );
}
