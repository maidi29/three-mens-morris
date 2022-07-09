import React, { ComponentProps } from "react";
import styles from "./Button.module.scss";
import classnames from "classnames";

export const Button = ({ ...props }: ComponentProps<"button">): JSX.Element => {
  return (
    <button {...props} className={classnames(props.className, styles.button)} />
  );
};
