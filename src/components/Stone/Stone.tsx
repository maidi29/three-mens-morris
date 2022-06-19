import React from "react";
import styles from './Stone.module.scss';
import {size} from "lodash-es";

export function Stone({color, emoji, size}: {color?: string, emoji: string, size: number}): JSX.Element {
  return (
      <div className={styles.stone}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={styles.octagon}
          style={{width: `${size}rem`, height: `${size}rem`}}
          >
              <path {...color && { style: {fill: color}}} d="M24 16.971l-7.029 7.029h-9.942l-7.029-7.029v-9.942l7.029-7.029h9.942l7.029 7.029z"/>
          </svg>
          <div className={styles.emoji} style={{fontSize: `${size/1.6}rem`}}>{emoji}</div>
      </div>

  );
}
