import React, { ComponentProps } from "react";
import styles from "./Input.module.scss";
import classnames from "classnames";

export const Input = ({ ...props }: ComponentProps<"input">): JSX.Element => {
  return (
    <input {...props} className={classnames(props.className, styles.input)} />
  );
};
