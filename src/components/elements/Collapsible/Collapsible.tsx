import React, { useEffect, useRef, useState } from "react";
import styles from "./Collapsible.module.scss";

interface CollapsibleProps {
  open?: boolean;
  header: string | React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open,
  children,
  header,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(open);
  const [height, setHeight] = useState<number | undefined>(
    open ? undefined : 0
  );
  const ref = useRef<HTMLDivElement>(null);

  const handleFilterOpening = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((element) =>
      setHeight(isOpen ? element[0].contentRect.height : 0)
    );
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    setHeight(isOpen ? ref.current?.getBoundingClientRect().height : 0);
  }, [isOpen]);

  return (
    <>
      <div className={styles.collapsible}>
        <div className={styles.header} onClick={handleFilterOpening}>
          <div className={styles.title}>{header}</div>
          <button type="button" className={styles.iconButton}>
            <div className={`${styles.icon} ${isOpen && styles.open}`}>
              &#8249;
            </div>
          </button>
        </div>
        <div className={styles.content} style={{ height }}>
          <div ref={ref}>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
