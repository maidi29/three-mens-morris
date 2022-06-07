import React from "react";
import styles from './Stone.module.scss';

export function Stone({color, emoji}: {color?: string, emoji: string}): JSX.Element {
  return (
      <div className={styles.stone}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={styles.octagon}>
              <path {...color && { style: {fill: color}}} d="M24 16.971l-7.029 7.029h-9.942l-7.029-7.029v-9.942l7.029-7.029h9.942l7.029 7.029z"/>
          </svg>
          <div className={styles.emoji}>{emoji}</div>
      </div>

  );
}
